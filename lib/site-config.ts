// 사이트 설정 데이터 — 서버/클라이언트 모두에서 사용 가능 ('use client' 없음)

export type SiteIdentifier = 'tenone' | 'madleague' | 'madleap' | 'youinone' | 'luki' | 'rook' | 'badak' | 'smarcomm' | 'hero' | 'ogamja' | 'seoul360' | 'mullaesian' | 'fwn' | 'montz' | 'trendhunter' | 'myverse' | 'townity' | 'naturebox' | 'domo' | 'jakka' | 'changeup' | 'planners' | 'wio';

// 인증 전용 도메인 (OAuth redirect를 여기로 통일)
export const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.tenone.biz';

// ── 일괄 적용 (Global) ──
// 모든 사이트에 공통 적용되는 설정. 여기를 바꾸면 전체 반영.
export const globalConfig = {
    // 푸터 copyright 형식 — {name}은 사이트명으로 치환
    copyrightTemplate: '© {name}. Powered by Ten:One™ Universe.',
    // TenOne 자체는 다른 형식
    copyrightTemplateSelf: '© Ten:One™ Universe.',
    // 메뉴에 "홈" 포함 여부
    showHomeInNav: false,
    // 로그인/회원가입 버튼 표시
    showAuthButtons: true,
    // Universe 배지 표시 (TenOne 제외)
    showUniverseBadge: true,
    // 공통 Universe 도메인 목록
    universeLinks: [
        { name: 'TenOne.biz', href: 'https://tenone.biz' },
        { name: 'YouInOne.com', href: 'https://youinone.com' },
        { name: 'MADLeague.net', href: 'https://madleague.net' },
        { name: 'RooK.co.kr', href: 'https://rook.co.kr' },
        { name: 'Badak.biz', href: 'https://badak.biz' },
        { name: '0gamja.com', href: 'https://0gamja.com' },
    ],
};

// ── 사이트별 적용 (Per-site) ──
export interface NavItem {
    name: string;
    href: string;
}

export interface FooterLink {
    name: string;
    href: string;
}

export interface SiteConfig {
    id: SiteIdentifier;
    name: string;
    logoText: string;
    logoImageUrl?: string;
    logoStyle: 'badge' | 'text' | 'image';
    faviconUrl: string;
    appleTouchIcon: string;
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
    // 가입/로그인 방식
    authMethods: {
        email: boolean;
        google: boolean;
        kakao: boolean;
    };
    // 사이트별 네비게이션 메뉴
    nav: NavItem[];
    // 사이트별 푸터 퀵링크
    footerLinks: FooterLink[];
    // 사이트별 연락처
    contact?: {
        email?: string;
        phone?: string;
        kakao?: string;
        instagram?: string;
        youtube?: string;
    };
    // 사이트 한 줄 설명 (푸터용)
    tagline?: string;

    /** @deprecated Use logoText instead */
    logo?: string;
    /** @deprecated Use colors.primary instead */
    accentColor?: string;
    /** @deprecated Use colors.headerBg instead */
    bgDark?: string;
}

// 헬퍼: copyright 텍스트 생성
export function getCopyright(site: SiteConfig): string {
    if (site.id === 'tenone') return globalConfig.copyrightTemplateSelf;
    return globalConfig.copyrightTemplate.replace('{name}', site.name);
}

export const siteConfigs: Record<SiteIdentifier, SiteConfig> = {
    tenone: {
        id: 'tenone', name: 'Ten:One™', logoText: 'Ten:One™', logoStyle: 'text',
        faviconUrl: '/icon.png', appleTouchIcon: '/apple-icon-180x180.png',
        colors: { primary: '#171717', primaryDark: '#0a0a0a', secondary: '#525252', headerBg: '#ffffff', headerText: '#171717', footerBg: '#171717', footerText: '#a3a3a3', accent: '#171717' },
        meta: { title: 'Ten:One™ — Beyond the Limit', description: 'Ten:One Universe. 다양한 브랜드와 프로젝트로 구성된 멀티 브랜드 생태계.', keywords: ['TenOne', 'Ten:One', '멀티브랜드', '생태계'] },
        homePath: '/', signupPath: '/signup', domain: 'tenone.biz',
        universeLabel: '', showUniverseBadge: false,
        authMethods: { email: true, google: true, kakao: true },
        nav: [
            { name: 'About', href: '/about' },
            { name: 'Universe', href: '/universe' },
            { name: 'Brands', href: '/brands' },
            { name: 'Works', href: '/works' },
            { name: 'Contact', href: '/contact' },
        ],
        footerLinks: [
            { name: 'About', href: '/about' },
            { name: 'Universe', href: '/universe' },
            { name: 'Contact', href: '/contact' },
        ],
        tagline: 'Beyond the Limit. 가치로 연결된 멀티 브랜드 생태계.',
        contact: { email: 'lools@tenone.biz' },
    },
    madleague: {
        id: 'madleague', name: 'MAD League', logo: 'MAD LEAGUE', logoText: 'MAD LEAGUE', logoStyle: 'badge',
        faviconUrl: '/brands/madleague/favicon.png', appleTouchIcon: '/brands/madleague/favicon.png',
        accentColor: '#D32F2F', bgDark: '#212121',
        colors: { primary: '#D32F2F', primaryDark: '#B71C1C', secondary: '#FF5252', headerBg: '#171717', headerText: '#ffffff', footerBg: '#212121', footerText: '#a3a3a3', accent: '#D32F2F' },
        meta: { title: 'MAD League — 경쟁을 통한 성장 플랫폼', description: 'Match, Act, Develop. 경쟁하고, 행동하고, 성장하라. 전국 대학 연합 마케팅 경쟁 플랫폼 MAD League.', keywords: ['MAD League', '대학생', '마케팅', '경쟁', 'PT'] },
        homePath: '/madleague', signupPath: '/signup', domain: 'madleague.net',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
    },
    madleap: {
        id: 'madleap', name: 'MADLeap', logo: 'MAD Leap', logoText: 'MAD Leap', logoStyle: 'text',
        faviconUrl: '/brands/madleap/favicon.png', appleTouchIcon: '/brands/madleap/favicon.png',
        accentColor: '#00B8FF', bgDark: '#000000',
        colors: { primary: '#00B8FF', primaryDark: '#0090CC', secondary: '#4DD4FF', headerBg: '#ffffff', headerText: '#171717', footerBg: '#333333', footerText: '#a3a3a3', accent: '#00B8FF' },
        meta: { title: 'MADLeap — 수도권 마케팅 광고 창업 대학생 연합 동아리', description: '실전 프로젝트 대학생 연합동아리. 마케팅, 광고, 창업을 실전으로 경험하는 MADLeap.', keywords: ['MADLeap', '대학생', '마케팅', '광고', '창업', '연합동아리', '수도권'] },
        homePath: '/madleap', signupPath: '/signup', domain: 'madleap.co.kr',
        nav: [
            { name: '커뮤니티', href: '/mlp/community' },
            { name: '스터디 룸', href: '/mlp/study-room' },
            { name: '매드립 소개', href: '/mlp/about' },
            { name: '포트폴리오', href: '/mlp/portfolio' },
        ],
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
    },
    youinone: {
        id: 'youinone', name: 'YouInOne', logo: 'YouInOne', logoText: 'YouInOne', logoStyle: 'text',
        faviconUrl: '/brands/youinone/favicon.png', appleTouchIcon: '/brands/youinone/favicon.png',
        accentColor: '#171717', bgDark: '#171717',
        colors: { primary: '#171717', primaryDark: '#0a0a0a', secondary: '#525252', headerBg: '#ffffff', headerText: '#171717', footerBg: '#171717', footerText: '#a3a3a3', accent: '#E53935' },
        meta: { title: 'YouInOne — 프로젝트 그룹', description: '기업과 사회의 문제를 해결하는 프로젝트 그룹. Idea + Strategy. 소규모 기업 연합 얼라이언스.', keywords: ['YouInOne', '프로젝트그룹', '얼라이언스', '문제해결'] },
        homePath: '/youinone', signupPath: '/signup', domain: 'youinone.com',
        universeLabel: 'Part of Ten:One™ Universe', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
    },
    luki: {
        id: 'luki', name: 'LUKI', logo: 'LUKI', logoText: 'LUKI', logoStyle: 'text',
        faviconUrl: '/brands/luki/favicon.png', appleTouchIcon: '/brands/luki/favicon.png',
        accentColor: '#7C3AED', bgDark: '#1a1a2e',
        colors: { primary: '#7C3AED', primaryDark: '#5B21B6', secondary: '#A78BFA', headerBg: '#1a1a2e', headerText: '#ffffff', footerBg: '#1a1a2e', footerText: '#a3a3a3', accent: '#7C3AED' },
        meta: { title: 'LUKI — AI Idol Group', description: 'LUKI - AI 기반 아이돌 그룹. Ten:One Universe의 AI 엔터테인먼트 브랜드.', keywords: ['LUKI', 'AI Idol', 'AI 아이돌', 'Ten:One'] },
        homePath: '/', signupPath: '/signup', domain: 'luki.ai',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
    },
    rook: {
        id: 'rook', name: 'RooK', logo: 'RooK', logoText: 'RooK', logoStyle: 'text',
        faviconUrl: '/brands/rook/favicon.png', appleTouchIcon: '/brands/rook/favicon.png',
        accentColor: '#00d255', bgDark: '#282828',
        colors: { primary: '#00d255', primaryDark: '#00b347', secondary: '#00ff66', headerBg: '#282828', headerText: '#ffffff', footerBg: '#1a1a1a', footerText: '#a3a3a3', accent: '#00d255' },
        meta: { title: 'RooK — AI Creator', description: 'AI Creator RooK. 밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다. 하고 싶은 것이라면 무엇이든 도전합니다.', keywords: ['RooK', 'AI Creator', 'AI 크리에이터', 'AI 아티스트', 'Ten:One'] },
        homePath: '/rook', signupPath: '/signup', domain: 'rook.co.kr',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
    },
    badak: {
        id: 'badak', name: 'Badak', logo: 'Badak', logoText: 'Badak', logoStyle: 'text',
        faviconUrl: '/brands/badak/favicon.png', appleTouchIcon: '/brands/badak/favicon.png',
        accentColor: '#2563EB', bgDark: '#1a1a2e',
        colors: { primary: '#2563EB', primaryDark: '#1D4ED8', secondary: '#60A5FA', headerBg: '#ffffff', headerText: '#171717', footerBg: '#1a1a2e', footerText: '#a3a3a3', accent: '#2563EB' },
        meta: { title: 'Badak — 마케팅 광고 네트워킹 커뮤니티', description: 'Badak - 마케팅 업계 네트워킹 커뮤니티. 약한 연결 고리가 만드는 강력한 기회.', keywords: ['Badak', '네트워킹', '커뮤니티', '마케팅', '광고', 'Ten:One'] },
        homePath: '/badak', signupPath: '/signup', domain: 'badak.biz',
        nav: [
            { name: '탐색', href: '/badak/explore' },
            { name: '이바닥 스타', href: '/badak/stars' },
            { name: '커뮤니티', href: '/badak/community' },
            { name: '바닥이란', href: '/badak/about' },
        ],
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
    },
    smarcomm: {
        id: 'smarcomm', name: 'SmarComm.', logo: 'SmarComm.', logoText: 'SmarComm.', logoStyle: 'text',
        faviconUrl: '/brands/smarcomm/favicon.png', appleTouchIcon: '/brands/smarcomm/favicon.png',
        accentColor: '#3B82F6', bgDark: '#0A0E1A',
        colors: { primary: '#3B82F6', primaryDark: '#2563EB', secondary: '#60A5FA', headerBg: '#ffffff', headerText: '#171717', footerBg: '#0A0E1A', footerText: '#a3a3a3', accent: '#3B82F6' },
        meta: { title: 'SmarComm. — AI 마케팅 커뮤니케이션', description: 'SmarComm. - AI 기반 올인원 마케팅 커뮤니케이션 플랫폼.', keywords: ['SmarComm', 'AI 마케팅', '커뮤니케이션', 'Ten:One'] },
        homePath: '/smarcomm', signupPath: '/signup', domain: 'smarcomm.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: false, kakao: false },
    },
    ogamja: {
        id: 'ogamja', name: '공감자', logoText: '공감자', logoStyle: 'text' as const,
        faviconUrl: '/brands/ogamja/favicon.png', appleTouchIcon: '/brands/ogamja/favicon.png',
        colors: { primary: '#F5C518', primaryDark: '#D4A017', secondary: '#FFD54F', headerBg: '#ffffff', headerText: '#171717', footerBg: '#2D2D2D', footerText: '#a3a3a3', accent: '#F5C518' },
        meta: { title: '공감자 — 하찮고 귀여운 감자들의 공감 이야기', description: '하찮고 귀여운 감자들의 공감 이야기. 감자처럼 소소하지만 따뜻한 일상의 공감 블로그.', keywords: ['공감자', 'Ogamja', '블로그', '공감', '감자', 'Ten:One'] },
        homePath: '/0gamja', signupPath: '/signup', domain: '0gamja.com',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
        nav: [
            { name: '필찐감자', href: '/0gamja/writers' },
            { name: '프로그램', href: '/0gamja/programs' },
            { name: 'About', href: '/0gamja/about' },
        ],
        footerLinks: [
            { name: '필찐감자', href: '/0gamja/writers' },
            { name: '프로그램', href: '/0gamja/programs' },
            { name: 'About', href: '/0gamja/about' },
        ],
        contact: { email: 'lools@tenone.biz' },
        tagline: '하찮고 귀여운 감자들의 공감 이야기.',
    },
    seoul360: {
        id: 'seoul360', name: 'Seoul/360°', logoText: 'Seoul /360°', logoStyle: 'badge' as const,
        faviconUrl: '/brands/seoul360/favicon.png', appleTouchIcon: '/brands/seoul360/favicon.png',
        colors: { primary: '#F5C518', primaryDark: '#D4A017', secondary: '#FFD54F', headerBg: '#3D3D3D', headerText: '#ffffff', footerBg: '#3D3D3D', footerText: '#a3a3a3', accent: '#F5C518' },
        meta: { title: 'Seoul/360° — Explore Seoul by Subway', description: 'Your complete guide to exploring Seoul using only the subway. Challenge Only Subway Seoul Tour!', keywords: ['Seoul', 'subway', 'travel', 'Korea', 'tour', 'metro'] },
        homePath: '/seoul360', signupPath: '/signup', domain: 'seoul360.net',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: false, google: false, kakao: false },
        nav: [
            { name: 'Seoul/360°', href: '/seoul360' },
            { name: 'Subway Line', href: '/seoul360/subway-line' },
            { name: 'District', href: '/seoul360/district' },
            { name: 'Station', href: '/seoul360/station' },
            { name: 'Outside Seoul', href: '/seoul360/outside-seoul' },
        ],
        footerLinks: [
            { name: 'Seoul/360°', href: '/seoul360' },
            { name: 'Subway Line', href: '/seoul360/subway-line' },
            { name: 'District', href: '/seoul360/district' },
            { name: 'Station', href: '/seoul360/station' },
        ],
        contact: { email: 'lools@tenone.biz' },
        tagline: '#ChallengeOnlySubwaySeoulTour',
    },
    mullaesian: {
        id: 'mullaesian', name: '문래지앙', logoText: '문래지앙', logoStyle: 'text' as const,
        faviconUrl: '/brands/mullaesian/favicon.png', appleTouchIcon: '/brands/mullaesian/favicon.png',
        colors: { primary: '#007BBF', primaryDark: '#005F8A', secondary: '#4FC3F7', headerBg: '#ffffff', headerText: '#171717', footerBg: '#1a1a2e', footerText: '#a3a3a3', accent: '#007BBF' },
        meta: { title: '문래지앙 — 작은 철공소, 골목 그리고 가난한 예술가들', description: '문래동 18년 거주자의 로컬 프로젝트. 철공소, 골목, 예술가들의 이야기를 기록합니다.', keywords: ['문래지앙', 'Mullaesian', '문래동', '문래창작촌', '철공소', 'Ten:One'] },
        homePath: '/mullaesian', signupPath: '/signup', domain: 'mullaesian.tenone.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: false, google: false, kakao: false },
        nav: [
            { name: '뚜르 드 문래', href: '/mls#tour' },
            { name: '갤러리 문래', href: '/mls#gallery' },
            { name: '문래 꼬뮨', href: '/mls#commune' },
        ],
        footerLinks: [
            { name: '뚜르 드 문래', href: '/mls#tour' },
            { name: '갤러리 문래', href: '/mls#gallery' },
            { name: '문래 꼬뮨', href: '/mls#commune' },
        ],
        contact: { email: 'lools@tenone.biz', phone: '+82 10 2795 1001', kakao: 'https://open.kakao.com/me/tenone' },
        tagline: '작은 철공소, 골목 그리고 가난한 예술가들.',
    },
    fwn: {
        id: 'fwn', name: 'FWN', logoText: 'FWN', logoStyle: 'text' as const,
        faviconUrl: '/brands/fwn/favicon.png', appleTouchIcon: '/brands/fwn/favicon.png',
        colors: { primary: '#00C853', primaryDark: '#00A844', secondary: '#69F0AE', headerBg: '#1a1a1a', headerText: '#ffffff', footerBg: '#1a1a1a', footerText: '#a3a3a3', accent: '#00C853' },
        meta: { title: 'FWN — 패션 위크 네트워크', description: 'Fashion Week Network. 전 세계 패션 위크를 네트워크로 연결합니다. The World is on the Runway.', keywords: ['FWN', 'Fashion Week', '패션위크', '패션위크네트워크', '서울패션위크', 'Ten:One'] },
        homePath: '/fwn', signupPath: '/signup', domain: 'fwn.co.kr',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: false, google: false, kakao: false },
        nav: [
            { name: '서울', href: '/fwn/category/seoul' },
            { name: '파리', href: '/fwn/category/paris' },
            { name: '뉴욕', href: '/fwn/category/newyork' },
            { name: '런던', href: '/fwn/category/london' },
            { name: '밀라노', href: '/fwn/category/milan' },
            { name: '월드', href: '/fwn/category/world' },
            { name: '모델', href: '/fwn/category/models' },
            { name: '브랜드', href: '/fwn/category/brands' },
            { name: 'About', href: '/fwn/about' },
        ],
        footerLinks: [
            { name: 'New York', href: '/fwn/category/newyork' },
            { name: 'Paris', href: '/fwn/category/paris' },
            { name: 'London', href: '/fwn/category/london' },
            { name: 'Milan', href: '/fwn/category/milan' },
            { name: 'Seoul', href: '/fwn/category/seoul' },
            { name: 'About FWN', href: '/fwn/about' },
        ],
        contact: { email: 'lools@tenone.biz' },
        tagline: 'The World is on the Runway.',
    },
    montz: {
        id: 'montz', name: 'MoNTZ', logoText: 'MoNTZ', logoStyle: 'text' as const,
        faviconUrl: '/brands/montz/favicon.png', appleTouchIcon: '/brands/montz/favicon.png',
        colors: { primary: '#1a1a1a', primaryDark: '#111111', secondary: '#333333', headerBg: '#1a1a1a', headerText: '#ffffff', footerBg: '#1a1a1a', footerText: '#a3a3a3', accent: '#c8a97e' },
        meta: { title: 'MoNTZ — U.G.L.Y Photography', description: 'MoNTZ 포토그래피. 자신을 사랑하며, 개인적·상업적으로 다양한 사진 촬영 작업을 하고 있습니다.', keywords: ['MoNTZ', 'photography', '포토그래피', '사진', 'UGLY', 'Ten:One'] },
        homePath: '/montz', signupPath: '/signup', domain: 'montz.tenone.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: false, google: false, kakao: false },
        nav: [
            { name: 'MoNTZ', href: '/montz' },
            { name: '소개', href: '/mtz/about' },
        ],
        footerLinks: [
            { name: 'MoNTZ', href: '/montz' },
            { name: '소개', href: '/mtz/about' },
        ],
        contact: { email: 'lools@tenone.biz' },
        tagline: 'U.G.L.Y — Unique, Glory, Lovely, You.',
    },
    hero: {
        id: 'hero', name: 'HeRo', logo: 'HeRo', logoText: 'HeRo', logoStyle: 'text',
        faviconUrl: '/brands/hero/favicon.png', appleTouchIcon: '/brands/hero/favicon.png',
        accentColor: '#F59E0B', bgDark: '#171717',
        colors: { primary: '#F59E0B', primaryDark: '#D97706', secondary: '#FBBF24', headerBg: '#ffffff', headerText: '#171717', footerBg: '#171717', footerText: '#a3a3a3', accent: '#F59E0B' },
        meta: { title: 'HeRo — 인재 발굴·성장 플랫폼', description: '숨겨진 인재를 발굴하고 성장시키는 HeRo 플랫폼. HIT 프로그램, 커리어 로드맵, 멘토링, 브랜딩.', keywords: ['HeRo', '인재발굴', '커리어', '멘토링', 'HIT', 'Ten:One'] },
        homePath: '/hero', signupPath: '/signup', domain: 'hero.ne.kr',
        universeLabel: 'Part of Ten:One™ Universe', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
    },
    trendhunter: {
        id: 'trendhunter', name: 'Trend Hunter', logoText: 'Trend Hunter', logoStyle: 'text' as const,
        faviconUrl: '/brands/trendhunter/favicon.png', appleTouchIcon: '/brands/trendhunter/favicon.png',
        colors: { primary: '#E50000', primaryDark: '#CC0000', secondary: '#FFB800', headerBg: '#0A0A0A', headerText: '#ffffff', footerBg: '#0A0A0A', footerText: '#a3a3a3', accent: '#00C853' },
        meta: { title: 'Trend Hunter — AI가 데이터를 읽고, 우리가 트렌드를 만든다', description: 'AI 기반 트렌드 분석과 콘텐츠 보고서. 데이터 크롤링부터 인사이트 큐레이션까지, 트렌드를 읽고 실행합니다.', keywords: ['Trend Hunter', '트렌드', 'AI 분석', '트렌드 리포트', '콘텐츠 보고서', 'Ten:One'] },
        homePath: '/trendhunter', signupPath: '/signup', domain: 'trendhunter.tenone.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: false, google: false, kakao: false },
        nav: [
            { name: 'Weekly', href: '/trendhunter/weekly' },
            { name: 'Signals', href: '/trendhunter/signals' },
            { name: 'References', href: '/trendhunter/references' },
            { name: 'Opportunities', href: '/trendhunter/opportunities' },
        ],
        footerLinks: [
            { name: 'Weekly', href: '/trendhunter/weekly' },
            { name: 'Signals', href: '/trendhunter/signals' },
            { name: 'References', href: '/trendhunter/references' },
            { name: 'About', href: '/trendhunter/about' },
        ],
        contact: { email: 'lools@tenone.biz', phone: '+82 10 2795 1001' },
        tagline: 'AI가 데이터를 읽고, 우리가 트렌드를 만든다.',
    },
    townity: {
        id: 'townity', name: '타우니티', logoText: '타우니티', logoStyle: 'text' as const,
        faviconUrl: '/brands/townity/favicon.png', appleTouchIcon: '/brands/townity/favicon.png',
        colors: { primary: '#10B981', primaryDark: '#059669', secondary: '#34D399', headerBg: '#ffffff', headerText: '#171717', footerBg: '#1a2e1a', footerText: '#a3a3a3', accent: '#10B981' },
        meta: { title: '타우니티 — 지역이 살아야 우리가 산다', description: 'Town Community 타우니티. 인공지능 시대, 지역 소멸과 고령화에 맞서는 지역 기반 커뮤니티.', keywords: ['타우니티', 'Townity', '지역 커뮤니티', '지역 소멸', '고령화', '로컬', 'Ten:One'] },
        homePath: '/townity', signupPath: '/signup', domain: 'townity.tenone.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: false, google: false, kakao: false },
        nav: [
            { name: '타우니티란', href: '/tw#about' },
            { name: '우리 동네', href: '/tw#town' },
            { name: '함께 해요', href: '/tw#together' },
            { name: '이야기', href: '/tw#stories' },
        ],
        footerLinks: [
            { name: '타우니티란', href: '/tw#about' },
            { name: '우리 동네', href: '/tw#town' },
            { name: '함께 해요', href: '/tw#together' },
            { name: '이야기', href: '/tw#stories' },
        ],
        contact: { email: 'lools@tenone.biz', phone: '+82 10 2795 1001', kakao: 'https://open.kakao.com/me/tenone' },
        tagline: '지역이 살아야 우리가 산다. AI 시대의 지역 커뮤니티.',
    },
    naturebox: {
        id: 'naturebox', name: '자연함', logoText: '자연함', logoStyle: 'text' as const,
        faviconUrl: '/brands/naturebox/favicon.png', appleTouchIcon: '/brands/naturebox/favicon.png',
        colors: { primary: '#6B8E23', primaryDark: '#556B2F', secondary: '#8FBC8F', headerBg: '#ffffff', headerText: '#171717', footerBg: '#2D3319', footerText: '#a3a3a3', accent: '#6B8E23' },
        meta: { title: '자연함 — 정선의 자연을 담다', description: '강원도 정선 기반 자연식품 브랜드. 자연이 키운 건강한 먹거리를 전합니다.', keywords: ['자연함', 'NatureBox', '정선', '자연식품', '강원도', '건강식품', 'Ten:One'] },
        homePath: '/naturebox', signupPath: '/signup', domain: 'naturebox.tenone.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: false, google: false, kakao: false },
        nav: [
            { name: '자연함 이야기', href: '/nb#about' },
            { name: '우리 먹거리', href: '/nb#products' },
            { name: '정선 이야기', href: '/nb#jeongseon' },
            { name: '오시는 길', href: '/nb#visit' },
        ],
        footerLinks: [
            { name: '자연함 이야기', href: '/nb#about' },
            { name: '우리 먹거리', href: '/nb#products' },
            { name: '정선 이야기', href: '/nb#jeongseon' },
            { name: '오시는 길', href: '/nb#visit' },
        ],
        contact: { email: 'lools@tenone.biz', phone: '+82 10 2795 1001', kakao: 'https://open.kakao.com/me/tenone' },
        tagline: '정선의 자연을 담다. 한소농장에서 전하는 건강한 먹거리.',
    },
    myverse: {
        id: 'myverse', name: 'My Universe', logoText: 'My Universe', logoStyle: 'text' as const,
        faviconUrl: '/brands/myverse/favicon.png', appleTouchIcon: '/brands/myverse/favicon.png',
        colors: { primary: '#6366F1', primaryDark: '#4F46E5', secondary: '#818CF8', headerBg: '#0B0D17', headerText: '#ffffff', footerBg: '#0B0D17', footerText: '#a3a3a3', accent: '#6366F1' },
        meta: { title: 'My Universe — 디지털 속 나를 키운다', description: '흩어져 있는 나의 기록을 모으고, AI가 나를 알아가고, 디지털 세상에서 나를 대표하는 Personal Black Box.', keywords: ['My Universe', 'MyVerse', 'AI 에이전트', '개인화', '데이터 주권', 'Personal Black Box', 'Ten:One'] },
        homePath: '/myverse', signupPath: '/signup', domain: 'myverse.tenone.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
        nav: [
            { name: '철학', href: '/mv/philosophy' },
            { name: '서비스', href: '/mv/service' },
            { name: '기술', href: '/mv/technology' },
            { name: '로드맵', href: '/mv/roadmap' },
            { name: '팀', href: '/mv/team' },
        ],
        footerLinks: [
            { name: '철학', href: '/mv/philosophy' },
            { name: '서비스', href: '/mv/service' },
            { name: '기술 & 보안', href: '/mv/technology' },
            { name: '로드맵', href: '/mv/roadmap' },
            { name: '팀', href: '/mv/team' },
            { name: 'Contact', href: '/mv/contact' },
        ],
        contact: { email: 'lools@tenone.biz', phone: '+82 10 2795 1001' },
        tagline: '디지털 속 나를 키운다.',
    },
    domo: {
        id: 'domo', name: 'Domo', logoText: 'Domo', logoStyle: 'text',
        faviconUrl: '/brands/domo/favicon.png', appleTouchIcon: '/brands/domo/favicon.png',
        colors: { primary: '#7F1146', primaryDark: '#5C0C33', secondary: '#A3194F', headerBg: '#2D1B2E', headerText: '#ffffff', footerBg: '#1E1220', footerText: '#a3a3a3', accent: '#7F1146' },
        meta: { title: 'Domo — 인생 2회차, 도모하다', description: '정년·은퇴 후 새로운 도전을 시작하는 시니어 비즈니스맨을 위한 네트워킹·준비서·기획·투자자문 플랫폼.', keywords: ['도모', 'Domo', '시니어', '네트워킹', '은퇴', '비즈니스', '투자자문', '기획'] },
        homePath: '/domo', signupPath: '/signup', domain: 'domo.tenone.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
        nav: [
            { name: '서비스', href: '/dm/services' },
            { name: '네트워크', href: '/dm/network' },
            { name: '인사이트', href: '/dm/insights' },
            { name: '이벤트', href: '/dm/events' },
            { name: 'About', href: '/dm/about' },
        ],
        footerLinks: [
            { name: '서비스 안내', href: '/dm/services' },
            { name: '네트워크', href: '/dm/network' },
            { name: 'About', href: '/dm/about' },
        ],
        contact: { email: 'lools@tenone.biz', phone: '+82 10 2795 1001', kakao: 'https://open.kakao.com/me/tenone' },
        tagline: '인생 2회차, 함께 도모하다. 시니어 비즈니스맨을 위한 네트워킹 & 비서 서비스.',
    },
    jakka: {
        id: 'jakka', name: 'JAKKA', logoText: 'JAKKA', logoStyle: 'text' as const,
        faviconUrl: '/brands/jakka/favicon.png', appleTouchIcon: '/brands/jakka/favicon.png',
        colors: { primary: '#111111', primaryDark: '#000000', secondary: '#555555', headerBg: '#ffffff', headerText: '#111111', footerBg: '#1a1a1a', footerText: '#a3a3a3', accent: '#111111' },
        meta: { title: 'JAKKA — 포트폴리오', description: '사진작가 JAKKA의 포트폴리오. 인물, 스튜디오, 스포츠, 항공, 콘서트 사진.', keywords: ['JAKKA', '포트폴리오', '사진작가', 'Photography', 'Ten:One'] },
        homePath: '/jakka', signupPath: '/signup', domain: 'jakka.tenone.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: false, google: false, kakao: false },
        nav: [
            { name: '포트폴리오', href: '/jakka' },
            { name: '소개', href: '/jk/about' },
        ],
        footerLinks: [
            { name: '포트폴리오', href: '/jakka' },
            { name: '소개', href: '/jk/about' },
        ],
        contact: { email: 'lools@tenone.biz' },
        tagline: 'Capturing moments, telling stories.',
    },
    changeup: {
        id: 'changeup', name: 'ChangeUp', logoText: 'ChangeUp', logoStyle: 'text' as const,
        faviconUrl: '/brands/changeup/favicon.png', appleTouchIcon: '/brands/changeup/favicon.png',
        colors: { primary: '#1AAD64', primaryDark: '#148F52', secondary: '#256EFF', headerBg: '#ffffff', headerText: '#171717', footerBg: '#0F1F2E', footerText: '#a3a3a3', accent: '#1AAD64' },
        meta: { title: 'ChangeUp — 미래를 만드는 일, 창업', description: 'AI 시대 고등학생·대학생 창업 교육 플랫폼. 부모·학교·지역사회가 함께 투자하는 청소년 창업 생태계.', keywords: ['ChangeUp', '창업교육', '청소년창업', 'AI창업', '투자', 'Ten:One'] },
        homePath: '/changeup', signupPath: '/signup', domain: 'changeup.company',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
        nav: [
            { name: '프로그램', href: '/cu/programs' },
            { name: '투자', href: '/cu/invest' },
            { name: '스타트업', href: '/cu/startups' },
            { name: '커뮤니티', href: '/cu/community' },
            { name: 'About', href: '/cu/about' },
        ],
        footerLinks: [
            { name: '프로그램', href: '/cu/programs' },
            { name: '투자', href: '/cu/invest' },
            { name: 'About', href: '/cu/about' },
        ],
        contact: { email: 'hello@changeup.company' },
        tagline: '미래를 만드는 일, 창업',
    },
    planners: {
        id: 'planners', name: "Planner's", logoText: "Planner's", logoStyle: 'text' as const,
        faviconUrl: '/favicon.ico', appleTouchIcon: '/favicon.ico',
        colors: { primary: '#0F766E', primaryDark: '#134E4A', secondary: '#14B8A6', headerBg: '#134E4A', headerText: '#ffffff', footerBg: '#042F2E', footerText: '#99F6E4', accent: '#14B8A6' },
        meta: { title: "Planner's — 우리는 모두 기획자다", description: '기획은 꾀하는 것이고, 계획은 세우는 것이다. Why를 찾고 What을 만드는 사람, 그것이 기획자다.', keywords: ['Planner', '기획자', '기획', 'Planning', 'Ten:One'] },
        homePath: '/planners', signupPath: '/signup', domain: 'planners.tenone.biz',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: false, google: false, kakao: false },
        nav: [
            { name: "Planner's", href: '/planners' },
            { name: 'Planning', href: '/pln?tab=planning' },
            { name: "Planner's Planner", href: '/pln?tab=planner-tool' },
        ],
        footerLinks: [
            { name: "Planner's", href: '/planners' },
            { name: 'Planning', href: '/pln?tab=planning' },
            { name: "Planner's Planner", href: '/pln?tab=planner-tool' },
        ],
        contact: { email: 'lools@tenone.biz' },
        tagline: '우리는 모두 기획자다 — 자기 인생에서 만큼은.',
    },
    wio: {
        id: 'wio', name: 'WIO', logoText: 'WIO', logoStyle: 'text' as const,
        faviconUrl: '/favicon.ico', appleTouchIcon: '/favicon.ico',
        accentColor: '#6366F1', bgDark: '#0F0F23',
        colors: { primary: '#6366F1', primaryDark: '#4F46E5', secondary: '#818CF8', headerBg: '#0F0F23', headerText: '#ffffff', footerBg: '#0F0F23', footerText: '#94A3B8', accent: '#6366F1' },
        meta: { title: 'WIO — Work In One', description: '프로젝트 중심으로 사람·일·돈·지식이 하나의 시스템에서 돌아가는 통합 운영 플랫폼. 솔루션 구축과 컨설팅.', keywords: ['WIO', 'Work In One', '프로젝트 관리', 'ERP', 'GPR', 'Vrief', 'Ten:One'] },
        homePath: '/wio', signupPath: '/signup', domain: 'wio.work',
        universeLabel: 'Powered by Ten:One™', showUniverseBadge: true,
        authMethods: { email: true, google: true, kakao: true },
        nav: [
            { name: '솔루션', href: '/wio/solutions' },
            { name: '프레임워크', href: '/wio/framework' },
            { name: '가격', href: '/wio/pricing' },
            { name: '소개', href: '/wio/about' },
        ],
    },
};

// 도메인 → 사이트 매핑
export const domainMap: Record<string, SiteIdentifier> = {
    'madleague.net': 'madleague',
    'www.madleague.net': 'madleague',
    'madleap.co.kr': 'madleap',
    'www.madleap.co.kr': 'madleap',
    'luki.ai': 'luki',
    'www.luki.ai': 'luki',
    'rook.co.kr': 'rook',
    'www.rook.co.kr': 'rook',
    'youinone.com': 'youinone',
    'www.youinone.com': 'youinone',
    'badak.biz': 'badak',
    'www.badak.biz': 'badak',
    'smarcomm.biz': 'smarcomm',
    'www.smarcomm.biz': 'smarcomm',
    'hero.ne.kr': 'hero',
    'www.hero.ne.kr': 'hero',
    '0gamja.com': 'ogamja',
    'www.0gamja.com': 'ogamja',
    'seoul360.net': 'seoul360',
    'www.seoul360.net': 'seoul360',
    'mullaesian.tenone.biz': 'mullaesian',
    'fwn.co.kr': 'fwn',
    'www.fwn.co.kr': 'fwn',
    'montz.tenone.biz': 'montz',
    'trendhunter.tenone.biz': 'trendhunter',
    'myverse.tenone.biz': 'myverse',
    'townity.tenone.biz': 'townity',
    'naturebox.tenone.biz': 'naturebox',
    'domo.tenone.biz': 'domo',
    'jakka.tenone.biz': 'jakka',
    'changeup.company': 'changeup',
    'www.changeup.company': 'changeup',
    'planners.tenone.biz': 'planners',
};
