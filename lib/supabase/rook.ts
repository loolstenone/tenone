// RooK 공개 콘텐츠 조회 (서버 전용) — Works·AI Artist = ums_posts (site 'rook', 게시판 works·artist)
// anon 키 + RLS(공개 게시판의 published 글만) → 쿠키 없이 조회해 ISR 캐시 가능
import { createClient } from '@supabase/supabase-js';

export type RookBoard = 'works' | 'artist';

export interface RookPost {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    body: string;
    category: string | null;
    image: string | null;
    youtubeId: string | null;
    publishedAt: string | null;
}

/** 게시판 카테고리 순서 (ums_boards.categories와 동일) */
export const ROOK_CATEGORIES: Record<RookBoard, string[]> = {
    works: ['Music', 'Meme', 'Contents', 'AD', 'Art work'],
    artist: ['Woman', 'Man', 'High teen', 'Kids', 'Baby', 'Senior', 'Animal', 'Character', 'Musician'],
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
    extra_fields: { youtube_id?: string | null } | null;
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

const COLUMNS = 'id, slug, title, summary, body, category_id, image, extra_fields, published_at';

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
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) {
        console.error('[rook] posts', board, error.message);
        return [];
    }
    return ((data ?? []) as PostRow[]).map(toPost);
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
