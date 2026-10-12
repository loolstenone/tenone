import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, createHitDResult, upsertHeroProfile, getLatestHitAResult } from '@/lib/supabase/hit';
import { scoreHitD } from '@/lib/hit/scoring-d';
import { createAdminClient as createClient } from '@/lib/supabase/admin';
import Anthropic from '@anthropic-ai/sdk';
import { HIT_REPORT_MODEL } from '@/lib/hit/ai';
import { getStageChecklistProgress } from '@/lib/hero/journey-checklists';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, hitAResultId, targetJob } = body;

    if (!sessionToken) {
      return errorResponse('sessionToken은 필수입니다.', 400);
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

    if (!session.member_id) return errorResponse('회원 세션만 채점할 수 있습니다.', 403);

    // HIT A 결과 — 본인 것만. ?a= 가 없거나 남의 것이면 본인 최신 A (2026-10-12)
    const supabase = createClient();
    let hitAData: Record<string, any> | null = null;
    if (hitAResultId) {
      const { data } = await supabase.from('hit_a_results').select('*').eq('id', hitAResultId).eq('member_id', session.member_id).maybeSingle();
      hitAData = data;
    }
    if (!hitAData) hitAData = await getLatestHitAResult(session.member_id);
    if (!hitAData) {
      return errorResponse('HIT A를 먼저 완료해야 합니다.', 400);
    }

    // 채점
    // 준비도(상태형 항목)는 검사가 아니라 Journey 체크리스트 완료율 — 채점에 넘겨 파생값(갭·경로·차기 역할)도 같은 값으로 (2026-10-12)
    const checklist = await getStageChecklistProgress(createClient(), session.member_id!, 'd');
    const scored = scoreHitD(responses, { checklist });

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
      const hitAContext = `HIT A 프로필:\n- MBTI: ${hitAData.mbti_type}\n- DISC: ${hitAData.disc_primary} (${hitAData.disc_subtype})\n- 64유형: ${hitAData.type_code} "${hitAData.type_name_ko}"\n- S-Power: ${JSON.stringify(hitAData.s_power_scores)}\n- 기저요인: ${hitAData.base_summary ?? "미측정"}\n\n`;

      const msg = await anthropic.messages.create({
        model: HIT_REPORT_MODEL,
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
          content: `${hitAContext}HIT D 경력전환 분석 결과:\n` +
            `경력 자본: ${JSON.stringify(scored.capitalScores)} (종합 ${scored.capitalOverall}점)\n` +
            `이직 동기: Push ${scored.motivationPush} / Pull ${scored.motivationPull} (유형: ${scored.motivationType})\n` +
            `전환 가능성: ${JSON.stringify(scored.transferabilityScores)} (지수 ${scored.transferabilityIndex})\n` +
            `전환 준비도: ${scored.transitionReadiness} (준비 ${scored.preparation}, 갭인식 ${scored.gapAwareness})\n` +
            `준비도 세부: ${JSON.stringify(scored.readinessScores)}\n` +
            `전환유형(CTYPE): ${scored.ctype}\n` +
            `갭 영역: ${scored.gapAreas.join(', ') || '없음'}\n` +
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
      console.error('[HIT D Score] AI 리포트 생성 실패:', aiError);
    }

    // 결과 저장
    const result = await createHitDResult({
      session_id: session.id,
      member_id: session.member_id || null,
      hit_a_result_id: hitAData.id,
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
