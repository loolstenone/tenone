/**
 * 브랜드 사이트 메뉴 레지스트리 — 사이트 헤더 메뉴 · 페이지 안 기능 ↔ 콘텐츠 원천 ↔ 인트라 관리 화면 SSOT
 *
 * 원칙 (CLAUDE.md §1.9.5):
 *   - 사이트 헤더는 이 파일의 header 메뉴를 그대로 렌더한다 (siteHeaderNav) → 메뉴 이름을 고칠 곳은 여기 한 곳
 *   - 인트라 브랜드 메뉴는 사이트에 보이는 이름 그대로 (헤더 메뉴명 / 버튼 문구) — 위치(상위 메뉴)를 붙이지 않고, 다른 이름을 지어 붙이지 않는다
 *   - 통합 관리 > 사이트 현황과 브랜드 대시보드는 이 정의로 숫자를 센다 (lib/site-status.ts)
 *   - Tier(집중/보관)는 여기서 정하지 않는다 → DB ums_sites.tier
 */

export type ContentSource =
    /** 통합 게시판 ums_posts (사이트 + 게시판 slug) */
    | { kind: "board"; board: string }
    /** 브랜드 전용 테이블 (count) */
    | { kind: "table"; table: string; eq?: Record<string, string | boolean>; pendingEq?: Record<string, string> }
    /** 문의·지원 폼 contact_submissions.form_type */
    | { kind: "inquiry"; formType: string }
    /** 고정 페이지 — 관리할 콘텐츠 없음 */
    | { kind: "static" };

interface MenuBase {
    /** 사이트에 보이는 이름 그대로 (헤더 메뉴명 또는 버튼·링크 문구) */
    label: string;
    /** 사이트 경로 (브랜드 prefix 포함) */
    path: string;
    source: ContentSource;
    /** 인트라에서 이 콘텐츠를 관리하는 화면 (없으면 대시보드 표에만 보임) */
    adminHref?: string;
    /** 콘텐츠 단위 (글·건·개) */
    unit?: string;
}

/** 사이트 헤더 메뉴 — 사이트 헤더가 이 순서·이 이름으로 렌더 */
export interface HeaderMenu extends MenuBase {
    placement: "header";
    /** 헤더 드롭다운 하위 링크 */
    dropdown?: { label: string; path: string }[];
}

/** 페이지 안 기능 (버튼·폼·푸터 링크) — 인트라 이름 = 버튼 문구 그대로, 위치는 현황표 보조 정보로만 */
export interface FeatureMenu extends MenuBase {
    placement: "feature";
    /** 기능이 있는 위치 (현황표 보조 표기) — 헤더 메뉴명 또는 "홈"·"푸터 Contact" 등 */
    location: string;
}

export type SiteMenu = HeaderMenu | FeatureMenu;

export interface BrandSiteMenus {
    siteId: string;
    /** 인트라 브랜드 루트 */
    adminBase: string;
    menus: SiteMenu[];
}

export const BRAND_SITE_MENUS: BrandSiteMenus[] = [
    {
        // 원본 www.rook.co.kr 메뉴 그대로 (Free board * 표기 포함)
        siteId: "rook",
        adminBase: "/intra/ums/rook",
        menus: [
            { placement: "header", label: "Home", path: "/rook", source: { kind: "static" } },
            { placement: "header", label: "Works", path: "/rook/works", source: { kind: "board", board: "works" }, adminHref: "/intra/ums/rook/works", unit: "글" },
            { placement: "header", label: "Artist", path: "/rook/artist", source: { kind: "board", board: "artist" }, adminHref: "/intra/ums/rook/artist", unit: "글" },
            { placement: "header", label: "Free board *", path: "/rook/freeboard", source: { kind: "board", board: "freeboard" }, adminHref: "/intra/ums/rook/freeboard", unit: "글" },
            { placement: "header", label: "RooKie", path: "/rook/rookie", source: { kind: "static" } },
            { placement: "header", label: "About", path: "/rook/about", source: { kind: "static" } },
            { placement: "feature", location: "RooKie", label: "RooKie 지원하기", path: "/rook/rookie", source: { kind: "inquiry", formType: "rook_rookie" }, adminHref: "/intra/ums/rook/rookie", unit: "건" },
            { placement: "feature", location: "RooKie", label: "참가 신청", path: "/rook/projects", source: { kind: "table", table: "program_applications", eq: { brand_id: "rook" }, pendingEq: { status: "pending" } }, adminHref: "/intra/ums/rook/programs", unit: "건" },
            { placement: "feature", location: "About", label: "상담 / 문의", path: "/rook/about", source: { kind: "inquiry", formType: "rook_inquiry" }, adminHref: "/intra/ums/rook/cs", unit: "건" },
        ],
    },
    {
        // Planner's — 기획자 훈련 브랜드. 훈련·프로젝트는 코어 프로그램 모듈(program_*, 주인 brand planners)
        siteId: "planners",
        adminBase: "/intra/ums/planners",
        menus: [
            { placement: "header", label: "프로젝트", path: "/planners/projects", source: { kind: "table", table: "program_rounds", eq: { brand_id: "planners" } }, adminHref: "/intra/ums/planners/programs", unit: "개" },
            { placement: "header", label: "인증서", path: "/planners/certificate", source: { kind: "table", table: "program_certificates", eq: { brand_id: "planners" } }, unit: "건" },
            { placement: "feature", location: "프로젝트", label: "참가 신청", path: "/planners/projects", source: { kind: "table", table: "program_applications", eq: { brand_id: "planners" }, pendingEq: { status: "pending" } }, adminHref: "/intra/ums/planners/programs", unit: "건" },
        ],
    },
    {
        // HeRo — Talent Agency (비공개 운영, is_open=false). 헤더 = features/hero/HeRoHeader.tsx가 이 순서로 렌더 (2026-10-10 등록)
        siteId: "hero",
        adminBase: "/intra/hero",
        menus: [
            { placement: "header", label: "HIT 검사", path: "/hero/hit", source: { kind: "table", table: "hit_a_results" }, adminHref: "/intra/hero/hit", unit: "건" },
            { placement: "header", label: "AI 상담", path: "/hero/coaching/ai", source: { kind: "static" }, adminHref: "/intra/hero/ai-counseling" },
            { placement: "header", label: "커리어 코칭", path: "/hero/coaching", source: { kind: "table", table: "hero_coaching_sessions" }, unit: "건" },
            { placement: "header", label: "탤런트 에이전시", path: "/hero/talent-agent", source: { kind: "table", table: "hero_talent_applications", pendingEq: { status: "pending" } }, adminHref: "/intra/hero/talent-agent", unit: "건" },
            { placement: "header", label: "요금 안내", path: "/hero/pricing", source: { kind: "static" } },
            { placement: "header", label: "써치 라이트", path: "/hero/search-light", source: { kind: "table", table: "hero_tih_responses" }, adminHref: "/intra/hero/search-light", unit: "건" },
            { placement: "feature", location: "헤더 기업 버튼", label: "기업", path: "/hero/company", source: { kind: "table", table: "hero_companies" }, adminHref: "/intra/hero/companies", unit: "개" },
            { placement: "feature", location: "커리어 코칭", label: "코칭 대기 신청", path: "/hero/coaching", source: { kind: "table", table: "coaching_waitlist" }, unit: "건" },
        ],
    },
    {
        // Badak — 기획자 네트워크 (Vercel 새 사이트 스테이징, 외부 badak.biz 운영 중). 헤더 = features/badak/BadakHeader.tsx (2026-10-10 등록)
        siteId: "badak",
        adminBase: "/intra/ums/badak",
        menus: [
            { placement: "header", label: "모임", path: "/badak/groups", source: { kind: "table", table: "badak_groups" }, adminHref: "/intra/ums/badak/groups", unit: "개" },
            { placement: "header", label: "니즈 탐색", path: "/badak/explore", source: { kind: "table", table: "badak_needs" }, adminHref: "/intra/ums/badak/needs", unit: "건" },
            { placement: "header", label: "커뮤니티", path: "/badak/community", source: { kind: "table", table: "badak_community_posts" }, adminHref: "/intra/ums/badak/posts", unit: "글" },
            { placement: "header", label: "스토리", path: "/badak/story", source: { kind: "table", table: "badak_stories" }, adminHref: "/intra/ums/badak/stories", unit: "글" },
            { placement: "header", label: "모임 개설", path: "/badak/groups/create", source: { kind: "static" } },
            { placement: "header", label: "바닥장 신청", path: "/badak/apply", source: { kind: "table", table: "badak_leader_applications", pendingEq: { status: "pending" } }, adminHref: "/intra/ums/badak/applications", unit: "건" },
        ],
    },
    {
        // MADLeap — 실전 프로젝트 대학생 연합동아리 (Vercel 새 사이트 스테이징, 외부 madleap.co.kr 운영 중). 헤더 = features/madleap/MadLeapHeader.tsx (2026-10-10 등록)
        siteId: "madleap",
        adminBase: "/intra/ums/madleap",
        menus: [
            { placement: "header", label: "커뮤니티", path: "/madleap/community", source: { kind: "board", board: "community" }, unit: "글" },
            { placement: "header", label: "스터디 룸", path: "/madleap/study-room", source: { kind: "table", table: "madleap_study_programs" }, unit: "개" },
            { placement: "header", label: "매드립 소개", path: "/madleap/about", source: { kind: "static" } },
            { placement: "header", label: "포트폴리오", path: "/madleap/portfolio", source: { kind: "table", table: "madleap_portfolios" }, unit: "개" },
        ],
    },
    {
        siteId: "madleague",
        adminBase: "/intra/ums/madleague",
        menus: [
            { placement: "header", label: "경쟁 PT", path: "/madleague/programs/competition", source: { kind: "table", table: "program_rounds", eq: { brand_id: "madleague" } }, adminHref: "/intra/ums/madleague/competitions", unit: "개" },
            {
                placement: "header", label: "프로그램", path: "/madleague/programs", source: { kind: "static" },
                dropdown: [
                    // 이름·순서 = features/madleague/programs-list.ts (SSOT, 2026-10-08) — 경쟁 PT는 헤더 단독 메뉴로 (사용자 결정 2026-10-07)
                    { label: "크리에이지", path: "/madleague/programs/creazy" },
                    { label: "DAM 파티", path: "/madleague/programs/dam" },
                    { label: "아이디어 무브먼트", path: "/madleague/programs/im" },
                    { label: "PJT", path: "/madleague/programs/project" },
                    { label: "마케톤", path: "/madleague/programs/markethon" },
                    { label: "인사이트 투어링", path: "/madleague/programs/insight-touring" },
                    { label: "히어로 프로그램", path: "/madleague/programs/hero" },
                    { label: "RooKie", path: "/madleague/programs/rookie" },
                    { label: "Planner's", path: "/madleague/programs/planners" },
                    { label: "전체 프로그램", path: "/madleague/programs" },
                ],
            },
            {
                placement: "header", label: "매드리거", path: "/madleague/madleaguer", source: { kind: "table", table: "mad_posts" }, unit: "글",
                dropdown: [
                    { label: "매드리거 홈", path: "/madleague/madleaguer" },
                    { label: "동아리", path: "/madleague/clubs" },
                    { label: "매드리거 등록", path: "/madleague/apply" },
                    { label: "인증서 발급", path: "/madleague/certificate/issue" },
                ],
            },
            { placement: "header", label: "MADzine", path: "/madleague/madzine", source: { kind: "table", table: "mad_articles", pendingEq: { status: "pending_review" } }, adminHref: "/intra/ums/madleague/articles", unit: "글" },
            // 동아리 = 매드리거 하위 메뉴 (2026-10-08 사용자 결정 — 동아리 목록에서 각 동아리 방으로)
            { placement: "feature", location: "매드리거", label: "동아리", path: "/madleague/clubs", source: { kind: "table", table: "mad_clubs", eq: { status: "active" } }, adminHref: "/intra/ums/madleague/officers", unit: "개" },
            { placement: "feature", location: "홈·매드리거", label: "매드리거 등록", path: "/madleague/apply", source: { kind: "table", table: "mad_applications", pendingEq: { status: "pending" } }, adminHref: "/intra/ums/madleague/applications", unit: "건" },
            { placement: "feature", location: "매드리거", label: "인증서 발급", path: "/madleague/certificate/issue", source: { kind: "table", table: "program_certificates", eq: { brand_id: "madleague" } }, adminHref: "/intra/ums/madleague/certificates", unit: "건" },
            { placement: "feature", location: "프로그램 상세", label: "참가 신청", path: "/madleague/programs", source: { kind: "table", table: "form_responses", eq: { brand_id: "madleague" }, pendingEq: { status: "pending" } }, adminHref: "/intra/ums/madleague/forms", unit: "건" },
            { placement: "feature", location: "푸터 Contact", label: "문의하기", path: "/madleague/contact", source: { kind: "inquiry", formType: "madleague_inquiry" }, adminHref: "/intra/ums/madleague/cs", unit: "건" },
        ],
    },
];

export function getBrandSiteMenus(siteId: string): BrandSiteMenus | undefined {
    return BRAND_SITE_MENUS.find(b => b.siteId === siteId);
}

/** 인트라·현황표에 쓰는 이름 — 사이트에 보이는 그대로 (헤더 메뉴명 / 버튼 문구, 위치 표기 없음) */
export function siteMenuTitle(m: SiteMenu): string {
    return m.label;
}

/** 사이트 헤더 메뉴 — 브랜드 헤더 컴포넌트가 이걸로 렌더 (이름·순서 SSOT) */
export function siteHeaderNav(siteId: string): { name: string; href: string; dropdown?: { name: string; href: string }[] }[] {
    return (getBrandSiteMenus(siteId)?.menus ?? [])
        .filter((m): m is HeaderMenu => m.placement === "header")
        .map(m => ({
            name: m.label,
            href: m.path,
            ...(m.dropdown && { dropdown: m.dropdown.map(d => ({ name: d.label, href: d.path })) }),
        }));
}

export interface AdminNavChild { name: string; href: string }

/**
 * 인트라 브랜드 메뉴(children) = 대시보드 + 관리 화면이 있는 사이트 메뉴·기능(사이트 이름 그대로) + 공통 탭
 * lib/intra-nav.ts가 사용 — 사이트 메뉴를 바꾸면 인트라 메뉴가 같이 바뀐다
 */
export function brandAdminChildren(siteId: string, extra: AdminNavChild[] = []): AdminNavChild[] {
    const reg = getBrandSiteMenus(siteId);
    if (!reg) return extra;
    const out: AdminNavChild[] = [{ name: "대시보드", href: reg.adminBase }];
    for (const m of reg.menus) {
        if (m.adminHref && !out.some(c => c.href === m.adminHref)) out.push({ name: siteMenuTitle(m), href: m.adminHref });
    }
    for (const e of extra) if (!out.some(c => c.href === e.href)) out.push(e);
    return out;
}

/** 인트라 관리 화면 제목 — 그 화면이 담당하는 사이트 메뉴·기능 이름 그대로 (화면에 이름을 따로 적지 않는다) */
export function adminTitle(adminHref: string, fallback: string): string {
    for (const b of BRAND_SITE_MENUS) {
        const m = b.menus.find(x => x.adminHref === adminHref);
        if (m) return siteMenuTitle(m);
    }
    return fallback;
}
