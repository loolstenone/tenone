/**
 * 좋아요 토글 API — 로그인 회원 본인만 (회원은 세션에서 식별)
 * POST /api/board/like  { targetType: 'post'|'comment', targetId: '...' }
 * Returns { liked: boolean, count: number }
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import { requireMember } from '@/lib/api-guard';

export async function POST(request: NextRequest) {
    try {
        const auth = await requireMember(request);
        if (auth instanceof NextResponse) return auth;

        const { targetType, targetId } = await request.json();
        if ((targetType !== 'post' && targetType !== 'comment') || !targetId) {
            return NextResponse.json({ error: 'targetType, targetId required' }, { status: 400 });
        }
        const result = await boardDb.toggleLike(auth.memberId, targetType, targetId);
        return NextResponse.json(result);
    } catch (error) {
        console.error('toggleLike error:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
