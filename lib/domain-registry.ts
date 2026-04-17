/**
 * 도메인 레지스트리 — 단일 진실 소스 (Single Source of Truth)
 *
 * middleware.ts와 site-config.ts 양쪽에서 import하여 사용.
 * 새 도메인 추가 시 이 파일만 수정하면 양쪽 자동 반영.
 *
 * 구조: domain → { prefix: '/badak', siteId: 'badak' }
 *   - prefix: 미들웨어 리라이트 경로 (app 폴더 구조)
 *   - siteId: 클라이언트 사이트 컨텍스트 식별자 (siteConfigs 키)
 */

import type { SiteIdentifier } from '@/lib/site-config';

interface DomainEntry {
    /** 미들웨어 리라이트 프리픽스 (예: '/badak') */
    prefix: string;
    /** 사이트 설정 키 (예: 'badak') — siteConfigs[siteId] */
    siteId: SiteIdentifier;
}

// ── 전체 도메인 레지스트리 ──
const registry: Record<string, DomainEntry> = {
    // MADLeague
    'madleague.net':            { prefix: '/madleague',  siteId: 'madleague' },
    'www.madleague.net':        { prefix: '/madleague',  siteId: 'madleague' },
    'madleague.tenone.biz':     { prefix: '/madleague',  siteId: 'madleague' },
    // MADLeap
    'madleap.co.kr':            { prefix: '/madleap',    siteId: 'madleap' },
    'www.madleap.co.kr':        { prefix: '/madleap',    siteId: 'madleap' },
    // YouInOne
    'youinone.com':             { prefix: '/youinone',   siteId: 'youinone' },
    'www.youinone.com':         { prefix: '/youinone',   siteId: 'youinone' },
    'youinone.tenone.biz':      { prefix: '/youinone',   siteId: 'youinone' },
    // SmarComm
    'smarcomm.biz':             { prefix: '/smarcomm',   siteId: 'smarcomm' },
    'www.smarcomm.biz':         { prefix: '/smarcomm',   siteId: 'smarcomm' },
    'smarcomm.tenone.biz':      { prefix: '/smarcomm',   siteId: 'smarcomm' },
    // HeRo
    'hero.ne.kr':               { prefix: '/hero',       siteId: 'hero' },
    'www.hero.ne.kr':           { prefix: '/hero',       siteId: 'hero' },
    'hero.tenone.biz':          { prefix: '/hero',       siteId: 'hero' },
    // RooK
    'rook.co.kr':               { prefix: '/rook',       siteId: 'rook' },
    'www.rook.co.kr':           { prefix: '/rook',       siteId: 'rook' },
    'rook.tenone.biz':          { prefix: '/rook',       siteId: 'rook' },
    // 공감자
    '0gamja.com':               { prefix: '/0gamja',     siteId: 'ogamja' },
    'www.0gamja.com':           { prefix: '/0gamja',     siteId: 'ogamja' },
    '0gamja.tenone.biz':        { prefix: '/0gamja',     siteId: 'ogamja' },
    // Seoul360
    'seoul360.net':             { prefix: '/seoul360',   siteId: 'seoul360' },
    'www.seoul360.net':         { prefix: '/seoul360',   siteId: 'seoul360' },
    'seoul360.tenone.biz':      { prefix: '/seoul360',   siteId: 'seoul360' },
    // Badak
    'badak.biz':                { prefix: '/badak',      siteId: 'badak' },
    'www.badak.biz':            { prefix: '/badak',      siteId: 'badak' },
    'badak.tenone.biz':         { prefix: '/badak',      siteId: 'badak' },
    // Mindle
    'trendhunter.tenone.biz':   { prefix: '/mindle',     siteId: 'trendhunter' },
    'mindle.tenone.biz':        { prefix: '/mindle',     siteId: 'mindle' },
    // FWN
    'fwn.co.kr':                { prefix: '/fwn',        siteId: 'fwn' },
    'www.fwn.co.kr':            { prefix: '/fwn',        siteId: 'fwn' },
    'fwn.tenone.biz':           { prefix: '/fwn',        siteId: 'fwn' },
    // DOMO
    'domo.tenone.biz':          { prefix: '/domo',       siteId: 'domo' },
    'domo.ne.kr':               { prefix: '/domo',       siteId: 'domo' },
    'www.domo.ne.kr':           { prefix: '/domo',       siteId: 'domo' },
    // 기타 tenone.biz 서브도메인
    'mullaesian.tenone.biz':    { prefix: '/mullaesian', siteId: 'mullaesian' },
    'montz.tenone.biz':         { prefix: '/montz',      siteId: 'montz' },
    'myverse.tenone.biz':       { prefix: '/myverse',    siteId: 'myverse' },
    'myverse.kr':               { prefix: '/myverse',    siteId: 'myverse' },
    'www.myverse.kr':           { prefix: '/myverse',    siteId: 'myverse' },
    'townity.tenone.biz':       { prefix: '/townity',    siteId: 'townity' },
    'naturebox.tenone.biz':     { prefix: '/naturebox',  siteId: 'naturebox' },
    'jakka.tenone.biz':         { prefix: '/jakka',      siteId: 'jakka' },
    'planners.tenone.biz':      { prefix: '/planners',   siteId: 'planners' },
    'wio.tenone.biz':           { prefix: '/wio',        siteId: 'wio' },
    'wiki.tenone.biz':          { prefix: '/wiki',       siteId: 'wiki' },
    // ChangeUp
    'changeup.tenone.biz':      { prefix: '/changeup',   siteId: 'changeup' },
    'changeup.company':         { prefix: '/changeup',   siteId: 'changeup' },
    'www.changeup.company':     { prefix: '/changeup',   siteId: 'changeup' },
    // BrandGravity
    'brandgravity.co.kr':       { prefix: '/brandgravity', siteId: 'tenone' },
    'www.brandgravity.co.kr':   { prefix: '/brandgravity', siteId: 'tenone' },
    'brandgravity.tenone.biz':  { prefix: '/brandgravity', siteId: 'tenone' },
    // Auth Hub
    'auth.tenone.biz':          { prefix: '/auth-hub',   siteId: 'tenone' },
    // Intra (내부 관리자)
    'intra.tenone.biz':         { prefix: '/intra',      siteId: 'tenone' },
};

// ── 파생 맵 (자동 생성) ──

/** 미들웨어용: domain → prefix */
export const domainPrefixMap: Record<string, string> = Object.fromEntries(
    Object.entries(registry).map(([domain, { prefix }]) => [domain, prefix])
);

/** 사이트 컨텍스트용: domain → siteId */
export const domainSiteMap: Record<string, SiteIdentifier> = Object.fromEntries(
    Object.entries(registry).map(([domain, { siteId }]) => [domain, siteId])
);

/** prefix → siteId 역방향 매핑 (첫 매칭 기준) */
export const prefixToSiteId: Record<string, SiteIdentifier> = {};
for (const { prefix, siteId } of Object.values(registry)) {
    if (!prefixToSiteId[prefix]) prefixToSiteId[prefix] = siteId;
}

// ── 도메인 유틸리티 (모든 인증 파일의 단일 진실 소스) ──

/** hostname이 *.tenone.biz 패밀리인지 판별 */
export function isTenoneFamily(hostname: string): boolean {
    const host = hostname.split(':')[0]; // 포트 제거
    return host === 'tenone.biz' || host === 'www.tenone.biz'
        || host.endsWith('.tenone.biz') || host === 'localhost';
}

/**
 * 요청 도메인에 맞는 쿠키 도메인 결정
 * - *.tenone.biz → '.tenone.biz' (서브도메인 간 세션 공유)
 * - 외부 도메인 (badak.biz 등) → undefined (브라우저 기본값 = 현재 호스트)
 * - 로컬/프리뷰 → undefined
 */
export function getCookieDomain(hostname: string): string | undefined {
    if (process.env.VERCEL_ENV !== 'production') return undefined;
    return isTenoneFamily(hostname) ? '.tenone.biz' : undefined;
}

/**
 * registry에서 외부 도메인(비-tenone.biz) 자동 추출
 * SSO allowedDomains, EXTERNAL_DOMAINS 등에 사용
 * → 새 도메인을 registry에 추가하면 자동으로 SSO 허용
 */
export function getAllExternalDomains(): string[] {
    return Object.keys(registry).filter(domain =>
        !domain.endsWith('.tenone.biz')
        && domain !== 'localhost'
    );
}

/** hostname이 SSO가 필요한 외부 도메인인지 확인 */
export function isExternalDomain(hostname: string): boolean {
    const host = hostname.split(':')[0];
    return getAllExternalDomains().includes(host);
}
