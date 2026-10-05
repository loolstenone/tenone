/**
 * 게시글 상세 API
 * GET    /api/board/posts/:id   발행글은 누구나(직원 전용 게시판 제외), 그 외는 작성자 본인·직원
 * PUT    /api/board/posts/:id   작성자 본인·직원
 * PATCH  /api/board/posts/:id   (PUT과 동일)
 * DELETE /api/board/posts/:id   작성자 본인·직원 (보관 처리). ?hard=true 영구 삭제는 직원·Admin Key
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import type { UpdatePostInput } from '@/types/board';
import { isAdminRequest } from '@/lib/supabase/api-utils';
import { getApiUser, requireMember } from '@/lib/api-guard';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
    const { id } = await params;
    try {
        const apiUser = await getApiUser(request);
        const post = await boardDb.fetchPostWithDetails(id, apiUser?.memberId ?? undefined);
        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        const isStaff = isAdminRequest(request) || !!apiUser?.isStaff;
        const canSeeUnpublished = isStaff || (!!apiUser?.memberId && post.authorId === apiUser.memberId);
        if (post.status !== 'published' && !canSeeUnpublished) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        // 직원 전용 게시판 글은 직원만
        if (!isStaff) {
            const rule = await boardDb.fetchBoardRule(post.site, post.board);
            if (rule && !boardDb.isPublicBoard(rule)) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }
        }

        if (post.status === 'published' && !isStaff) await boardDb.incrementViewCount(id);
        return NextResponse.json(post);
    } catch (error) {
        console.error('fetchPost error:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

/** 작성자 본인 또는 직원만 — 통과 시 { isStaff } 반환 */
async function authorizeOwner(request: NextRequest, id: string): Promise<{ isStaff: boolean } | NextResponse> {
    if (isAdminRequest(request)) return { isStaff: true };
    const auth = await requireMember(request);
    if (auth instanceof NextResponse) return auth;
    const post = await boardDb.fetchPostById(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    if (!auth.isStaff && post.authorId !== auth.memberId) {
        return NextResponse.json({ error: '본인 글만 수정·삭제할 수 있습니다.' }, { status: 403 });
    }
    return { isStaff: auth.isStaff };
}

async function update(request: NextRequest, { params }: Ctx) {
    const { id } = await params;
    try {
        const allowed = await authorizeOwner(request, id);
        if (allowed instanceof NextResponse) return allowed;

        const body = await request.json() as UpdatePostInput;
        const input: UpdatePostInput = allowed.isStaff
            ? body
            // 회원: 고정 불가, 상태는 발행·임시저장만
            : { ...body, isPinned: undefined, status: body.status && body.status !== 'published' && body.status !== 'draft' ? undefined : body.status };
        const post = await boardDb.updatePost(id, input);
        return NextResponse.json(post);
    } catch (error) {
        console.error('updatePost error:', error);
        return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
    }
}

export const PUT = update;
export const PATCH = update;

export async function DELETE(request: NextRequest, { params }: Ctx) {
    const { id } = await params;
    try {
        const allowed = await authorizeOwner(request, id);
        if (allowed instanceof NextResponse) return allowed;

        const hard = new URL(request.url).searchParams.get('hard') === 'true';
        if (hard && !allowed.isStaff) {
            return NextResponse.json({ error: 'Admin only' }, { status: 403 });
        }
        await boardDb.deletePost(id, hard);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('deletePost error:', error);
        return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
    }
}
