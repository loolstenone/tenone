/**
 * 북마크 토글 API
 * POST /api/board/bookmark  { postId: '...', userId: '...' }
 * GET  /api/board/bookmark?userId=...&page=1&limit=12
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    try {
        const result = await boardDb.fetchBookmarks(userId, page, limit);
        return NextResponse.json(result);
    } catch (error) {
        console.error('fetchBookmarks error:', error);
        return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { postId, userId } = await request.json();

        if (!postId || !userId) {
            return NextResponse.json({ error: 'postId, userId required' }, { status: 400 });
        }

        const bookmarked = await boardDb.toggleBookmark(userId, postId);
        return NextResponse.json({ bookmarked });
    } catch (error) {
        console.error('toggleBookmark error:', error);
        return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
    }
}
