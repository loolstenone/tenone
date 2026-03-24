/**
 * 게시글 API
 * GET  /api/board/posts?site=tenone&board=news&page=1&limit=12
 * POST /api/board/posts  (글 작성)
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import type { CreatePostInput, PostListParams, SiteCode } from '@/types/board';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const params: PostListParams = {
        site: (searchParams.get('site') || 'tenone') as SiteCode,
        board: searchParams.get('board') || undefined,
        category: searchParams.get('category') || undefined,
        tag: searchParams.get('tag') || undefined,
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

        // 인증 확인
        let authorId: string | undefined;
        const authHeader = request.headers.get('authorization');

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            // Admin API Key 체크
            if (token === process.env.ADMIN_API_KEY) {
                // AI 에이전트 / 관리자 → author_type = 'agent'
                const post = await boardDb.createPost({
                    ...body,
                    status: body.status || 'published',
                }, undefined);

                // author_type 직접 설정
                const { createClient: createSupabase } = await import('@/lib/supabase/client');
                const supabase = createSupabase();
                await supabase.from('posts').update({
                    author_type: 'agent',
                }).eq('id', post.id);

                return NextResponse.json(post, { status: 201 });
            }
        }

        // 일반 유저 (Supabase auth)
        // TODO: Supabase server-side auth에서 user 가져오기
        // 현재는 body에 authorId가 있으면 사용
        if (body.guestNickname) {
            // 비회원 글 작성
            if (!body.guestPassword) {
                return NextResponse.json({ error: 'Guest password required' }, { status: 400 });
            }
            // TODO: bcrypt 해시
        }

        const post = await boardDb.createPost(body, authorId);
        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('createPost error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
