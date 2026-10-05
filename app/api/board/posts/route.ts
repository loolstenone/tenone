/**
 * 게시글 API
 * GET  /api/board/posts?site=tenone&board=news&page=1&limit=12
 *      발행글은 누구나. 그 외 상태(draft 등)는 직원 또는 본인 글(author_id=본인)만
 * POST /api/board/posts  (글 작성)
 *      로그인 회원 + 게시판 쓰기 권한 (운영 게시판은 직원만). 비회원 작성 없음
 *      Admin API Key = 에이전트 작성 (작성자 표기 'Ten:One')
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import type { CreatePostInput, PostListParams, SiteCode } from '@/types/board';
import { isAdminRequest } from '@/lib/supabase/api-utils';
import { getApiUser, requireMember } from '@/lib/api-guard';

const TITLE_MAX = 200;
const CONTENT_MAX = 200_000;

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
        page: Math.max(1, parseInt(searchParams.get('page') || '1') || 1),
        limit: Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12)),
        author_id: searchParams.get('author_id') || undefined,
    };

    // 발행 외 상태 조회 = 직원 또는 본인 글
    if (params.status && params.status !== 'published' && !isAdminRequest(request)) {
        const apiUser = await getApiUser(request);
        const isSelf = !!apiUser?.memberId && params.author_id === apiUser.memberId;
        if (!apiUser?.isStaff && !isSelf) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

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

        if (!body.site || !body.board || !body.title?.trim() || !body.content?.trim()) {
            return NextResponse.json({ error: '제목과 내용을 입력하세요.' }, { status: 400 });
        }
        if (body.title.length > TITLE_MAX || body.content.length > CONTENT_MAX) {
            return NextResponse.json({ error: '제목 또는 내용이 너무 깁니다.' }, { status: 400 });
        }

        const rule = await boardDb.fetchBoardRule(body.site, body.board);
        if (!rule) return NextResponse.json({ error: '게시판을 찾을 수 없습니다.' }, { status: 404 });

        let post;
        if (isAdminRequest(request)) {
            // 에이전트·자동화 작성
            post = await boardDb.createPost(
                { ...body, status: body.status || 'published' },
                rule,
                { memberId: null, displayName: 'Ten:One' },
            );
        } else {
            const auth = await requireMember(request);
            if (auth instanceof NextResponse) return auth;
            if (!auth.isStaff && !boardDb.memberCanWrite(rule.writePermission)) {
                return NextResponse.json({ error: '이 게시판은 운영진만 작성할 수 있습니다.' }, { status: 403 });
            }
            const input: CreatePostInput = auth.isStaff
                ? body
                // 회원: 고정·임의 상태 지정 불가 (발행 또는 임시저장만)
                : { ...body, isPinned: false, status: body.status === 'draft' ? 'draft' : 'published' };
            post = await boardDb.createPost(input, rule, { memberId: auth.memberId });
        }

        // 운영 게시판(직원 작성) 발행글만 뉴스룸 자동 등록 — 회원 커뮤니티 글을 다른 곳에 노출하지 않음 (데이터 계약 4조)
        if (post.status === 'published' && !boardDb.memberCanWrite(rule.writePermission)) {
            const { registerToNewsroom } = await import('@/lib/supabase/newsroom');
            await registerToNewsroom({
                id: post.id,
                site: post.site,
                title: post.title,
                excerpt: post.excerpt,
                represent_image: post.representImage,
                category: post.category,
                tags: post.tags,
                created_at: post.createdAt,
            });
        }

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('createPost error:', error);
        return NextResponse.json({ error: '글 저장에 실패했습니다.' }, { status: 500 });
    }
}
