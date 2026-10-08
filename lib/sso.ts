/**
 * Ten:One™ Universe One ID — SSO 클라이언트 헬퍼 (독립 도메인 간 로그인 이어주기)
 * 서버 흐름·보안 원칙: lib/sso-server.ts
 *
 * - *.tenone.biz 계열은 `.tenone.biz` 쿠키로 이미 공유 → SSO 불필요
 * - 독립 도메인(rook.co.kr·madleague.net·hero.ne.kr …) 프로덕션에서만 동작. localhost는 경로 분기라 해당 없음
 */
import { isExternalDomain as checkExternalDomain } from '@/lib/domain-registry';

const HUB_ORIGIN = 'https://auth.tenone.biz';
const NONE_COOKIE = 't1_sso_none';

/** 현재 페이지가 SSO 대상 독립 도메인(https)인지 */
export function isSsoDomain(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.protocol === 'https:' && checkExternalDomain(window.location.hostname);
}

/** 로그인 버튼을 눌렀을 때 허브에 먼저 물어볼지 — 허브에 세션 없음이 최근 확인됐으면 바로 로그인 모달 */
export function shouldTrySso(): boolean {
    if (!isSsoDomain()) return false;
    return !document.cookie.split(';').some(c => c.trim().startsWith(`${NONE_COOKIE}=`));
}

function currentPath(): string {
    return window.location.pathname + window.location.search;
}

/** 허브에 로그인 상태가 있으면 이 도메인에도 로그인 (없으면 돌아와서 로그인 모달) */
export function startSso(finalPath: string = currentPath()) {
    const url = new URL('/api/sso/initiate', HUB_ORIGIN);
    url.searchParams.set('origin', window.location.origin);
    url.searchParams.set('final', finalPath);
    window.location.href = url.toString();
}

/** 이 도메인에서 로그인 성공 직후 — 허브에도 등록해 다른 유니버스 사이트에서 다시 로그인하지 않게 */
export function publishLoginToHub(finalPath: string = currentPath()): boolean {
    if (!isSsoDomain()) return false;
    window.location.href = `/api/sso/publish?final=${encodeURIComponent(finalPath)}`;
    return true;
}
