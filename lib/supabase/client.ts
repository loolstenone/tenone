import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * 브라우저 Supabase 클라이언트 (싱글톤)
 *
 * 쿠키 도메인은 미들웨어(middleware.ts)가 관리:
 *   - *.tenone.biz → domain=.tenone.biz (공유 쿠키)
 *   - 외부 도메인 → domain 미지정 (해당 도메인 전용)
 * 브라우저 클라이언트는 도메인을 지정하지 않는다.
 * (외부 도메인에서 .tenone.biz 쿠키 설정 시 브라우저가 거부)
 */
export function createClient() {
    if (client) return client;
    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: 'tenone-auth',
                persistSession: true,
                autoRefreshToken: true,
            },
        }
    );
    return client;
}
