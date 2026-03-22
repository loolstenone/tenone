// 사이트 설정 데이터 — 서버/클라이언트 모두에서 사용 가능 ('use client' 없음)

export type SiteIdentifier = 'tenone' | 'madleague' | 'youinone' | 'luki' | 'rook' | 'badak' | 'smarcomm' | 'hero';

export interface SiteConfig {
    id: SiteIdentifier;
    name: string;
    /** @deprecated Use logoText instead */
    logo: string;
    logoText: string;
    logoImageUrl?: string;
    logoStyle: 'badge' | 'text' | 'image';
    faviconUrl: string;
    appleTouchIcon: string;
    /** @deprecated Use colors.primary instead */
    accentColor: string;
    /** @deprecated Use colors.headerBg instead */
    bgDark: string;
    colors: {
        primary: string;
        primaryDark: string;
        secondary: string;
        headerBg: string;
        headerText: string;
        footerBg: string;
        footerText: string;
        accent: string;
    };
    meta: {
        title: string;
        description: string;
        ogImage?: string;
        keywords?: string[];
    };
    homePath: string;
    signupPath: string;
    domain: string;
    universeLabel: string;
    showUniverseBadge: boolean;
}

export const siteConfigs: Record<SiteIdentifier, SiteConfig> = {
    tenone: {
        id: 'tenone', name: 'Ten:One™', logo: 'Ten:One™', logoText: 'Ten:One™', logoStyle: 'text',
        faviconUrl: '/icon.png', appleTouchIcon: '/apple-icon-180x180.png',
        accentColor: '#171717', bgDark: '#171717',
        colors: { primary: '#171717', primaryDark: '#0a0a0a', secondary: '#525252', headerBg: '#ffffff', headerText: '#171717', footerBg: '#171717', footerText: '#a3a3a3', accent: '#171717' },
        meta: { title: 'Ten:One™ — Beyond the Limit', description: 'Ten:One Universe. 다양한 브랜드와 프로젝트로 구성된 멀티 브랜드 생태계.', keywords: ['TenOne', 'Ten:One', '멀티브랜드', '생태계'] },
        homePath: '/', signupPath: '/signup', domain: 'tenone.biz',
        universeLabel: '', showUniverseBadge: false,
    },
    madleague: {
        id: 'madleague', name: 'MAD League', logo: 'MAD LEAGUE', logoText: 'MAD LEAGUE', logoStyle: 'badge',
        faviconUrl: '/brands/madleague/favicon.png', appleTouchIcon: '/brands/madleague/favicon.png',
        accentColor: '#D32F2F', bgDark: '#212121',
        colors: { primary: '#D32F2F', primaryDark: '#B71C1C', secondary: '#FF5252', headerBg: '#171717', headerText: '#ffffff', footerBg: '#212121', footerText: '#a3a3a3', accent: '#D32F2F' },
        meta: { title: 'MAD League — 경쟁을 통한 성장 플랫폼', description: 'Match, Act, Develop. 경쟁하고, 행동하고, 성장하라. 전국 대학 연합 마케팅 경쟁 플랫폼 MAD League.', keywords: ['MAD League', '대학생', '마케팅', '경쟁', 'PT'] },
        homePath: '/ml', signupPath: '/signup', domain: 'madleague.net',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
    },
    youinone: {
        id: 'youinone', name: 'YouInOne', logo: 'YouInOne', logoText: 'YouInOne', logoStyle: 'text',
        faviconUrl: '/brands/youinone/favicon.png', appleTouchIcon: '/brands/youinone/favicon.png',
        accentColor: '#171717', bgDark: '#171717',
        colors: { primary: '#171717', primaryDark: '#0a0a0a', secondary: '#525252', headerBg: '#ffffff', headerText: '#171717', footerBg: '#171717', footerText: '#a3a3a3', accent: '#E53935' },
        meta: { title: 'YouInOne — 프로젝트 그룹', description: '기업과 사회의 문제를 해결하는 프로젝트 그룹. Idea + Strategy. 소규모 기업 연합 얼라이언스.', keywords: ['YouInOne', '프로젝트그룹', '얼라이언스', '문제해결'] },
        homePath: '/yi', signupPath: '/signup', domain: 'youinone.com',
        universeLabel: 'Part of Ten:One™ Universe', showUniverseBadge: true,
    },
    luki: {
        id: 'luki', name: 'LUKI', logo: 'LUKI', logoText: 'LUKI', logoStyle: 'text',
        faviconUrl: '/brands/luki/favicon.png', appleTouchIcon: '/brands/luki/favicon.png',
        accentColor: '#7C3AED', bgDark: '#1a1a2e',
        colors: { primary: '#7C3AED', primaryDark: '#5B21B6', secondary: '#A78BFA', headerBg: '#1a1a2e', headerText: '#ffffff', footerBg: '#1a1a2e', footerText: '#a3a3a3', accent: '#7C3AED' },
        meta: { title: 'LUKI — AI Idol Group', description: 'LUKI - AI 기반 아이돌 그룹. Ten:One Universe의 AI 엔터테인먼트 브랜드.', keywords: ['LUKI', 'AI Idol', 'AI 아이돌', 'Ten:One'] },
        homePath: '/', signupPath: '/signup', domain: 'luki.ai',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
    },
    rook: {
        id: 'rook', name: 'RooK', logo: 'RooK', logoText: 'RooK', logoStyle: 'text',
        faviconUrl: '/brands/rook/favicon.png', appleTouchIcon: '/brands/rook/favicon.png',
        accentColor: '#059669', bgDark: '#1a2e1a',
        colors: { primary: '#059669', primaryDark: '#047857', secondary: '#34D399', headerBg: '#ffffff', headerText: '#171717', footerBg: '#1a2e1a', footerText: '#a3a3a3', accent: '#059669' },
        meta: { title: 'RooK — AI Creator Platform', description: 'RooK - AI 크리에이터 플랫폼. Ten:One Universe의 AI 콘텐츠 브랜드.', keywords: ['RooK', 'AI Creator', 'AI 크리에이터', 'Ten:One'] },
        homePath: '/', signupPath: '/signup', domain: 'rook.co.kr',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
    },
    badak: {
        id: 'badak', name: 'Badak', logo: 'Badak', logoText: 'Badak', logoStyle: 'text',
        faviconUrl: '/brands/badak/favicon.png', appleTouchIcon: '/brands/badak/favicon.png',
        accentColor: '#2563EB', bgDark: '#1a1a2e',
        colors: { primary: '#2563EB', primaryDark: '#1D4ED8', secondary: '#60A5FA', headerBg: '#ffffff', headerText: '#171717', footerBg: '#1a1a2e', footerText: '#a3a3a3', accent: '#2563EB' },
        meta: { title: 'Badak — 네트워킹 커뮤니티', description: 'Badak - 네트워킹 커뮤니티. Ten:One Universe의 연결 플랫폼.', keywords: ['Badak', '네트워킹', '커뮤니티', 'Ten:One'] },
        homePath: '/', signupPath: '/signup', domain: 'badak.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
    },
    smarcomm: {
        id: 'smarcomm', name: 'SmarComm.', logo: 'SmarComm.', logoText: 'SmarComm.', logoStyle: 'text',
        faviconUrl: '/brands/smarcomm/favicon.png', appleTouchIcon: '/brands/smarcomm/favicon.png',
        accentColor: '#3B82F6', bgDark: '#0A0E1A',
        colors: { primary: '#3B82F6', primaryDark: '#2563EB', secondary: '#60A5FA', headerBg: '#ffffff', headerText: '#171717', footerBg: '#0A0E1A', footerText: '#a3a3a3', accent: '#3B82F6' },
        meta: { title: 'SmarComm. — AI 마케팅 커뮤니케이션', description: 'SmarComm. - AI 기반 올인원 마케팅 커뮤니케이션 플랫폼.', keywords: ['SmarComm', 'AI 마케팅', '커뮤니케이션', 'Ten:One'] },
        homePath: '/sc', signupPath: '/signup', domain: 'smarcomm.co.kr',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
    },
    hero: {
        id: 'hero', name: 'HeRo', logo: 'HeRo', logoText: 'HeRo', logoStyle: 'text',
        faviconUrl: '/brands/hero/favicon.png', appleTouchIcon: '/brands/hero/favicon.png',
        accentColor: '#F59E0B', bgDark: '#171717',
        colors: { primary: '#F59E0B', primaryDark: '#D97706', secondary: '#FBBF24', headerBg: '#ffffff', headerText: '#171717', footerBg: '#171717', footerText: '#a3a3a3', accent: '#F59E0B' },
        meta: { title: 'HeRo — 인재 발굴·성장 플랫폼', description: '숨겨진 인재를 발굴하고 성장시키는 HeRo 플랫폼. HIT 프로그램, 커리어 로드맵, 멘토링, 브랜딩.', keywords: ['HeRo', '인재발굴', '커리어', '멘토링', 'HIT', 'Ten:One'] },
        homePath: '/hr', signupPath: '/signup', domain: 'hero.ne.kr',
        universeLabel: 'Part of Ten:One™ Universe', showUniverseBadge: true,
    },
};

// 도메인 → 사이트 매핑
export const domainMap: Record<string, SiteIdentifier> = {
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
    'smarcomm.co.kr': 'smarcomm',
    'www.smarcomm.co.kr': 'smarcomm',
    'hero.ne.kr': 'hero',
    'www.hero.ne.kr': 'hero',
};
