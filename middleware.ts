import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
    'mindle.tenone.biz': '/mindle',
    'myverse.tenone.biz': '/myverse',
    'badak.biz': '/badak',
    'www.badak.biz': '/badak',
    'townity.tenone.biz': '/townity',
    'naturebox.tenone.biz': '/naturebox',
    'domo.tenone.biz': '/domo',
    'jakka.tenone.biz': '/jakka',
    'planners.tenone.biz': '/planners',
    'wio.tenone.biz': '/wio',
    'seoul360.tenone.biz': '/seoul360',
    'auth.tenone.biz': '/auth-hub',
    // 추후 추가: 'luki.ai': '/lk'
};

// 리라이트 제외 경로 (모든 도메인 공통 — 인증 통일 후 SmarComm 분기 제거)
const skipPaths = ['/intra', '/api', '/_next', '/auth', '/login', '/signup'];

export async function middleware(request: NextRequest) {
    // 1. Supabase 세션 갱신 (모든 요청에서)
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );
    // getUser()를 호출해야 세션 쿠키가 갱신됨
    await supabase.auth.getUser();

    // 2. 도메인 → 프리픽스 리라이트
    const hostname = request.headers.get('host') || '';
    const domain = hostname.split(':')[0];
    const prefix = domainPrefixMap[domain];

    if (!prefix) return response;

    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith(prefix)) return response;

    if (skipPaths.some(p => pathname.startsWith(p)) || pathname.includes('.')) {
        return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = `${prefix}${pathname === '/' ? '' : pathname}`;

    // rewrite with session cookies preserved
    const rewriteResponse = NextResponse.rewrite(url, { request });
    // 세션 쿠키를 rewrite 응답에도 복사
    response.cookies.getAll().forEach(cookie => {
        rewriteResponse.cookies.set(cookie.name, cookie.value);
    });
    return rewriteResponse;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
