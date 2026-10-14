// 브랜드 서비스 레지스트리 — 유틸리티바 계정 메뉴의 '이용 중인 다른 서비스' 목록 (CLAUDE.md §1.9.2)
//
// 이용 여부는 member_brand_joins(브랜드 가입·동의 SSOT)에서 판단한다 — members.affiliations 아님 (헌법 원칙 1)
// 유니버스는 강조하지 않는다(원칙 7) → 이 목록은 바에 두지 않고 계정 메뉴 안에만
// 새 브랜드: 한 줄 추가 (siteId = site-config 식별자, slug = ums_sites.slug가 다를 때만)

export interface BrandService {
    siteId: string;
    /** ums_sites.slug (member_brand_joins.brand_id) — siteId와 다를 때만 */
    slug?: string;
    label: string;
    /** 그 브랜드의 '나' 화면 (마이페이지 또는 서비스 화면) */
    path: string;
}

export const BRAND_SERVICES: BrandService[] = [
    { siteId: "hero",         label: "HeRo",          path: "/hero/my" },
    { siteId: "madleague",    label: "MADLeague",     path: "/madleague/my" },
    { siteId: "madleap",      label: "MADLeap",       path: "/madleap/my" },
    { siteId: "badak",        label: "Badak",         path: "/badak/my" },
    { siteId: "rook",         label: "RooK",          path: "/rook/my" },
    { siteId: "planners",     label: "Planner's",     path: "/planners/my" },
    { siteId: "mindle",       label: "Mindle",        path: "/mindle/my" },
    { siteId: "wio",          label: "WIO",           path: "/wio/app" },
    { siteId: "smarcomm",     label: "SmarComm",      path: "/smarcomm/dashboard" },
    { siteId: "youinone",     label: "YouInOne",      path: "/youinone/my" },
    { siteId: "brandgravity", label: "BrandGravity",  path: "/brandgravity/my" },
    { siteId: "jakka",        label: "Jakka",         path: "/jakka/profile" },
    { siteId: "montz",        label: "MoNTZ",         path: "/montz/profile" },
    { siteId: "domo",         label: "Domo",          path: "/domo/my" },
    { siteId: "townity",      label: "Townity",       path: "/townity/my" },
    { siteId: "changeup",     label: "ChangeUp",      path: "/changeup/my" },
    { siteId: "naturebox",    label: "NatureBox",     path: "/naturebox/my" },
    { siteId: "fwn",          label: "FWN",           path: "/fwn/my" },
    { siteId: "mullaesian",   label: "Mullaesian",    path: "/mullaesian/my" },
    { siteId: "seoul360",     label: "Seoul360",      path: "/seoul360/my" },
    { siteId: "ogamja",       slug: "0gamja", label: "0gamja", path: "/0gamja/my" },
    { siteId: "myverse",      label: "MyVerse",       path: "/myverse/my" },
];

/** member_brand_joins.brand_id(slug) 목록 → 레지스트리 항목 (현재 사이트 제외) */
export function servicesForJoins(slugs: string[], currentSiteId?: string): BrandService[] {
    const joined = new Set(slugs);
    return BRAND_SERVICES.filter(s => joined.has(s.slug ?? s.siteId) && s.siteId !== currentSiteId);
}
