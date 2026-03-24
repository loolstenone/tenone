/**
 * 댓글 API
 * GET  /api/board/comments?postId=xxx
 * POST /api/board/comments
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import type { CreateCommentInput } from '@/types/board';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
        return NextResponse.json({ error: 'postId required' }, { status: 400 });
    }

    try {
        const comments = await boardDb.fetchComments(postId);
        return NextResponse.json({ comments });
    } catch (error) {
        console.error('fetchComments error:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CreateCommentInput;

        if (!body.postId || !body.content) {
            return NextResponse.json({ error: 'postId and content required' }, { status: 400 });
        }

        // 비회원 검증
        if (!body.guestNickname) {
            // TODO: Supabase auth에서 유저 ID 가져오기
        } else if (!body.guestPassword) {
            return NextResponse.json({ error: 'Guest password required' }, { status: 400 });
        }

        const comment = await boardDb.createComment(body);
        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('createComment error:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
