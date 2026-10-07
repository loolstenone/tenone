/**
 * 브랜드 사이트 메뉴 레지스트리 — 사이트 메뉴 ↔ 콘텐츠 원천 ↔ 인트라 관리 화면 SSOT
 *
 * 원칙 (CLAUDE.md §1.9.5):
 *   - 인트라 브랜드 메뉴는 사이트 메뉴와 1:1. 사이트 메뉴를 바꾸면 이 파일을 같이 바꾼다
 *   - 통합 관리 > 사이트 현황(/intra/ums/sites/status)과 브랜드별 화면은 이 정의로 숫자를 계산한다 → 사이트·인트라 불일치 방지
 *   - 아직 매핑 안 된 브랜드는 숨기지 않고 "메뉴 매핑 없음"으로 드러낸다
 *   - Tier(집중/보관)는 여기서 정하지 않는다 → DB ums_sites.tier (헌법 §0.1 SSOT)
 */

export type ContentSource =
    /** 통합 게시판 ums_posts (사이트 slug + 게시판 slug) */
    | { kind: "board"; board: string }
    /** 브랜드 전용 테이블 (count) */
    | { kind: "table"; table: string; eq?: Record<string, string | boolean>; pendingEq?: Record<string, string> }
    /** 문의·지원 폼 contact_submissions.form_type */
    | { kind: "inquiry"; formType: string }
    /** 고정 페이지 — 관리할 콘텐츠 없음 */
    | { kind: "static" };

export interface SiteMenu {
    /** 사이트 헤더에 보이는 이름 */
    label: string;
    /** 사이트 경로 (브랜드 prefix 포함) */
    path: string;
    source: ContentSource;
    /** 인트라에서 이 메뉴 콘텐츠를 관리하는 화면 */
    adminHref?: string;
    /** 인트라 메뉴 이름 (없으면 label) */
    adminLabel?: string;
    /** 콘텐츠 단위 (글·건·개) */
    unit?: string;
}

export interface BrandSiteMenus {
    siteId: string;
    /** 인트라 브랜드 루트 */
    adminBase: string;
    menus: SiteMenu[];
}

export const BRAND_SITE_MENUS: BrandSiteMenus[] = [
    {
        siteId: "rook",
        adminBase: "/intra/ums/rook",
        menus: [
            { label: "Home", path: "/rook", source: { kind: "static" } },
            { label: "Works", path: "/rook/works", source: { kind: "board", board: "works" }, adminHref: "/intra/ums/rook/works", unit: "글" },
            { label: "Artist", path: "/rook/artist", source: { kind: "board", board: "artist" }, adminHref: "/intra/ums/rook/artist", unit: "글" },
            { label: "Free board", path: "/rook/freeboard", source: { kind: "board", board: "freeboard" }, adminHref: "/intra/ums/rook/freeboard", unit: "글" },
            { label: "RooKie 지원", path: "/rook/rookie", source: { kind: "inquiry", formType: "rook_rookie" }, adminHref: "/intra/ums/rook/rookie", unit: "건" },
            { label: "Contact (About)", path: "/rook/about", source: { kind: "inquiry", formType: "rook_inquiry" }, adminHref: "/intra/ums/rook/cs", adminLabel: "Contact 문의", unit: "건" },
        ],
    },
    {
        siteId: "madleague",
        adminBase: "/intra/ums/madleague",
        menus: [
            { label: "프로그램", path: "/madleague/programs", source: { kind: "table", table: "mad_competitions" }, unit: "개" },
            { label: "동아리", path: "/madleague/clubs", source: { kind: "table", table: "mad_clubs", eq: { status: "active" } }, unit: "개" },
            { label: "아레나 (커뮤니티)", path: "/madleague/arena", source: { kind: "table", table: "mad_posts" }, unit: "글" },
            { label: "MADzine", path: "/madleague/madzine", source: { kind: "table", table: "mad_articles", pendingEq: { status: "pending_review" } }, adminHref: "/intra/ums/madleague/articles", adminLabel: "MADzine 검토", unit: "글" },
            { label: "지원하기", path: "/madleague/apply", source: { kind: "table", table: "mad_applications", pendingEq: { status: "pending" } }, adminHref: "/intra/ums/madleague/applications", adminLabel: "지원·HeRo 심사", unit: "건" },
            { label: "HeRo 신청", path: "/madleague/hero", source: { kind: "table", table: "mad_hero_applications", pendingEq: { status: "pending" } }, adminHref: "/intra/ums/madleague/applications", unit: "건" },
            { label: "문의하기", path: "/madleague/contact", source: { kind: "inquiry", formType: "madleague_inquiry" }, adminHref: "/intra/ums/madleague/cs", adminLabel: "고객 문의", unit: "건" },
        ],
    },
];

export function getBrandSiteMenus(siteId: string): BrandSiteMenus | undefined {
    return BRAND_SITE_MENUS.find(b => b.siteId === siteId);
}

export interface AdminNavChild { name: string; href: string }

/**
 * 인트라 브랜드 메뉴(children) = 대시보드 + 사이트 메뉴별 관리 화면(중복 href 제외) + 공통 탭
 * lib/intra-nav.ts가 사용 — 사이트 메뉴를 바꾸면 인트라 메뉴가 같이 바뀐다
 */
export function brandAdminChildren(siteId: string, extra: AdminNavChild[] = []): AdminNavChild[] {
    const reg = getBrandSiteMenus(siteId);
    if (!reg) return extra;
    const out: AdminNavChild[] = [{ name: "대시보드", href: reg.adminBase }];
    for (const m of reg.menus) {
        if (m.adminHref && !out.some(c => c.href === m.adminHref)) out.push({ name: m.adminLabel ?? m.label, href: m.adminHref });
    }
    for (const e of extra) if (!out.some(c => c.href === e.href)) out.push(e);
    return out;
}
