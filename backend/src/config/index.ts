import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env first, then let .env.local override it
const backendRoot = resolve(__dirname, '..', '..');
dotenv.config({ path: resolve(backendRoot, '.env') });
if (existsSync(resolve(backendRoot, '.env.local'))) {
  dotenv.config({ path: resolve(backendRoot, '.env.local'), override: true });
}

export const config = {
  // Server
  port: parseInt(process.env['PORT'] || '3001', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  logLevel: process.env['LOG_LEVEL'] || 'info',

  // CORS
  corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',

  // JWT
  jwtSecret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
  refreshTokenExpiresIn: process.env['REFRESH_TOKEN_EXPIRES_IN'] || '7d',

  // Cookies
  cookieSecret: process.env['COOKIE_SECRET'] || 'your-cookie-secret-change-in-production',

  // Firebase
  firebaseProjectId: process.env['FIREBASE_PROJECT_ID'] || 'flowstate-dev',

  // Google Cloud
  gcpProjectId: process.env['GCP_PROJECT_ID'] || 'flowstate-dev',
  gcpLocation: process.env['GCP_LOCATION'] || 'us-central1',
  gcsBucket: process.env['GCS_BUCKET'] || 'flowstate-dev',

  // Vertex AI - Gemini 3.1 Pro preferred for agentic workflows
  vertexAiModel: process.env['VERTEX_AI_MODEL'] || 'gemini-3.1-pro-preview',

  // Stripe
  stripeSecretKey: process.env['STRIPE_SECRET_KEY'] || '',
  stripeWebhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || '',

  // Playwright Service
  playwrightServiceUrl: process.env['PLAYWRIGHT_SERVICE_URL'] || 'http://localhost:3002',
} as const;

export type Config = typeof config;
