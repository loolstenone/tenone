/**
 * 북마크 API — 로그인 회원 본인만 (회원은 세션에서 식별)
 * POST /api/board/bookmark  { postId: '...' }  → { bookmarked: boolean, count: number }
 * GET  /api/board/bookmark?page=1&limit=12    → 내 북마크 목록
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import { requireMember } from '@/lib/api-guard';

export async function GET(request: NextRequest) {
    const auth = await requireMember(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12));
    try {
        const result = await boardDb.fetchBookmarks(auth.memberId, page, limit);
        return NextResponse.json(result);
    } catch (error) {
        console.error('fetchBookmarks error:', error);
        return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireMember(request);
        if (auth instanceof NextResponse) return auth;

        const { postId } = await request.json();
        if (!postId) {
            return NextResponse.json({ error: 'postId required' }, { status: 400 });
        }
        const result = await boardDb.toggleBookmark(auth.memberId, postId);
        return NextResponse.json(result);
    } catch (error) {
        console.error('toggleBookmark error:', error);
        return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
    }
}
