/**
 * HIT 결과를 회원에 연결
 * POST /api/hit/link-member
 * Body: { resultId, memberId }
 *
 * 회원가입 직후 호출 — 비회원 검사 데이터를 새 회원에 연결
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { resultId, memberId } = await request.json();
    if (!resultId || !memberId) {
      return errorResponse('resultId와 memberId는 필수입니다.', 400);
    }

    const supabase = createClient();

    // hit_a_results의 member_id 업데이트 (null인 경우만)
    const { error: aError } = await supabase
      .from('hit_a_results')
      .update({ member_id: memberId })
      .eq('id', resultId)
      .is('member_id', null);

    // hit_sessions도 연결
    const { data: aResult } = await supabase
      .from('hit_a_results')
      .select('session_id')
      .eq('id', resultId)
      .maybeSingle();

    if (aResult?.session_id) {
      await supabase
        .from('hit_sessions')
        .update({ member_id: memberId })
        .eq('id', aResult.session_id)
        .is('member_id', null);
    }

    // hit_b_results도 같은 member로 연결 (있으면)
    await supabase
      .from('hit_b_results')
      .update({ member_id: memberId })
      .eq('hit_a_result_id', resultId)
      .is('member_id', null);

    return successResponse({ linked: true });
  } catch (error) {
    console.error('[HIT Link Member]:', error);
    return errorResponse('연결 실패', 500);
  }
}
