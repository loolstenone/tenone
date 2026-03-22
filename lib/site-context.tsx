"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SiteIdentifier = 'tenone' | 'madleague' | 'youinone' | 'luki' | 'rook' | 'badak';

interface SiteConfig {
    id: SiteIdentifier;
    name: string;
    logo: string;
    accentColor: string;
    bgDark: string;
    homePath: string;
    signupPath: string;
}

const siteConfigs: Record<SiteIdentifier, SiteConfig> = {
    tenone: {
        id: 'tenone', name: 'Ten:One™', logo: 'Ten:One™',
        accentColor: '#171717', bgDark: '#171717',
        homePath: '/', signupPath: '/signup',
    },
    madleague: {
        id: 'madleague', name: 'MAD League', logo: 'MAD LEAGUE',
        accentColor: '#D32F2F', bgDark: '#212121',
        homePath: '/ml', signupPath: '/signup',
    },
    youinone: {
        id: 'youinone', name: 'YouInOne', logo: 'YouInOne',
        accentColor: '#171717', bgDark: '#171717',
        homePath: '/yi', signupPath: '/signup',
    },
    luki: {
        id: 'luki', name: 'LUKI', logo: 'LUKI',
        accentColor: '#7C3AED', bgDark: '#1a1a2e',
        homePath: '/', signupPath: '/signup',
    },
    rook: {
        id: 'rook', name: 'RooK', logo: 'RooK',
        accentColor: '#059669', bgDark: '#1a2e1a',
        homePath: '/', signupPath: '/signup',
    },
    badak: {
        id: 'badak', name: 'Badak', logo: 'Badak',
        accentColor: '#2563EB', bgDark: '#1a1a2e',
        homePath: '/', signupPath: '/signup',
    },
};

// 도메인 → 사이트 매핑
const domainMap: Record<string, SiteIdentifier> = {
    'madleague.net': 'madleague',
    'www.madleague.net': 'madleague',
    'luki.ai': 'luki',
    'www.luki.ai': 'luki',
    'rook.co.kr': 'rook',
    'www.rook.co.kr': 'rook',
    'youinone.com': 'youinone',
    'www.youinone.com': 'youinone',
    'badak.biz': 'badak',
    'www.badak.biz': 'badak',
};

interface SiteContextType {
    site: SiteConfig;
    siteId: SiteIdentifier;
    isTenOne: boolean;
    isMadLeague: boolean;
}

const SiteContext = createContext<SiteContextType>({
    site: siteConfigs.tenone,
    siteId: 'tenone',
    isTenOne: true,
    isMadLeague: false,
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
        }}>
            {children}
        </SiteContext.Provider>
    );
}

export function useSite() {
    return useContext(SiteContext);
}

export { siteConfigs };
