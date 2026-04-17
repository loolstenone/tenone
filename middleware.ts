import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { domainPrefixMap, getCookieDomain } from '@/lib/domain-registry';

// 리라이트 제외 경로 (모든 도메인 공통 — 인증·프로필은 전 도메인 공유)
const skipPaths = ['/intra', '/api', '/_next', '/auth', '/login', '/signup', '/reset-password', '/profile'];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

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

    // 2a. /@handle → /profile/@handle (pretty URL)
    const atHandleMatch = pathname.match(/^\/@([^/]+)$/);
    if (atHandleMatch) {
        const url = request.nextUrl.clone();
        url.pathname = `/profile/${atHandleMatch[1]}`;
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
