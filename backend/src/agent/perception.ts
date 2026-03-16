import '../types/index.js';
import type { PerceptionOutput } from '@flowstate/shared';
import { callGemini } from '../lib/vertex.js';

// =====================================================================================
// FLOWSTATE PERCEPTION ENGINE v3 — Genius-Level Screen Understanding
// =====================================================================================

const PERCEPTION_SYSTEM = `# FlowState Perception Engine — Expert Visual Analyzer

You are an EXPERT screen reader for an autonomous web agent. Your job is to analyze screenshots with EXTREME precision and extract everything the agent needs to take action.

## YOUR PRIORITIES (in order)
1. **OBSTACLES FIRST**: Identify anything blocking the user (modals, overlays, CAPTCHAs, login walls, cookie banners, error messages). The agent MUST clear these before doing anything else.
2. **INTERACTIVE ELEMENTS**: Find all clickable elements with PRECISE coordinates (center of each element).
3. **FORM FIELDS**: Identify all input fields, their labels, current values, and whether they're required.
4. **PAGE CONTEXT**: What page is this? What progress has been made toward the goal?

## COORDINATE RULES
- Provide coordinates as {x, y} pixel values from the TOP-LEFT corner of the viewport (1920x1080).
- Coordinates should point to the CENTER of the clickable area.
- Be EXTREMELY precise — a few pixels off can mean clicking the wrong element.
- For text links: point to the center of the text.
- For buttons: point to the center of the button area.
- For input fields: point to the center of the input box.

## OBSTACLE CODES (use in errors[])
- "MODAL_OVERLAY" — any modal/popup/overlay blocking the page
- "LOGIN_WALL" — login/sign-in/sign-up requirement blocking access
- "CAPTCHA" — any CAPTCHA challenge visible
- "COOKIE_BANNER" — cookie consent banner
- "ERROR_PAGE" — 404, 500, error state shown
- "RATE_LIMITED" — rate-limit or "slow down" message
- "BLOCKED" — access denied or anti-bot blocking

## FORM FIELD ANALYSIS
For each visible form field, extract:
- label: the field label text
- type: text, email, tel, file, select, checkbox, radio, textarea, url, number
- placeholder: placeholder text if visible
- value: current filled value (empty string if empty)
- required: true/false
- coordinates: {x, y} center of the input
- selector: best CSS selector guess

## OUTPUT FORMAT
Return ONLY valid JSON:
{
  "page_type": "search_results|job_listing|application_form|login_page|error|captcha|other",
  "page_title": "string",
  "page_url": "best guess from URL bar or page content",
  "interactive_elements": [
    { "id": "string", "type": "button|link|input|select|checkbox", "text": "visible text", "coordinates": {"x": 0, "y": 0}, "selector": "css selector", "is_visible": true }
  ],
  "forms": [
    {
      "id": "string",
      "fields": [
        { "label": "string", "type": "text|email|tel|file|select|checkbox|textarea", "placeholder": "string", "value": "string", "required": true, "coordinates": {"x": 0, "y": 0}, "selector": "string" }
      ],
      "submit_button": { "text": "string", "coordinates": {"x": 0, "y": 0}, "selector": "string" }
    }
  ],
  "buttons": [
    { "text": "string", "coordinates": {"x": 0, "y": 0}, "selector": "string", "type": "submit|link|action", "is_primary": true }
  ],
  "errors": ["OBSTACLE_CODE"],
  "progress": "assessment of progress toward the goal",
  "confidence": 0.0-1.0
}`;

export interface PerceptionInput {
  screenshot: Buffer;
  goal: string;
  context?: string;
}

export async function analyzeScreen(input: PerceptionInput): Promise<PerceptionOutput> {
  const prompt = `${PERCEPTION_SYSTEM}

## CURRENT MISSION: ${input.goal}

## RECENT CONTEXT: ${input.context || 'Starting fresh — this is the first screenshot.'}

Analyze this screenshot CAREFULLY. Extract ALL interactive elements with PRECISE coordinates.
Focus especially on: obstacles, buttons (Apply, Submit, Close, Next), form fields, and job listings.

Return ONLY valid JSON. No markdown. No fences.`;

  try {
    const result = await callGemini({
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/png', data: input.screenshot.toString('base64') } },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.1,    // Very low for precision
        responseMimeType: 'application/json',
      },
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) throw new Error('Empty perception response');

    // Sanitize: strip markdown fences and fix trailing commas (common Gemini quirks)
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/,\s*([}\]])/g, '$1') // trailing commas
      .trim();

    return JSON.parse(cleaned) as PerceptionOutput;
  } catch (error) {
    console.error('Perception error:', error);
    return {
      page_type: 'unknown',
      page_title: '',
      page_url: '',
      interactive_elements: [],
      forms: [],
      buttons: [],
      errors: ['PERCEPTION_FAILED'],
      progress: null,
      confidence: 0,
    };
  }
}
