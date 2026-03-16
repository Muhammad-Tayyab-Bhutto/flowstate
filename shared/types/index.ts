// ============================================
// User & Authentication Types
// ============================================

export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  tenant_id: string;
  role: UserRole;
  stripe_customer_id: string | null;
  created_at: Date;
  updated_at: Date;

  // Profile Information
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  location?: string;
  skills?: string;
  resumeUrl?: string;
  yearsOfExperience?: string;
  preferredRole?: string;
  coverLetterTemplate?: string;
}

export type UserProfile = Pick<User, 'name' | 'email' | 'phone' | 'linkedin' | 'portfolio' | 'location' | 'skills' | 'resumeUrl' | 'yearsOfExperience' | 'preferredRole' | 'coverLetterTemplate'> & {
  /** Dynamic fields collected during automation (e.g. github_url, visa_status) */
  extra_fields?: Record<string, string>;
};

/** A single dynamically-collected profile field */
export interface UserProfileField {
  key: string;
  label: string;
  value: string;
}


export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  default_timeout_minutes: number;
  default_max_actions: number;
}

// ============================================
// Tenant Types
// ============================================

export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';

export interface Tenant {
  id: string;
  name: string;
  owner_id: string;
  plan: PlanType;
  subscription_status: SubscriptionStatus;
  usage: TenantUsage;
  created_at: Date;
  updated_at: Date;
}

export interface TenantUsage {
  tasks_this_month: number;
  screenshots_stored: number;
  last_reset_at: Date;
}

// ============================================
// Session Types
// ============================================

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELED';

export interface Session {
  id: string;
  tenant_id: string;
  user_id: string;
  status: SessionStatus;
  goal: string;
  started_at: Date;
  ended_at: Date | null;
  total_actions: number;
  successful_actions: number;
  failed_actions: number;
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  browser: string;
  resolution: string;
  user_agent: string;
  initial_url?: string;
}

export interface CreateSessionRequest {
  goal: string;
  options?: SessionOptions;
}

export interface SessionOptions {
  max_actions?: number;
  timeout_minutes?: number;
  initial_url?: string;
  headless?: boolean;
}

// ============================================
// Task Types
// ============================================

export type TaskType = 'CLICK' | 'TYPE' | 'SCROLL' | 'NAVIGATE' | 'WAIT' | 'SCREENSHOT' | 'ASK_USER';
export type TaskStatus = 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface Task {
  id: string;
  session_id: string;
  tenant_id: string;
  user_id: string;
  type: TaskType;
  target: TaskTarget;
  status: TaskStatus;
  result: TaskResult;
  confidence: number;
  reasoning: string;
  created_at: Date;
  executed_at: Date | null;
}

export interface TaskTarget {
  selector?: string;
  coordinates?: Coordinates;
  text?: string;
  url?: string;
  element_description?: string;
  seconds?: number;
  direction?: 'up' | 'down';
  amount?: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface TaskResult {
  success: boolean;
  error?: string;
  screenshot_url?: string;
  duration_ms?: number;
  retries?: number;
}

// ============================================
// Workflow Types
// ============================================

export interface WorkflowStep {
  type: TaskType;
  target: TaskTarget;
  reasoning: string;
}

export interface Workflow {
  id: string;
  tenant_id: string;
  user_id: string;
  goal: string;
  steps: WorkflowStep[];
  created_at: Date;
  updated_at: Date;
  success_count: number;
}

// ============================================
// Agent Types
// ============================================

export interface PerceptionOutput {
  page_type: string;
  page_title: string;
  page_url: string;
  interactive_elements: InteractiveElement[];
  forms: FormElement[];
  buttons: ButtonElement[];
  errors: string[];
  progress: string | null;
  confidence: number;
}

export interface InteractiveElement {
  id: string;
  type: 'input' | 'button' | 'link' | 'select' | 'checkbox' | 'radio' | 'textarea';
  selector: string;
  coordinates: Coordinates;
  text: string;
  placeholder?: string;
  value?: string;
  is_visible: boolean;
  is_enabled: boolean;
}

export interface FormElement {
  id: string;
  name: string;
  fields: InteractiveElement[];
  submit_button?: ButtonElement;
}

export interface ButtonElement {
  id: string;
  selector: string;
  coordinates: Coordinates;
  text: string;
  type: 'submit' | 'button' | 'link';
  is_primary: boolean;
}

export interface PlannerOutput {
  action: AgentAction;
  target: TaskTarget;
  confidence: number;
  reasoning: string;
  alternatives: AlternativeAction[];
  /** Set when action=ask_user_field — the profile field key being requested */
  field_key?: string;
  /** Human-readable label for the missing field (e.g. "GitHub URL") */
  field_label?: string;
  /** Previous value from profile if the field already exists */
  field_existing_value?: string;
  /** Category of obstacle that triggered ask_user (captcha, login_wall, security_check) */
  obstacle_type?: 'captcha' | 'login_wall' | 'security_check' | 'unknown';
}

export type AgentAction = 'click' | 'type' | 'scroll' | 'navigate' | 'wait' | 'complete' | 'ask_user' | 'ask_user_field' | 'screenshot';

export interface AlternativeAction {
  action: AgentAction;
  target: TaskTarget;
  confidence: number;
  reasoning: string;
}

export interface VerifierOutput {
  success: boolean;
  matches_expectation: boolean;
  differences: string[];
  should_retry: boolean;
  should_replan: boolean;
  user_intervention_needed: boolean;
  confidence: number;
}

// ============================================
// Subscription Types
// ============================================

export interface Subscription {
  id: string;
  tenant_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PlanFeatures {
  tasks_per_month: number;
  concurrent_sessions: number;
  history_retention_days: number;
  support: 'community' | 'email' | 'priority' | 'dedicated';
  api_access: boolean;
  team_members: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ============================================
// WebSocket Event Types
// ============================================

export type WebSocketEventType =
  | 'session:started'
  | 'session:paused'
  | 'session:resumed'
  | 'session:completed'
  | 'session:failed'
  | 'task:started'
  | 'task:completed'
  | 'task:failed'
  | 'perception:update'
  | 'user:prompt'
  | 'user:field_prompt'
  | 'agent:thought'
  | 'error';

export interface WebSocketEvent<T = unknown> {
  type: WebSocketEventType;
  session_id: string;
  timestamp: Date;
  data: T;
}

export interface TaskStartedEvent {
  task_id: string;
  type: TaskType;
  target: TaskTarget;
  reasoning: string;
}

export interface TaskCompletedEvent {
  task_id: string;
  success: boolean;
  screenshot_url?: string;
  duration_ms: number;
}

export interface UserPromptEvent {
  prompt_id: string;
  message: string;
  options?: string[];
  timeout_seconds?: number;
  obstacle_type?: 'captcha' | 'login_wall' | 'security_check' | 'unknown';
}

/** Structured prompt when agent needs a specific profile field value */
export interface FieldPromptEvent {
  field_key: string;
  field_label: string;
  existing_value?: string;
  message: string;
}

export interface AgentThoughtEvent {
  message: string;
}

// ============================================
// Voice Command Types
// ============================================

export interface VoiceCommand {
  type: 'start' | 'stop' | 'pause' | 'resume' | 'skip' | 'custom';
  text: string;
  confidence: number;
  timestamp: Date;
}
