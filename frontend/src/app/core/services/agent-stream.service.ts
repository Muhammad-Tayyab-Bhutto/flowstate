import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import type { WebSocketEvent, PerceptionOutput } from '@flowstate/shared';

export type AgentStreamStatus = 'idle' | 'connecting' | 'connected' | 'running' | 'paused' | 'completed' | 'failed' | 'error';

export interface FieldPrompt {
    field_key: string;
    field_label: string;
    existing_value?: string;
    message: string;
}

/** Categorized reasoning step — drives the visible timeline UI */
export type TimelineStepType =
    | 'analyze'       // Analyzing page / perception
    | 'navigate'      // Navigating to a URL
    | 'found'         // Found element / form / element
    | 'missing_field' // Missing profile field detected
    | 'ask_user'      // Requesting user input (obstacle)
    | 'save_profile'  // Saving field to profile
    | 'fill'          // Filling form field
    | 'click'         // Clicking button / link
    | 'submit'        // Submitting form
    | 'complete'      // Mission accomplished
    | 'error'         // Error / consecutive failure
    | 'thought';      // Generic thought fallback

export interface TimelineStep {
    id: number;
    type: TimelineStepType;
    message: string;
    timestamp: Date;
    confidence?: number;
}

export interface AgentStreamState {
    status: AgentStreamStatus;
    sessionId: string | null;
    lastEvent: WebSocketEvent | null;
    perception: (PerceptionOutput & { screenshot_url?: string }) | null;
    tasks: Array<{ id: string; type: string; reasoning: string; success?: boolean; confidence?: number }>;
    thoughts: string[];
    /** Enriched categorized timeline steps for the reasoning timeline UI */
    timeline: TimelineStep[];
    /** Current confidence from last planner action (0-1) */
    currentConfidence: number | null;
    /** Platform name detected from current page URL */
    detectedPlatform: string | null;
    error: string | null;
    userPrompt: string | null;
    obstacleType: 'captcha' | 'login_wall' | 'security_check' | 'unknown' | null;
    fieldPrompt: FieldPrompt | null;
    fieldSavedMessage: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Timeline step classifier — maps LLM thought strings to typed step categories
// ─────────────────────────────────────────────────────────────────────────────
let stepIdCounter = 0;

function classifyThought(message: string): TimelineStepType {
    const m = message.toLowerCase();
    if (m.includes('analyz') || m.includes('perception') || m.includes('vision') || m.includes('screen')) return 'analyze';
    if (m.includes('navigat') || m.includes('going to') || m.includes('loading')) return 'navigate';
    if (m.includes('found') || m.includes('detected') || m.includes('interactive element') || m.includes('form')) return 'found';
    if (m.includes('missing') || m.includes('field prompt') || m.includes('profile field')) return 'missing_field';
    if (m.includes('captcha') || m.includes('login wall') || m.includes('asking user') || m.includes('waiting for user')) return 'ask_user';
    if (m.includes('saved') || m.includes('saving') || m.includes('injected into profile')) return 'save_profile';
    if (m.includes('type') || m.includes('fill') || m.includes('typing') || m.includes('enter')) return 'fill';
    if (m.includes('click') || m.includes('pressing') || m.includes('submit') && !m.includes('submitting')) return 'click';
    if (m.includes('submit') || m.includes('applying') || m.includes('sending application')) return 'submit';
    if (m.includes('mission accomplished') || m.includes('complete') || m.includes('finished')) return 'complete';
    if (m.includes('error') || m.includes('failure') || m.includes('failed') || m.includes('critical')) return 'error';
    return 'thought';
}

function detectPlatform(url: string): string | null {
    if (!url) return null;
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('greenhouse.io') || url.includes('boards.greenhouse')) return 'Greenhouse';
    if (url.includes('lever.co')) return 'Lever';
    if (url.includes('workday.com') || url.includes('myworkdayjobs')) return 'Workday';
    if (url.includes('indeed.com')) return 'Indeed';
    if (url.includes('glassdoor.com')) return 'Glassdoor';
    if (url.includes('ziprecruiter.com')) return 'ZipRecruiter';
    if (url.includes('ashbyhq.com')) return 'Ashby';
    if (url.includes('smartrecruiters.com')) return 'SmartRecruiters';
    if (url.includes('bamboohr.com')) return 'BambooHR';
    if (url.includes('angel.co') || url.includes('wellfound.com')) return 'Wellfound';
    return null;
}

@Injectable({ providedIn: 'root' })
export class AgentStreamService {
    private authService = inject(AuthService);
    private router = inject(Router);
    private ws: WebSocket | null = null;

    private stateSubject = new BehaviorSubject<AgentStreamState>({
        status: 'idle',
        sessionId: null,
        lastEvent: null,
        perception: null,
        tasks: [],
        thoughts: [],
        timeline: [],
        currentConfidence: null,
        detectedPlatform: null,
        error: null,
        userPrompt: null,
        obstacleType: null,
        fieldPrompt: null,
        fieldSavedMessage: null,
    });
    public state$ = this.stateSubject.asObservable();

    get state() { return this.stateSubject.value; }

    private updateState(partial: Partial<AgentStreamState>) {
        this.stateSubject.next({ ...this.state, ...partial });
    }

    startSession(sessionId: string) {
        if (this.state.status === 'connecting' || this.state.status === 'running') return;
        this.updateState({ status: 'connecting', error: null, timeline: [], currentConfidence: null, detectedPlatform: null });

        const token = this.authService.getToken();
        if (!token) {
            this.updateState({ status: 'error', error: 'Not authenticated' });
            return;
        }

        const wsUrl = `${environment.wsUrl}/api/v1/agent/stream`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.ws?.send(JSON.stringify({ type: 'auth', data: token }));
        };

        this.ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data) as WebSocketEvent & { type?: string };
                const next = { ...this.state, lastEvent: msg };

                if ((msg.type as string) === 'authenticated') {
                    next.status = 'connected';
                    this.ws?.send(JSON.stringify({ type: 'client:start_session', session_id: sessionId }));
                } else if (msg.type === 'session:started') {
                    next.status = 'running';
                    next.sessionId = sessionId;
                } else if (msg.type === 'session:paused') next.status = 'paused';
                else if (msg.type === 'session:resumed') {
                    next.status = 'running';
                    next.userPrompt = null;
                    next.fieldPrompt = null;
                    next.obstacleType = null;
                } else if (msg.type === 'session:completed' || msg.type === 'session:failed') {
                    next.status = msg.type === 'session:completed' ? 'completed' : 'failed';
                    // Add a final timeline step
                    const finalStep: TimelineStep = {
                        id: ++stepIdCounter,
                        type: msg.type === 'session:completed' ? 'complete' : 'error',
                        message: msg.type === 'session:completed' ? '✅ Mission accomplished!' : '❌ Session ended with error',
                        timestamp: new Date(),
                    };
                    next.timeline = [...next.timeline, finalStep];
                } else if (msg.type === 'agent:thought') {
                    const thought = (msg.data as any).message as string;
                    next.thoughts = [...next.thoughts, thought];
                    // Classify and add to timeline
                    const step: TimelineStep = {
                        id: ++stepIdCounter,
                        type: classifyThought(thought),
                        message: thought.replace(/^🧠\s*|^✅\s*|^🛑\s*|^⚠️\s*|^🔄\s*|^🔴\s*/u, '').trim(),
                        timestamp: new Date(),
                        confidence: next.currentConfidence ?? undefined,
                    };
                    next.timeline = [...next.timeline, step];
                } else if (msg.type === 'perception:update') {
                    const perc = msg.data as PerceptionOutput;
                    next.perception = perc;
                    // Detect platform from URL
                    const platform = detectPlatform((perc as any).page_url || '');
                    if (platform) next.detectedPlatform = platform;
                } else if (msg.type === 'task:started') {
                    const d = msg.data as any;
                    // Track confidence from task
                    if (d.confidence != null) next.currentConfidence = d.confidence;
                    next.tasks = [...next.tasks, {
                        id: d.task_id,
                        type: d.type,
                        reasoning: d.reasoning,
                        confidence: d.confidence,
                    }];
                } else if (msg.type === 'task:completed' || msg.type === 'task:failed') {
                    const d = msg.data as any;
                    next.tasks = next.tasks.map((t) =>
                        t.id === d.task_id ? { ...t, success: msg.type === 'task:completed' } : t
                    );
                } else if (msg.type === 'error') {
                    const errMsg: string = (msg.data as any)?.message ?? 'Unknown error';
                    const isAuthError = errMsg.toLowerCase().includes('invalid token') ||
                        errMsg.toLowerCase().includes('not authenticated') ||
                        errMsg.toLowerCase().includes('unauthorized');
                    if (isAuthError) {
                        this.authService.setToken('');
                        this.ws?.close();
                        this.ws = null;
                        this.router.navigate(['/login'], { queryParams: { reason: 'session_expired' } });
                        return;
                    }
                    next.error = errMsg;
                } else if ((msg.type as string) === 'user:prompt') {
                    const d = msg.data as any;
                    next.userPrompt = d?.message ?? 'The agent needs your help.';
                    next.obstacleType = d?.obstacle_type ?? 'unknown';
                    next.fieldPrompt = null;
                    next.status = 'paused';
                    // Add to timeline
                    next.timeline = [...next.timeline, {
                        id: ++stepIdCounter,
                        type: 'ask_user',
                        message: `User assistance needed: ${d?.obstacle_type ?? 'manual action required'}`,
                        timestamp: new Date(),
                    }];
                } else if ((msg.type as string) === 'user:field_prompt') {
                    const d = msg.data as any;
                    next.fieldPrompt = {
                        field_key: d.field_key,
                        field_label: d.field_label,
                        existing_value: d.existing_value,
                        message: d.message,
                    };
                    next.userPrompt = null;
                    next.status = 'paused';
                    // Add to timeline
                    next.timeline = [...next.timeline, {
                        id: ++stepIdCounter,
                        type: 'missing_field',
                        message: `Missing profile field: ${d.field_label}`,
                        timestamp: new Date(),
                    }];
                } else if ((msg.type as string) === 'field_saved') {
                    const d = msg.data as any;
                    next.fieldSavedMessage = d?.message ?? 'Field saved to your profile.';
                    // Add to timeline
                    next.timeline = [...next.timeline, {
                        id: ++stepIdCounter,
                        type: 'save_profile',
                        message: `Saved "${d?.label ?? d?.field_key}" to profile`,
                        timestamp: new Date(),
                    }];
                    setTimeout(() => this.updateState({ fieldSavedMessage: null }), 4000);
                }

                this.updateState(next);
            } catch (e) { }
        };

        this.ws.onerror = () => {
            this.updateState({ status: 'error', error: 'WebSocket error' });
        };

        this.ws.onclose = () => {
            this.ws = null;
            if (this.state.status === 'running' || this.state.status === 'paused') {
                this.updateState({ status: 'error', error: 'Connection closed' });
            }
        };
    }

    send(type: string, data?: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data !== undefined ? { type, data } : { type }));
        }
    }

    pause() { this.send('client:pause_session'); }
    resume() { this.send('client:resume_session'); this.updateState({ userPrompt: null, fieldPrompt: null, obstacleType: null }); }
    cancel() { this.send('client:cancel_session'); }
    sendInterruption(text: string) { this.send('client:voice_command', { text }); this.updateState({ userPrompt: null }); }

    replyToPrompt(text: string) {
        this.send('client:voice_command', { text });
        this.updateState({ userPrompt: null, obstacleType: null, status: 'running' });
    }

    replyToFieldPrompt(value: string, saveToProfile: boolean) {
        const fp = this.state.fieldPrompt;
        this.send('client:voice_command', { text: value });
        this.updateState({ fieldPrompt: null, status: 'running' });
        if (saveToProfile && fp) {
            this.send('client:save_profile_field', {
                field_key: fp.field_key,
                value,
                label: fp.field_label,
            });
        }
    }

    disconnect() {
        this.ws?.close();
        this.ws = null;
        this.updateState({
            status: 'idle', sessionId: null, lastEvent: null,
            perception: null, tasks: [], thoughts: [], timeline: [],
            currentConfidence: null, detectedPlatform: null,
            error: null, userPrompt: null, obstacleType: null,
            fieldPrompt: null, fieldSavedMessage: null,
        });
    }
}
