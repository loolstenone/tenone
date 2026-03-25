import { NextRequest, NextResponse } from 'next/server';

// 도메인 → 사이트 프리픽스 매핑
const domainPrefixMap: Record<string, string> = {
    'madleague.net': '/madleague',
    'www.madleague.net': '/madleague',
    'youinone.com': '/youinone',
    'www.youinone.com': '/youinone',
    'smarcomm.biz': '/smarcomm',
    'www.smarcomm.biz': '/smarcomm',
    'hero.ne.kr': '/hero',
    'www.hero.ne.kr': '/hero',
    'rook.co.kr': '/rook',
    'www.rook.co.kr': '/rook',
    '0gamja.com': '/0gamja',
    'www.0gamja.com': '/0gamja',
    'seoul360.net': '/seoul360',
    'www.seoul360.net': '/seoul360',
    'mullaesian.tenone.biz': '/mullaesian',
    'fwn.co.kr': '/fwn',
    'www.fwn.co.kr': '/fwn',
    'montz.tenone.biz': '/montz',
    'trendhunter.tenone.biz': '/trendhunter',
    'myverse.tenone.biz': '/myverse',
    'badak.biz': '/badak',
    'www.badak.biz': '/badak',
    'townity.tenone.biz': '/townity',
    'naturebox.tenone.biz': '/naturebox',
    'domo.tenone.biz': '/domo',
    'jakka.tenone.biz': '/jakka',
    'planners.tenone.biz': '/planners',
    'auth.tenone.biz': '/auth-hub',
    // 추후 추가: 'luki.ai': '/lk'
};

// 리라이트 제외 경로
const skipPaths = ['/intra', '/api', '/_next', '/auth'];
// SmarComm은 자체 login/signup 있으므로 제외하지 않음
const skipPathsWithAuth = ['/intra', '/api', '/_next', '/auth', '/login', '/signup'];

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const domain = hostname.split(':')[0];
    const prefix = domainPrefixMap[domain];

    if (!prefix) return NextResponse.next();

    const pathname = request.nextUrl.pathname;

    // 이미 프리픽스가 붙어있으면 스킵 (이중 리라이트 방지)
    if (pathname.startsWith(prefix)) {
        return NextResponse.next();
    }

    // 제외 경로 체크 (SmarComm은 /login, /signup도 rewrite 대상)
    const paths = domain.startsWith('smarcomm') ? skipPaths : skipPathsWithAuth;
    if (paths.some(p => pathname.startsWith(p)) || pathname.includes('.')) {
        return NextResponse.next();
    }

    // 도메인 → 내부 프리픽스로 리라이트 (URL은 그대로 유지)
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}${pathname === '/' ? '' : pathname}`;

    // rewrite: URL 바에는 원래 경로 유지, 내부적으로 프리픽스 경로 렌더링
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
