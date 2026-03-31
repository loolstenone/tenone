import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Vercel 프리뷰/로컬에서는 .tenone.biz 도메인 쿠키 불필요
const cookieDomain = process.env.VERCEL_ENV === 'production' ? '.tenone.biz' : undefined;

export async function createClient() {
    const cookieStore = await cookies();

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
