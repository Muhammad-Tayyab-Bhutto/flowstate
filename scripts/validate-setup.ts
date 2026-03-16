#!/usr/bin/env npx ts-node
/**
 * FlowState Setup Validation Script
 * Run: npx ts-node scripts/validate-setup.ts
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '..');
const checks: { name: string; ok: boolean; message: string }[] = [];

// 1. Backend .env
const backendEnv = resolve(root, 'backend/.env');
if (existsSync(backendEnv)) {
  const env = readFileSync(backendEnv, 'utf-8');
  const hasFirebase = /FIREBASE_PROJECT_ID=/.test(env) && env.includes('FIREBASE_PROJECT_ID');
  const hasGcp = /GCP_PROJECT_ID=/.test(env) && env.includes('GCP_PROJECT_ID');
  const hasVertex = /VERTEX_AI_MODEL=/.test(env);
  const vertexModel = env.match(/VERTEX_AI_MODEL=(.+)/)?.[1]?.trim();
  const hasPlaywright = /PLAYWRIGHT_SERVICE_URL=/.test(env);
  const hasCreds = /GOOGLE_APPLICATION_CREDENTIALS=/.test(env);

  checks.push({ name: 'Backend .env exists', ok: true, message: backendEnv });
  checks.push({ name: 'Firebase/Firestore config', ok: hasFirebase, message: hasFirebase ? 'FIREBASE_PROJECT_ID set' : 'Missing FIREBASE_PROJECT_ID' });
  checks.push({ name: 'GCP project config', ok: hasGcp, message: hasGcp ? 'GCP_PROJECT_ID set' : 'Missing GCP_PROJECT_ID' });
  checks.push({ name: 'Vertex AI model', ok: hasVertex && (vertexModel?.includes('gemini-3.1') ?? false), message: vertexModel ? `Using ${vertexModel}` : 'Set VERTEX_AI_MODEL=gemini-3.1-pro-preview' });
  checks.push({ name: 'Playwright service URL', ok: hasPlaywright, message: hasPlaywright ? 'PLAYWRIGHT_SERVICE_URL set' : 'Missing' });
  checks.push({ name: 'Service account path', ok: hasCreds, message: hasCreds ? 'GOOGLE_APPLICATION_CREDENTIALS set' : 'Add path to service-account.json' });
} else {
  checks.push({ name: 'Backend .env', ok: false, message: 'Copy backend/.env.example to backend/.env' });
}

  // 2. Service account file (resolve relative to backend)
  const envPath = backendEnv ? readFileSync(backendEnv, 'utf-8').match(/GOOGLE_APPLICATION_CREDENTIALS=(.+)/)?.[1]?.trim() : '';
  const credsPath = envPath
    ? (envPath.startsWith('/') ? envPath : resolve(root, 'backend', envPath.replace(/^\.\//, '')))
    : resolve(root, 'backend/service-account.json');
  checks.push({ name: 'Service account file', ok: existsSync(credsPath), message: existsSync(credsPath) ? 'Found' : `Add service-account.json to backend/ (GCP Console → IAM → Service Accounts)` });

// 3. Playwright service .env
const pwEnv = resolve(root, 'playwright-service/.env');
checks.push({ name: 'Playwright .env', ok: existsSync(pwEnv), message: existsSync(pwEnv) ? 'Exists' : 'Optional: copy from .env.example' });

// 4. Shared package built
const sharedDist = resolve(root, 'shared/dist/index.js');
checks.push({ name: 'Shared package built', ok: existsSync(sharedDist), message: existsSync(sharedDist) ? 'OK' : 'Run: npm run build --workspace=@flowstate/shared' });

console.log('\n🔍 FlowState Setup Validation\n');
checks.forEach((c) => {
  const icon = c.ok ? '✅' : '❌';
  console.log(`${icon} ${c.name}: ${c.message}`);
});
const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${failed === 0 ? '✅ All checks passed!' : `⚠️ ${failed} check(s) failed`}\n`);

if (failed > 0) {
  console.log('Quick fixes:');
  if (!existsSync(backendEnv)) console.log('  - cp backend/.env.example backend/.env');
  if (!existsSync(credsPath)) console.log('  - Download service account from GCP Console → IAM → Service Accounts');
  if (!existsSync(sharedDist)) console.log('  - npm run build --workspace=@flowstate/shared');
  console.log('');
  process.exit(1);
}
