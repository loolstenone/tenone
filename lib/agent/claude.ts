/**
 * Claude API 모듈 — 에이전트 코어
 *
 * ✅ Prompt Caching   — 시스템 프롬프트 + 대화 히스토리 끝에 cache_control 적용
 * ✅ 대화 히스토리     — user_id × agentName 기준 최근 N턴 자동 로드
 */
import Anthropic from '@anthropic-ai/sdk';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { AgentProfile, AgentMessage } from '@/types/agent';

// 에이전트 전용 서비스 클라이언트 (RLS 우회)
function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── Anthropic 클라이언트 ─────────────────────────────────────────

function getAnthropicClient(): Anthropic | null {
  let apiKey = process.env.ANTHROPIC_API_KEY;

  // Turbopack/Next.js 16에서 서버 env가 안 읽히는 경우 직접 로드
  if (!apiKey) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
          if (line.startsWith('ANTHROPIC_API_KEY=')) {
            apiKey = line.split('=').slice(1).join('=').trim();
            break;
          }
        }
      }
    } catch {}
  }

  if (!apiKey || apiKey.trim() === '') return null;
  return new Anthropic({ apiKey });
}

// ── 프로필 조회 ──────────────────────────────────────────────────

export async function getAgentProfile(name: string): Promise<AgentProfile | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('agent_profiles')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as AgentProfile;
}

export async function listAgentProfiles(): Promise<AgentProfile[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('agent_profiles')
    .select('*')
    .eq('is_active', true)
    .order('layer', { ascending: true });

  if (error || !data) return [];
  return data as AgentProfile[];
}

// ── 메시지 로깅 ──────────────────────────────────────────────────

async function logMessage(
  message: Omit<AgentMessage, 'id' | 'created_at'>
): Promise<string | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('agent_messages')
    .insert(message)
    .select('id')
    .single();

  if (error) {
    console.error('[Agent] 메시지 로깅 실패:', error.message);
    return null;
  }
  return data?.id ?? null;
}

// ── 대화 히스토리 로드 ───────────────────────────────────────────

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

/**
 * agent_messages에서 해당 user × agent의 최근 N턴을 로드한다.
 * user_input / agent_response 타입만 대상으로 하여 중복 없이 추출.
 */
async function loadConversationHistory(
  agentName: string,
  userId: string,
  maxTurns = 10,
): Promise<HistoryMessage[]> {
  const supabase = getServiceClient();

  const { data } = await supabase
    .from('agent_messages')
    .select('from_agent, message_type, payload, created_at')
    .eq('user_id', userId)
    .in('message_type', ['user_input', 'agent_response'])
    .or(
      `and(from_agent.eq.user,to_agent.eq.${agentName}),` +
      `and(from_agent.eq.${agentName},to_agent.eq.user)`
    )
    .order('created_at', { ascending: false })
    .limit(maxTurns * 2);   // N턴 = N*2 메시지

  if (!data?.length) return [];

  return (data as Array<{
    from_agent: string;
    message_type: string;
    payload: Record<string, unknown>;
    created_at: string;
  }>)
    .reverse()
    .map((row) => {
      const isUser = row.from_agent === 'user';
      const content = isUser
        ? String((row.payload as { input?: string }).input ?? '')
        : String((row.payload as { output?: string }).output ?? '');
      return { role: (isUser ? 'user' : 'assistant') as 'user' | 'assistant', content };
    })
    .filter((m) => m.content.length > 0);
}

/**
 * 히스토리를 Anthropic MessageParam 배열로 변환.
 * 마지막 히스토리 메시지에 cache_control 추가 → 다음 요청 시 히스토리 전체가 캐시됨.
 */
function buildMessageParams(
  history: HistoryMessage[],
  currentMessage: string,
): Anthropic.MessageParam[] {
  const params: Anthropic.MessageParam[] = [];

  history.forEach((msg, idx) => {
    const isLastHistory = idx === history.length - 1;

    if (isLastHistory) {
      // 히스토리 끝 캐시 포인트 — 이후 호출에서 재사용
      params.push({
        role: msg.role,
        content: [
          {
            type: 'text',
            text: msg.content,
            cache_control: { type: 'ephemeral' },
          },
        ],
      });
    } else {
      params.push({ role: msg.role, content: msg.content });
    }
  });

  // 현재 메시지 (캐시 없음 — 매번 새로움)
  params.push({ role: 'user', content: currentMessage });

  return params;
}

// ── Mock 응답 ─────────────────────────────────────────────────────

function createMockResponse(agentName: string, userMessage: string): string {
  return (
    `[Mock 응답 — ANTHROPIC_API_KEY 미설정]\n\n` +
    `에이전트: ${agentName}\n` +
    `입력: ${userMessage}\n\n` +
    `실제 Claude API 연동을 위해 .env.local에 ANTHROPIC_API_KEY를 설정하세요.`
  );
}

// ── invokeAgent ───────────────────────────────────────────────────

/**
 * 에이전트 실행
 * 1. 프로필 로드
 * 2. 대화 히스토리 로드 (userId 있을 때)
 * 3. 현재 메시지 로깅
 * 4. Claude API 호출 (Prompt Cache + 히스토리 포함)
 * 5. 응답 로깅 → 반환
 */
export async function invokeAgent(params: {
  agentName: string;
  userMessage: string;
  userId?: string;
  correlationId?: string;
}): Promise<{
  response: string;
  messageId: string | null;
  confidence: number;
}> {
  const { agentName, userMessage, userId, correlationId } = params;

  // 1. 프로필 조회
  const profile = await getAgentProfile(agentName);
  if (!profile) throw new Error(`에이전트를 찾을 수 없습니다: ${agentName}`);

  // 2. 대화 히스토리 로드 (userId 있을 때만)
  const history = userId
    ? await loadConversationHistory(agentName, userId, 10)
    : [];

  // 3. 현재 메시지 로깅
  const inputMessageId = await logMessage({
    from_agent: 'user',
    to_agent: agentName,
    message_type: 'user_input',
    payload: { input: userMessage },
    risk_level: 'green',
    confidence: null,
    correlation_id: correlationId || null,
    user_id: userId || null,
  });

  // 4. Claude API 호출
  const anthropic = getAnthropicClient();
  let responseText: string;
  let confidence = 0.9;

  if (!anthropic) {
    responseText = createMockResponse(agentName, userMessage);
    confidence = 0;
  } else {
    try {
      const messages = buildMessageParams(history, userMessage);

      const message = await anthropic.messages.create({
        model: profile.model_id || 'claude-sonnet-4-6',
        max_tokens: profile.max_tokens || 4096,
        temperature: profile.temperature || 0.3,

        // ✅ Prompt Cache — 시스템 프롬프트 캐시 포인트
        system: [
          {
            type: 'text',
            text: profile.system_prompt,
            cache_control: { type: 'ephemeral' },
          },
        ],

        // ✅ 히스토리 + 현재 메시지 (히스토리 끝에 추가 캐시 포인트)
        messages,
      });

      responseText = message.content
        .filter((block) => block.type === 'text')
        .map((block) => (block.type === 'text' ? block.text : ''))
        .join('\n');

      // 캐시 사용량 로그 (개발용)
      if (process.env.NODE_ENV === 'development') {
        const usage = message.usage as unknown as Record<string, number>;
        console.log(
          `[Agent:${agentName}] tokens — ` +
          `input: ${usage.input_tokens}, ` +
          `output: ${usage.output_tokens}, ` +
          `cache_read: ${usage.cache_read_input_tokens ?? 0}, ` +
          `cache_write: ${usage.cache_creation_input_tokens ?? 0}`
        );
      }

      confidence = message.stop_reason === 'end_turn' ? 0.95
                 : message.stop_reason === 'max_tokens' ? 0.7
                 : 0.85;

    } catch (error) {
      console.error(`[Agent] Claude API 호출 실패 (${agentName}):`, error);
      responseText = `에이전트 오류: ${error instanceof Error ? error.message : 'Unknown error'}`;
      confidence = 0;
    }
  }

  // 5. 응답 로깅
  const responseMessageId = await logMessage({
    from_agent: agentName,
    to_agent: 'user',
    message_type: 'agent_response',
    payload: { output: responseText, input: userMessage },
    risk_level: profile.risk_level || 'green',
    confidence,
    correlation_id: correlationId || inputMessageId || null,
    user_id: userId || null,
  });

  return {
    response: responseText,
    messageId: responseMessageId || inputMessageId || null,
    confidence,
  };
}
