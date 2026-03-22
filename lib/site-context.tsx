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

export function SiteProvider({ children }: { children: ReactNode }) {
    const [siteId, setSiteId] = useState<SiteIdentifier>('tenone');

    useEffect(() => {
        const hostname = window.location.hostname;
        const mapped = domainMap[hostname];
        if (mapped) setSiteId(mapped);
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
