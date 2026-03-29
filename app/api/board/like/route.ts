/**
 * 좋아요 토글 API
 * POST /api/board/like  { targetType: 'post'|'comment', targetId: '...', userId: '...' }
 * Returns { liked: boolean, count: number }
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { targetType, targetId, userId } = await request.json();

        if (!targetType || !targetId || !userId) {
            return NextResponse.json({ error: 'targetType, targetId, userId required' }, { status: 400 });
        }

        const liked = await boardDb.toggleLike(userId, targetType, targetId);

        // Fetch updated count
        let count = 0;
        if (targetType === 'post') {
            const { data } = await supabase
                .from('posts')
                .select('like_count')
                .eq('id', targetId)
                .single();
            count = data?.like_count ?? 0;
        } else if (targetType === 'comment') {
            const { data } = await supabase
                .from('comments')
                .select('like_count')
                .eq('id', targetId)
                .single();
            count = data?.like_count ?? 0;
        }

        return NextResponse.json({ liked, count });
    } catch (error) {
        console.error('toggleLike error:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
