/**
 * 독대 API
 * POST /api/agent/dokdae
 *
 * 텐원(대표)과 열시일분(1001)의 1:1 전용 채널.
 * 에이전트 현황·트렌드·태스크 카드를 함께 반환.
 *
 * Auth: 로그인 필수 (requireAuthOrAdmin)
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuthOrAdmin } from '@/lib/supabase/api-utils';
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
  const { error: authErr } = await requireAuthOrAdmin(request);
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

    // 1001에게 직접 전달
    const result = await invokeAgent({
      agentName: '1001',
      userMessage: `[독대 채널 — 텐원 직접 지시]\n${userMessage}`,
      correlationId: corrId,
    });

    // 사이드 데이터 병렬 조회
    const supabase = await createClient();

    const [agentsRes, trendsRes] = await Promise.allSettled([
      supabase
        .from('agent_profiles')
        .select('name, display_name, is_active, layer, risk_level')
        .order('layer', { ascending: true }),
      supabase
        .from('mindle_trends')
        .select('title, summary, source_url, tags, published_at')
        .order('published_at', { ascending: false })
        .limit(3),
    ]);

    const cards: (AgentStatusCard | TrendCard)[] = [];

    if (agentsRes.status === 'fulfilled' && agentsRes.value.data) {
      agentsRes.value.data.slice(0, 6).forEach((a) => {
        cards.push({
          type: 'agent_status',
          name: a.name,
          displayName: a.display_name,
          isActive: a.is_active,
          layer: a.layer,
          riskLevel: a.risk_level,
        });
      });
    }

    if (trendsRes.status === 'fulfilled' && trendsRes.value.data) {
      trendsRes.value.data.forEach((t) => {
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
