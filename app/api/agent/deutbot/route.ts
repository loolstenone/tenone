/**
 * 방별 챗봇 API
 * POST /api/agent/deutbot
 *
 * OpenClaw(카카오 봇 스크립트)에서 호출.
 * agent_id로 해당 방 챗봇 에이전트를 직접 실행.
 *
 * 방별 에이전트 매핑:
 *   badangsoe → 수다방
 *   repper    → 레퍼런스창고
 *   dima      → 디지털마케팅방
 *   hunter    → 이직취업방
 *   cr        → CR방
 *   leader    → 팀리더방
 *   jaryo     → 자료방공유방
 *
 * Auth: Bearer ADMIN_API_KEY
 */
import { NextRequest, NextResponse } from 'next/server';
import { invokeAgent } from '@/lib/agent/claude';

/** 에이전트별 응답 가이드 (system_prompt 보완) */
const AGENT_STYLE: Record<string, string> = {
  badangsoe: '수다방: 가볍고 유머러스하게.',
  repper:    '레퍼런스창고: 큐레이터형, 핵심 요약 먼저.',
  dima:      '디지털마케팅방: 실용 정보, 트렌드·데이터 중심.',
  hunter:    '이직취업방: 공감 먼저, 현실적 조언.',
  cr:        'CR방: 핵심만, 간결하게.',
  leader:    '팀리더방: 격식체, 리더십·조직 관점.',
  jaryo:     '자료공유방: 자료 정리·요약, 출처 명시.',
};

const VALID_AGENTS = new Set(Object.keys(AGENT_STYLE));

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      message: string;
      agent_id: string;        // 방별 에이전트 이름 (badangsoe, repper, ...)
      sender_name?: string;    // 발신자 닉네임 (선택)
      platform?: string;       // 'kakao' | 기타
    };

    const { message, agent_id, sender_name, platform = 'kakao' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message 필드가 필요합니다.' }, { status: 400 });
    }

    // agent_id 검증 — 미지정·미등록 시 badangsoe fallback
    const targetAgent = VALID_AGENTS.has(agent_id) ? agent_id : 'badangsoe';
    const style = AGENT_STYLE[targetAgent];

    const contextualMessage =
      `[플랫폼: ${platform}${sender_name ? ` | 발신자: ${sender_name}` : ''}]\n` +
      `[응답 스타일: ${style}]\n\n` +
      message;

    const result = await invokeAgent({
      agentName: targetAgent,
      userMessage: contextualMessage,
      correlationId: crypto.randomUUID(),
    });

    return NextResponse.json({
      response: result.response,
      agent: targetAgent,
      message_id: result.messageId,
    });

  } catch (error) {
    console.error('[방별챗봇] 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '챗봇 오류' },
      { status: 500 },
    );
  }
}
