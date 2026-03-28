// ============================================
// Agent Core 타입 정의
// Ten:One Universe Operating System - Phase 1
// ============================================

/** 에이전트 레이어 */
export type AgentLayer = 0 | 1 | 2 | 3;

/** 에이전트 유형 */
export type AgentType = 'meta' | 'infra' | 'brand' | 'sub';

/** 리스크 레벨 */
export type RiskLevel = 'green' | 'yellow' | 'red';

/** 메시지 유형 */
export type MessageType = 'user_input' | 'agent_response' | 'route' | 'invoke' | 'error';

/** 에이전트 도구 정의 */
export interface AgentTool {
  name: string;
  endpoint: string;
  description?: string;
}

/** 에이전트 프로필 (DB 스키마 매핑) */
export interface AgentProfile {
  id: string;
  name: string;
  display_name: string;
  layer: AgentLayer;
  agent_type: AgentType;
  model_id: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  knowledge_refs: string[];
  tools: AgentTool[];
  risk_level: RiskLevel;
  can_invoke: string[];
  is_active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

/** 에이전트 메시지 (DB 스키마 매핑) */
export interface AgentMessage {
  id: string;
  from_agent: string;
  to_agent: string;
  message_type: MessageType;
  payload: {
    input?: string;
    output?: string;
    routed_to?: string;
    error?: string;
    [key: string]: unknown;
  };
  risk_level: RiskLevel;
  confidence: number | null;
  correlation_id: string | null;
  user_id: string | null;
  created_at: string;
}

/** Agent Hub 요청 */
export interface AgentHubRequest {
  message: string;
  agentName?: string;
  userId?: string;
  correlationId?: string;
}

/** Agent Hub 응답 */
export interface AgentHubResponse {
  response: string;
  agentName: string;
  messageId: string;
  correlationId: string;
  confidence?: number;
  error?: string;
}

/** 에이전트 프로필 생성 요청 */
export interface CreateAgentProfileRequest {
  name: string;
  display_name: string;
  layer?: AgentLayer;
  agent_type?: AgentType;
  model_id?: string;
  system_prompt: string;
  temperature?: number;
  max_tokens?: number;
  knowledge_refs?: string[];
  tools?: AgentTool[];
  risk_level?: RiskLevel;
  can_invoke?: string[];
}
