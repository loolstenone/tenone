import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { domainPrefixMap, getCookieDomain } from '@/lib/domain-registry';

// 리라이트 제외 경로 (모든 도메인 공통 — 인증·프로필은 전 도메인 공유)
const skipPaths = ['/intra', '/api', '/_next', '/auth', '/login', '/signup', '/reset-password', '/profile'];

// Myverse 앱 라우트 SSOT — myverse.kr 도메인에서 prefix 없이 노출되는 앱 첫 세그먼트 목록
// 예: myverse.kr/today → 내부 /myverse/app/today
const MYVERSE_APP_ROUTES = new Set([
    'today', 'traces', 'ask', 'coach', 'diary', 'insights', 'capsules',
    'feed', 'dm', 'verse', 'notifications',
    'projects', 'tasks', 'canvas', 'templates', 'contacts', 'personal',
    'body', 'work', 'study', 'lifestyle', 'schedule', 'travel', 'move', 'relation',
    'weekly', 'monthly', 'yearly', 'daily',
    'search', 'settings', 'onboarding', 'help', 'index',
    'time', 'with', 'ai-briefing',
]);

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 0. layout/page에서 pathname 식별을 위한 x-pathname 헤더 (SSR header())
    //    /myverse/app/layout.tsx가 onboarding 하위 경로를 인증 게이트에서 제외할 때 사용.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);

    // 00. RSC prefetch는 layout의 인증 게이트가 redirect를 발산할 때 Next.js 16 dev router가
    //     stale 큐에 박혀 무한 루프를 만든다. 인증이 필요한 보호 경로에 대해선 prefetch를 차단.
    const isPrefetch = request.headers.get('next-router-prefetch') === '1'
        || request.headers.get('purpose') === 'prefetch'
        || request.headers.get('rsc') === '1'
        || request.headers.get('next-router-state-tree') !== null
        || request.nextUrl.searchParams.has('_rsc');
    if (isPrefetch && (pathname.startsWith('/myverse/app') || pathname === '/planners' || pathname.startsWith('/planners/'))) {
        return new NextResponse(null, { status: 204 });
    }

    // 0a. /api/planners/* → /api/myverse/* 내부 rewrite (외부 호출자 호환: Toss, Google OAuth, Cron)
    //     URL은 그대로 유지하면서 새 핸들러로 라우팅.
    if (pathname.startsWith('/api/planners/')) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.replace(/^\/api\/planners\//, '/api/myverse/');
        return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    // 0b. /planners/* → /myverse/* 308 영구 리디렉트 (Planner's Planner를 마이버스로 흡수)
    //     RSC prefetch는 308을 따라가다 stale 큐 무한 루프를 일으키므로 prefetch에는 redirect 안 함
    //     주의: /planners-sw.js, /planners-icon-*.png 같은 정적 자산은 startsWith('/planners')에 걸리면
    //     안 된다 → 옛 PWA 사용자가 SW 업그레이드 못함. 반드시 /planners 또는 /planners/* 만 매칭.
    if (pathname === '/planners' || pathname.startsWith('/planners/')) {
        const isPrefetch = request.headers.get('next-router-prefetch') === '1'
            || request.headers.get('purpose') === 'prefetch'
            || request.headers.get('rsc') === '1';
        if (isPrefetch) {
            return new NextResponse(null, { status: 204 });
        }
        const url = request.nextUrl.clone();
        url.pathname = pathname.replace(/^\/planners/, '/myverse');
        return NextResponse.redirect(url, 308);
    }

    // /auth/* 경로는 세션 갱신/검증 건너뛰기 (pass-through)
    // 이유: getSession()이 stale 세션 감지 시 code-verifier까지 같이 제거하여
    //      OAuth/recovery 콜백에서 PKCE 교환 실패 (PKCE code verifier not found)
    if (pathname.startsWith('/auth/')) {
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // 1. Supabase 세션 갱신 (모든 요청에서)
    let response = NextResponse.next({ request: { headers: requestHeaders } });

    // 도메인별 쿠키 범위 결정 (domain-registry 단일 진실 소스)
    const hostname = request.headers.get('host') || '';
    const reqDomain = hostname.split(':')[0];
    const cookieDomain = getCookieDomain(hostname);

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

    // 2a. /@handle → 호스트별 분기
    //     myverse.kr → /myverse/{handle} (Myverse 공개 페이지)
    //     그 외      → /profile/{handle} (유니버스 프로필)
    const atHandleMatch = pathname.match(/^\/@([^/]+)$/);
    if (atHandleMatch) {
        const url = request.nextUrl.clone();
        const isMyverseHost = reqDomain === "myverse.kr" || reqDomain === "www.myverse.kr" || reqDomain === "myverse.tenone.biz";
        url.pathname = isMyverseHost
            ? `/myverse/${atHandleMatch[1]}`
            : `/profile/${atHandleMatch[1]}`;
        const rewrite = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
        response.cookies.getAll().forEach(c => rewrite.cookies.set(c.name, c.value));
        return rewrite;
    }

    // 2a-2. /myverse/@handle (pretty URL within myverse path) → /myverse/{handle}
    const myverseAtMatch = pathname.match(/^\/myverse\/@([^/]+)(\/.*)?$/);
    if (myverseAtMatch) {
        const url = request.nextUrl.clone();
        url.pathname = `/myverse/${myverseAtMatch[1]}${myverseAtMatch[2] ?? ""}`;
        const rewrite = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
        response.cookies.getAll().forEach(c => rewrite.cookies.set(c.name, c.value));
        return rewrite;
    }

    // 2b. /profile/@handle → /profile/handle (@ in URL is pretty, rewrite to route-safe)
    const atProfileMatch = pathname.match(/^\/profile\/@(.+)$/);
    if (atProfileMatch) {
        const url = request.nextUrl.clone();
        url.pathname = `/profile/${atProfileMatch[1]}`;
        const rewrite = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
        response.cookies.getAll().forEach(c => rewrite.cookies.set(c.name, c.value));
        return rewrite;
    }

    // 3. 도메인 → 프리픽스 리라이트
    const prefix = domainPrefixMap[reqDomain];

    if (!prefix) return response;

    if (pathname.startsWith(prefix)) return response;

    // 3a-pre. Myverse 자동 랜딩: 로그인 사용자가 myverse.kr/ 접근 시 → /today 302
    //     LinkedIn 패턴 — 인증 사용자에게 마케팅 랜딩은 무의미, 바로 앱 진입
    {
        const isMyverseDomainEarly = reqDomain === 'myverse.kr' || reqDomain === 'www.myverse.kr' || reqDomain === 'myverse.tenone.biz';
        if (isMyverseDomainEarly && pathname === '/' && !isPrefetch) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const url = request.nextUrl.clone();
                url.pathname = '/today';
                return NextResponse.redirect(url, 302);
            }
        }
    }

    // 3a. Myverse 전용: myverse.kr/login → /myverse/login 리라이트
    //     루트 /login 페이지에는 외부 도메인 감지 시 SSO 자동 발사 코드가 있어서,
    //     myverse.kr/login이 /login skipPath를 타면 의도치 않은 SSO → tenone.biz/login으로 튕김.
    const isMyverseDomain = reqDomain === 'myverse.kr' || reqDomain === 'www.myverse.kr' || reqDomain === 'myverse.tenone.biz';
    if (isMyverseDomain && pathname === '/login') {
        const url = request.nextUrl.clone();
        url.pathname = '/myverse/login';
        const rw = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
        response.cookies.getAll().forEach(c => rw.cookies.set(c.name, c.value));
        return rw;
    }

    // 3b. Myverse 깔끔 URL: 레거시 /app/X 직접 URL → /X 308 영구 리디렉트
    //     LinkedIn 패턴 — 앱 라우트는 prefix 없이 도메인 직속으로 노출
    if (isMyverseDomain && pathname.startsWith('/app/') && !isPrefetch) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.replace(/^\/app\//, '/');
        return NextResponse.redirect(url, 308);
    }

    // 3c. Myverse 앱 라우트: /today, /traces 등 → 내부 /myverse/app/X rewrite
    //     사용자에는 깔끔 URL, 폴더 구조는 그대로
    if (isMyverseDomain) {
        const firstSeg = pathname.split('/')[1];
        if (firstSeg && MYVERSE_APP_ROUTES.has(firstSeg)) {
            const url = request.nextUrl.clone();
            url.pathname = `/myverse/app${pathname}`;
            const rw = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
            response.cookies.getAll().forEach(c => rw.cookies.set(c.name, c.value));
            return rw;
        }
    }

    if (skipPaths.some(p => pathname.startsWith(p)) || pathname.includes('.')) {
        return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = `${prefix}${pathname === '/' ? '' : pathname}`;

    // rewrite with session cookies preserved
    const rewriteResponse = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    // 세션 쿠키를 rewrite 응답에도 복사
    response.cookies.getAll().forEach(cookie => {
        rewriteResponse.cookies.set(cookie.name, cookie.value);
    });
    return rewriteResponse;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
