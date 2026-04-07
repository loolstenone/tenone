import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses, updateHitSession, getHitAResult } from '@/lib/supabase/hit';
import { scoreCH, scoreCHDeep, scoreAPDeep } from '@/lib/hit/scoring';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, hitAResultId } = body;

    if (!sessionToken || !hitAResultId) {
      return errorResponse('sessionToken과 hitAResultId는 필수입니다.', 400);
    }

    const session = await getHitSession(sessionToken);
    if (!session) {
      return errorResponse('세션을 찾을 수 없습니다.', 404);
    }

    if (session.status !== 'in_progress') {
      return errorResponse('이미 완료된 세션입니다.', 400);
    }

    // 심화 세션의 응답 (character_deep + aptitude_deep)
    const deepResponses = await getHitResponses(session.id);
    if (deepResponses.length === 0) {
      return errorResponse('심화 응답 데이터가 없습니다.', 400);
    }

    // 원본 HIT A 결과 → 원본 session_id → core 응답
    const aResult = await getHitAResult(hitAResultId);
    if (!aResult) {
      return errorResponse('원본 HIT A 결과를 찾을 수 없습니다.', 404);
    }
    const coreResponses = await getHitResponses(aResult.session_id);

    // 합쳐서 채점 (scoreCHDeep는 core+deep 모두 필요)
    const allResponses = [...coreResponses, ...deepResponses];
    const chCore = scoreCH(allResponses);
    const chDeep = scoreCHDeep(allResponses, chCore);
    const apDeep = scoreAPDeep(allResponses);

    const nowIso = new Date().toISOString();

    // hit_a_results UPDATE (deep 컬럼이 없을 수 있으므로 best-effort)
    try {
      await supabase
        .from('hit_a_results')
        .update({
          ch_deep_scores: chDeep,
          ap_deep_scores: apDeep,
          ch_deep_completed_at: nowIso,
          ap_deep_completed_at: nowIso,
        })
        .eq('id', hitAResultId);
    } catch (updateErr) {
      console.warn('[HIT A Deep Score] hit_a_results 업데이트 실패 (컬럼 없을 수 있음):', updateErr);
    }

    // 다크 트라이어드 4유형 탐지 플래그
    try {
      const dark = chDeep.darkTypes;
      if (dark.narcissism || dark.machiavellianism || dark.psychopathy || dark.sociopathy || chDeep.decoyFakingFlag) {
        await supabase.from('hit_admin_flags').insert({
          member_id: session.member_id || null,
          session_id: session.id,
          flag_type: chDeep.decoyFakingFlag ? 'distortion' : 'dark_triad',
          flag_score: 90,
          flag_detail: {
            narcissism: dark.narcissism,
            machiavellianism: dark.machiavellianism,
            psychopathy: dark.psychopathy,
            sociopathy: dark.sociopathy,
            decoy_faking: chDeep.decoyFakingFlag,
            source: 'ch_deep',
          },
        });
      }
    } catch (flagErr) {
      console.warn('[HIT A Deep Score] 플래그 저장 실패:', flagErr);
    }

    // 세션 완료
    await updateHitSession(sessionToken, {
      status: 'completed',
      completed_at: nowIso,
    });

    return successResponse({
      resultId: hitAResultId,
      chDeep,
      apDeep,
    }, 200);
  } catch (error) {
    console.error('[HIT A Deep Score] 채점 오류:', error);
    const message = error instanceof Error ? error.message : '심화 채점 실패';
    return errorResponse(message, 500);
  }
}
