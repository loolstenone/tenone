import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

// localhost에서는 도메인 쿠키 설정 불가
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

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
            ...(isLocalhost ? {} : {
                cookieOptions: {
                    domain: '.tenone.biz',  // 서브도메인 쿠키 공유
                    path: '/',
                    sameSite: 'lax' as const,
                    secure: true,
                },
            }),
        }
    );
    return client;
}
