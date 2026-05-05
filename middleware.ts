import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { domainPrefixMap, getCookieDomain } from '@/lib/domain-registry';

// 리라이트 제외 경로 (모든 도메인 공통 — 인증·프로필은 전 도메인 공유)
const skipPaths = ['/intra', '/api', '/_next', '/auth', '/login', '/signup', '/reset-password', '/profile'];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

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
        return NextResponse.rewrite(url, { request });
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
        return NextResponse.next({ request });
    }

    // 1. Supabase 세션 갱신 (모든 요청에서)
    let response = NextResponse.next({ request });

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
        const rewrite = NextResponse.rewrite(url, { request });
        response.cookies.getAll().forEach(c => rewrite.cookies.set(c.name, c.value));
        return rewrite;
    }

    // 2a-2. /myverse/@handle (pretty URL within myverse path) → /myverse/{handle}
    const myverseAtMatch = pathname.match(/^\/myverse\/@([^/]+)(\/.*)?$/);
    if (myverseAtMatch) {
        const url = request.nextUrl.clone();
        url.pathname = `/myverse/${myverseAtMatch[1]}${myverseAtMatch[2] ?? ""}`;
        const rewrite = NextResponse.rewrite(url, { request });
        response.cookies.getAll().forEach(c => rewrite.cookies.set(c.name, c.value));
        return rewrite;
    }

    // 2b. /profile/@handle → /profile/handle (@ in URL is pretty, rewrite to route-safe)
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
