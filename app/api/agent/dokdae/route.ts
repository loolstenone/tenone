/**
 * 독대 API
 * POST /api/agent/dokdae
 *
 * 텐원과 AI 에이전트 채널.
 *  - mode='agent' (기본): 특정 에이전트 1명과 1:1 대화
 *  - mode='group'        : 텐원 AI 팀 단체 채팅방. 1001이 Haiku 라우터로 적합한
 *                          에이전트 1~3명을 결정 → 병렬 invoke → 모든 응답 반환
 *
 * Auth: 로그인 필수 (requireAuth)
 */
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { successResponse, errorResponse, requireAuth } from '@/lib/supabase/api-utils';
import { invokeAgent, listAgentProfiles } from '@/lib/agent/claude';
import { createClient } from '@/lib/supabase/server';

export interface DokdaeRequest {
  message: string;
  mode?: 'agent' | 'group';
  agentName?: string;
  /** @멘션 — group 모드에서 라우터 우회. 매칭되는 에이전트만 응답 */
  mention?: string;
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

export interface DokdaeAgentReply {
  agentName: string;        // ex: 'mindle'
  displayName: string;      // ex: 'Mindle'
  layer: number;            // 0/1/2/3
  response: string;
  messageId: string | null;
}

export interface DokdaeResponse {
  mode: 'agent' | 'group';
  // mode='agent' 호환 필드
  response?: string;
  agentName?: string;
  messageId?: string;
  // mode='group' 필드
  routerNote?: string;             // 1001이 왜 이 에이전트들을 골랐는지
  replies?: DokdaeAgentReply[];    // 호출된 에이전트들의 응답 (1~3)
  // 공통
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

// ── Haiku 라우터 ────────────────────────────────────────────────
// 텐원의 메시지를 보고, 응답할 에이전트 1~3명을 결정한다.
// 1001 자체는 직접 응답하지 않고 라우팅만 한다 (비용·중복 절감).

interface RouterDecision {
  agents: string[];
  reason: string;
}

async function decideRoutingHaiku(args: {
  message: string;
  candidates: Array<{ name: string; display_name: string; agent_type: string; layer: number }>;
}): Promise<RouterDecision> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // 폴백: API 키 없으면 1001만 응답
    return { agents: ['1001'], reason: 'ANTHROPIC_API_KEY 미설정 — 1001만 응답' };
  }

  const anthropic = new Anthropic({ apiKey });

  const roster = args.candidates
    .map(a => `- ${a.name} (${a.display_name}, ${a.agent_type}, layer ${a.layer})`)
    .join('\n');

  const prompt =
    `너는 Ten:One Universe AI 팀의 라우터다. 텐원이 단체 채팅방에 메시지를 보냈다. ` +
    `어떤 에이전트가 응답해야 할지 결정한다.\n\n` +
    `규칙:\n` +
    `1. 1~3명만 선택. 가능하면 1명, 협업 필요 시 2~3명.\n` +
    `2. 메시지와 관련 없는 에이전트는 절대 선택하지 않는다.\n` +
    `3. 1001(열시일분)은 라우터이므로 응답자에서 제외한다.\n` +
    `4. 응답은 반드시 JSON. 다른 텍스트 금지.\n\n` +
    `에이전트 명단:\n${roster}\n\n` +
    `텐원의 메시지: ${args.message}\n\n` +
    `JSON으로 응답:\n{"agents":["name1","name2"],"reason":"왜 이들을 골랐는지 50자 이내"}`;

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content[0].type === 'text' ? res.content[0].text : '';
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as RouterDecision;

    // 안전장치: 1001 제외, candidate에 있는 이름만, 최대 3명
    const allowed = new Set(args.candidates.map(a => a.name).filter(n => n !== '1001'));
    const filtered = (parsed.agents ?? []).filter(n => allowed.has(n)).slice(0, 3);

    if (filtered.length === 0) {
      // 라우터가 아무도 못 고르면 mindle을 기본으로 (가장 활발한 에이전트)
      return { agents: ['mindle'], reason: parsed.reason || '기본 라우팅' };
    }

    return { agents: filtered, reason: parsed.reason || '' };
  } catch (err) {
    console.error('[독대 라우터] Haiku 호출 실패:', err);
    return { agents: ['mindle'], reason: '라우터 오류 — mindle 기본 라우팅' };
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr, user } = await requireAuth();
  if (authErr) return authErr;

  try {
    const body: DokdaeRequest = await request.json();
    const { message, quickAction, agentName: reqAgentName } = body;
    const mode = body.mode ?? 'agent';

    const userMessage = quickAction
      ? QUICK_PROMPTS[quickAction] || message
      : message;

    if (!userMessage || typeof userMessage !== 'string') {
      return errorResponse('message 필드가 필요합니다.', 400);
    }

    const corrId = `dokdae-${Date.now()}`;
    const supabase = await createClient();

    // ── 유저 메시지 저장 (모드 표시) ────────────────────────────
    await supabase.from('agent_messages').insert({
      from_agent: 'user',
      to_agent: mode === 'group' ? 'group' : (reqAgentName || '1001'),
      message_type: 'dokdae_chat',
      payload: { text: message, quickAction: quickAction ?? null, mode },
      risk_level: 'green',
      correlation_id: corrId,
      user_id: user!.id,
    });

    // ── 트렌드 카드 (quickAction 일부에서 첨부) ─────────────────
    const cards: (AgentStatusCard | TrendCard)[] = [];
    if (quickAction === 'trend_summary' || quickAction === 'morning_briefing') {
      const trendsRes = await supabase
        .from('mindle_trends')
        .select('title, summary, source_urls, tags, published_at')
        .order('published_at', { ascending: false })
        .limit(3);
      if (trendsRes.data) {
        trendsRes.data.forEach((t) => {
          cards.push({
            type: 'trend',
            title: t.title,
            summary: t.summary,
            source: Array.isArray(t.source_urls) ? t.source_urls[0] : undefined,
            tags: t.tags ?? [],
            publishedAt: t.published_at,
          });
        });
      }
    }

    // ════════════════════════════════════════════════════════════
    //  mode === 'agent' — 기존 1:1 흐름 유지
    // ════════════════════════════════════════════════════════════
    if (mode === 'agent') {
      const targetAgent = reqAgentName || '1001';
      const result = await invokeAgent({
        agentName: targetAgent,
        userMessage: `[독대 채널 — 텐원 직접 지시]\n${userMessage}`,
        correlationId: corrId,
        userId: user!.id,
      });

      await supabase.from('agent_messages').insert({
        from_agent: targetAgent,
        to_agent: 'user',
        message_type: 'dokdae_chat',
        payload: { text: result.response, cards, mode: 'agent', agentName: targetAgent },
        risk_level: 'green',
        correlation_id: corrId,
        user_id: user!.id,
      });

      const response: DokdaeResponse = {
        mode: 'agent',
        response: result.response,
        agentName: targetAgent,
        messageId: result.messageId || corrId,
        correlationId: corrId,
        cards,
      };
      return successResponse(response);
    }

    // ════════════════════════════════════════════════════════════
    //  mode === 'group' — 텐원 AI 팀 단체 채팅방
    // ════════════════════════════════════════════════════════════

    // 1) 라우팅 후보 = 활성 에이전트 전부 (1001 자체는 라우터에서 제외)
    const allAgents = await listAgentProfiles();
    const routingCandidates = allAgents.map(a => ({
      name: a.name,
      display_name: a.display_name,
      agent_type: a.agent_type ?? 'agent',
      layer: a.layer ?? 2,
    }));

    // 2) 라우팅 결정: @멘션이 있으면 라우터 우회, 없으면 Haiku 라우터
    let decision: RouterDecision;
    if (body.mention) {
      const mentionLower = body.mention.toLowerCase();
      const exists = allAgents.find(a =>
        a.name.toLowerCase() === mentionLower ||
        (a.display_name ?? '').toLowerCase().includes(mentionLower),
      );
      if (exists && exists.name !== '1001') {
        decision = { agents: [exists.name], reason: `@멘션 직접 호출: ${exists.display_name ?? exists.name}` };
      } else {
        // 매칭 실패 → 일반 라우터로 폴백
        decision = await decideRoutingHaiku({ message: userMessage, candidates: routingCandidates });
      }
    } else {
      decision = await decideRoutingHaiku({ message: userMessage, candidates: routingCandidates });
    }

    // 라우터 결정 메시지 저장 (1001이 한 결정으로 기록)
    await supabase.from('agent_messages').insert({
      from_agent: '1001',
      to_agent: 'group',
      message_type: 'dokdae_routing',
      payload: { agents: decision.agents, reason: decision.reason },
      risk_level: 'green',
      correlation_id: corrId,
      user_id: user!.id,
    });

    // 3) 결정된 에이전트들 병렬 invoke
    const profileByName = new Map(allAgents.map(a => [a.name, a]));
    const replies: DokdaeAgentReply[] = await Promise.all(
      decision.agents.map(async (name) => {
        const profile = profileByName.get(name);
        try {
          const r = await invokeAgent({
            agentName: name,
            userMessage: `[독대 단체방 — 텐원이 팀 전체에 보낸 메시지]\n${userMessage}\n\n(라우터 1001 메모: ${decision.reason})`,
            correlationId: corrId,
            userId: user!.id,
          });
          return {
            agentName: name,
            displayName: profile?.display_name ?? name,
            layer: profile?.layer ?? 2,
            response: r.response,
            messageId: r.messageId,
          };
        } catch (err) {
          return {
            agentName: name,
            displayName: profile?.display_name ?? name,
            layer: profile?.layer ?? 2,
            response: `(${profile?.display_name ?? name} 응답 실패: ${err instanceof Error ? err.message : String(err)})`,
            messageId: null,
          };
        }
      }),
    );

    // 4) 각 응답을 단체방 메시지로 INSERT
    for (const reply of replies) {
      await supabase.from('agent_messages').insert({
        from_agent: reply.agentName,
        to_agent: 'group',
        message_type: 'dokdae_chat',
        payload: {
          text: reply.response,
          cards,
          mode: 'group',
          agentName: reply.agentName,
          displayName: reply.displayName,
          layer: reply.layer,
        },
        risk_level: 'green',
        correlation_id: corrId,
        user_id: user!.id,
      });
    }

    const response: DokdaeResponse = {
      mode: 'group',
      routerNote: decision.reason,
      replies,
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
