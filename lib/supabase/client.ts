import { createBrowserClient } from '@supabase/ssr';

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

    // *.tenone.biz 계열이면 공유 쿠키 도메인 설정
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isTenoneFamily = hostname === 'tenone.biz' || hostname.endsWith('.tenone.biz');

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                ...(isTenoneFamily && { domain: '.tenone.biz' }),
                path: '/',
            },
            auth: {
                storageKey: 'tenone-auth',
                persistSession: true,
                autoRefreshToken: true,
                // Navigator Lock 경합 방지: 탭 간 lock 없이 in-process로만 실행
                // (Intra 단일 테넌트 앱에서는 cross-tab 동기화 불필요)
                lock: async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn(),
            },
        }
    );
    return client;
}
