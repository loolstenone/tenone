"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { siteConfigs, domainMap } from '@/lib/site-config';
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
    { prefix: '/youinone',  siteId: 'youinone' },
    { prefix: '/hero',      siteId: 'hero' },
    { prefix: '/smarcomm',  siteId: 'smarcomm' },
    { prefix: '/mindle',    siteId: 'mindle' },
    { prefix: '/myverse',   siteId: 'myverse' },
    { prefix: '/domo',      siteId: 'domo' },
    { prefix: '/changeup',  siteId: 'changeup' },
    { prefix: '/wio',       siteId: 'wio' },
];

export function SiteProvider({ children }: { children: ReactNode }) {
    const [siteId, setSiteId] = useState<SiteIdentifier>('tenone');

    useEffect(() => {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;

        // 1. 독립 도메인 감지 (madleague.net, badak.biz 등)
        const domainMapped = domainMap[hostname];
        if (domainMapped) {
            setSiteId(domainMapped);
            return;
        }

        // 2. tenone.biz(또는 localhost) 내부에서 경로 기반 감지
        const isTenOneDomain = hostname === 'tenone.biz' || hostname === 'www.tenone.biz' || hostname === 'localhost';
        if (isTenOneDomain) {
            const matched = pathSiteMap.find(({ prefix }) => pathname.startsWith(prefix));
            if (matched) setSiteId(matched.siteId);
        }
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
