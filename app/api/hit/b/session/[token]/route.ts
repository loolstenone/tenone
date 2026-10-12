import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getOwnedHitSessionPayload } from '@/lib/supabase/hit';

/** GET — 세션 소유 회원만 (member_id는 응답에서 제외, 2026-10-12) */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const r = await getOwnedHitSessionPayload(request, token);
    if ('error' in r) return r.error;
    return successResponse(r.payload);
  } catch (error) {
    console.error('[HIT B Session] 조회 오류:', error);
    return errorResponse('세션을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', 500);
  }
}
