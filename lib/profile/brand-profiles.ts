/**
 * 브랜드 My Profile 레지스트리 — 브랜드 도메인/@핸들을 그 브랜드 공개 프로필로 여는 브랜드
 *
 * 브랜드를 추가할 때 함께 바꾸는 곳 (한 곳이라도 빠지면 404 또는 빈 섹션):
 *   ① 여기 BRAND_PROFILES
 *   ② DB brand_profile_enabled() · brand_profile_section() + 그 브랜드의 {brand}_profile_section() (sql/profile-p2-brand.sql)
 *   ③ app/({Brand})/{brand}/u/[handle]/ 페이지 (features/profile/BrandPublicProfile 사용) + 섹션 렌더러
 * middleware가 이 목록으로 /@핸들 → /{brand}/u/{핸들} 을 고른다 (그 외 도메인은 유니버스 프로필 /profile/{핸들}).
 */
export interface BrandProfileConfig {
    siteId: string;
    name: string;
    /** 사이트 경로 접두사 (localhost·tenone.biz 경로 모드) */
    prefix: string;
    accent: string;
    /** 사이트 바탕이 어두운가 */
    dark: boolean;
    /** 본인 설정 화면 */
    myPath: string;
    /** 프로필 안 브랜드 섹션 제목 */
    sectionTitle: string;
}

export const BRAND_PROFILES: Record<string, BrandProfileConfig> = {
    madleague: {
        siteId: 'madleague',
        name: 'MAD League',
        prefix: '/madleague',
        accent: '#EC1D25',
        dark: true,
        myPath: '/madleague/my',
        sectionTitle: 'MAD League 활동',
    },
};

export function brandProfileByPrefix(prefix: string | undefined): BrandProfileConfig | null {
    if (!prefix) return null;
    return Object.values(BRAND_PROFILES).find(b => b.prefix === prefix) ?? null;
}

/** 지금 보고 있는 주소 기준 브랜드 공개 프로필 주소 (경로 모드면 /madleague/@핸들, 브랜드 도메인이면 /@핸들) */
export function brandProfileUrl(origin: string, pathname: string, cfg: BrandProfileConfig, handle: string, shareToken?: string) {
    const base = pathname.startsWith(cfg.prefix) ? `${origin}${cfg.prefix}` : origin;
    return `${base}/@${handle}${shareToken ? `?s=${shareToken}` : ''}`;
}
