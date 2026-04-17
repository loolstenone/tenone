import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 도메인 → 사이트 프리픽스 매핑
const domainPrefixMap: Record<string, string> = {
    'madleague.net': '/madleague',
    'www.madleague.net': '/madleague',
    'madleap.co.kr': '/madleap',
    'www.madleap.co.kr': '/madleap',
    'youinone.com': '/youinone',
    'www.youinone.com': '/youinone',
    'smarcomm.biz': '/smarcomm',
    'www.smarcomm.biz': '/smarcomm',
    'smarcomm.tenone.biz': '/smarcomm',
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
    'trendhunter.tenone.biz': '/mindle',
    'mindle.tenone.biz': '/mindle',
    'myverse.tenone.biz': '/myverse',
    'badak.biz': '/badak',
    'www.badak.biz': '/badak',
    'badak.tenone.biz': '/badak',
    'townity.tenone.biz': '/townity',
    'naturebox.tenone.biz': '/naturebox',
    'domo.tenone.biz': '/domo',
    'domo.ne.kr': '/domo',
    'www.domo.ne.kr': '/domo',
    'hero.tenone.biz': '/hero',
    'fwn.tenone.biz': '/fwn',
    '0gamja.tenone.biz': '/0gamja',
    'changeup.tenone.biz': '/changeup',
    'jakka.tenone.biz': '/jakka',
    'planners.tenone.biz': '/planners',
    'wio.tenone.biz': '/wio',
    'seoul360.tenone.biz': '/seoul360',
    'auth.tenone.biz': '/auth-hub',
    'brandgravity.co.kr': '/brandgravity',
    'www.brandgravity.co.kr': '/brandgravity',
    'brandgravity.tenone.biz': '/brandgravity',
    'intra.tenone.biz': '/intra',
    // 추후 추가: 'luki.ai': '/lk'
};

// 리라이트 제외 경로 (모든 도메인 공통 — 인증 통일 후 SmarComm 분기 제거)
const skipPaths = ['/intra', '/api', '/_next', '/auth', '/login', '/signup'];

export async function middleware(request: NextRequest) {
    // 1. Supabase 세션 갱신 (모든 요청에서)
    let response = NextResponse.next({ request });

    // 도메인별 쿠키 범위 결정
    const hostname = request.headers.get('host') || '';
    const reqDomain = hostname.split(':')[0];
    const isTenoneFamily = reqDomain === 'tenone.biz' || reqDomain.endsWith('.tenone.biz');
    const isProduction = process.env.VERCEL_ENV === 'production';
    // *.tenone.biz → .tenone.biz 공유 쿠키 / 타 루트 도메인 → 도메인 미지정 (해당 도메인 전용)
    const cookieDomain = isProduction && isTenoneFamily ? '.tenone.biz' : undefined;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, {
                            ...options,
                            ...(cookieDomain && { domain: cookieDomain }),
                        });
                    });
                },
            },
            auth: {
                storageKey: 'tenone-auth',
            },
        }
    );
    // getSession()으로 쿠키 갱신 (getUser()는 매 요청마다 Supabase 서버 호출 → cold start 블로킹)
    // 보안 검증이 필요한 경우는 API Route에서 getUser() 직접 호출
    await supabase.auth.getSession();

    // 2. /profile/@handle → /profile/handle (@ in URL is pretty, rewrite to route-safe)
    const pathname = request.nextUrl.pathname;
    const atProfileMatch = pathname.match(/^\/profile\/@(.+)$/);
    if (atProfileMatch) {
        const url = request.nextUrl.clone();
        url.pathname = `/profile/${atProfileMatch[1]}`;
        const rewrite = NextResponse.rewrite(url, { request });
        response.cookies.getAll().forEach(c => rewrite.cookies.set(c.name, c.value));
        return rewrite;
    }

    // 3. 도메인 → 프리픽스 리라이트
    const prefix = domainPrefixMap[reqDomain];

    if (!prefix) return response;

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
