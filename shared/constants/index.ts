import type { PlanType, PlanFeatures } from '../types/index.js';

// ============================================
// Plan Configuration
// ============================================

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  FREE: {
    tasks_per_month: 50,
    concurrent_sessions: 5,
    history_retention_days: 7,
    support: 'community',
    api_access: false,
    team_members: 1,
  },
  STARTER: {
    tasks_per_month: 200,
    concurrent_sessions: 10,
    history_retention_days: 30,
    support: 'email',
    api_access: false,
    team_members: 3,
  },
  PRO: {
    tasks_per_month: 1000,
    concurrent_sessions: 50,
    history_retention_days: 90,
    support: 'priority',
    api_access: true,
    team_members: 10,
  },
  ENTERPRISE: {
    tasks_per_month: -1, // unlimited
    concurrent_sessions: -1, // unlimited
    history_retention_days: 365,
    support: 'dedicated',
    api_access: true,
    team_members: -1, // unlimited
  },
} as const;

export const PLAN_PRICES: Record<Exclude<PlanType, 'FREE' | 'ENTERPRISE'>, { monthly: number; yearly: number }> = {
  STARTER: {
    monthly: 1900, // cents
    yearly: 19000, // cents (2 months free)
  },
  PRO: {
    monthly: 4900,
    yearly: 49000,
  },
} as const;

// ============================================
// Role Permissions
// ============================================

export const PERMISSIONS = {
  OWNER: ['*'],
  ADMIN: ['tasks:*', 'team:*', 'settings:read', 'settings:write', 'billing:read'],
  MEMBER: ['tasks:own', 'tasks:create', 'settings:read'],
  VIEWER: ['tasks:read', 'settings:read'],
} as const;

// ============================================
// Session Defaults
// ============================================

export const SESSION_DEFAULTS = {
  MAX_ACTIONS: 50,
  TIMEOUT_MINUTES: 10,
  MAX_RETRIES: 3,
  SCREENSHOT_INTERVAL_MS: 1000,
} as const;

// ============================================
// Agent Configuration
// ============================================

export const AGENT_CONFIG = {
  PERCEPTION: {
    MIN_CONFIDENCE: 0.7,
    MAX_ELEMENTS: 50,
  },
  PLANNER: {
    MIN_CONFIDENCE: 0.6,
    MAX_ALTERNATIVES: 3,
  },
  EXECUTOR: {
    ACTION_TIMEOUT_MS: 10000,
    WAIT_AFTER_ACTION_MS: 500,
  },
  VERIFIER: {
    MIN_CONFIDENCE: 0.8,
    MAX_RETRIES: 2,
  },
} as const;

// ============================================
// API Configuration
// ============================================

export const API_VERSION = 'v1';

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  SESSIONS: {
    LIST: '/sessions',
    CREATE: '/sessions',
    GET: '/sessions/:id',
    UPDATE: '/sessions/:id',
    DELETE: '/sessions/:id',
    TASKS: '/sessions/:id/tasks',
  },
  TASKS: {
    GET: '/tasks/:id',
  },
  BILLING: {
    CHECKOUT: '/billing/checkout',
    SUBSCRIPTION: '/billing/subscription',
    PORTAL: '/billing/portal',
    WEBHOOK: '/billing/webhook',
  },
  USER: {
    PROFILE: '/user/profile',
    USAGE: '/user/usage',
  },
  AGENT: {
    STREAM: '/agent/stream',
  },
} as const;

// ============================================
// Error Codes
// ============================================

export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Sessions
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_ALREADY_ACTIVE: 'SESSION_ALREADY_ACTIVE',
  SESSION_LIMIT_REACHED: 'SESSION_LIMIT_REACHED',

  // Tasks
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  TASK_EXECUTION_FAILED: 'TASK_EXECUTION_FAILED',

  // Billing
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  USAGE_LIMIT_REACHED: 'USAGE_LIMIT_REACHED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  // Agent
  AGENT_ERROR: 'AGENT_ERROR',
  BROWSER_ERROR: 'BROWSER_ERROR',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// ============================================
// WebSocket Events
// ============================================

export const WS_EVENTS = {
  // Client -> Server
  CLIENT: {
    START_SESSION: 'client:start_session',
    RECONNECT_SESSION: 'client:reconnect_session',
    PAUSE_SESSION: 'client:pause_session',
    RESUME_SESSION: 'client:resume_session',
    CANCEL_SESSION: 'client:cancel_session',
    USER_RESPONSE: 'client:user_response',
    VOICE_COMMAND: 'client:voice_command',
    /** User wants to save a value to their profile after agent asked for it */
    SAVE_PROFILE_FIELD: 'client:save_profile_field',
  },
  // Server -> Client
  SERVER: {
    SESSION_STARTED: 'session:started',
    SESSION_PAUSED: 'session:paused',
    SESSION_RESUMED: 'session:resumed',
    SESSION_COMPLETED: 'session:completed',
    SESSION_FAILED: 'session:failed',
    TASK_STARTED: 'task:started',
    TASK_COMPLETED: 'task:completed',
    TASK_FAILED: 'task:failed',
    PERCEPTION_UPDATE: 'perception:update',
    USER_PROMPT: 'user:prompt',
    /** Structured prompt: agent needs a specific profile field */
    FIELD_PROMPT: 'user:field_prompt',
    AGENT_THOUGHT: 'agent:thought',
    ERROR: 'error',
  },
} as const;

// ============================================
// Firestore Collections
// ============================================

export const COLLECTIONS = {
  USERS: 'users',
  TENANTS: 'tenants',
  SESSIONS: 'sessions',
  TASKS: 'tasks',
  SUBSCRIPTIONS: 'subscriptions',
  USER_MEMORY: 'user_memory', // Personalization: resume, preferences, past behavior
  WORKFLOWS: 'workflows', // Learned workflow memory
} as const;

// ============================================
// Storage Paths
// ============================================

export const STORAGE_PATHS = {
  SCREENSHOTS: 'screenshots',
  RECORDINGS: 'recordings',
  EXPORTS: 'exports',
  RESUMES: 'resumes',
} as const;
