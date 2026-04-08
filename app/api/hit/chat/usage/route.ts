/**
 * AI 채팅 사용 횟수 조회
 * GET /api/hit/chat/usage?memberId=xxx
 * Response: { data: number } — 총 사용 횟수 (role='user' 메시지 수)
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return errorResponse('memberId는 필수입니다.', 400);
    }

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
