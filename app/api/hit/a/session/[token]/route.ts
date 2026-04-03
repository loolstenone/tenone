import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, getHitResponses } from '@/lib/supabase/hit';

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const session = await getHitSession(token);
    if (!session) {
      return errorResponse('세션을 찾을 수 없습니다.', 404);
    }

    const responses = await getHitResponses(session.id);

    return successResponse({ session, responses });
  } catch (error) {
    console.error('[HIT A Session] 조회 오류:', error);
    const message = error instanceof Error ? error.message : '세션 조회 실패';
    return errorResponse(message, 500);
  }
}
