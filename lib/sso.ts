/**
 * SSO (Single Sign-On) 유틸리티
 * 타 루트 도메인 간 세션 공유
 *
 * 도메인 목록은 domain-registry.ts에서 자동 파생 — 수동 관리 불필요
 */

import {
    getAllExternalDomains,
    isTenoneFamily as checkTenoneFamily,
    isExternalDomain as checkExternalDomain,
} from '@/lib/domain-registry';

/** 현재 도메인이 SSO가 필요한 외부 도메인인지 확인 */
export function isExternalDomain(): boolean {
    if (typeof window === 'undefined') return false;
    return checkExternalDomain(window.location.hostname);
}

/** 현재 도메인이 *.tenone.biz 패밀리인지 확인 */
export function isTenoneFamily(): boolean {
    if (typeof window === 'undefined') return true;
    return checkTenoneFamily(window.location.hostname);
}

/**
 * SSO 로그인 시작
 * 현재 도메인이 외부 도메인이면 tenone.biz의 SSO initiate로 리다이렉트
 * @param finalPath 로그인 완료 후 최종 목적지 (기본 /)
 */
export function startSSOLogin(finalPath: string = '/') {
    const origin = window.location.origin;
    const ssoUrl = new URL('https://tenone.biz/api/sso/initiate');
    ssoUrl.searchParams.set('origin', origin);
    ssoUrl.searchParams.set('final', finalPath);
    window.location.href = ssoUrl.toString();
}

/**
 * 페이지 로드 시 SSO 자동 체크
 * 외부 도메인에서 로그인 안 된 상태면 tenone.biz 세션 확인 시도
 * (자동 로그인 — 사용자가 tenone.biz에서 이미 로그인한 경우)
 */
export function checkSSOSession(finalPath: string = '/') {
    if (!isExternalDomain()) return;

    // 이미 SSO 시도한 적 있으면 무한 루프 방지
    const ssoAttempted = sessionStorage.getItem('sso_attempted');
    if (ssoAttempted) return;

    sessionStorage.setItem('sso_attempted', 'true');
    startSSOLogin(finalPath);
}

/** 외부 도메인 목록 (하위 호환용 export) */
export { getAllExternalDomains };
