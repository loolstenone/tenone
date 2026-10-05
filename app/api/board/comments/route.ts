/**
 * 댓글 API (ums_comments)
 * GET    /api/board/comments?postId=xxx
 * POST   /api/board/comments          로그인 회원 + 게시판 댓글 권한. 비회원 댓글 없음
 * DELETE /api/board/comments?id=xxx   작성자 본인·직원
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import type { CreateCommentInput } from '@/types/board';
import { getApiUser, requireMember } from '@/lib/api-guard';

const CONTENT_MAX = 2000;

export async function GET(request: NextRequest) {
    const postId = new URL(request.url).searchParams.get('postId');
    if (!postId) {
        return NextResponse.json({ error: 'postId required' }, { status: 400 });
    }
    try {
        const apiUser = await getApiUser(request);
        // 직원 전용 게시판 글의 댓글은 직원만
        if (!apiUser?.isStaff) {
            const post = await boardDb.fetchPostById(postId);
            const rule = post ? await boardDb.fetchBoardRule(post.site, post.board) : null;
            if (!post || post.status !== 'published' || (rule && !boardDb.isPublicBoard(rule))) {
                return NextResponse.json({ comments: [] });
            }
        }
        const comments = await boardDb.fetchComments(postId, apiUser?.memberId ?? undefined);
        return NextResponse.json({ comments });
    } catch (error) {
        console.error('fetchComments error:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireMember(request);
        if (auth instanceof NextResponse) return auth;

        const body = await request.json() as CreateCommentInput;
        const content = body.content?.trim();
        if (!body.postId || !content) {
            return NextResponse.json({ error: '댓글 내용을 입력하세요.' }, { status: 400 });
        }
        if (content.length > CONTENT_MAX) {
            return NextResponse.json({ error: '댓글이 너무 깁니다.' }, { status: 400 });
        }

        const post = await boardDb.fetchPostById(body.postId);
        if (!post || post.status !== 'published') {
            return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
        }
        const rule = await boardDb.fetchBoardRule(post.site, post.board);
        if (rule && !boardDb.isPublicBoard(rule) && !auth.isStaff) {
            return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
        }
        if (!rule?.allowComments) {
            return NextResponse.json({ error: '댓글을 쓸 수 없는 게시판입니다.' }, { status: 403 });
        }
        if (!auth.isStaff && !boardDb.memberCanWrite(rule.commentPermission)) {
            return NextResponse.json({ error: '운영진만 댓글을 쓸 수 있습니다.' }, { status: 403 });
        }

        const comment = await boardDb.createComment({ postId: body.postId, parentId: body.parentId, content }, auth.memberId);
        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('createComment error:', error);
        return NextResponse.json({ error: '댓글 저장에 실패했습니다.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const auth = await requireMember(request);
        if (auth instanceof NextResponse) return auth;

        const id = new URL(request.url).searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        const authorId = await boardDb.fetchCommentAuthor(id);
        if (authorId === undefined) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (!auth.isStaff && authorId !== auth.memberId) {
            return NextResponse.json({ error: '본인 댓글만 삭제할 수 있습니다.' }, { status: 403 });
        }
        await boardDb.deleteComment(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('deleteComment error:', error);
        return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
    }
}
