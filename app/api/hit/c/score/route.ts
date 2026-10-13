import { NextRequest } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitCResult, getLatestHitAResult, upsertHeroProfile } from '@/lib/supabase/hit';
import { scoreHitC, READINESS_LABELS, ONBOARDING_LABELS } from '@/lib/hit/scoring-c';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeHitResponses } from '@/lib/hit/normalize-responses';
import { getStageChecklistProgress } from '@/lib/hero/journey-checklists';
import Anthropic from '@anthropic-ai/sdk';
import { HIT_REPORT_MODEL } from '@/lib/hit/ai';

/** POST /api/hit/c/score — 진입(대학생·사회 초년) 채점 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, trackId, hitAResultId } = body;
    if (!sessionToken) return errorResponse('sessionToken은 필수입니다.', 400);

    const session = await getHitSession(sessionToken);
    if (!session) return errorResponse('세션을 찾을 수 없습니다.', 404);
    // 본인 세션만 채점 (2026-10-12)
    const auth = await requireMember(request);
    if (auth instanceof Response) return auth;
    if (session.member_id !== auth.memberId) return errorResponse('세션을 찾을 수 없습니다.', 404);
    if (session.status !== 'in_progress') return errorResponse('이미 완료된 세션입니다.', 400);
    if (!session.member_id) return errorResponse('회원 세션만 채점할 수 있습니다.', 403);

    const rawResponses = await getHitResponses(session.id);
    if (rawResponses.length === 0) return errorResponse('응답 데이터가 없습니다.', 400);

    // 모듈·척도·역채점은 DB에서, 트랙 문항은 고른 트랙 것만 (2026-10-13 — B와 같은 정규화)
    const sb = createAdminClient();
    const responses = await normalizeHitResponses(sb, 'C', rawResponses, { trackId });
    const scored = scoreHitC(responses);
    const checklist = await getStageChecklistProgress(sb, session.member_id, 'c');
    // 같은 회차의 A를 잇는다 (R9, 2026-10-12): ① 요청에 온 본인 A → ② 최근 B가 기준으로 삼은 A → ③ 최근 A
    let hitA: Awaited<ReturnType<typeof getLatestHitAResult>> = null;
    if (hitAResultId) {
      const { data } = await sb.from('hit_a_results').select('*').eq('id', hitAResultId).eq('member_id', session.member_id).maybeSingle();
      hitA = data;
    }
    if (!hitA) {
      const { data: lastB } = await sb.from('hit_b_results').select('hit_a_result_id').eq('member_id', session.member_id).not('hit_a_result_id', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (lastB?.hit_a_result_id) {
        const { data } = await sb.from('hit_a_results').select('*').eq('id', lastB.hit_a_result_id).eq('member_id', session.member_id).maybeSingle();
        hitA = data;
      }
    }
    if (!hitA) hitA = await getLatestHitAResult(session.member_id);

    let aiReport: string | null = null;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const rd = Object.entries(scored.readinessScores).map(([k, v]) => `${READINESS_LABELS[k] ?? k} ${v}`).join(' · ');
      const ob = Object.entries(scored.onboardingScores).map(([k, v]) => `${ONBOARDING_LABELS[k] ?? k} ${v}`).join(' · ');
      const msg = await anthropic.messages.create({
        model: HIT_REPORT_MODEL,
        max_tokens: 1600,
        system: '당신은 HeRo 인재 기획사의 커리어 컨설턴트입니다. 대학생·사회 초년생에게 한국어로 따뜻하고 구체적으로 씁니다. 이모지·특수문자·마크다운 헤딩 금지. 준비가 부족한 영역은 비난이 아니라 "다음에 할 일"로. 마지막에 이번 달 할 일 3가지.',
        messages: [{
          role: 'user',
          content: `${hitA ? `기본 성향 검사: ${hitA.type_code} "${hitA.type_name_ko}" · 흥미 Top3 ${hitA.ap_top3_code ?? '-'}\n` : ''}희망 트랙: ${trackId ?? '-'}\n취업 준비(자기 인식): ${rd} (종합 ${scored.readinessTotal}, ${scored.readinessGrade})\n준비 체크리스트 완료율: ${checklist.percent}% (${checklist.done}/${checklist.total})\n첫 직무 적응: ${ob} (종합 ${scored.onboardingTotal})\n진로 결정 확신: ${scored.careerDecision}\n\n3~4문단으로 진입 단계 리포트를 써 주세요.`,
        }],
      });
      const t = msg.content.find(b => b.type === 'text');
      if (t && t.type === 'text') aiReport = t.text;
    } catch (e) {
      console.error('[HIT C Score] AI 리포트 생성 실패:', e);
    }

    const result = await createHitCResult({
      session_id: session.id,
      member_id: session.member_id,
      hit_a_result_id: hitA?.id ?? null,
      track_id: trackId ?? null,
      readiness_scores: scored.readinessScores,
      readiness_total: scored.readinessTotal,
      readiness_grade: scored.readinessGrade,
      readiness_gaps: scored.readinessGaps,
      checklist_percent: checklist.percent,
      onboarding_scores: scored.onboardingScores,
      onboarding_total: scored.onboardingTotal,
      career_decision: scored.careerDecision,
      ai_report: aiReport,
      journey_stage: scored.journeyStage,
    });

    try { await upsertHeroProfile({ member_id: session.member_id, hit_c_result_id: result.id }); } catch (e) { console.warn('[HIT C Score] hero_profile 업데이트 실패:', e); }
    await updateHitSession(sessionToken, { status: 'completed', completed_at: new Date().toISOString() });
    return successResponse({ resultId: result.id }, 201);
  } catch (error) {
    console.error('[HIT C Score] 채점 오류:', error);
    return errorResponse('채점 처리 실패', 500);
  }
}
