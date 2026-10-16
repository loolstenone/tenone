/**
 * 교차 브랜드 링크 (클라이언트) — 다른 브랜드·TenOne 페이지로 가는 링크를 지금 도메인에 맞게 바꾼다 (점검 축6 H-2)
 *
 * - localhost · www.tenone.biz: 경로 분기라 상대 경로 그대로
 * - 독립 도메인 · *.tenone.biz: 상대 경로는 middleware가 현재 사이트 prefix를 붙여 404 → 대상 사이트 절대 주소
 * - 로그인 상태로 다른 독립 도메인에 갈 때는 허브(auth.tenone.biz)를 거쳐 로그인도 함께 넘긴다 (One ID — lib/sso-server.ts)
 * - 약관·개인정보·로그인·프로필처럼 모든 도메인이 공유하는 경로는 그대로
 */
import { siteOriginForPath, isExternalDomain, ACCOUNT_ORIGIN } from '@/lib/domain-registry';

const SHARED_PATHS = ['/terms', '/privacy', '/profile', '/login', '/signup', '/reset-password', '/auth'];
const HUB_ORIGIN = 'https://auth.tenone.biz';

/** /profile(본인 계정 관리) — 공개 프로필 /profile/{핸들}은 아님 */
function isAccountPath(path: string): boolean {
    return path === '/profile' || path.startsWith('/profile?');
}
function accountHref(path: string): string {
    return `${ACCOUNT_ORIGIN}/${path.slice('/profile'.length)}`;
}

export function crossSiteHref(path: string, opts: { loggedIn?: boolean } = {}): string {
    if (typeof window === 'undefined' || !path.startsWith('/') || path.startsWith('//')) return path;
    const host = window.location.hostname;
    if (host === 'localhost') return path;
    // 계정 관리는 account.tenone.biz 하나 (2026-10-16) — .tenone.biz 쿠키라 허브 세션이 있으면 바로 열린다
    if (isAccountPath(path)) return accountHref(path);
    if (host === 'tenone.biz' || host === 'www.tenone.biz') return path;
    if (SHARED_PATHS.some(p => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}?`))) return path;

    const target = new URL(siteOriginForPath(path));
    if (target.host === window.location.host) return path;

    if (opts.loggedIn && window.location.protocol === 'https:' && isExternalDomain(target.hostname)) {
        const sso = new URL('/api/sso/initiate', HUB_ORIGIN);
        sso.searchParams.set('origin', target.origin);
        sso.searchParams.set('final', path);
        return sso.toString();
    }
    return `${target.origin}${path}`;
}

/**
 * 서버 렌더·첫 화면용 — 브라우저 정보 없이 대상 사이트 절대 주소. 독립 도메인에서 상대 경로가 그대로 HTML에 나가면
 * middleware가 현재 사이트 prefix를 붙여 404가 된다 (2026-10-15 www.planners.ai.kr 푸터 /madleague·/rook — 검색엔진·화면 뜨기 전 클릭)
 * 화면이 뜬 뒤 crossSiteHref가 도메인에 맞게 다시 고친다 (localhost는 상대 경로로 돌아감)
 */
export function crossSiteHrefStatic(path: string): string {
    if (!path.startsWith('/') || path.startsWith('//')) return path;
    if (isAccountPath(path)) return accountHref(path);
    if (SHARED_PATHS.some(p => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}?`))) return path;
    return `${siteOriginForPath(path)}${path}`;
}
