/**
 * 좋아요 토글 API
 * POST /api/board/like  { targetType: 'post'|'comment', targetId: '...' }
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';

export async function POST(request: NextRequest) {
    try {
        const { targetType, targetId, userId } = await request.json();

        if (!targetType || !targetId || !userId) {
            return NextResponse.json({ error: 'targetType, targetId, userId required' }, { status: 400 });
        }

        const liked = await boardDb.toggleLike(userId, targetType, targetId);
        return NextResponse.json({ liked });
    } catch (error) {
        console.error('toggleLike error:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
