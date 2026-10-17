/**
 * 도메인별 검색 노출 — robots.txt · sitemap.xml · llms.txt (2026-10-16)
 *
 * 한 서버가 여러 도메인을 서빙하므로, 요청한 호스트를 보고 그 사이트의 것을 만든다.
 * (이전: 모든 도메인이 tenone.biz 사이트맵·robots를 내보냄 — rook.co.kr에서도 tenone.biz 주소 목록이 나갔다)
 *
 * 원천
 *   - 공개 페이지 = lib/brand-site-menus.ts (헤더·하위·기능 메뉴) — 메뉴를 바꾸면 사이트맵도 따라온다
 *   - 글 = 게시판(ums_posts, 메뉴 source.board) · MADzine(mad_articles)
 *   - 인트라 설정 = ums_sites.robots_extra · sitemap_exclude · llms_txt · json_ld (인트라 › 사이트 설정 › 검색 노출)
 * 막는 곳: 외부 서버 운영 중인 브랜드의 스테이징(*.tenone.biz)·공식 주소가 아닌 진입로·비공개 사이트(is_open=false) → 전체 차단
 */
import { createClient } from '@supabase/supabase-js';
import { CANONICAL_HOSTS, domainSiteMap } from '@/lib/domain-registry';
import { BRAND_SITE_MENUS } from '@/lib/brand-site-menus';
import { PRIVATE_PATHS, COMMON_PRIVATE } from '@/lib/private-paths';

export interface SiteSeoSettings {
    is_open: boolean | null;
    robots_extra: string | null;
    sitemap_exclude: string[];
    llms_txt: string | null;
    json_ld: string | null;
}

export interface HostSite {
    host: string;
    siteId: string;
    /** 검색엔진에 열어도 되는 주소인가 */
    indexable: boolean;
    /** 막는 이유 (인트라 표시용) */
    reason?: string;
}

// 사이트맵에서 빼는 회원 전용 경로 = lib/private-paths.ts (로그아웃 이동과 같은 목록)
/** 메뉴 레지스트리에 없는 공개 페이지 — 홈(로고)·About(유틸리티바) */
const EXTRA_PATHS: Record<string, string[]> = {
    madleague: ['/madleague/about'],
    rook: ['/rook/about'],
    hero: ['/hero/about'],
    planners: ['/planners/about'],
};

function admin() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

/** 호스트 → 사이트·공개 여부 */
export function resolveHost(rawHost: string): HostSite {
    const host = rawHost.split(':')[0].toLowerCase();
    const siteId = (domainSiteMap as Record<string, string>)[host] ?? 'tenone';
    const canonical = CANONICAL_HOSTS[siteId];
    if (host === 'localhost') return { host, siteId, indexable: false, reason: '로컬 개발' };
    if (canonical) {
        if (canonical.hosting === 'external') return { host, siteId, indexable: false, reason: '외부 서버 운영 중 — 이 주소는 이전 준비용 스테이징' };
        if (host !== canonical.host) return { host, siteId, indexable: false, reason: `공식 주소가 아님 (공식: ${canonical.host})` };
    }
    if (siteId === 'tenone' && host !== 'www.tenone.biz' && host !== 'tenone.biz') {
        return { host, siteId, indexable: false, reason: '공식 주소가 아님' };
    }
    return { host, siteId, indexable: true };
}

export async function getSiteSeoSettings(siteId: string): Promise<SiteSeoSettings> {
    const { data } = await admin().from('ums_sites')
        .select('is_open, robots_extra, sitemap_exclude, llms_txt, json_ld').eq('slug', siteId).maybeSingle();
    const d = data as Partial<SiteSeoSettings> | null;
    return {
        is_open: d?.is_open ?? null,
        robots_extra: d?.robots_extra ?? null,
        sitemap_exclude: d?.sitemap_exclude ?? [],
        llms_txt: d?.llms_txt ?? null,
        json_ld: d?.json_ld ?? null,
    };
}

export function robotsText(site: HostSite, settings: SiteSeoSettings): string {
    if (!site.indexable || settings.is_open === false) {
        return `# ${site.reason ?? '비공개 사이트'} — 검색 수집 안 함\nUser-agent: *\nDisallow: /\n`;
    }
    return [
        '# Bytespider(바이트댄스) — 원본 이미지를 반복 수집해 전송량 초과 (2026-10-15)',
        'User-agent: Bytespider',
        'Disallow: /',
        '',
        'User-agent: *',
        'Allow: /',
        ...['/intra/', '/api/', '/auth-hub/', '/login', '/signup', '/oauth'].map(p => `Disallow: ${p}`),
        ...(settings.robots_extra?.trim() ? ['', '# 인트라 › 사이트 설정 › 검색 노출', settings.robots_extra.trim()] : []),
        '',
        `Sitemap: https://${site.host}/sitemap.xml`,
        '',
    ].join('\n');
}

export interface SitemapEntry { url: string; lastModified?: string; priority?: number }

/** 브랜드 사이트 공개 주소 목록 (메뉴 + 게시판 글 + MADzine) */
export async function brandSitemap(site: HostSite, settings: SiteSeoSettings): Promise<SitemapEntry[]> {
    if (!site.indexable || settings.is_open === false) return [];
    const reg = BRAND_SITE_MENUS.find(b => b.siteId === site.siteId);
    if (!reg) return [];
    const origin = `https://${site.host}`;
    const blocked = [...COMMON_PRIVATE, ...(PRIVATE_PATHS[site.siteId] ?? []), ...settings.sitemap_exclude.filter(Boolean)];
    const isBlocked = (path: string) => blocked.some(b => path === b || path.startsWith(`${b}/`) || path.endsWith(b));

    const paths = new Map<string, number>([[`/${site.siteId}`, 1], ...(EXTRA_PATHS[site.siteId] ?? []).map(p => [p, 0.7] as [string, number])]);
    for (const m of reg.menus) {
        paths.set(m.path.split('?')[0], m.placement === 'header' ? 0.8 : 0.6);
        if (m.placement === 'header') for (const d of m.dropdown ?? []) paths.set(d.path.split('?')[0], 0.6);
    }
    const out: SitemapEntry[] = [...paths]
        .filter(([p]) => !isBlocked(p))
        .map(([p, priority]) => ({ url: `${origin}${p}`, priority }));

    const db = admin();
    // 게시판 글 (공개 게시판의 발행 글만)
    const boards = reg.menus.filter(m => m.source.kind === 'board' && !isBlocked(m.path));
    if (boards.length) {
        const { data: siteRow } = await db.from('ums_sites').select('id').eq('slug', site.siteId).maybeSingle();
        for (const m of boards) {
            const boardSlug = (m.source as { board: string }).board;
            const { data: b } = await db.from('ums_boards').select('id, visibility').eq('site_id', siteRow?.id ?? '').eq('slug', boardSlug).maybeSingle();
            if (!b || b.visibility !== 'public') continue;
            const { data: posts } = await db.from('ums_posts').select('id, slug, updated_at, published_at')
                .eq('board_id', b.id).eq('status', 'published').order('published_at', { ascending: false }).limit(1000);
            for (const p of posts ?? []) {
                out.push({ url: `${origin}${m.path}/${p.slug ?? p.id}`, lastModified: p.updated_at ?? p.published_at ?? undefined, priority: 0.5 });
            }
        }
    }
    // MADLeague 동아리 소개 페이지
    if (site.siteId === 'madleague' && !isBlocked('/madleague/clubs')) {
        const { data: clubs } = await db.from('mad_clubs').select('slug, updated_at').eq('status', 'active');
        for (const c of clubs ?? []) if (c.slug) out.push({ url: `${origin}/madleague/clubs/${c.slug}`, lastModified: c.updated_at ?? undefined, priority: 0.6 });
    }
    // MADzine 기사
    if (site.siteId === 'madleague' && !isBlocked('/madleague/madzine')) {
        const { data: articles } = await db.from('mad_articles').select('slug, updated_at, published_at')
            .eq('is_published', true).order('published_at', { ascending: false }).limit(1000);
        for (const a of articles ?? []) {
            if (a.slug) out.push({ url: `${origin}/madleague/madzine/${a.slug}`, lastModified: a.updated_at ?? a.published_at ?? undefined, priority: 0.5 });
        }
    }
    return out;
}

/** tenone.biz 사이트맵에서 뺄 경로 — 자기 공식 도메인이 있는 브랜드(그쪽 사이트맵이 담당) */
export function ownedByBrandDomain(path: string): boolean {
    const seg = path.split('/')[1] ?? '';
    return !!CANONICAL_HOSTS[seg];
}

export interface SeoOverview {
    /** 이 브랜드의 사이트맵·robots를 내보내는 주소 */
    host: string;
    /** 자기 공식 도메인이 있는가 (없으면 tenone.biz 사이트맵에 포함) */
    ownDomain: boolean;
    /** tenone.biz 자신 — 공식 도메인 없는 브랜드 경로까지 담는 대표 사이트맵 */
    isHub: boolean;
    indexable: boolean;
    reason?: string;
    robotsUrl: string;
    sitemapUrl: string;
    /** 지금 사이트맵에 나가는 주소 수 */
    urlCount: number;
    /** 막혀 있을 때, 열면 나갈 주소 수 */
    urlCountIfOpen: number | null;
}

/** 인트라 › 사이트 설정 › 검색 노출 — 공식 주소 기준 현황 */
export async function seoOverview(siteId: string, settings: SiteSeoSettings): Promise<SeoOverview> {
    const canonical = CANONICAL_HOSTS[siteId];
    const host = canonical?.host ?? 'www.tenone.biz';
    const site = canonical ? resolveHost(host) : { ...resolveHost(host), siteId };
    const closed = settings.is_open === false;
    const indexable = site.indexable && !closed;
    const reason = !site.indexable ? site.reason : closed ? '비공개 사이트 (is_open=false)' : undefined;
    let urlCount = 0;
    let urlCountIfOpen: number | null = null;
    if (canonical) {
        urlCount = indexable ? (await brandSitemap(site, settings)).length : 0;
        if (!indexable) urlCountIfOpen = (await brandSitemap({ ...site, indexable: true }, { ...settings, is_open: true })).length;
    }
    return {
        host, ownDomain: !!canonical, isHub: siteId === 'tenone', indexable, reason,
        robotsUrl: `https://${host}/robots.txt`,
        sitemapUrl: `https://${host}/sitemap.xml`,
        urlCount, urlCountIfOpen,
    };
}
