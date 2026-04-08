import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitCResult, upsertHeroProfile } from '@/lib/supabase/hit';
import { scoreHitC } from '@/lib/hit/scoring-c';
import { createClient } from '@/lib/supabase/client';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, hitAResultId, targetJob } = body;

    if (!sessionToken) {
      return errorResponse('sessionToken은 필수입니다.', 400);
    }

    if (!hitAResultId) {
      return errorResponse('hitAResultId는 필수입니다.', 400);
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

    // 채점
    const scored = scoreHitC(responses);

    // 여정 단계 결정
    const journeyStage = determineJourneyStage(
      scored.transitionReadiness,
      scored.capitalOverall,
      scored.motivationType,
    );

    // AI 리포트 (Claude Sonnet) — 경력전환 분석
    let aiReport: string | null = null;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const hitAContext = `HIT A 프로필:\n- MBTI: ${hitAData.mbti_type}\n- DISC: ${hitAData.disc_primary} (${hitAData.disc_subtype})\n- 64유형: ${hitAData.type_code} "${hitAData.type_name_ko}"\n- S-Power: ${JSON.stringify(hitAData.s_power_scores)}\n- 기저요인: ${hitAData.base_summary}\n\n`;

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 2000,
        system: `당신은 HeRo 인재 기획사의 경력전환 전문 컨설턴트입니다. 한국어로 따뜻하면서도 전문적인 경력전환 분석 리포트를 작성합니다.

규칙:
- 현재 경력 자본, 이직 동기, 전환 가능성, 준비도를 통합 분석
- 구체적인 전환 전략과 액션 플랜 제시
- 절대 이모지, 이모티콘, 특수문자 사용 금지
- 마크다운 헤딩(#) 사용 금지
- Push/Pull 동기의 균형을 해석하여 전환 타이밍 조언
- 갭 영역에 대한 구체적 보완 방안 제시
- 마지막에 경력전환을 위한 구체적 액션 아이템 3가지 제시`,
        messages: [{
          role: 'user',
          content: `${hitAContext}HIT C 경력전환 분석 결과:\n` +
            `경력 자본: ${JSON.stringify(scored.capitalScores)} (종합 ${scored.capitalOverall}점)\n` +
            `이직 동기: Push ${scored.motivationPush} / Pull ${scored.motivationPull} (유형: ${scored.motivationType})\n` +
            `전환 가능성: ${JSON.stringify(scored.transferabilityScores)} (지수 ${scored.transferabilityIndex})\n` +
            `전환 준비도: ${scored.transitionReadiness} (준비 ${scored.preparation}, 갭인식 ${scored.gapAwareness})\n` +
            `준비도 세부: ${JSON.stringify(scored.readinessScores)}\n` +
            `전환유형(CTYPE): ${scored.ctype}\n` +
            `갭 영역: ${scored.gapAreas.join(', ') || '없음'}\n` +
            (scored.chDeepScores ? `CH 심화(경력전환맥락): 완벽주의${scored.chDeepScores.scores.perfectionism} 민감성${scored.chDeepScores.scores.sensitivity} 긴장${scored.chDeepScores.scores.tension} 온정${scored.chDeepScores.scores.warmth} 사회적담대함${scored.chDeepScores.scores.social_boldness} 낙관성${scored.chDeepScores.scores.optimism} 통제력${scored.chDeepScores.scores.control} 독립성${scored.chDeepScores.scores.independence} 지적호기심${scored.chDeepScores.scores.intellect}\n` : '') +
            (scored.apDeepScores ? `AP 심화(경력효능감 Top3=${scored.apDeepScores.top3Code}): R${scored.apDeepScores.scores.R} I${scored.apDeepScores.scores.I} A${scored.apDeepScores.scores.A} S${scored.apDeepScores.scores.S} E${scored.apDeepScores.scores.E} C${scored.apDeepScores.scores.C}\n` : '') +
            `여정 단계: ${journeyStage}\n` +
            (targetJob ? `희망 직무: ${targetJob}\n` : '') +
            `\n위 결과를 통합하여 4-5문단의 경력전환 분석 리포트를 작성해주세요. 현재 자본 진단, 전환 동기 해석, 전환 가능성 평가, 갭 보완 전략, 구체적 액션 아이템을 포함해주세요.`,
        }],
      });
      const textBlock = msg.content.find(b => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        aiReport = textBlock.text;
      }
    } catch (aiError) {
      console.error('[HIT C Score] AI 리포트 생성 실패:', aiError);
    }

    // CH Deep 다크 플래그 — admin-only
    if (scored.chDeepScores?.alertFlags) {
      const af = scored.chDeepScores.alertFlags;
      const darkScore = af.NR + af.MK;
      if (darkScore >= 50) {
        try {
          const { createClient: serverClient } = await import('@/lib/supabase/server');
          const supabaseAdmin = await serverClient();
          await supabaseAdmin.from('hit_admin_flags').insert({
            member_id: session.member_id || null,
            session_id: session.id,
            flag_type: 'dark_triad',
            flag_score: darkScore,
            flag_detail: { ...af, source: 'ch_deep_c', layer: 'C' },
          });
        } catch (flagErr) {
          console.warn('[HIT C Score] CH Deep 플래그 저장 실패:', flagErr);
        }
      }
    }

    // 결과 저장
    const result = await createHitCResult({
      session_id: session.id,
      member_id: session.member_id || null,
      hit_a_result_id: hitAResultId,
      capital_scores: scored.capitalScores,
      motivation_push: scored.motivationPush,
      motivation_pull: scored.motivationPull,
      motivation_type: scored.motivationType,
      transferability_index: scored.transferabilityIndex,
      target_job: targetJob || null,
      gap_areas: scored.gapAreas,
      transition_readiness: scored.transitionReadiness,
      ai_report: aiReport,
      journey_stage: journeyStage,
      ctype: scored.ctype,
      transferability_scores: scored.transferabilityScores,
      readiness_scores: scored.readinessScores,
      faking_flag: scored.fakingFlag,
      // CH Deep C / AP Deep C
      ...(scored.chDeepScores && {
        ch_deep_scores: {
          scores: scored.chDeepScores.scores,
          grades: scored.chDeepScores.grades,
          overallScore: scored.chDeepScores.overallScore,
          overallGrade: scored.chDeepScores.overallGrade,
        },
      }),
      ...(scored.apDeepScores && {
        ap_deep_scores: {
          scores: scored.apDeepScores.scores,
          grades: scored.apDeepScores.grades,
          top3Code: scored.apDeepScores.top3Code,
          top3Labels: scored.apDeepScores.top3Labels,
          dominantType: scored.apDeepScores.dominantType,
        },
      }),
    });

    // faking 의심 시 hit_admin_flags 기록
    if (scored.fakingFlag) {
      try {
        await supabase.from('hit_admin_flags').insert({
          member_id: session.member_id || null,
          session_id: session.id,
          flag_type: 'distortion',
          flag_score: 90,
          flag_detail: { source: 'HIT_C', c_val01: true, c_val02: true },
        });
      } catch (e) {
        console.warn('[HIT C Score] faking flag 저장 실패:', e);
      }
    }

    // hero_profiles 링크
    if (session.member_id) {
      try {
        await upsertHeroProfile({ member_id: session.member_id, hit_c_result_id: result.id });
      } catch (e) {
        console.warn('[HIT C Score] hero_profile 업데이트 실패:', e);
      }
    }

    // 세션 완료
    await updateHitSession(sessionToken, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    return successResponse({ resultId: result.id }, 201);
  } catch (error) {
    console.error('[HIT C Score] 채점 오류:', error);
    const message = error instanceof Error ? error.message : '채점 처리 실패';
    return errorResponse(message, 500);
  }
}

/**
 * 경력전환 여정 단계 결정
 */
function determineJourneyStage(
  readiness: number,
  capitalOverall: number,
  motivationType: string,
): string {
  // 준비도 + 자본 합산 기반 단계 결정
  const combined = (readiness + capitalOverall) / 2;

  if (combined >= 75) {
    return motivationType === 'pull_driven' ? 'ready_to_leap' : 'almost_ready';
  }
  if (combined >= 50) {
    return motivationType === 'push_driven' ? 'urgent_but_unprepared' : 'building_foundation';
  }
  if (combined >= 30) {
    return 'exploring';
  }
  return 'early_awareness';
}
