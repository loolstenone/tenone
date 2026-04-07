import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitDResult } from '@/lib/supabase/hit';
import { scoreHitD } from '@/lib/hit/scoring-d';
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
    const scored = scoreHitD(responses);

    // 여정 단계 결정
    const journeyStage = determineJourneyStage(
      scored.senior_readiness,
      scored.identity_flexibility,
      scored.expertise_depth,
      scored.leadership_type,
    );

    // 리더십 유형 한글 라벨
    const leadershipLabels: Record<string, string> = {
      exec_leadership: '실행형',
      strategic_leadership: '전략형',
      coaching_leadership: '코칭형',
      independent_leadership: '독립형',
    };

    // AI 리포트 (Claude Sonnet) — 시니어 리더십 전환 분석
    let aiReport: string | null = null;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const hitAContext = `HIT A 프로필:\n- MBTI: ${hitAData.mbti_type}\n- DISC: ${hitAData.disc_primary} (${hitAData.disc_subtype})\n- 64유형: ${hitAData.type_code} "${hitAData.type_name_ko}"\n- S-Power: ${JSON.stringify(hitAData.s_power_scores)}\n- 기저요인: ${hitAData.base_summary}\n\n`;

      const topRoles = scored.next_role_matrix.possible_roles.slice(0, 3)
        .map(r => `${r.role}(${r.fit_score}%)`).join(', ');

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 2000,
        system: `당신은 HeRo 인재 기획사의 시니어 리더십 전환 전문 컨설턴트입니다. 한국어로 따뜻하면서도 전문적인 시니어 리더십 전환 분석 리포트를 작성합니다.

규칙:
- 전문성 깊이, 리더십 스타일, 정체성 유연성, 네트워크 & 시니어 준비도를 통합 분석
- 현재 리더십 유형의 장단점과 시니어 단계에서의 활용법 제시
- 다음 역할 매트릭스 상위 3개에 대한 구체적 전환 전략 제시
- 절대 이모지, 이모티콘, 특수문자 사용 금지
- 마크다운 헤딩(#) 사용 금지
- 시니어 단계 특유의 과제(정체성 전환, 권력 내려놓기, 레거시 구축)에 대한 인사이트 포함
- 마지막에 시니어 리더십 전환을 위한 구체적 액션 아이템 3가지 제시`,
        messages: [{
          role: 'user',
          content: `${hitAContext}HIT D 시니어 리더십 전환 분석 결과:\n` +
            `전문성 깊이: ${scored.expertise_depth}점 / 도메인 확장성: ${scored.expertise_breadth}점\n` +
            `리더십 유형: ${leadershipLabels[scored.leadership_type]} (${scored.leadership_type})\n` +
            `리더십 점수: ${JSON.stringify(scored.leadership_scores)}\n` +
            `정체성 유연성: ${scored.identity_flexibility}점 (역할정체성 ${scored.role_identity}, 변화개방성 ${scored.change_openness}, 자기재발명 ${scored.self_reinvention})\n` +
            `네트워크 질: ${scored.network_quality}점 / 네트워크 폭: ${scored.network_breadth}점\n` +
            `시니어 준비도: ${scored.senior_readiness}점\n` +
            `추천 다음 역할 Top 3: ${topRoles}\n` +
            `현재 추정 역할: ${scored.next_role_matrix.current_role}\n` +
            `여정 단계: ${journeyStage}\n` +
            `\n위 결과를 통합하여 4-5문단의 시니어 리더십 전환 분석 리포트를 작성해주세요. 전문성 진단, 리더십 스타일 분석, 정체성 유연성 평가, 다음 역할 전환 전략, 구체적 액션 아이템을 포함해주세요.`,
        }],
      });
      const textBlock = msg.content.find(b => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        aiReport = textBlock.text;
      }
    } catch (aiError) {
      console.error('[HIT D Score] AI 리포트 생성 실패:', aiError);
    }

    // 결과 저장
    const result = await createHitDResult({
      session_id: session.id,
      member_id: session.member_id || null,
      hit_a_result_id: hitAResultId,
      expertise_depth: scored.expertise_depth,
      expertise_domains: scored.expertise_domains,
      leadership_type: scored.leadership_type,
      leadership_scores: scored.leadership_scores,
      identity_flexibility: scored.identity_flexibility,
      network_quality: scored.network_quality,
      network_breadth: scored.network_breadth,
      senior_readiness: scored.senior_readiness,
      next_role_matrix: scored.next_role_matrix,
      ai_report: aiReport,
      journey_stage: journeyStage,
    });

    // 세션 완료
    await updateHitSession(sessionToken, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    return successResponse({ resultId: result.id }, 201);
  } catch (error) {
    console.error('[HIT D Score] 채점 오류:', error);
    const message = error instanceof Error ? error.message : '채점 처리 실패';
    return errorResponse(message, 500);
  }
}

/**
 * 시니어 리더십 전환 여정 단계 결정
 */
function determineJourneyStage(
  seniorReadiness: number,
  identityFlexibility: number,
  expertiseDepth: number,
  leadershipType: string,
): string {
  const combined = (seniorReadiness + identityFlexibility + expertiseDepth) / 3;

  if (combined >= 75) {
    return seniorReadiness >= 70 ? 'ready_for_transition' : 'almost_ready';
  }
  if (combined >= 55) {
    return identityFlexibility >= 60 ? 'building_bridge' : 'deepening_expertise';
  }
  if (combined >= 35) {
    return 'exploring_options';
  }
  return 'early_reflection';
}
