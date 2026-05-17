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

  // 4. API 호출 — 로컬 에이전트면 Ollama, 아니면 Claude API
  const isLocal = profile.runtime === 'local';
  const localEndpoint = profile.local_endpoint;

  let responseText: string;
  let confidence = 0.9;

  if (isLocal && localEndpoint) {
    // ── 로컬 AI (Ollama) 직접 호출 ──
    try {
      const ollamaUrl = localEndpoint.includes('/api/chat')
        ? localEndpoint
        : `${new URL(localEndpoint).origin}/api/chat`;

      // system prompt + 히스토리 + 현재 메시지 조립
      const ollamaMessages = [
        { role: 'system' as const, content: profile.system_prompt },
        ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: 'user' as const, content: userMessage },
      ];

      const ollamaRes = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: profile.model_id || 'gemma4:e4b',
          messages: ollamaMessages,
          stream: false,
          options: {
            temperature: profile.temperature || 0.3,
            num_predict: profile.max_tokens || 2048,
          },
        }),
        signal: AbortSignal.timeout(120000),
      });

      if (!ollamaRes.ok) {
        throw new Error(`Ollama error ${ollamaRes.status}`);
      }

      const ollamaData = await ollamaRes.json() as { message?: { content?: string }; model?: string };
      responseText = ollamaData.message?.content || '';
      confidence = 0.85;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Agent:${agentName}] LOCAL response (${ollamaData.model}): ${responseText.slice(0, 80)}...`);
      }
    } catch (error) {
      // 로컬 실패 → 폴백 에이전트(클라우드)로 위임
      const fallbackAgent = profile.fallback_agent || '1001';
      console.warn(`[Agent] 로컬 AI 실패 (${agentName}), ${fallbackAgent}로 폴백:`, error);

      try {
        const fallbackResult = await invokeAgent({
          agentName: fallbackAgent,
          userMessage: `[${agentName} 오프라인 — 대신 응답] ${userMessage}`,
          userId,
          correlationId,
        });
        responseText = fallbackResult.response;
        confidence = fallbackResult.confidence;
      } catch {
        responseText = `${agentName} 오프라인, 폴백도 실패했습니다.`;
        confidence = 0;
      }
    }
  } else if (!getAnthropicClient()) {
    responseText = createMockResponse(agentName, userMessage);
    confidence = 0;
  } else {
    const anthropic = getAnthropicClient()!;
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
      // 401 인증 실패 — 친절한 안내 (raw JSON 노출 금지)
      const status = (error as { status?: number })?.status;
      if (status === 401) {
        responseText =
          '🔑 **ANTHROPIC_API_KEY가 만료되었거나 유효하지 않습니다.**\n\n' +
          '코드는 정상이고 키 문제입니다. 텐원 직접 조치 필요:\n\n' +
          '1. https://console.anthropic.com/settings/keys 에서 새 키 발급\n' +
          '2. `.env.local`의 `ANTHROPIC_API_KEY` 갱신\n' +
          '3. Vercel Dashboard > Environment Variables도 갱신 (프로덕션용)\n' +
          '4. 로컬 dev 서버 재시작 (`preview_start` 재호출), Vercel은 재배포 자동\n\n' +
          '📌 참고: Supabase Edge Function 환경변수는 별개입니다. trend-crawl은 정상 가동 중(15:15 KST 257건 수집).';
      } else if (status === 429) {
        responseText = '⏱ Anthropic API 사용량 제한(429). 잠시 후 다시 시도하거나 결제 상태를 확인하세요.';
      } else if (status === 529) {
        responseText = '🌐 Anthropic 일시 과부하(529). 잠시 후 다시 시도해주세요.';
      } else {
        responseText = `에이전트 오류: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
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
