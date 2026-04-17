import { createBrowserClient } from '@supabase/ssr';
import { isTenoneFamily } from '@/lib/domain-registry';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * 브라우저 Supabase 클라이언트 (싱글톤)
 *
 * *.tenone.biz 도메인에서는 cookieOptions.domain='.tenone.biz'로 설정하여
 * 로그인 세션이 모든 서브도메인(domo.tenone.biz, jakka.tenone.biz 등)에서 공유된다.
 * 외부 도메인(badak.biz 등)에서는 domain 미지정 (해당 도메인 전용).
 */
export function createClient() {
    if (client) return client;

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                ...(isTenoneFamily(hostname) && { domain: '.tenone.biz' }),
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
