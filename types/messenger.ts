// ============================================
// Messenger Hub 타입 정의
// 통합 커맨드 센터: 사람 + 클라우드AI + 로컬AI + 서비스
// ============================================

// ── 스레드 타입 ────────────────────────────────

export type ThreadType = 'dm' | 'group' | 'channel' | 'agent_dm' | 'service';
export type AgentRuntime = 'cloud' | 'local';
export type SenderType = 'human' | 'agent' | 'system' | 'service' | 'local_agent';
export type MessageFormat = 'text' | 'action_card' | 'file' | 'rich';

// ── Action Card ────────────────────────────────

export type ActionButtonType = 'navigate' | 'callback' | 'dismiss' | 'delegate';
export type ActionButtonStyle = 'primary' | 'secondary' | 'danger';
export type ActionStatus = 'pending' | 'acted' | 'expired';

export interface ActionButton {
  id: string;
  label: string;
  type: ActionButtonType;
  url?: string;              // navigate
  callback_url?: string;     // callback
  callback_payload?: Record<string, unknown>;
  delegate_to?: string;      // delegate: 에이전트 이름
  style?: ActionButtonStyle;
}

export interface ActionPayload {
  title: string;
  body: string;
  actions: ActionButton[];
  status: ActionStatus;
  acted_action_id?: string | null;
  acted_at?: string | null;
  acted_by?: string | null;
}

// ── Service Hook ───────────────────────────────

export type ServicePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ServiceHookPayload {
  service: string;
  event: string;
  title: string;
  body: string;
  recipients?: string[];
  thread_id?: string;
  correlation_id?: string;
  priority?: ServicePriority;
  expires_at?: string;
  actions?: ActionButton[];
  metadata?: Record<string, unknown>;
}

export interface ServiceHookResponse {
  success: boolean;
  message_id: string;
  thread_id: string;
}

// ── Action Callback ────────────────────────────

export interface ActionCallbackPayload {
  message_id: string;
  thread_id: string;
  action_id: string;
  user_id: string;
  user_name: string;
  correlation_id?: string;
  original_payload: Record<string, unknown>;
}

export interface ActionCallbackResponse {
  success: boolean;
  follow_up?: {
    title: string;
    body: string;
    actions?: ActionButton[];
  };
  delegate?: {
    agent_name: string;
    message: string;
    context?: Record<string, unknown>;
  };
}

// ── Service Hook 등록 ──────────────────────────

export interface MessengerServiceHook {
  id: string;
  service_name: string;
  display_name: string;
  icon: string | null;
  color: string | null;
  webhook_url: string | null;
  callback_base: string | null;
  events: string[];
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

// ── 확장된 Chat 타입 ──────────────────────────

export interface MessengerThread {
  id: string;
  name: string | null;
  is_group: boolean;
  thread_type: ThreadType;
  description?: string;
  agent_name?: string;
  service_name?: string;
  agent_runtime?: AgentRuntime;
  participants: string[];
  is_pinned: boolean;
  is_muted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessengerMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  type: string;
  sender_type: SenderType;
  message_format: MessageFormat;
  action_payload?: ActionPayload | null;
  correlation_id?: string | null;
  metadata?: Record<string, unknown> | null;
  read_by: string[];
  created_at: string;
}

// ── Local Agent Bridge ─────────────────────────

export interface LocalAgentStatus {
  name: string;
  display_name: string;
  runtime: AgentRuntime;
  endpoint: string;
  is_online: boolean;
  last_health_check: string;
  fallback_agent: string | null;
}

export interface AgentProfileExtended {
  id: string;
  name: string;
  display_name: string;
  layer: number;
  agent_type: string;
  runtime: AgentRuntime;
  local_endpoint?: string;
  fallback_agent?: string;
  model_id: string;
  is_active: boolean;
  brand_id: string;
}
