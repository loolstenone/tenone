import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitFResult } from '@/lib/supabase/hit';
import { scoreHitF } from '@/lib/hit/scoring-f';
import { createClient } from '@/lib/supabase/client';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, hitAResultId, breakMonths, jobCategory } = body;

    if (!sessionToken) {
      return errorResponse('sessionToken은 필수입니다.', 400);
    }

    if (!hitAResultId) {
      return errorResponse('hitAResultId는 필수입니다.', 400);
    }

    if (!breakMonths || !jobCategory) {
      return errorResponse('breakMonths와 jobCategory는 필수입니다.', 400);
    }

    const session = await getHitSession(sessionToken);
    if (!session) {
      return errorResponse('세션을 찾을 수 없습니다.', 404);
    }

    if (session.status !== 'in_progress') {
      return errorResponse('이미 완료된 세션입니다.', 400);
    }

    const responses = await getHitResponses(session.id);
    if (responses.length === 0) {
      return errorResponse('응답 데이터가 없습니다.', 400);
    }

    // HIT A 결과 가져오기
    const supabase = createClient();
    const { data: hitAData } = await supabase
      .from('hit_a_results')
      .select('*')
      .eq('id', hitAResultId)
      .maybeSingle();

    if (!hitAData) {
      return errorResponse('HIT A 결과를 찾을 수 없습니다.', 400);
    }

    // 채점 (CVI 포함)
    const scored = scoreHitF(responses, breakMonths, jobCategory);

    // 여정 단계 결정
    const journeyStage = determineJourneyStage(
      scored.cviGrade,
      scored.resilienceScore,
      scored.reentryReadiness,
    );

    // AI 리포트 (Claude Sonnet) -- 경력 공백 복귀 분석
    let aiReport: string | null = null;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const hitAContext = `HIT A 프로필:\n- MBTI: ${hitAData.mbti_type}\n- DISC: ${hitAData.disc_primary} (${hitAData.disc_subtype})\n- 64유형: ${hitAData.type_code} "${hitAData.type_name_ko}"\n- S-Power: ${JSON.stringify(hitAData.s_power_scores)}\n- 기저요인: ${hitAData.base_summary}\n\n`;

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 2000,
        system: `당신은 HeRo 인재 기획사의 경력 공백 복귀 전문 컨설턴트입니다. 한국어로 따뜻하면서도 전문적인 경력 복귀 분석 리포트를 작성합니다.

규칙:
- 경력 공백 기간, CVI(경력유효성지수), 잠재 역량, 회복탄력성, 재진입 준비도를 통합 분석
- 경력 단절자가 자신감을 회복할 수 있도록 긍정적이면서도 현실적인 조언 제공
- 절대 이모지, 이모티콘, 특수문자 사용 금지
- 마크다운 헤딩(#) 사용 금지
- CVI 등급(HIGH/MID/LOW)에 따른 맞춤형 복귀 전략 제시
- 잠재 역량을 강점으로 활용하는 방안 구체화
- 마지막에 복귀를 위한 구체적 액션 아이템 3가지 제시`,
        messages: [{
          role: 'user',
          content: `${hitAContext}HIT F 경력 공백 복귀 분석 결과:\n` +
            `경력 공백: ${breakMonths}개월\n` +
            `직군: ${jobCategory} (직무변화속도: ${scored.jobChangeVelocity})\n` +
            `CVI: ${scored.cviRaw}점 (등급: ${scored.cviGrade})\n` +
            `추천 경로: ${scored.nextRoute === 'recovery' ? 'Recovery(복귀)' : scored.nextRoute === 'C' ? 'HIT C(전환)' : 'HIT B(기본)'}\n` +
            `잠재 역량: ${scored.latentScore}점 (기술유지 ${scored.latentScores.technical_retention}, 소프트스킬 ${scored.latentScores.soft_skill_retention}, 학습 ${scored.latentScores.continuous_learning})\n` +
            `회복탄력성: ${scored.resilienceScore}점 (정서 ${scored.resilienceScores.emotional_resilience}, 자신감 ${scored.resilienceScores.confidence}, 적응력 ${scored.resilienceScores.adaptability})\n` +
            `재진입 준비도: ${scored.reentryReadiness}점 (실질준비 ${scored.practicalReadiness}, 동기 ${scored.reentryMotivation})\n` +
            `공백 맥락: ${scored.overallContext}점\n` +
            `라우팅 근거: ${scored.routingRationale}\n` +
            `여정 단계: ${journeyStage}\n` +
            `\n위 결과를 통합하여 4-5문단의 경력 복귀 분석 리포트를 작성해주세요. CVI 해석, 잠재 역량 활용 방안, 회복탄력성 평가, 복귀 전략, 구체적 액션 아이템을 포함해주세요.`,
        }],
      });
      const textBlock = msg.content.find(b => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        aiReport = textBlock.text;
      }
    } catch (aiError) {
      console.error('[HIT F Score] AI 리포트 생성 실패:', aiError);
    }

    // 결과 저장
    const result = await createHitFResult({
      session_id: session.id,
      member_id: session.member_id || null,
      hit_a_result_id: hitAResultId,
      break_months: breakMonths,
      job_change_velocity: scored.jobChangeVelocity,
      latent_score: scored.latentScore,
      cvi_raw: scored.cviRaw,
      cvi_grade: scored.cviGrade,
      next_route: scored.nextRoute === 'recovery' ? 'R' : scored.nextRoute,
      resilience_score: scored.resilienceScore,
      reentry_readiness: scored.reentryReadiness,
      routing_rationale: scored.routingRationale,
      ai_report: aiReport,
      journey_stage: journeyStage,
      // 상세 점수 JSON
      latent_scores: scored.latentScores,
      resilience_scores: scored.resilienceScores,
      break_context_score: scored.breakContextScore,
      break_reason_score: scored.breakReasonScore,
      practical_readiness: scored.practicalReadiness,
      reentry_motivation: scored.reentryMotivation,
      job_category: jobCategory,
    });

    // 세션 완료
    await updateHitSession(sessionToken, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    return successResponse({ resultId: result.id }, 201);
  } catch (error) {
    console.error('[HIT F Score] 채점 오류:', error);
    const message = error instanceof Error ? error.message : '채점 처리 실패';
    return errorResponse(message, 500);
  }
}

/**
 * 경력 공백 복귀 여정 단계 결정
 */
function determineJourneyStage(
  cviGrade: string,
  resilienceScore: number,
  reentryReadiness: number,
): string {
  if (cviGrade === 'HIGH' && reentryReadiness >= 70) {
    return 'ready_to_return';
  }
  if (cviGrade === 'HIGH' && reentryReadiness < 70) {
    return 'skill_ready_prep_needed';
  }
  if (cviGrade === 'MID' && resilienceScore >= 60) {
    return 'strategic_transition';
  }
  if (cviGrade === 'MID' && resilienceScore < 60) {
    return 'resilience_building';
  }
  if (resilienceScore >= 50) {
    return 'foundation_rebuilding';
  }
  return 'early_recovery';
}
