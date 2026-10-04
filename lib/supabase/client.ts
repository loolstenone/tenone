import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * 브라우저 Supabase 클라이언트 (싱글톤)
 *
 * *.tenone.biz 도메인에서는 cookieOptions.domain='.tenone.biz'로 설정하여
 * 로그인 세션이 모든 서브도메인(domo.tenone.biz, jakka.tenone.biz 등)에서 공유된다.
 * 외부 도메인(badak.biz 등)이나 localhost에서는 domain 미지정 (해당 도메인 전용).
 */
export function createClient() {
    if (client) return client;

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    // localhost는 제외 — browser rejects domain='.tenone.biz' on localhost (PKCE verifier cookie drop)
    const cookieDomain = (hostname === 'tenone.biz' || hostname.endsWith('.tenone.biz'))
        ? '.tenone.biz'
        : undefined;

    // *.tenone.biz: 같은 이름의 host-only 세션 쿠키(과거 코드·SSO가 domain 없이 심은 것)가 남아 있으면
    // supabase가 실패한 세션을 .tenone.biz 쪽만 지우고 host-only 사본을 다시 읽어 refresh를 무한 재시도한다
    // (2026-10-04 intra.tenone.biz에서 4분간 4,170회 → 429 차단). domain 없이 만료시키면 host-only 사본만 삭제된다.
    if (cookieDomain && typeof document !== 'undefined') {
        document.cookie.split(';').forEach(c => {
            const name = c.split('=')[0].trim();
            if (name.startsWith('tenone-auth')) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            }
        });
    }

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                ...(cookieDomain && { domain: cookieDomain }),
                path: '/',
            },
            auth: {
                storageKey: 'tenone-auth',
                persistSession: true,
                autoRefreshToken: true,
                // Navigator Lock 활성화: 동시 탭에서 refresh token 경합 방지
            },
        }
    );
    return client;
}
