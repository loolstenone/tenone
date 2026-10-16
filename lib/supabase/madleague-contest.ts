// MAD League 공모전/프로젝트 (서버 전용) — 공통 게시판 ums_posts (site 'madleague', board 'contest')
// 옛 madleague.net/pinboard 이전 글 slug = 'mp-{아임웹 idx}' (scripts/madleague-pinboard-import.mjs)
// anon 키 + RLS(공개 게시판의 published 글만) → 쿠키 없이 조회해 ISR 캐시 가능
import { createClient } from '@supabase/supabase-js';

export const CONTEST_CATEGORIES = ['공모전', '프로젝트'] as const;

export interface ContestPost {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    body: string;
    category: string | null;
    image: string | null;
    authorName: string | null;
    publishedAt: string | null;
}

function anon() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

interface Row {
    id: string; slug: string | null; title: string; summary: string | null; body: string | null;
    category_id: string | null; image: string | null; author_name: string | null; published_at: string | null;
}

const toPost = (r: Row): ContestPost => ({
    id: r.id, slug: r.slug ?? r.id, title: r.title, summary: r.summary, body: r.body ?? '',
    category: r.category_id, image: r.image, authorName: r.author_name, publishedAt: r.published_at,
});

const COLUMNS = 'id, slug, title, summary, body, category_id, image, author_name, published_at';

async function boardId(): Promise<string | null> {
    const { data } = await anon()
        .from('ums_boards')
        .select('id, ums_sites!inner(slug)')
        .eq('ums_sites.slug', 'madleague')
        .eq('slug', 'contest')
        .maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
}

export async function getContestPosts(opts: { category?: string } = {}): Promise<ContestPost[]> {
    const id = await boardId();
    if (!id) return [];
    let q = anon().from('ums_posts').select(COLUMNS).eq('board_id', id).eq('status', 'published')
        .order('published_at', { ascending: false }).limit(200);
    if (opts.category) q = q.eq('category_id', opts.category);
    const { data } = await q;
    return ((data ?? []) as Row[]).map(toPost);
}

export async function getContestPost(slug: string): Promise<ContestPost | null> {
    const id = await boardId();
    if (!id) return null;
    const { data } = await anon().from('ums_posts').select(COLUMNS).eq('board_id', id).eq('status', 'published')
        .eq('slug', slug).maybeSingle();
    return data ? toPost(data as Row) : null;
}
