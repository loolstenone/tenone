import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitEResult, upsertHeroProfile } from '@/lib/supabase/hit';
import { scoreHitE } from '@/lib/hit/scoring-e';
import { createClient } from '@/lib/supabase/client';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, hitAResultId } = body;

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
    const scored = scoreHitE(responses);

    // 여정 단계 결정
    const journeyStage = determineJourneyStage(
      scored.secondActReadiness,
      scored.lifeSatisfaction,
      scored.remainingPassion,
      scored.directionType,
    );

    // 방향 유형 한글 라벨
    const directionLabels: Record<string, string> = {
      re_employment: '재취업형',
      entrepreneurship: '창업/사업형',
      social_contribution: '사회 공헌형',
      mentoring: '멘토링/교육형',
      leisure: '여가/취미형',
    };

    // AI 리포트 (Claude Sonnet) — 인생 2막 분석
    let aiReport: string | null = null;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const hitAContext = `HIT A 프로필:\n- MBTI: ${hitAData.mbti_type}\n- DISC: ${hitAData.disc_primary} (${hitAData.disc_subtype})\n- 64유형: ${hitAData.type_code} "${hitAData.type_name_ko}"\n- S-Power: ${JSON.stringify(hitAData.s_power_scores)}\n- 기저요인: ${hitAData.base_summary}\n\n`;

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 2000,
        system: `당신은 HeRo 인재 기획사의 인생 2막 전문 컨설턴트입니다. 한국어로 따뜻하면서도 전문적인 인생 2막 분석 리포트를 작성합니다.

규칙:
- 현재 삶 만족도, 열정, 방향성, 레거시 스킬, 사회적 준비도를 통합 분석
- 구체적인 2막 설계 전략과 액션 플랜 제시
- 절대 이모지, 이모티콘, 특수문자 사용 금지
- 마크다운 헤딩(#) 사용 금지
- 방향 유형(사회공헌/창업/교육/여가)에 맞는 구체적 제안
- 레거시 스킬을 새로운 영역에 활용하는 방안 제시
- 마지막에 인생 2막을 위한 구체적 액션 아이템 3가지 제시`,
        messages: [{
          role: 'user',
          content: `${hitAContext}HIT E 인생 2막 분석 결과:\n` +
            `삶의 만족도: ${scored.lifeSatisfaction}점\n` +
            `남은 열정: ${scored.remainingPassion}점\n` +
            `방향 유형: ${directionLabels[scored.directionType] || scored.directionType}\n` +
            `방향별 점수: ${JSON.stringify(scored.directionScores)}\n` +
            `레거시 스킬: ${scored.legacySkillScore}점\n` +
            `레거시 영역: ${scored.legacyAreas.join(', ') || '없음'}\n` +
            `사회적 필요: ${scored.socialNeedScore}점\n` +
            `2막 준비도: ${scored.secondActReadiness}점\n` +
            `여정 단계: ${journeyStage}\n` +
            `\n위 결과를 통합하여 4-5문단의 인생 2막 분석 리포트를 작성해주세요. 현재 삶 진단, 방향성 해석, 레거시 스킬 활용 전략, 사회적 연결 방안, 구체적 액션 아이템을 포함해주세요.`,
        }],
      });
      const textBlock = msg.content.find(b => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        aiReport = textBlock.text;
      }
    } catch (aiError) {
      console.error('[HIT E Score] AI 리포트 생성 실패:', aiError);
    }

    // 결과 저장
    const result = await createHitEResult({
      session_id: session.id,
      member_id: session.member_id || null,
      hit_a_result_id: hitAResultId,
      life_satisfaction: scored.lifeSatisfaction,
      remaining_passion: scored.remainingPassion,
      direction_type: scored.directionType,
      direction_scores: scored.directionScores,
      legacy_skill_score: scored.legacySkillScore,
      legacy_areas: scored.legacyAreas,
      social_need_score: scored.socialNeedScore,
      second_act_readiness: scored.secondActReadiness,
      ai_report: aiReport,
      journey_stage: journeyStage,
    });

    // hero_profiles 링크
    if (session.member_id) {
      try {
        await upsertHeroProfile({ member_id: session.member_id, hit_e_result_id: result.id });
      } catch (e) {
        console.warn('[HIT E Score] hero_profile 업데이트 실패:', e);
      }
    }

    // 세션 완료
    await updateHitSession(sessionToken, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    return successResponse({ resultId: result.id }, 201);
  } catch (error) {
    console.error('[HIT E Score] 채점 오류:', error);
    const message = error instanceof Error ? error.message : '채점 처리 실패';
    return errorResponse(message, 500);
  }
}

/**
 * 인생 2막 여정 단계 결정
 */
function determineJourneyStage(
  readiness: number,
  lifeSatisfaction: number,
  passion: number,
  directionType: string,
): string {
  const combined = (readiness + passion) / 2;

  if (combined >= 75 && lifeSatisfaction >= 60) {
    return 'ready_to_launch';  // 2막 시작 준비 완료
  }
  if (combined >= 60) {
    return 'almost_ready';  // 거의 준비됨
  }
  if (combined >= 40 && passion >= 50) {
    return 'direction_found';  // 방향은 잡힘
  }
  if (passion >= 40) {
    return 'exploring';  // 탐색 중
  }
  if (lifeSatisfaction < 40) {
    return 'needs_reflection';  // 성찰 필요
  }
  return 'early_awareness';  // 초기 인식
}
