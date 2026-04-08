import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitDResult, upsertHeroProfile } from '@/lib/supabase/hit';
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

    // A 결과 컨텍스트
    const aCtx = {
      bt: {
        d: hitAData.disc_d_score || 50,
        i: hitAData.disc_i_score || 50,
        s: hitAData.disc_s_score || 50,
        c: hitAData.disc_c_score || 50,
      },
      sp: hitAData.s_power_scores || {
        strategic: 50, execution: 50, creativity: 50, interpersonal: 50,
        analytical: 50, harmony: 50, breakthrough: 50, guard: 50,
      },
      ch: {
        integrity: hitAData.ch_integrity || 50,
        relational: hitAData.ch_relational || 50,
        emotional: hitAData.ch_emotional || 50,
        ethics: hitAData.ch_ethics || 50,
        growth: hitAData.ch_growth || 50,
      },
      ap: hitAData.ap_scores || { R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 },
      uf: {
        self: hitAData.uf_self || 50,
        parent: hitAData.uf_parent || 50,
        peer: hitAData.uf_peer || 50,
      },
    };

    // 채점
    const scored = scoreHitD(responses, aCtx);

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
            (scored.chDeepScores ? `CH 심화(시니어맥락): 완벽주의${scored.chDeepScores.scores.perfectionism} 민감성${scored.chDeepScores.scores.sensitivity} 긴장${scored.chDeepScores.scores.tension} 온정${scored.chDeepScores.scores.warmth} 사회적담대함${scored.chDeepScores.scores.social_boldness} 낙관성${scored.chDeepScores.scores.optimism} 통제력${scored.chDeepScores.scores.control} 독립성${scored.chDeepScores.scores.independence} 지적호기심${scored.chDeepScores.scores.intellect}\n` : '') +
            (scored.apDeepScores ? `AP 심화(임원역량 Top3=${scored.apDeepScores.top3Code}): R${scored.apDeepScores.scores.R} I${scored.apDeepScores.scores.I} A${scored.apDeepScores.scores.A} S${scored.apDeepScores.scores.S} E${scored.apDeepScores.scores.E} C${scored.apDeepScores.scores.C}\n` : '') +
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
            flag_detail: { ...af, source: 'ch_deep_d', layer: 'D' },
          });
        } catch (flagErr) {
          console.warn('[HIT D Score] CH Deep 플래그 저장 실패:', flagErr);
        }
      }
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
      faking_flag: scored.faking_flag,
      // CH Deep D / AP Deep D
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

    // 미끼 통과(조작 의심) 시 어드민 플래그 등록
    if (scored.faking_flag) {
      try {
        const { createClient: createServerClient } = await import('@/lib/supabase/server');
        const serverSupabase = await createServerClient();
        await serverSupabase.from('hit_admin_flags').insert({
          member_id: session.member_id || null,
          session_id: session.id,
          flag_type: 'distortion',
          flag_score: 90,
          flag_detail: { source: 'HIT_D', d_val01: true, d_val02: true },
        });
      } catch (e) {
        console.warn('[HIT D Score] faking flag 저장 실패:', e);
      }
    }

    // hero_profiles 링크
    if (session.member_id) {
      try {
        await upsertHeroProfile({ member_id: session.member_id, hit_d_result_id: result.id });
      } catch (e) {
        console.warn('[HIT D Score] hero_profile 업데이트 실패:', e);
      }
    }

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
