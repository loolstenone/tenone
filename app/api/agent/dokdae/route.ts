/**
 * 독대 API
 * POST /api/agent/dokdae
 *
 * 텐원(대표)과 열시일분(1001)의 1:1 전용 채널.
 * 에이전트 현황·트렌드·태스크 카드를 함께 반환.
 *
 * Auth: 로그인 필수 (requireAuth)
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuth } from '@/lib/supabase/api-utils';
import { invokeAgent } from '@/lib/agent/claude';
import { createClient } from '@/lib/supabase/server';

export interface DokdaeRequest {
  message: string;
  quickAction?: 'morning_briefing' | 'agent_status' | 'trend_summary' | 'today_tasks';
}

export interface AgentStatusCard {
  type: 'agent_status';
  name: string;
  displayName: string;
  isActive: boolean;
  layer: number;
  riskLevel: string;
}

export interface TrendCard {
  type: 'trend';
  title: string;
  summary: string;
  source?: string;
  tags: string[];
  publishedAt?: string;
}

export interface DokdaeResponse {
  response: string;
  agentName: string;
  messageId: string;
  correlationId: string;
  cards?: (AgentStatusCard | TrendCard)[];
}

const QUICK_PROMPTS: Record<string, string> = {
  morning_briefing:
    'AM 10:01 브리핑을 수행해줘. Universe 각 에이전트 현황과 오늘의 방향 제안을 포함해서.',
  agent_status:
    '현재 Universe 에이전트 전체 현황을 보고해줘. 각 에이전트 상태와 최근 활동 요약.',
  trend_summary:
    '오늘 Mindle 트렌드 중 텐원에게 중요한 신호 3가지를 골라 요약해줘.',
  today_tasks:
    '오늘 처리해야 할 Universe 주요 사항과 각 브랜드 우선순위를 정리해줘.',
};

export async function POST(request: NextRequest) {
  const { error: authErr, user } = await requireAuth();
  if (authErr) return authErr;

  try {
    const body: DokdaeRequest = await request.json();
    const { message, quickAction } = body;

    const userMessage = quickAction
      ? QUICK_PROMPTS[quickAction] || message
      : message;

    if (!userMessage || typeof userMessage !== 'string') {
      return errorResponse('message 필드가 필요합니다.', 400);
    }

    const corrId = `dokdae-${Date.now()}`;
    const supabase = await createClient();

    // 유저 메시지 저장
    await supabase.from('agent_messages').insert({
      from_agent: 'user',
      to_agent: '1001',
      message_type: 'dokdae_chat',
      payload: { text: message, quickAction: quickAction ?? null },
      risk_level: 'green',
      correlation_id: corrId,
      user_id: user!.id,
    });

    // 1001에게 직접 전달
    const result = await invokeAgent({
      agentName: '1001',
      userMessage: `[독대 채널 — 텐원 직접 지시]\n${userMessage}`,
      correlationId: corrId,
      userId: user!.id,
    });

    // 트렌드 카드: trend_summary 또는 morning_briefing 때만 첨부
    const cards: (AgentStatusCard | TrendCard)[] = [];

    if (quickAction === 'trend_summary' || quickAction === 'morning_briefing') {
      const trendsRes = await supabase
        .from('mindle_trends')
        .select('title, summary, source_url, tags, published_at')
        .order('published_at', { ascending: false })
        .limit(3);

      if (trendsRes.data) {
        trendsRes.data.forEach((t) => {
          cards.push({
            type: 'trend',
            title: t.title,
            summary: t.summary,
            source: t.source_url,
            tags: t.tags ?? [],
            publishedAt: t.published_at,
          });
        });
      }
    }

    // AI 응답 저장
    await supabase.from('agent_messages').insert({
      from_agent: '1001',
      to_agent: 'user',
      message_type: 'dokdae_chat',
      payload: { text: result.response, cards },
      risk_level: 'green',
      correlation_id: corrId,
      user_id: user!.id,
    });

    const response: DokdaeResponse = {
      response: result.response,
      agentName: '1001',
      messageId: result.messageId || corrId,
      correlationId: corrId,
      cards,
    };

    return successResponse(response);
  } catch (error) {
    console.error('[독대] 오류:', error);
    return errorResponse(
      error instanceof Error ? error.message : '독대 오류',
      500,
    );
  }
}
