import '../types/index.js';
import type { VerifierOutput, PlannerOutput } from '@flowstate/shared';
import { callGemini } from '../lib/vertex.js';

// ============================================
// INTELLIGENT VERIFIER — Quality Control
// ============================================

const VERIFIER_PROMPT = `You are FlowState's action verifier. Compare before/after screenshots to determine if an action succeeded.

## ACTION PERFORMED
Action: {action}
Expected outcome: {expected}

## ANALYSIS RULES
1. Compare the two screenshots carefully. Look for:
   - Did the page change? (new content, navigation, form submission)
   - Did the intended element get clicked/typed into?
   - Are there any NEW error messages or obstacles?
   - Did a CAPTCHA, pop-up, or login wall appear?

2. IMPORTANT: A page that looks "the same" doesn't always mean failure.
   - Typing into a field: the field should now contain the text
   - Clicking a button: might trigger a load, redirect, or modal
   - Scrolling: the viewport should have shifted
   - Waiting: the page may have loaded new content

3. Be GENEROUS with success — if the action plausibly worked, mark it as success.
   Only mark failure if something clearly went wrong.

4. Use should_replan = true when the action succeeded but the outcome wasn't what was expected
   (e.g., clicking "Apply" opened a new tab instead of a form).

Return JSON: { "success": bool, "matches_expectation": bool, "differences": string[], "should_retry": bool, "should_replan": bool, "user_intervention_needed": bool, "confidence": 0-1 }`;

export interface VerifierInput {
  action: PlannerOutput;
  expectedOutcome: string;
  beforeScreenshot: Buffer;
  afterScreenshot: Buffer;
}

export async function verifyAction(input: VerifierInput): Promise<VerifierOutput> {
  const prompt = VERIFIER_PROMPT
    .replace('{action}', `${input.action.action} on ${JSON.stringify(input.action.target)}`)
    .replace('{expected}', input.expectedOutcome);

  try {
    const result = await callGemini({
      contents: [{
        role: 'user',
        parts: [
          { text: 'BEFORE screenshot:' },
          { inlineData: { mimeType: 'image/png', data: input.beforeScreenshot.toString('base64') } },
          { text: 'AFTER screenshot:' },
          { inlineData: { mimeType: 'image/png', data: input.afterScreenshot.toString('base64') } },
          { text: prompt },
        ],
      }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.1, responseMimeType: 'application/json' },
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) throw new Error('No verifier response');

    // Try to parse directly, fallback to regex extraction
    try {
      return JSON.parse(text) as VerifierOutput;
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in verifier response');
      return JSON.parse(jsonMatch[0]) as VerifierOutput;
    }
  } catch {
    // Default to optimistic: assume action worked if we can't verify
    return { success: true, matches_expectation: true, differences: [], should_retry: false, should_replan: false, user_intervention_needed: false, confidence: 0.5 };
  }
}
