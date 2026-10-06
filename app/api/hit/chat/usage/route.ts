/**
 * AI 채팅 사용 횟수 조회
 * GET /api/hit/chat/usage — 로그인 회원 본인 사용량 (비로그인 0)
 * Response: { data: number } — 총 사용 횟수 (role='user' 메시지 수)
 */
import { NextRequest } from 'next/server';
import { getApiUser } from '@/lib/api-guard';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createAdminClient as createClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const memberId = (await getApiUser(request))?.memberId;
    if (!memberId) return successResponse(0);

    const supabase = await createClient();
    const { count, error } = await supabase
      .from('hit_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('role', 'user');

    if (error) throw error;

    return successResponse(count ?? 0);
  } catch (error) {
    console.error('[HIT Chat Usage]:', error);
    return errorResponse('사용 횟수 조회 실패', 500);
  }
}
