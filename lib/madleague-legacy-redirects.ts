/**
 * 옛 madleague.net(아임웹) 주소 → 새 사이트 (DNS 전환 후 구글 검색·외부 링크 유입 보존, 308 영구 이동)
 *
 * 원천: 옛 사이트 sitemap.xml 47개 + 게시판 글 주소(?idx=N&bmode=view) — 2026-10-16 수집
 * 구글 사이트링크(경쟁 PT·공식 동아리 가입 신청·히어로 프로그램·매드리거 소개·크리에이지)가 모두 여기 포함된다.
 * middleware가 MADLeague 도메인에서 prefix 리라이트보다 먼저 확인한다. 새 사이트 링크는 전부 /madleague/… 라 겹치지 않는다.
 *
 * ⚠️ 옛 /pt(경쟁 PT 소개)는 새 /madleague/pt(매드리거 전용 회차 방)가 아니라 공개 소개 페이지로 보낸다.
 * 옛 샵(/shop, /shop_view/*)은 템플릿 견본 상품이라 홈으로.
 */

const HOME = '/madleague';

/** 옛 경로(소문자) → 새 경로 */
const PATHS: Record<string, string> = {
    '/index': HOME, '/home': HOME, '/20': HOME, '/21': HOME, '/22': HOME, '/23': HOME, '/shop': HOME,
    '/about': '/madleague/about',
    '/dambe': '/madleague/about',
    '/mad_leaguer': '/madleague/madleaguer',
    '/35': '/madleague/madleaguer',
    '/ml-board': '/madleague/madleaguer',
    '/freeboard': '/madleague/madleaguer',
    '/dongari': '/madleague/contact?type=club-apply',
    '/55': '/madleague/contact?type=club-apply',
    '/dongart_news': '/madleague/clubs',
    '/request': '/madleague/contact',
    '/program': '/madleague/programs',
    '/pt': '/madleague/programs/competition',
    '/creazy': '/madleague/programs/creazy',
    '/creazy_signup': '/madleague/programs/creazy',
    '/52': '/madleague/programs/creazy',
    '/53': '/madleague/programs/creazy',
    '/damparty': '/madleague/programs/dam',
    '/damhistory': '/madleague/programs/dam',
    '/dam_student': '/madleague/programs/dam',
    '/dam_worker': '/madleague/programs/dam',
    '/dam_corporate': '/madleague/programs/dam',
    '/ideamovement': '/madleague/programs/im',
    '/projectjobtraining': '/madleague/programs/project',
    '/hero_prgram': '/madleague/programs/hero',
    '/madleague_certificateofcompletion': '/madleague/certificate/issue',
    '/madzine': '/madleague/madzine',
    '/59': '/madleague/madzine',
    '/pinboard': '/madleague/madzine/contest',
};

/** 게시판 글 주소(?idx=N) → 옮긴 글 (옮기지 않은 게시판은 목록으로) */
const POSTS: Record<string, (idx: string) => string> = {
    '/madzine': idx => `/madleague/madzine/mz-${idx}`,
    '/59': idx => `/madleague/madzine/mz-${idx}`,
    '/pinboard': idx => `/madleague/madzine/contest/mp-${idx}`,
};

/** 옛 주소면 새 주소, 아니면 null */
export function madleagueLegacyRedirect(pathname: string, search: URLSearchParams): string | null {
    if (pathname.startsWith('/madleague') || pathname.startsWith('/_next') || pathname.startsWith('/api')) return null;
    const key = pathname.replace(/\/+$/, '').toLowerCase() || '/';
    if (key.startsWith('/shop_view/')) return HOME;
    const idx = search.get('idx');
    if (idx && /^\d+$/.test(idx) && POSTS[key]) return POSTS[key](idx);
    return PATHS[key] ?? null;
}

/** 이 규칙을 적용하는 호스트 — 옛 주소가 살아 있는 공식 도메인 + 확인용 스테이징 */
export const MADLEAGUE_LEGACY_HOSTS = new Set(['madleague.net', 'www.madleague.net', 'madleague.tenone.biz']);
