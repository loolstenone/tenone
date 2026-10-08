import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BRAND_SITE_MENUS, getBrandSiteMenus } from '@/lib/brand-site-menus';
import { PROGRAM_ROOM_BASE, programRoomPath } from '@/lib/programs/paths';
import { MAD_PROGRAMS } from '@/features/madleague/programs-list';

/**
 * 유니버스 공통 검색 (UniverseUtilityBar 검색창)
 *
 *   이 사이트 — ① 메뉴·기능 (lib/brand-site-menus.ts) ② 통합 게시판 글 (board 원천 → ums_posts, 공개·비밀글 제외)
 *              ③ 브랜드 전용 공개 콘텐츠 (아래 SITE_SEARCHERS)
 *   유니버스  — 공개 중인 브랜드 사이트 (ums_sites.is_open)
 *
 * 회원은 검색하지 않는다 — 이름·소개를 비로그인에게 노출하게 됨 (헌법 원칙 7 · 데이터 계약 4: 교차 노출은 본인 허락 시에만)
 * service_role로 읽으므로 공개 상태(published·active 등) 필터를 반드시 건다.
 */

const supabase = createAdminClient();

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    href: string;
    type: string;
}

/** 내부 사이트는 유니버스 결과에서 뺀다 */
const INTERNAL_SITES = new Set(['tenone', 'wiki', 'dokdae']);

/** PostgREST or() 필터 문법을 깨는 문자 제거 */
function sanitize(raw: string): string {
    return raw.replace(/[,()*%\\:"'.]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50);
}

function snippet(text: string | null | undefined): string | undefined {
    if (!text) return undefined;
    const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return plain ? plain.slice(0, 80) : undefined;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = sanitize(searchParams.get('q') ?? '');
    const site = searchParams.get('site') ?? '';

    if (q.length < 2) {
        return NextResponse.json({ siteResults: [], universeResults: [] });
    }

    const [siteResults, universeResults] = await Promise.all([
        searchSite(site, q).catch((e) => { console.error('[search] site', site, e); return []; }),
        searchUniverse(q, site).catch((e) => { console.error('[search] universe', e); return []; }),
    ]);

    return NextResponse.json({ siteResults, universeResults });
}

// ─── 이 사이트 ───────────────────────────────────────────────

async function searchSite(site: string, q: string): Promise<SearchResult[]> {
    if (!site) return [];
    const groups = await Promise.all([
        Promise.resolve(searchMenus(site, q)),
        searchBoards(site, q),
        SITE_SEARCHERS[site]?.(q) ?? Promise.resolve([]),
    ]);
    // 같은 주소 중복 제거 (메뉴와 콘텐츠가 겹칠 때)
    const seen = new Set<string>();
    return groups.flat().filter(r => (seen.has(r.href) ? false : (seen.add(r.href), true))).slice(0, 15);
}

/** 메뉴 이름·하위 메뉴·페이지 기능(버튼 문구) */
function searchMenus(site: string, q: string): SearchResult[] {
    const reg = getBrandSiteMenus(site);
    if (!reg) return [];
    const needle = q.toLowerCase();
    const results: SearchResult[] = [];
    for (const m of reg.menus) {
        const entries = [{ label: m.label, path: m.path }, ...('dropdown' in m && m.dropdown ? m.dropdown : [])];
        for (const e of entries) {
            if (e.label.toLowerCase().includes(needle)) {
                results.push({ id: `menu-${e.path}-${e.label}`, title: e.label, href: e.path, type: '메뉴' });
            }
        }
    }
    return results;
}

/** 레지스트리의 board 원천 → ums_posts (공개 글만) */
async function searchBoards(site: string, q: string): Promise<SearchResult[]> {
    const reg = getBrandSiteMenus(site);
    const boards = (reg?.menus ?? []).flatMap(m => (m.source.kind === 'board' ? [{ slug: m.source.board, path: m.path, label: m.label }] : []));
    if (boards.length === 0) return [];

    const { data: siteRow } = await supabase.from('ums_sites').select('id').eq('slug', site).maybeSingle();
    if (!siteRow) return [];
    const { data: boardRows } = await supabase.from('ums_boards').select('id, slug')
        .eq('site_id', siteRow.id).in('slug', boards.map(b => b.slug));
    if (!boardRows?.length) return [];
    const byId = new Map(boardRows.map(b => [b.id, boards.find(x => x.slug === b.slug)!]));

    const { data: posts } = await supabase.from('ums_posts')
        .select('id, slug, title, summary, board_id')
        .in('board_id', boardRows.map(b => b.id))
        .eq('status', 'published')
        .eq('is_secret', false)
        .or(`title.ilike.%${q}%,summary.ilike.%${q}%,body.ilike.%${q}%`)
        .order('published_at', { ascending: false })
        .limit(10);

    return (posts ?? []).map(p => {
        const b = byId.get(p.board_id)!;
        return {
            id: `post-${p.id}`,
            title: p.title,
            description: snippet(p.summary),
            href: `${b.path}/${p.slug || p.id}`,
            type: b.label.replace(/\s*\*$/, ''),
        };
    });
}

/** 프로그램 회차 — 이 사이트가 주인이거나 창구(channels)인 공개 회차 */
async function searchProgramRounds(site: string, q: string): Promise<SearchResult[]> {
    const { data } = await supabase.from('program_rounds')
        .select('id, brand_id, channels, title, client_name')
        .contains('channels', [site])
        .in('status', ['upcoming', 'ongoing', 'completed'])
        .or(`title.ilike.%${q}%,client_name.ilike.%${q}%`)
        .limit(5);
    return (data ?? []).map(r => ({
        id: `round-${r.id}`,
        title: r.title,
        description: r.client_name ?? undefined,
        // 이 사이트 창구의 회차 방으로 (창구가 없으면 주인 브랜드 기준)
        href: PROGRAM_ROOM_BASE[site] ? `${PROGRAM_ROOM_BASE[site]}/${r.id}` : programRoomPath(r),
        type: '프로그램',
    }));
}

/** 브랜드 전용 공개 콘텐츠 */
const SITE_SEARCHERS: Record<string, (q: string) => Promise<SearchResult[]>> = {
    madleague: async (q) => {
        const needle = q.toLowerCase();
        const programs: SearchResult[] = MAD_PROGRAMS
            .filter(p => p.title.toLowerCase().includes(needle) || p.desc.toLowerCase().includes(needle))
            .map(p => ({ id: `program-${p.href}`, title: p.title, description: p.desc, href: p.href, type: '프로그램' }));

        const [articles, clubs, rounds] = await Promise.all([
            supabase.from('mad_articles')
                .select('id, slug, title, excerpt')
                .eq('status', 'published').eq('is_published', true)
                .or(`title.ilike.%${q}%,subtitle.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`)
                .order('published_at', { ascending: false })
                .limit(6),
            supabase.from('mad_clubs')
                .select('id, slug, name, region')
                .eq('status', 'active')
                .or(`name.ilike.%${q}%,region.ilike.%${q}%`)
                .limit(5),
            searchProgramRounds('madleague', q),
        ]);

        return [
            ...programs,
            ...(articles.data ?? []).map(a => ({ id: `article-${a.id}`, title: a.title, description: snippet(a.excerpt), href: `/madleague/madzine/${a.slug}`, type: 'MADzine' })),
            ...(clubs.data ?? []).map(c => ({ id: `club-${c.id}`, title: c.name, description: c.region ?? undefined, href: `/madleague/clubs/${c.slug}`, type: '동아리' })),
            ...rounds,
        ];
    },
    rook: (q) => searchProgramRounds('rook', q),
    hero: (q) => searchProgramRounds('hero', q),
    badak: async (q) => {
        const { data } = await supabase.from('badak_groups')
            .select('id, title, description')
            .not('status', 'in', '(pending,rejected,draft)')
            .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
            .limit(8);
        return (data ?? []).map(g => ({ id: `group-${g.id}`, title: g.title, description: snippet(g.description), href: `/badak/groups/${g.id}`, type: '모임' }));
    },
};

// ─── 유니버스 ────────────────────────────────────────────────

async function searchUniverse(q: string, currentSite: string): Promise<SearchResult[]> {
    const { data: sites } = await supabase.from('ums_sites')
        .select('slug, name, tagline, meta_description, home_path')
        .eq('is_open', true)
        .or(`name.ilike.%${q}%,tagline.ilike.%${q}%,meta_description.ilike.%${q}%,slug.ilike.%${q}%`)
        .limit(8);

    return (sites ?? [])
        .filter(s => !INTERNAL_SITES.has(s.slug) && s.slug !== currentSite)
        .slice(0, 5)
        .map(s => ({
            id: `site-${s.slug}`,
            title: s.name,
            description: snippet(s.tagline || s.meta_description),
            // 다른 브랜드 경로는 화면에서 CrossSiteLink가 그 사이트 공식 주소로 바꾼다
            href: s.home_path || `/${s.slug}`,
            type: BRAND_SITE_MENUS.some(b => b.siteId === s.slug) ? '브랜드' : '사이트',
        }));
}
