import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitBResult, getLatestHitAResult, upsertHeroProfile } from '@/lib/supabase/hit';
import { scoreHitB, CORE_COMPETENCY_LABELS, HOLLAND_LABELS, type HollandType, type CoreCompetency } from '@/lib/hit/scoring-b';
import { createAdminClient } from '@/lib/supabase/admin';
import Anthropic from '@anthropic-ai/sdk';
import { HIT_REPORT_MODEL } from '@/lib/hit/ai';

/**
 * POST /api/hit/b/score — HIT B "역량과 방향" 채점 (2026-10-12 재정의)
 * 핵심역량 6 · 트랙 역량 · RIASEC 효능감 · 자기/직무 이해 → 흥미(HIT A)×효능 매트릭스 · AI 리포트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, competencyTrack, hitAResultId, interestIndustry, interestJobFunction } = body;
    if (!sessionToken) return errorResponse('sessionToken은 필수입니다.', 400);
    if (!competencyTrack) return errorResponse('competencyTrack은 필수입니다.', 400);

    const session = await getHitSession(sessionToken);
    if (!session) return errorResponse('세션을 찾을 수 없습니다.', 404);
    if (session.status !== 'in_progress') return errorResponse('이미 완료된 세션입니다.', 400);
    if (!session.member_id) return errorResponse('회원 세션만 채점할 수 있습니다.', 403);

    const responses = await getHitResponses(session.id);
    if (responses.length === 0) return errorResponse('응답 데이터가 없습니다.', 400);

    // HIT A 결과 (흥미 점수 → 매트릭스) — 본인 것만
    const supabase = createAdminClient();
    let hitAData: Record<string, unknown> | null = null;
    if (hitAResultId) {
      const { data } = await supabase.from('hit_a_results').select('*').eq('id', hitAResultId).eq('member_id', session.member_id).maybeSingle();
      hitAData = data;
    } else {
      hitAData = await getLatestHitAResult(session.member_id);
    }
    const interest = (hitAData?.ap_scores as Partial<Record<HollandType, number>> | undefined) ?? null;

    const scored = scoreHitB(responses, interest);

    // AI 리포트 (실패해도 결과는 저장)
    let aiReport: string | null = null;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const coreText = (Object.keys(scored.coreCompetencyScores) as CoreCompetency[])
        .map(k => `${CORE_COMPETENCY_LABELS[k]} ${scored.coreCompetencyScores[k]}`).join(' · ');
      const effText = (Object.keys(scored.efficacyScores) as HollandType[])
        .map(k => `${HOLLAND_LABELS[k]} ${scored.efficacyScores[k]}`).join(' · ');
      const matrixText = (Object.entries(scored.matrix.cells) as [HollandType, string][])
        .map(([k, v]) => `${HOLLAND_LABELS[k]}:${v}`).join(', ');
      const hitAContext = hitAData
        ? `HIT A 프로필: ${hitAData.type_code} "${hitAData.type_name_ko}" · MBTI ${hitAData.mbti_type} · DISC ${hitAData.disc_primary} · 흥미 Top3 ${hitAData.ap_top3_code ?? '-'}\n`
        : 'HIT A 결과 없음 (흥미×효능 매트릭스는 미측정)\n';
      const msg = await anthropic.messages.create({
        model: HIT_REPORT_MODEL,
        max_tokens: 1800,
        system: `당신은 HeRo 인재 기획사의 커리어 컨설턴트입니다. 한국어로 따뜻하고 구체적으로 씁니다.
규칙: 이모지·특수문자·마크다운 헤딩 금지. 역량의 강점에서 출발해 방향을 제안. 흥미는 높은데 효능감이 낮은 영역은 "배우면 되는 영역"으로, 효능감은 높은데 흥미가 낮은 영역은 "소진 주의"로 설명. 마지막에 지금 할 수 있는 행동 3가지.`,
        messages: [{
          role: 'user',
          content: `${hitAContext}희망 직무 트랙: ${competencyTrack}\n핵심역량: ${coreText} (종합 ${scored.coreCompetencyOverall}, ${scored.coreCompetencyGrade})\n트랙 역량: ${JSON.stringify(scored.trackScores)} (종합 ${scored.trackOverallScore})\n효능감: ${effText} (Top3 ${scored.efficacyTop3})\n흥미×효능: ${matrixText}\n자기 이해 ${scored.insightSelf} · 직무 이해 ${scored.insightJob}\n\n4문단으로 역량과 방향 리포트를 써 주세요.`,
        }],
      });
      const textBlock = msg.content.find(b => b.type === 'text');
      if (textBlock && textBlock.type === 'text') aiReport = textBlock.text;
    } catch (aiError) {
      console.error('[HIT B Score] AI 리포트 생성 실패:', aiError);
    }

    const result = await createHitBResult({
      session_id: session.id,
      member_id: session.member_id,
      hit_a_result_id: (hitAData?.id as string | undefined) ?? null,
      competency_common: scored.coreCompetencyScores,
      competency_track: competencyTrack,
      competency_track_scores: scored.trackScores,
      efficacy_scores: scored.efficacyScores,
      efficacy_top3: scored.efficacyTop3,
      interest_efficacy_matrix: scored.matrix,
      insight_self: scored.insightSelf,
      insight_job: scored.insightJob,
      insight_total: scored.insightTotal,
      ai_report: aiReport,
      journey_stage: scored.journeyStage,
      interest_industry: interestIndustry || null,
      interest_job_function: interestJobFunction || null,
    });

    try {
      await upsertHeroProfile({ member_id: session.member_id, hit_b_result_id: result.id });
    } catch (e) {
      console.warn('[HIT B Score] hero_profile 업데이트 실패:', e);
    }

    await updateHitSession(sessionToken, { status: 'completed', completed_at: new Date().toISOString() });
    return successResponse({ resultId: result.id }, 201);
  } catch (error) {
    console.error('[HIT B Score] 채점 오류:', error);
    return errorResponse(error instanceof Error ? error.message : '채점 처리 실패', 500);
  }
}
