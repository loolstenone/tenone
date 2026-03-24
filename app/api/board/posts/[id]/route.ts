/**
 * 게시글 상세 API
 * GET    /api/board/posts/:id
 * PUT    /api/board/posts/:id
 * DELETE /api/board/posts/:id
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import type { UpdatePostInput } from '@/types/board';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // TODO: 로그인 유저 ID 가져오기
        const post = await boardDb.fetchPostWithDetails(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // 조회수 증가
        await boardDb.incrementViewCount(id);

        return NextResponse.json(post);
    } catch (error) {
        console.error('fetchPost error:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json() as UpdatePostInput;
        const post = await boardDb.updatePost(id, body);
        return NextResponse.json(post);
    } catch (error) {
        console.error('updatePost error:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { searchParams } = new URL(request.url);
        const hard = searchParams.get('hard') === 'true';

        // Admin API Key 체크
        const authHeader = request.headers.get('authorization');
        const isAdmin = authHeader === `Bearer ${process.env.ADMIN_API_KEY}`;

        if (hard && !isAdmin) {
            return NextResponse.json({ error: 'Admin only' }, { status: 403 });
        }

        await boardDb.deletePost(id, hard);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('deletePost error:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
