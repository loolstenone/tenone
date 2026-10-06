// RooK 공개 콘텐츠 조회 (서버 전용) — Works·AI Artist·Free board = ums_posts (site 'rook', 게시판 works·artist·freeboard)
// anon 키 + RLS(공개 게시판의 published 글만) → 쿠키 없이 조회해 ISR 캐시 가능
import { createClient } from '@supabase/supabase-js';

export type RookBoard = 'works' | 'artist' | 'freeboard';

export interface RookPost {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    body: string;
    category: string | null;
    image: string | null;
    youtubeId: string | null;
    authorName: string | null;
    publishedAt: string | null;
}

/** 게시판 카테고리 = 원본 rook.co.kr 메뉴 순서 (ums_boards.categories와 동일) */
export const ROOK_CATEGORIES: Record<RookBoard, string[]> = {
    works: ['Meme', 'AD', 'Music', 'Contents', 'RooK BooK', 'Art work'],
    artist: ['Woman', 'Man', 'High teen', 'Kids', 'Baby', 'Senior', 'Animal', 'Character', 'Musician'],
    freeboard: ['Imge', 'Video', 'Music', 'Text', 'Big Contents', '망했어요 ㅋ'],
};

function anon() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

interface PostRow {
    id: string;
    slug: string | null;
    title: string;
    summary: string | null;
    body: string | null;
    category_id: string | null;
    image: string | null;
    extra_fields: { youtube_id?: string | null; sort?: number } | null;
    author_name: string | null;
    published_at: string | null;
}

function toPost(r: PostRow): RookPost {
    return {
        id: r.id,
        slug: r.slug ?? r.id,
        title: r.title,
        summary: r.summary,
        body: r.body ?? '',
        category: r.category_id,
        image: r.image,
        youtubeId: r.extra_fields?.youtube_id ?? null,
        authorName: r.author_name,
        publishedAt: r.published_at,
    };
}

async function boardId(board: RookBoard): Promise<string | null> {
    const { data } = await anon()
        .from('ums_boards')
        .select('id, ums_sites!inner(slug)')
        .eq('ums_sites.slug', 'rook')
        .eq('slug', board)
        .maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
}

const COLUMNS = 'id, slug, title, summary, body, category_id, image, extra_fields, author_name, published_at';

export async function getRookPosts(board: RookBoard, opts: { category?: string; limit?: number } = {}): Promise<RookPost[]> {
    const id = await boardId(board);
    if (!id) return [];
    let q = anon()
        .from('ums_posts')
        .select(COLUMNS)
        .eq('board_id', id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
    if (opts.category) q = q.eq('category_id', opts.category);
    const { data, error } = await q;
    if (error) {
        console.error('[rook] posts', board, error.message);
        return [];
    }
    // 순서: 새로 올린 글(최신순) → 이전 글은 원본 rook.co.kr 목록 순서(extra_fields.sort)
    const rows = [...((data ?? []) as PostRow[])].sort((a, b) => {
        const sa = a.extra_fields?.sort, sb = b.extra_fields?.sort;
        if (sa === undefined && sb === undefined) return 0;
        if (sa === undefined) return -1;
        if (sb === undefined) return 1;
        return sa - sb;
    });
    return (opts.limit ? rows.slice(0, opts.limit) : rows).map(toPost);
}

export async function getRookPost(board: RookBoard, slug: string): Promise<RookPost | null> {
    const id = await boardId(board);
    if (!id) return null;
    const { data } = await anon()
        .from('ums_posts')
        .select(COLUMNS)
        .eq('board_id', id)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
    return data ? toPost(data as PostRow) : null;
}
