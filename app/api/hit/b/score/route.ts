import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitBResult, getLatestHitAResult, upsertHeroProfile } from '@/lib/supabase/hit';
import { scoreHitB, computeAlertScoresFromDB } from '@/lib/hit/scoring-b';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, competencyTrack, hitAResultId, interestIndustry, interestJobFunction } = body;

    if (!sessionToken) {
      return errorResponse('sessionToken은 필수입니다.', 400);
    }

    if (!competencyTrack) {
      return errorResponse('competencyTrack은 필수입니다.', 400);
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
    let hitAData = null;
    if (hitAResultId) {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('hit_a_results')
        .select('*')
        .eq('id', hitAResultId)
        .maybeSingle();
      hitAData = data;
    } else {
      hitAData = await getLatestHitAResult(session.member_id);
    }

    // alert_code 지정 문항 조회 (DB 기반 주의 신호 채점용)
    let alertQuestions: { question_id: string; alert_code: string }[] = [];
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const sb = createClient();
      const { data: aqData } = await sb
        .from('hit_questions')
        .select('id, alert_code')
        .not('alert_code', 'is', null);
      if (aqData) {
        alertQuestions = aqData.map((q: { id: string; alert_code: string }) => ({ question_id: q.id, alert_code: q.alert_code }));
      }
    } catch {
      // 조회 실패 시 폴백 사용
    }

    // 채점 (공통역량 + 트랙역량 + 준비도)
    const scored = scoreHitB(responses, competencyTrack);

    // AI 리포트 (Claude Sonnet) — 강점 기반 커리어 분석
    let aiReport: string | null = null;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const hitAContext = hitAData
        ? `HIT A 프로필:\n- MBTI: ${hitAData.mbti_type}\n- DISC: ${hitAData.disc_primary} (${hitAData.disc_subtype})\n- 64유형: ${hitAData.type_code} "${hitAData.type_name_ko}"\n- S-Power: ${JSON.stringify(hitAData.s_power_scores)}\n- 기저요인: ${hitAData.base_summary}\n\n`
        : '';

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: `당신은 HeRo 인재 기획사의 신입·사회초년생 커리어 전문 컨설턴트입니다. 한국어로 따뜻하면서도 전문적인 커리어 분석 리포트를 작성합니다.

규칙:
- 공통 기초역량 6가지, 직무별 전문역량, 준비도 4영역을 통합 분석
- 강점 역량에서 출발하여 커리어 방향을 구체화
- 절대 이모지, 이모티콘, 특수문자 사용 금지
- 마크다운 헤딩(#) 사용 금지
- 준비도 갭 영역은 성장 기회로 재프레이밍
- 희망 직무 트랙과 역량 매칭 관점 포함
- 마지막에 지금 당장 할 수 있는 구체적 액션 아이템 3가지 제시`,
        messages: [{
          role: 'user',
          content: `${hitAContext}HIT B 기초역량·준비도 결과:\n` +
            `희망 직무 트랙: ${competencyTrack}\n` +
            `공통 기초역량: ${JSON.stringify(scored.coreCompetencyScores)} (종합 ${scored.coreCompetencyOverall}점, ${scored.coreCompetencyGrade}등급)\n` +
            `직무별 역량(${competencyTrack}): ${JSON.stringify(scored.trackScores)} (종합 ${scored.trackOverallScore}점, ${scored.trackOverallGrade}등급)\n` +
            `준비도: 자기이해 ${scored.readinessScores.self} / 포트폴리오 ${scored.readinessScores.portfolio} / 면접준비 ${scored.readinessScores.interview} / 네트워킹 ${scored.readinessScores.network}\n` +
            `준비도 종합: ${scored.readinessTotal}점 (${scored.readinessGrade}등급)\n` +
            `보완 필요 영역: ${scored.readinessGaps.join(', ') || '없음'}\n` +
            (scored.chDeepScores ? `CH 심화(신입맥락): 완벽주의${scored.chDeepScores.scores.perfectionism} 민감성${scored.chDeepScores.scores.sensitivity} 긴장${scored.chDeepScores.scores.tension} 온정${scored.chDeepScores.scores.warmth} 사회적담대함${scored.chDeepScores.scores.social_boldness} 낙관성${scored.chDeepScores.scores.optimism} 통제력${scored.chDeepScores.scores.control} 자기규율${scored.chDeepScores.scores.self_discipline} 독립성${scored.chDeepScores.scores.independence} 지적호기심${scored.chDeepScores.scores.intellect}\n` : '') +
            (scored.apDeepScores ? `AP 심화(자기효능감 Top3=${scored.apDeepScores.top3Code}): R${scored.apDeepScores.scores.R} I${scored.apDeepScores.scores.I} A${scored.apDeepScores.scores.A} S${scored.apDeepScores.scores.S} E${scored.apDeepScores.scores.E} C${scored.apDeepScores.scores.C}\n` : '') +
            `여정 단계: ${scored.journeyStage}\n\n` +
            `위 결과를 통합하여 4-5문단의 커리어 분석 리포트를 작성해주세요. 강점 역량, 희망 직무 적합성, 준비도 평가, 구체적 액션 아이템을 포함해주세요.`,
        }],
      });
      const textBlock = msg.content.find(b => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        aiReport = textBlock.text;
      }
    } catch (aiError) {
      console.error('[HIT B Score] AI 리포트 생성 실패:', aiError);
    }

    // 주의 신호 채점
    const alerts = computeAlertScoresFromDB(responses, alertQuestions, {});

    // CH Deep 다크 플래그 (admin-only — 소비자 절대 비노출)
    if (scored.chDeepScores?.alertFlags) {
      const af = scored.chDeepScores.alertFlags;
      const darkScore = af.NR + af.MK;  // 나르시시즘 + 마키아벨리즘
      if (darkScore >= 50) {
        try {
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();
          await supabase.from('hit_admin_flags').insert({
            member_id: session.member_id || null,
            session_id: session.id,
            flag_type: 'dark_triad',
            flag_score: darkScore,
            flag_detail: { ...af, source: 'ch_deep_b', layer: 'B' },
          });
        } catch (flagErr) {
          console.warn('[HIT B Score] CH Deep 플래그 저장 실패:', flagErr);
        }
      }
    }

    // 결과 저장
    const result = await createHitBResult({
      session_id: session.id,
      member_id: session.member_id || null,
      hit_a_result_id: hitAResultId || (hitAData?.id ?? null),
      // 공통 기초역량
      competency_common: scored.coreCompetencyScores,
      competency_track: competencyTrack,
      competency_track_scores: scored.trackScores,
      // 준비도
      readiness_self:      scored.readinessScores.self,
      readiness_portfolio: scored.readinessScores.portfolio,
      readiness_interview: scored.readinessScores.interview,
      readiness_network:   scored.readinessScores.network,
      readiness_total: scored.readinessTotal,
      readiness_grade: scored.readinessGrade,
      readiness_gaps: scored.readinessGaps,
      // CH Deep B / AP Deep B (심화 레이어 응답 있을 때만)
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
      ai_report: aiReport,
      journey_stage: scored.journeyStage,
      interest_industry: interestIndustry || null,
      interest_job_function: interestJobFunction || null,
      // 주의 신호 (소비자 비노출)
      alert_n1: alerts.alertN1,
      alert_m1: alerts.alertM1,
      alert_p1: alerts.alertP1,
      alert_level: alerts.alertLevel,
    });

    // 주의 신호 level 3 → 관리자 알림
    if (alerts.alertLevel >= 3) {
      try {
        const { postAgentMessage } = await import('@/lib/supabase/chat');
        await postAgentMessage({
          channelName: '#브리핑',
          agentName: '히어로',
          content: `⚠ HIT B 주의 신호 감지 (alert_level: ${alerts.alertLevel})\n결과 ID: ${result.id}\n유형: ${session.member_id || '비회원'}\n즉시 확인 필요`,
        });
      } catch {}
    }

    // hero_profiles 링크
    if (session.member_id) {
      try {
        await upsertHeroProfile({ member_id: session.member_id, hit_b_result_id: result.id });
      } catch (e) {
        console.warn('[HIT B Score] hero_profile 업데이트 실패:', e);
      }
    }

    // 세션 완료
    await updateHitSession(sessionToken, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    return successResponse({ resultId: result.id }, 201);
  } catch (error) {
    console.error('[HIT B Score] 채점 오류:', error);
    const message = error instanceof Error ? error.message : '채점 처리 실패';
    return errorResponse(message, 500);
  }
}
