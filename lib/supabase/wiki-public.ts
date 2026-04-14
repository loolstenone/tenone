/**
 * 퍼블릭 위키 Supabase 쿼리
 * wiki.tenone.biz용 — 로그인 불필요, 읽기 전용
 */
import { createClient } from './client';
import type { WikiPage, WikiLink, WikiLog, WikiCategory } from '@/types/wiki';

const supabase = createClient();

/** 카테고리별 또는 전체 페이지 목록 */
export async function fetchWikiPages(category?: WikiCategory): Promise<WikiPage[]> {
    let query = supabase
        .from('wiki_pages')
        .select('*')
        .order('title');

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as WikiPage[]) || [];
}

/** 단일 페이지 + 연결된 페이지 */
export async function fetchWikiPage(slug: string): Promise<{
    page: WikiPage | null;
    linkedPages: Array<WikiPage & { linkType: string; direction: 'from' | 'to' }>;
}> {
    const { data: page, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !page) return { page: null, linkedPages: [] };

    // 이 페이지에 연결된 링크 조회
    const [outLinks, inLinks] = await Promise.all([
        supabase.from('wiki_links').select('to_slug, link_type').eq('from_slug', slug),
        supabase.from('wiki_links').select('from_slug, link_type').eq('to_slug', slug),
    ]);

    const linkedSlugs = new Set<string>();
    const linkInfo: Record<string, { type: string; direction: 'from' | 'to' }> = {};

    (outLinks.data || []).forEach(l => {
        linkedSlugs.add(l.to_slug);
        linkInfo[l.to_slug] = { type: l.link_type, direction: 'to' };
    });
    (inLinks.data || []).forEach(l => {
        linkedSlugs.add(l.from_slug);
        if (!linkInfo[l.from_slug]) {
            linkInfo[l.from_slug] = { type: l.link_type, direction: 'from' };
        }
    });

    let linkedPages: Array<WikiPage & { linkType: string; direction: 'from' | 'to' }> = [];
    if (linkedSlugs.size > 0) {
        const { data: pages } = await supabase
            .from('wiki_pages')
            .select('*')
            .in('slug', Array.from(linkedSlugs));

        linkedPages = (pages || []).map(p => ({
            ...p,
            linkType: linkInfo[p.slug]?.type || 'reference',
            direction: linkInfo[p.slug]?.direction || 'to',
        }));
    }

    return { page: page as WikiPage, linkedPages };
}

/** 전체 링크 (그래프용) */
export async function fetchWikiLinks(): Promise<WikiLink[]> {
    const { data, error } = await supabase
        .from('wiki_links')
        .select('*');
    if (error) throw error;
    return (data as WikiLink[]) || [];
}

/** 변경 이력 */
export async function fetchWikiLog(limit = 30): Promise<WikiLog[]> {
    const { data, error } = await supabase
        .from('wiki_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return (data as WikiLog[]) || [];
}

/** FTS 검색 */
export async function searchWikiPages(query: string, category?: WikiCategory): Promise<WikiPage[]> {
    // simple 텍스트서치 — tsquery로 변환
    const tsQuery = query.trim().split(/\s+/).join(' & ');

    let q = supabase
        .from('wiki_pages')
        .select('*')
        .textSearch('title', tsQuery, { config: 'simple', type: 'websearch' });

    if (category) {
        q = q.eq('category', category);
    }

    const { data, error } = await q.limit(50);

    // fallback: title/content ILIKE
    if (error || !data?.length) {
        let fallback = supabase
            .from('wiki_pages')
            .select('*')
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

        if (category) fallback = fallback.eq('category', category);

        const { data: fbData } = await fallback.limit(50);
        return (fbData as WikiPage[]) || [];
    }

    return (data as WikiPage[]) || [];
}

/** 카테고리별 페이지 수 통계 */
export async function fetchWikiStats(): Promise<{
    totalPages: number;
    totalLinks: number;
    byCategory: Record<string, number>;
}> {
    const [pages, links] = await Promise.all([
        supabase.from('wiki_pages').select('category'),
        supabase.from('wiki_links').select('id', { count: 'exact', head: true }),
    ]);

    const byCategory: Record<string, number> = {};
    (pages.data || []).forEach(p => {
        byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });

    return {
        totalPages: pages.data?.length || 0,
        totalLinks: links.count || 0,
        byCategory,
    };
}
