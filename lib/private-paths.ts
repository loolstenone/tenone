// 회원 전용 화면 목록 SSOT (2026-10-17) — 브라우저·서버 양쪽에서 쓴다
//   - 사이트맵·robots에서 빼는 경로 (lib/site-seo.ts)
//   - 직접 로그아웃했을 때 그 자리에 두지 않고 서비스 첫 화면으로 보내는 경로 (lib/sign-out.ts)
// 경로는 브랜드 prefix를 포함한 내부 경로 (예: '/planners/app'). 접두사 일치

/** 브랜드별 로그인·회원 전용 화면 */
export const PRIVATE_PATHS: Record<string, string[]> = {
    madleague: ['/madleague/pt', '/madleague/community', '/madleague/arena', '/madleague/projects', '/madleague/member', '/madleague/my', '/madleague/madzine/write', '/madleague/madzine/contest/write'],
    rook: ['/rook/my'],
    hero: ['/hero/my', '/hero/app'],  // /hero/journey는 비로그인 소개 화면이 있어 그 자리에 둔다
    planners: ['/planners/app', '/planners/my'],
    smarcomm: ['/smarcomm/dashboard', '/smarcomm/my'],
    myverse: ['/myverse/app', '/myverse/my'],
    wio: ['/wio/app', '/wio/my'],
};

/** 모든 사이트 공통 (TenOne 마이 페이지·계정 관리·인트라·로그인 화면 등) */
export const COMMON_PRIVATE = ['/my', '/profile', '/intra', '/api', '/login', '/signup'];

/** 목록에 없는 브랜드도 이 하위 경로는 회원 전용으로 본다 (/{brand}/my 등) */
const BRAND_PRIVATE_SEGMENTS = ['my', 'app', 'dashboard'];

const matches = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

/** 내부 경로가 회원 전용 화면인가 — 공개 프로필(/profile/{핸들})은 제외 */
export function isPrivatePath(siteId: string, path: string): boolean {
    if (path.startsWith('/profile/')) return false;
    if (COMMON_PRIVATE.some(b => matches(path, b))) return true;
    if ((PRIVATE_PATHS[siteId] ?? []).some(b => matches(path, b))) return true;
    const [, brand, sub] = path.split('/');
    return !!brand && !!sub && BRAND_PRIVATE_SEGMENTS.includes(sub) && brand !== 'profile';
}
