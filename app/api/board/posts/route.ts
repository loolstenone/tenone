/**
 * 게시글 API
 * GET  /api/board/posts?site=tenone&board=news&page=1&limit=12
 * POST /api/board/posts  (글 작성)
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import type { CreatePostInput, PostListParams, SiteCode } from '@/types/board';
import { isAdminRequest, getAuthenticatedClient } from '@/lib/supabase/api-utils';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const params: PostListParams = {
        site: (searchParams.get('site') || 'tenone') as SiteCode,
        board: searchParams.get('board') || undefined,
        category: searchParams.get('category') || undefined,
        tag: searchParams.get('tag') || undefined,
        status: (searchParams.get('status') as PostListParams['status']) || undefined,
        search: searchParams.get('search') || undefined,
        sort: (searchParams.get('sort') as PostListParams['sort']) || 'latest',
        period: (searchParams.get('period') as PostListParams['period']) || 'all',
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '12'),
    };

    try {
        const result = await boardDb.fetchPosts(params);
        return NextResponse.json(result);
    } catch (error) {
        console.error('fetchPosts error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CreatePostInput;

        // 필수 필드 검증
        if (!body.site || !body.board || !body.title || !body.content) {
            return NextResponse.json(
                { error: 'site, board, title, content are required' },
                { status: 400 }
            );
        }

        // Admin API Key → 에이전트/관리자 글 작성
        if (isAdminRequest(request)) {
            const post = await boardDb.createPost({
                ...body,
                status: body.status || 'published',
            }, undefined);

            const { createClient: createSupabase } = await import('@/lib/supabase/server');
            const supabase = await createSupabase();
            await supabase.from('posts').update({
                author_type: 'agent',
            }).eq('id', post.id);

            return NextResponse.json(post, { status: 201 });
        }

        // 인증된 사용자
        const { user } = await getAuthenticatedClient();
        let authorId: string | undefined = user?.id;

        if (!authorId && body.guestNickname) {
            // 비회원 글 작성
            if (!body.guestPassword) {
                return NextResponse.json({ error: 'Guest password required' }, { status: 400 });
            }
        } else if (!authorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const post = await boardDb.createPost(body, authorId);
        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('createPost error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
