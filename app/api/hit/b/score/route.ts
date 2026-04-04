import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitBResult, getLatestHitAResult } from '@/lib/supabase/hit';
import { scorePersonality, scoreRIASEC, scoreCompetency, scoreReadiness, determineJourneyStage, computeAlertScores } from '@/lib/hit/scoring-b';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, competencyTrack, hitAResultId } = body;

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

    // 채점
    const personality = scorePersonality(responses);
    const riasec = scoreRIASEC(responses);
    const competency = scoreCompetency(responses, competencyTrack);
    const readiness = scoreReadiness(responses);

    // 역량 평균
    const competencyValues = [
      ...Object.values(competency.common),
      ...Object.values(competency.trackScores),
    ];
    const competencyAvg = competencyValues.length > 0
      ? competencyValues.reduce((a, b) => a + b, 0) / competencyValues.length
      : 0;

    const journeyStage = determineJourneyStage(readiness.total, competencyAvg);

    // AI 리포트 (Claude Sonnet)
    let aiReport: string | null = null;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const hitAContext = hitAData
        ? `HIT A 프로필:\n- MBTI: ${hitAData.mbti_type}\n- DISC: ${hitAData.disc_primary} (${hitAData.disc_subtype})\n- 64유형: ${hitAData.type_code} "${hitAData.type_name_ko}"\n- S-Power: ${JSON.stringify(hitAData.s_power_scores)}\n- 기저요인: ${hitAData.base_summary}\n\n`
        : '';

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 2000,
        system: '당신은 커리어 진단 전문가입니다. 한국어로 따뜻하면서도 전문적인 종합 분석 리포트를 작성합니다. 검사 결과를 통합적으로 해석하여 강점, 성장영역, 커리어 제안을 포함해주세요. 절대 이모지, 이모티콘, 특수문자(★●▶ 등)를 사용하지 마세요. 순수 텍스트만 사용하세요. 마크다운 헤딩(#)도 사용하지 마세요.',
        messages: [{
          role: 'user',
          content: `${hitAContext}HIT B 결과:\n` +
            `성격 특성: ${JSON.stringify(personality.scores)}\n` +
            `다크 트라이어드: ${JSON.stringify(personality.darkTriadFlags)}\n` +
            `RIASEC: R${riasec.r} I${riasec.i} A${riasec.a} S${riasec.s} E${riasec.e} C${riasec.c} (Holland: ${riasec.hollandCode})\n` +
            `역량(공통): ${JSON.stringify(competency.common)}\n` +
            `역량(트랙: ${competencyTrack}): ${JSON.stringify(competency.trackScores)}\n` +
            `준비도: 자기이해${readiness.self} 포트폴리오${readiness.portfolio} 면접${readiness.interview} 네트워킹${readiness.network} (총점${readiness.total}, ${readiness.grade}등급)\n` +
            `여정단계: ${journeyStage}\n` +
            `취약영역: ${readiness.gaps.join(', ') || '없음'}\n\n` +
            `위 결과를 통합하여 4-5문단의 종합 커리어 분석 리포트를 작성해주세요. 강점, 주의점, 추천 커리어 방향, 지금 해야 할 액션 아이템을 포함해주세요.`,
        }],
      });
      const textBlock = msg.content.find(b => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        aiReport = textBlock.text;
      }
    } catch (aiError) {
      console.error('[HIT B Score] AI 리포트 생성 실패:', aiError);
    }

    // 결과 저장
    const result = await createHitBResult({
      session_id: session.id,
      member_id: session.member_id || null,
      hit_a_result_id: hitAResultId || (hitAData?.id ?? null),
      personality_scores: personality.scores,
      dark_triad_flags: personality.darkTriadFlags,
      riasec_r: riasec.r,
      riasec_i: riasec.i,
      riasec_a: riasec.a,
      riasec_s: riasec.s,
      riasec_e: riasec.e,
      riasec_c: riasec.c,
      holland_code: riasec.hollandCode,
      competency_common: competency.common,
      competency_track: competencyTrack,
      competency_track_scores: competency.trackScores,
      readiness_self: readiness.self,
      readiness_portfolio: readiness.portfolio,
      readiness_interview: readiness.interview,
      readiness_network: readiness.network,
      readiness_total: readiness.total,
      readiness_grade: readiness.grade,
      readiness_gaps: readiness.gaps,
      ai_report: aiReport,
      journey_stage: journeyStage,
      // 주의 신호 (소비자 비노출)
      ...(() => {
        const alerts = computeAlertScores(personality.scores);
        return {
          alert_n1: alerts.alertN1,
          alert_m1: alerts.alertM1,
          alert_p1: alerts.alertP1,
          alert_level: alerts.alertLevel,
        };
      })(),
    });

    // 주의 신호 level 3 → 관리자 알림
    const alerts = computeAlertScores(personality.scores);
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
