import { config } from '../config/index.js';
import type { PlannerOutput } from '@flowstate/shared';
import type { UserMemory } from './orchestrator.js';
import { callGemini } from '../lib/vertex.js';

export interface ExecutorInput {
  sessionId: string;
  action: PlannerOutput;
  userMemory?: UserMemory;
  onThought?: (msg: string) => void;
}

export interface ExecutorOutput {
  success: boolean;
  screenshot: Buffer | null;
  error?: string;
  duration_ms: number;
}

export async function executeAction(input: ExecutorInput): Promise<ExecutorOutput> {
  const startTime = Date.now();

  let actionToExecute = input.action;

  // AI Cover Letter Generation
  if (
    actionToExecute.action === 'type' &&
    (actionToExecute.target.element_description?.toLowerCase().includes('cover letter') ||
      actionToExecute.reasoning.toLowerCase().includes('cover letter'))
  ) {
    if (input.onThought) input.onThought('🧠 Generating tailored cover letter...');

    const prompt = `Using the user's profile, generate a short personalized cover letter.
Write ONLY the cover letter content. Do not include a subject line.
Input context:
User Profile: ${JSON.stringify(input.userMemory?.profile || {})}
Target Element / Reasoning: ${actionToExecute.target.element_description || actionToExecute.reasoning}`;

    try {
      const result = await callGemini({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
      });
      const generatedLetter = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (generatedLetter) {
        actionToExecute = {
          ...actionToExecute,
          target: { ...actionToExecute.target, text: generatedLetter }
        };
      }
    } catch (e) {
      console.error('Cover letter generation failed', e);
    }
  }

  try {
    const response = await fetch(`${config.playwrightServiceUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: input.sessionId, action: actionToExecute.action, target: actionToExecute.target }),
    });

    if (!response.ok) {
      return { success: false, screenshot: null, error: `Execution failed: ${await response.text()}`, duration_ms: Date.now() - startTime };
    }

    const result = (await response.json()) as { success: boolean; screenshot?: string; error?: string };
    return { success: result.success, screenshot: result.screenshot ? Buffer.from(result.screenshot, 'base64') : null, error: result.error, duration_ms: Date.now() - startTime };
  } catch (error) {
    return { success: false, screenshot: null, error: error instanceof Error ? error.message : 'Unknown error', duration_ms: Date.now() - startTime };
  }
}

export async function captureScreenshot(sessionId: string): Promise<Buffer | null> {
  try {
    const response = await fetch(`${config.playwrightServiceUrl}/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) return null;
    const result = (await response.json()) as { screenshot: string };
    return Buffer.from(result.screenshot, 'base64');
  } catch {
    return null;
  }
}

export async function initializeSession(sessionId: string, initialUrl?: string): Promise<boolean> {
  try {
    const response = await fetch(`${config.playwrightServiceUrl}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, initial_url: initialUrl || 'about:blank' }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function closeSession(sessionId: string): Promise<void> {
  try {
    await fetch(`${config.playwrightServiceUrl}/session/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch {
    // Ignore
  }
}
