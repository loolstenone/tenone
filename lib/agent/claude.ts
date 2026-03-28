/**
 * Claude API 모듈 — 에이전트 코어
 * 에이전트 프로필 기반으로 Claude API를 호출하고 메시지를 로깅한다.
 */
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import type { AgentProfile, AgentMessage } from '@/types/agent';

// Anthropic 클라이언트 (API 키가 있을 때만 생성)
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

  console.log('[Agent] ANTHROPIC_API_KEY:', apiKey ? `${apiKey.substring(0, 15)}... (${apiKey.length}자)` : 'NOT SET');
  if (!apiKey || apiKey.trim() === '') return null;
  return new Anthropic({ apiKey });
}

/** 에이전트 프로필 조회 */
export async function getAgentProfile(name: string): Promise<AgentProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('agent_profiles')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as AgentProfile;
}

/** 모든 활성 에이전트 프로필 조회 */
export async function listAgentProfiles(): Promise<AgentProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('agent_profiles')
    .select('*')
    .eq('is_active', true)
    .order('layer', { ascending: true });

  if (error || !data) return [];
  return data as AgentProfile[];
}

/** 에이전트 메시지 로깅 */
async function logMessage(
  message: Omit<AgentMessage, 'id' | 'created_at'>
): Promise<string | null> {
  const supabase = await createClient();
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

/** Mock 응답 생성 (API 키 없을 때) */
function createMockResponse(agentName: string, userMessage: string): string {
  return `[Mock 응답 — ANTHROPIC_API_KEY 미설정]\n\n` +
    `에이전트: ${agentName}\n` +
    `입력: ${userMessage}\n\n` +
    `실제 Claude API 연동을 위해 .env.local에 ANTHROPIC_API_KEY를 설정하세요.`;
}

/** 에이전트 실행: 프로필 로드 → Claude 호출 → 로깅 → 응답 반환 */
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

  // 1. 에이전트 프로필 조회
  const profile = await getAgentProfile(agentName);
  if (!profile) {
    throw new Error(`에이전트를 찾을 수 없습니다: ${agentName}`);
  }

  // 2. 사용자 입력 로깅
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

  // 3. Claude API 호출 (또는 Mock)
  const anthropic = getAnthropicClient();
  let responseText: string;
  let confidence = 0.9;

  if (!anthropic) {
    // API 키 없으면 Mock 응답
    responseText = createMockResponse(agentName, userMessage);
    confidence = 0;
  } else {
    try {
      const message = await anthropic.messages.create({
        model: profile.model_id || 'claude-sonnet-4-6',
        max_tokens: profile.max_tokens || 4096,
        temperature: profile.temperature || 0.3,
        system: profile.system_prompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      // 텍스트 블록 추출
      responseText = message.content
        .filter((block) => block.type === 'text')
        .map((block) => {
          if (block.type === 'text') return block.text;
          return '';
        })
        .join('\n');

      // stop_reason 기반 confidence 조정
      if (message.stop_reason === 'end_turn') {
        confidence = 0.95;
      } else if (message.stop_reason === 'max_tokens') {
        confidence = 0.7;
      }
    } catch (error) {
      console.error(`[Agent] Claude API 호출 실패 (${agentName}):`, error);
      responseText = `에이전트 오류: ${error instanceof Error ? error.message : 'Unknown error'}`;
      confidence = 0;
    }
  }

  // 4. 응답 로깅
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
