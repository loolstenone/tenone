import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

/**
 * 요청 도메인에 맞는 쿠키 도메인 결정
 * - *.tenone.biz → '.tenone.biz' (서브도메인 간 공유)
 * - 외부 도메인 (badak.biz, madleague.net 등) → undefined (현재 호스트 전용)
 * - 로컬/프리뷰 → undefined
 */
function getCookieDomain(hostname: string): string | undefined {
    if (process.env.VERCEL_ENV !== 'production') return undefined;
    const host = hostname.split(':')[0]; // 포트 제거
    if (host === 'tenone.biz' || host.endsWith('.tenone.biz')) {
        return '.tenone.biz';
    }
    return undefined; // 외부 도메인 → 브라우저 기본값 (현재 호스트)
}

export async function createClient() {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const hostname = headerStore.get('host') || '';
    const cookieDomain = getCookieDomain(hostname);

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                ...(cookieDomain && { domain: cookieDomain }),
                            })
                        );
                    } catch {
                        // Server Component에서는 쿠키 설정 불가 (무시)
                    }
                },
            },
            auth: {
                storageKey: 'tenone-auth',
            },
        }
    );
}
