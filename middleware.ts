import { NextRequest, NextResponse } from 'next/server';

// 도메인 → 사이트 매핑
const domainSiteMap: Record<string, string> = {
    'madleague.net': 'madleague',
    'www.madleague.net': 'madleague',
    'youinone.com': 'youinone',
    'www.youinone.com': 'youinone',
    'smarcomm.co.kr': 'smarcomm',
    'www.smarcomm.co.kr': 'smarcomm',
    // 추후 추가: 'luki.ai': 'luki', 'rook.co.kr': 'rook', 'badak.biz': 'badak'
};

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const domain = hostname.split(':')[0]; // 포트 제거

    const siteId = domainSiteMap[domain];

    if (siteId === 'madleague') {
        const pathname = request.nextUrl.pathname;

        // /intra, /api, /_next, /favicon 등은 분기하지 않음
        if (
            pathname.startsWith('/intra') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/login') ||
            pathname.startsWith('/signup') ||
            pathname.includes('.')
        ) {
            return NextResponse.next();
        }

        // MADLeague 도메인 → /ml/ 프리픽스로 내부 리라이트
        const url = request.nextUrl.clone();
        url.pathname = `/ml${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
    }

    if (siteId === 'youinone') {
        const pathname = request.nextUrl.pathname;

        if (
            pathname.startsWith('/intra') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/login') ||
            pathname.startsWith('/signup') ||
            pathname.includes('.')
        ) {
            return NextResponse.next();
        }

        // YouInOne 도메인 → /yi/ 프리픽스로 내부 리라이트
        const url = request.nextUrl.clone();
        url.pathname = `/yi${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
    }

    if (siteId === 'smarcomm') {
        const pathname = request.nextUrl.pathname;

        if (
            pathname.startsWith('/intra') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/login') ||
            pathname.startsWith('/signup') ||
            pathname.includes('.')
        ) {
            return NextResponse.next();
        }

        // SmarComm 도메인 → /sc/ 프리픽스로 내부 리라이트
        const url = request.nextUrl.clone();
        url.pathname = `/sc${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
