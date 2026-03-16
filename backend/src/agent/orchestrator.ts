import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { nanoid } from 'nanoid';
import { config } from '../config/index.js';
import { analyzeScreen } from './perception.js';
import { planNextAction } from './planner.js';
import { executeAction, captureScreenshot, initializeSession, closeSession } from './executor.js';
import { verifyAction } from './verifier.js';
import type { Session, Task, WebSocketEvent, TaskType, UserProfile, Workflow, WorkflowStep } from '@flowstate/shared';
import * as SharedConstants from '@flowstate/shared/constants';

const { COLLECTIONS, AGENT_CONFIG, SESSION_DEFAULTS } = SharedConstants;

const firestoreOptions: any = { projectId: config.firebaseProjectId };
if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
  firestoreOptions.keyFilename = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
}
const firestore = new Firestore(firestoreOptions);
const storageOptions: any = { projectId: config.gcpProjectId };
if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
  storageOptions.keyFilename = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
}
const storage = new Storage(storageOptions);
const bucket = storage.bucket(config.gcsBucket);

export interface AgentCallbacks {
  onTaskStarted: (event: WebSocketEvent) => void;
  onTaskCompleted: (event: WebSocketEvent) => void;
  onTaskFailed: (event: WebSocketEvent) => void;
  onPerceptionUpdate: (event: WebSocketEvent) => void;
  onUserPrompt: (event: WebSocketEvent) => void;
  onSessionCompleted: (event: WebSocketEvent) => void;
  onSessionFailed: (event: WebSocketEvent) => void;
  onAgentThought: (event: WebSocketEvent) => void;
  onError: (event: WebSocketEvent) => void;
}

export interface UserMemory {
  resume_url?: string;
  preferred_job_titles?: string[];
  salary_range?: string;
  excluded_companies?: string[];
  past_behavior_summary?: string;
  profile?: UserProfile;
}

interface AgentState {
  sessionId: string;
  tenantId: string;
  userId: string;
  goal: string;
  initialUrl?: string;
  userMemory?: UserMemory;
  status: 'running' | 'paused' | 'completed' | 'failed';
  tasks: Task[];
  currentRetries: number;
  consecutiveFailures: number;
  maxActions: number;
  timeoutMs: number;
  lastPageUrl: string;
  iterationsOnSamePage: number;
  perceptionFailures: number;
  /** User interruption: "skip", "skip this company", custom instruction */
  userInterruption?: string;
  availableWorkflows: Workflow[];
  /** Set when ask_user_field is triggered — tracks which field we're waiting for */
  pendingFieldKey?: string;
  pendingFieldLabel?: string;
}

export class AgentOrchestrator {
  private state: AgentState;
  private callbacks: AgentCallbacks;
  private startTime: number;
  private pauseRequested = false;
  private cancelRequested = false;
  private resumeResolve: (() => void) | null = null;

  constructor(session: Session, callbacks: AgentCallbacks, userMemory?: UserMemory) {
    this.state = {
      sessionId: session.id,
      tenantId: session.tenant_id,
      userId: session.user_id,
      goal: session.goal,
      initialUrl: (session.metadata as { initial_url?: string })?.initial_url,
      userMemory,
      status: 'running',
      tasks: [],
      currentRetries: 0,
      consecutiveFailures: 0,
      maxActions: SESSION_DEFAULTS.MAX_ACTIONS,
      timeoutMs: SESSION_DEFAULTS.TIMEOUT_MINUTES * 60 * 1000,
      lastPageUrl: '',
      iterationsOnSamePage: 0,
      perceptionFailures: 0,
      availableWorkflows: [],
    };
    this.callbacks = callbacks;
    this.startTime = Date.now();
  }

  /** Handle user interruption: "skip", "skip this company", etc. Agent will replan. */
  setUserInterruption(command: string): void {
    // If we're waiting for a field value, the user's reply IS the field value
    if (this.state.pendingFieldKey && command.trim() && !command.trim().toLowerCase().startsWith('skip')) {
      const fieldKey = this.state.pendingFieldKey;
      const value = command.trim();
      // Inject the value into userMemory so the planner can use it immediately
      if (!this.state.userMemory) this.state.userMemory = {} as UserMemory;
      if (!this.state.userMemory.profile) this.state.userMemory.profile = {} as any;
      const profileAny = this.state.userMemory.profile as any;
      if (!profileAny.extra_fields) profileAny.extra_fields = {};
      profileAny.extra_fields[fieldKey] = value;
      this.emitThought(`✅ Received "${this.state.pendingFieldLabel || fieldKey}" = "${value}" — injected into profile memory.`);
      this.state.pendingFieldKey = undefined;
      this.state.pendingFieldLabel = undefined;
    }
    this.state.userInterruption = command;
  }

  async run(): Promise<void> {
    try {
      const initialUrl = this.state.initialUrl || 'about:blank';
      const initialized = await initializeSession(this.state.sessionId, initialUrl);
      if (!initialized) throw new Error('Failed to initialize browser session');

      try {
        const workflowsSnapshot = await firestore.collection(COLLECTIONS.WORKFLOWS)
          .where('user_id', '==', this.state.userId)
          .limit(10)
          .get();
        this.state.availableWorkflows = workflowsSnapshot.docs.map((d: any) => d.data() as Workflow);
      } catch (err) {
        console.error('Failed to fetch workflows:', err);
      }

      while (this.shouldContinue()) {
        if (this.pauseRequested) {
          this.state.status = 'paused';
          await this.updateSessionStatus('PAUSED');
          await new Promise<void>((resolve) => { this.resumeResolve = resolve; });
          this.resumeResolve = null;
          this.state.status = 'running';
          await this.updateSessionStatus('ACTIVE');
          continue;
        }
        if (this.cancelRequested) {
          this.state.status = 'completed';
          await this.updateSessionStatus('CANCELED');
          this.callbacks.onSessionCompleted({ type: 'session:completed', session_id: this.state.sessionId, timestamp: new Date(), data: { reason: 'canceled' } });
          return;
        }

        let result: 'continue' | 'complete' | 'failed';
        try {
          result = await this.executeIteration();
        } catch (iterationError) {
          // CRITICAL: Don't let a single iteration error kill the whole agent!
          console.error('Iteration error (recovering):', iterationError);
          this.state.consecutiveFailures++;
          this.callbacks.onError({ type: 'error', session_id: this.state.sessionId, timestamp: new Date(), data: { error: iterationError instanceof Error ? iterationError.message : 'Unknown iteration error' } });

          // If we've had too many unrecoverable errors, bail out
          if (this.state.consecutiveFailures >= 8) {
            this.state.status = 'failed';
            await this.updateSessionStatus('FAILED');
            this.callbacks.onSessionFailed({ type: 'session:failed', session_id: this.state.sessionId, timestamp: new Date(), data: { reason: 'Too many consecutive errors' } });
            return;
          }

          // Wait a bit and retry
          await this.sleep(3000);
          continue;
        }

        if (result === 'complete') {
          this.state.status = 'completed';
          await this.updateSessionStatus('COMPLETED');
          try { await this.saveWorkflow(); } catch (err) { console.error('Workflow save error', err); }
          this.callbacks.onSessionCompleted({ type: 'session:completed', session_id: this.state.sessionId, timestamp: new Date(), data: { total_actions: this.state.tasks.length } });
          return;
        }
        if (result === 'failed') {
          this.state.status = 'failed';
          await this.updateSessionStatus('FAILED');
          this.callbacks.onSessionFailed({ type: 'session:failed', session_id: this.state.sessionId, timestamp: new Date(), data: { reason: 'Max retries exceeded' } });
          return;
        }

        // Adaptive wait: longer after failures, shorter on success
        const waitTime = this.state.consecutiveFailures > 0
          ? Math.min(AGENT_CONFIG.EXECUTOR.WAIT_AFTER_ACTION_MS * (1 + this.state.consecutiveFailures), 5000)
          : AGENT_CONFIG.EXECUTOR.WAIT_AFTER_ACTION_MS;
        await this.sleep(waitTime);
      }

      this.state.status = 'completed';
      await this.updateSessionStatus('COMPLETED');
      this.callbacks.onSessionCompleted({ type: 'session:completed', session_id: this.state.sessionId, timestamp: new Date(), data: { reason: this.isTimedOut() ? 'timeout' : 'max_actions' } });
    } catch (error) {
      this.state.status = 'failed';
      await this.updateSessionStatus('FAILED');
      this.callbacks.onSessionFailed({ type: 'session:failed', session_id: this.state.sessionId, timestamp: new Date(), data: { error: error instanceof Error ? error.message : 'Unknown' } });
    } finally {
      await closeSession(this.state.sessionId);
    }
  }

  private async executeIteration(): Promise<'continue' | 'complete' | 'failed'> {
    const screenshot = await captureScreenshot(this.state.sessionId);
    if (!screenshot) {
      this.state.consecutiveFailures++;
      // Give it a second chance — browser might be loading
      if (this.state.consecutiveFailures <= 3) {
        await this.sleep(2000);
        return 'continue';
      }
      return 'failed';
    }

    this.emitThought('🧠 Analyzing screen...');
    const perception = await analyzeScreen({ screenshot, goal: this.state.goal, context: this.getContextString() });
    (perception as any).screenshot_url = `data:image/png;base64,${screenshot.toString('base64')}`;
    this.callbacks.onPerceptionUpdate({ type: 'perception:update', session_id: this.state.sessionId, timestamp: new Date(), data: perception });

    if (perception.interactive_elements.length > 0) {
      this.emitThought(`🧠 Found ${perception.interactive_elements.length} interactive elements.`);
      this.state.perceptionFailures = 0; // Reset on success
    } else {
      this.state.perceptionFailures++;
      this.emitThought(`⚠️ Vision degraded. No interactive elements found (${this.state.perceptionFailures}/3).`);

      if (this.state.perceptionFailures < 3) {
        // Force a minor scroll to trigger lazy loading or reset state
        this.emitThought(`🔄 Forcing a scroll to refresh perception.`);
        const retryTask: Task = {
          id: nanoid(), session_id: this.state.sessionId, tenant_id: this.state.tenantId, user_id: this.state.userId,
          type: 'SCROLL', target: { direction: 'down', amount: 300 }, status: 'EXECUTING', result: { success: false },
          confidence: 1.0, reasoning: 'Perception failed. Scrolling to refresh UI.', created_at: new Date(), executed_at: null
        };
        this.state.tasks.push(retryTask);
        this.callbacks.onTaskStarted({ type: 'task:started', session_id: this.state.sessionId, timestamp: new Date(), data: { task_id: retryTask.id, type: retryTask.type, target: retryTask.target, reasoning: retryTask.reasoning } });
        const res = await executeAction({ sessionId: this.state.sessionId, action: { action: 'scroll', target: retryTask.target, confidence: 1, reasoning: '', alternatives: [] } });
        retryTask.executed_at = new Date();
        retryTask.result = { success: res.success, duration_ms: res.duration_ms };
        if (res.error) (retryTask.result as any).error = res.error;
        retryTask.status = res.success ? 'COMPLETED' : 'FAILED';
        try { await this.saveTask(retryTask); } catch (e) { /* ignore */ }
        return 'continue'; // Loop back and take a new screenshot
      }
    }

    // Track same-page iterations for stuck detection
    const currentPageId = `${perception.page_type}:${perception.page_title}`;
    if (currentPageId === this.state.lastPageUrl) {
      this.state.iterationsOnSamePage++;
    } else {
      this.state.iterationsOnSamePage = 0;
      this.state.lastPageUrl = currentPageId;
    }

    // Clear interruption after it's been passed to planner
    const interruption = this.state.userInterruption;
    if (interruption) this.state.userInterruption = undefined;

    this.emitThought('🧠 Planning next action...');
    const plan = await planNextAction({
      goal: this.state.goal,
      currentState: perception,
      history: this.state.tasks,
      userMemory: this.state.userMemory,
      userInterruption: interruption,
      consecutiveFailures: this.state.consecutiveFailures,
      iterationsOnSamePage: this.state.iterationsOnSamePage,
      availableWorkflows: this.state.availableWorkflows,
    });

    if (plan.action === 'complete') {
      this.emitThought('🧠 Mission accomplished!');
      return 'complete';
    }
    if ((plan as any).action === 'ask_user_field') {
      // Profile field is missing — ask user for it with structured prompt
      const fieldPlan = plan as any;
      this.state.pendingFieldKey = fieldPlan.field_key;
      this.state.pendingFieldLabel = fieldPlan.field_label;
      this.callbacks.onUserPrompt({
        type: 'user:field_prompt' as any,
        session_id: this.state.sessionId,
        timestamp: new Date(),
        data: {
          field_key: fieldPlan.field_key || 'unknown_field',
          field_label: fieldPlan.field_label || 'Required Field',
          existing_value: fieldPlan.field_existing_value,
          message: plan.reasoning,
        }
      });
      this.emitThought(`🛑 Missing profile field: "${fieldPlan.field_label || fieldPlan.field_key}". Asking user...`);
      this.pause();
      return 'continue';
    }
    if (plan.action === 'ask_user') {
      this.callbacks.onUserPrompt({
        type: 'user:prompt',
        session_id: this.state.sessionId,
        timestamp: new Date(),
        data: {
          message: plan.reasoning,
          obstacle_type: (plan as any).obstacle_type,
        }
      });
      this.emitThought('🛑 Pausing agent. Waiting for user assistance...');
      this.pause();
      return 'continue';
    }

    const taskId = nanoid();
    const task: Task = {
      id: taskId,
      session_id: this.state.sessionId,
      tenant_id: this.state.tenantId,
      user_id: this.state.userId,
      type: plan.action.toUpperCase() as TaskType,
      target: plan.target,
      status: 'EXECUTING',
      result: { success: false },
      confidence: plan.confidence,
      reasoning: plan.reasoning,
      created_at: new Date(),
      executed_at: null,
    };

    let actionLabel = plan.action;
    if (plan.target.text) actionLabel += ` "${plan.target.text}"`;
    if (plan.target.element_description) actionLabel += ` (${plan.target.element_description})`;
    this.emitThought(`🧠 Executing: ${actionLabel}`);

    this.state.tasks.push(task);
    this.callbacks.onTaskStarted({ type: 'task:started', session_id: this.state.sessionId, timestamp: new Date(), data: { task_id: taskId, type: task.type, target: task.target, reasoning: task.reasoning, confidence: plan.confidence } });

    const executionResult = await executeAction({
      sessionId: this.state.sessionId,
      action: plan,
      userMemory: this.state.userMemory,
      onThought: (msg: string) => this.emitThought(msg)
    });

    let verification;
    if (executionResult.success && executionResult.screenshot) {
      try {
        verification = await verifyAction({ action: plan, expectedOutcome: plan.reasoning, beforeScreenshot: screenshot, afterScreenshot: executionResult.screenshot });
      } catch (verifyErr) {
        console.error('Verification error (non-fatal):', verifyErr);
      }
    }

    task.executed_at = new Date();
    task.result = { success: executionResult.success && (verification?.matches_expectation ?? true), duration_ms: executionResult.duration_ms };
    if (executionResult.error) {
      (task.result as any).error = executionResult.error;
    }

    // Screenshot saving is NON-FATAL — GCS might not be configured
    if (executionResult.screenshot) {
      try {
        task.result.screenshot_url = await this.saveScreenshot(taskId, executionResult.screenshot);
      } catch (screenshotErr) {
        console.error('Screenshot save failed (non-fatal, GCS might not be configured):', (screenshotErr as Error)?.message);
      }
    }

    if (task.result.success) {
      task.status = 'COMPLETED';
      this.state.currentRetries = 0;
      this.state.consecutiveFailures = 0; // Reset on success
      this.callbacks.onTaskCompleted({ type: 'task:completed', session_id: this.state.sessionId, timestamp: new Date(), data: { task_id: taskId, success: true, duration_ms: executionResult.duration_ms } });
    } else {
      task.status = 'FAILED';
      this.state.currentRetries++;
      this.state.consecutiveFailures++;
      this.callbacks.onTaskFailed({ type: 'task:failed', session_id: this.state.sessionId, timestamp: new Date(), data: { task_id: taskId, error: task.result.error } });

      // Intelligent retry: if verifier says replan, reset retries but keep going
      if (verification?.should_replan) {
        this.state.currentRetries = 0; // Allow replanning instead of hard-failing
      }

      // Only hard-fail after many retries (increased from 2 to 5 for resilience)
      if (this.state.currentRetries >= 5) return 'failed';
    }

    // Task persistence is also non-fatal — Firestore might have transient issues
    try {
      await this.saveTask(task);
      await this.updateSessionStats();
    } catch (persistErr) {
      console.error('Task persistence error (non-fatal):', (persistErr as Error)?.message);
    }

    return 'continue';
  }

  pause(): void { this.pauseRequested = true; }
  cancel(): void { this.cancelRequested = true; }
  resume(): void {
    this.pauseRequested = false;
    this.resumeResolve?.();
    this.resumeResolve = null;
  }

  private emitThought(message: string): void {
    this.callbacks.onAgentThought({
      type: 'agent:thought',
      session_id: this.state.sessionId,
      timestamp: new Date(),
      data: { message }
    });
  }

  private shouldContinue(): boolean {
    return this.state.status === 'running' && this.state.tasks.length < this.state.maxActions && !this.isTimedOut();
  }

  private isTimedOut(): boolean { return Date.now() - this.startTime > this.state.timeoutMs; }

  private getContextString(): string {
    const recent = this.state.tasks.slice(-8);
    if (recent.length === 0) return 'Starting fresh — no previous actions.';

    const lines = recent.map((t) => {
      const status = t.status === 'COMPLETED' ? '✅' : '❌';
      return `${status} ${t.type}: ${t.reasoning} → ${t.result.error || 'OK'}`;
    });

    // Add metadata
    lines.push(`\n--- Iteration: ${this.state.tasks.length}/${this.state.maxActions} | Failures: ${this.state.consecutiveFailures} | Same page: ${this.state.iterationsOnSamePage} ---`);
    return lines.join('\n');
  }

  private async saveScreenshot(taskId: string, screenshot: Buffer): Promise<string> {
    const path = `screenshots/${this.state.tenantId}/${this.state.sessionId}/${taskId}.png`;
    await bucket.file(path).save(screenshot, { contentType: 'image/png' });
    return `gs://${config.gcsBucket}/${path}`;
  }

  private async saveTask(task: Task): Promise<void> {
    await firestore.collection(COLLECTIONS.TASKS).doc(task.id).set(task);
  }

  private async updateSessionStatus(status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELED'): Promise<void> {
    const updates: Record<string, unknown> = { status };
    if (!['ACTIVE', 'PAUSED'].includes(status)) updates['ended_at'] = new Date();
    await firestore.collection(COLLECTIONS.SESSIONS).doc(this.state.sessionId).update(updates);
  }

  private async updateSessionStats(): Promise<void> {
    const successful = this.state.tasks.filter((t) => t.status === 'COMPLETED').length;
    const failed = this.state.tasks.filter((t) => t.status === 'FAILED').length;
    await firestore.collection(COLLECTIONS.SESSIONS).doc(this.state.sessionId).update({ total_actions: this.state.tasks.length, successful_actions: successful, failed_actions: failed });
  }

  private async saveWorkflow(): Promise<void> {
    const successfulTasks = this.state.tasks.filter(t => t.status === 'COMPLETED');
    if (successfulTasks.length < 2) return; // Too short to be a useful workflow

    const steps: WorkflowStep[] = successfulTasks.map(t => ({
      type: t.type,
      target: t.target,
      reasoning: t.reasoning
    }));

    const workflowId = nanoid();
    const workflow: Workflow = {
      id: workflowId,
      tenant_id: this.state.tenantId,
      user_id: this.state.userId,
      goal: this.state.goal,
      steps,
      created_at: new Date(),
      updated_at: new Date(),
      success_count: 1
    };

    await firestore.collection(COLLECTIONS.WORKFLOWS).doc(workflowId).set(workflow);
  }

  private sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }
}
