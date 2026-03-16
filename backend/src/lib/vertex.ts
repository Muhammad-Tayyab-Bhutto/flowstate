import { GoogleAuth } from 'google-auth-library';
import { config } from '../config/index.js';

const authOptions: any = {
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
};
if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
  authOptions.keyFilename = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
}

const auth = new GoogleAuth(authOptions);

// Model fallback chain: try pro first, fall back to flash on quota/rate errors
const MODEL_CHAIN = [
  config.vertexAiModel,                    // e.g. gemini-2.5-pro
  'gemini-2.0-flash-001',                  // Flash — faster, higher quota
  'gemini-1.5-flash-002',                  // Older flash — max quota
];

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 2000; // 2s base → 4s → 8s → 16s

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRateLimitError(err: any): boolean {
  return err?.status === 429 || err?.code === 429 ||
    err?.response?.status === 429 ||
    String(err?.message ?? '').includes('429') ||
    String(err?.message ?? '').toLowerCase().includes('rate limit') ||
    String(err?.message ?? '').toLowerCase().includes('resource exhausted') ||
    String(err?.message ?? '').toLowerCase().includes('quota');
}

function isTransientError(err: any): boolean {
  const status = err?.status || err?.code || err?.response?.status;
  return status === 503 || status === 502 || status === 500 || status === 429;
}

/**
 * Call Gemini via Vertex AI with:
 *  - Exponential backoff on 429/503 (up to 4 retries, 2s base)
 *  - Automatic model fallback (pro → flash → 1.5-flash)
 *  - Jitter to avoid thundering herd
 */
export async function callGemini(request: unknown): Promise<any> {
  const client = await auth.getClient();

  let lastError: any;

  for (let modelIndex = 0; modelIndex < MODEL_CHAIN.length; modelIndex++) {
    const model = MODEL_CHAIN[modelIndex];
    const url = `https://${config.gcpLocation}-aiplatform.googleapis.com/v1beta1/projects/${config.gcpProjectId}/locations/${config.gcpLocation}/publishers/google/models/${model}:generateContent`;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await (client as any).request({
          url,
          method: 'POST',
          data: request,
        });
        if (attempt > 0 || modelIndex > 0) {
          console.log(`[Gemini] Success on model=${model} attempt=${attempt + 1}`);
        }
        return res.data;
      } catch (err: any) {
        lastError = err;
        const isRateLimit = isRateLimitError(err);
        const isTransient = isTransientError(err);

        if (isRateLimit || isTransient) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;
          console.warn(`[Gemini] ${isRateLimit ? '429 Rate limit' : 'Transient error'} on model=${model} attempt=${attempt + 1}. Retrying in ${(delay / 1000).toFixed(1)}s...`);
          await sleep(delay);
          continue;
        }

        // Non-transient error — break inner loop and try next model
        console.warn(`[Gemini] Non-retryable error on model=${model}: ${err?.message ?? err}`);
        break;
      }
    }

    // After exhausting retries on this model, move to next model in fallback chain
    if (modelIndex < MODEL_CHAIN.length - 1) {
      console.warn(`[Gemini] Falling back from ${model} to ${MODEL_CHAIN[modelIndex + 1]}`);
    }
  }

  // All models exhausted
  console.error('[Gemini] All models and retries exhausted. Last error:', lastError);
  throw lastError;
}

/**
 * Helper to generate structured JSON using the rate-limited fallback client
 */
export async function generateJson(prompt: string): Promise<any> {
  const request = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
  };
  const response = await callGemini(request);
  const text = response.predictions?.[0]?.content?.parts?.[0]?.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No content returned from Gemini');
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse Gemini JSON:', text);
    throw new Error('Invalid JSON format returned from Gemini');
  }
}
