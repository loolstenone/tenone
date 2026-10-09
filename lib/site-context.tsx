"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { siteConfigs, domainMap } from '@/lib/site-config';
import { domainSiteMap, domainPrefixMap, prefixToSiteId } from '@/lib/domain-registry';
import type { SiteIdentifier, SiteConfig } from '@/lib/site-config';

interface SiteContextType {
    site: SiteConfig;
    siteId: SiteIdentifier;
    isTenOne: boolean;
    isMadLeague: boolean;
    isYouInOne: boolean;
    isSmarComm: boolean;
    isHeRo: boolean;
}

const SiteContext = createContext<SiteContextType>({
    site: siteConfigs.tenone,
    siteId: 'tenone',
    isTenOne: true,
    isMadLeague: false,
    isYouInOne: false,
    isSmarComm: false,
    isHeRo: false,
});

// tenone.biz 내부에서 경로로 브랜드 감지
const pathSiteMap: Array<{ prefix: string; siteId: SiteIdentifier }> = [
    { prefix: '/madleague', siteId: 'madleague' },
    { prefix: '/madleap',   siteId: 'madleap' },
    { prefix: '/mlp',       siteId: 'madleap' },
    { prefix: '/badak',     siteId: 'badak' },
    { prefix: '/rook',      siteId: 'rook' },
    { prefix: '/planners',  siteId: 'planners' },
    { prefix: '/youinone',  siteId: 'youinone' },
    { prefix: '/hero',      siteId: 'hero' },
    { prefix: '/smarcomm',  siteId: 'smarcomm' },
    { prefix: '/mindle',    siteId: 'mindle' },
    { prefix: '/myverse',   siteId: 'myverse' },
    { prefix: '/domo',      siteId: 'domo' },
    { prefix: '/changeup',  siteId: 'changeup' },
    { prefix: '/wio',       siteId: 'wio' },
    { prefix: '/brandgravity', siteId: 'brandgravity' },
    { prefix: '/wiki',     siteId: 'wiki' },
    { prefix: '/dokdae',   siteId: 'dokdae' },
    { prefix: '/evschool', siteId: 'evschool' },
    { prefix: '/namingfactory', siteId: 'namingfactory' },
];

/**
 * 주소 → 사이트 ID (순수 함수 — 분석 태그가 페이지 이동마다 다시 판정할 때도 쓴다)
 *   도메인 SSOT = lib/domain-registry.ts (domainSiteMap·domainPrefixMap). site-config domainMap은 보조 —
 *   두 곳이 어긋나 myverse.kr·seoul360.net·domo.ne.kr 방문이 tenone으로 잡히던 문제 (2026-10-10)
 */
export function detectSiteId(hostname: string, pathname: string): SiteIdentifier {
    // 1. 독립 도메인·등록된 서브도메인 (domain-registry)
    const registered = domainSiteMap[hostname];
    if (registered) {
        // registry가 리라이트 때문에 'tenone'으로 둔 도메인(brandgravity 등)은 prefix의 사이트로
        const seg = (domainPrefixMap[hostname] ?? '').split('/')[1] ?? '';
        if (registered === 'tenone' && seg && seg in siteConfigs) return seg as SiteIdentifier;
        return registered;
    }
    const domainMapped = domainMap[hostname];
    if (domainMapped) return domainMapped;

    // 2. *.tenone.biz 서브도메인 감지 (badak.tenone.biz → badak)
    const subMatch = hostname.match(/^([a-z0-9-]+)\.tenone\.biz$/);
    if (subMatch && subMatch[1] !== 'www' && subMatch[1] in siteConfigs) return subMatch[1] as SiteIdentifier;

    // 3. tenone.biz(또는 localhost) 내부에서 경로 기반 감지
    const isTenOneDomain = hostname === 'tenone.biz' || hostname === 'www.tenone.biz' || hostname === 'localhost';
    if (isTenOneDomain) {
        const matched = pathSiteMap.find(({ prefix }) => pathname.startsWith(prefix));
        if (matched) return matched.siteId;
        // 목록에 없는 브랜드 경로: registry prefix(/0gamja → ogamja) → 첫 경로가 사이트 ID면 그대로(/seoul360 · /fwn · /jakka …)
        const seg = pathname.split('/')[1] ?? '';
        const byPrefix = seg ? prefixToSiteId[`/${seg}`] : undefined;
        if (byPrefix && byPrefix !== 'tenone') return byPrefix;
        if (seg && seg in siteConfigs) return seg as SiteIdentifier;
    }
    return 'tenone';
}

export function SiteProvider({ children }: { children: ReactNode }) {
    const [siteId, setSiteId] = useState<SiteIdentifier>('tenone');

    useEffect(() => {
        setSiteId(detectSiteId(window.location.hostname, window.location.pathname));
    }, []);

    const site = siteConfigs[siteId];

    return (
        <SiteContext.Provider value={{
            site,
            siteId,
            isTenOne: siteId === 'tenone',
            isMadLeague: siteId === 'madleague',
            isYouInOne: siteId === 'youinone',
            isSmarComm: siteId === 'smarcomm',
            isHeRo: siteId === 'hero',
        }}>
            {children}
        </SiteContext.Provider>
    );
}

export function useSite() {
    return useContext(SiteContext);
}

// Re-export for backward compatibility
export { siteConfigs, domainMap };
export type { SiteIdentifier, SiteConfig };
