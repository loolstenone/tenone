'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Supabase recovery 이메일 클릭 시 /reset-password로 자동 이동
 *
 * 3가지 방식으로 감지 (Supabase 버전/설정에 따라 다름):
 * 1. hash fragment: #access_token=...&type=recovery (implicit flow)
 * 2. query param: ?token_hash=...&type=recovery (PKCE / Dashboard 발송)
 * 3. onAuthStateChange PASSWORD_RECOVERY 이벤트 (가장 신뢰성 높음)
 */
export function AuthRecoveryHandler() {
    const router = useRouter();

    useEffect(() => {
        const isRecoveryType = (type: string | null) =>
            type === 'recovery' || type === 'magiclink';

        // 방법 1: hash fragment (implicit flow)
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            if (isRecoveryType(params.get('type'))) {
                router.replace('/reset-password');
                return;
            }
        }

        // 방법 2: query params (PKCE token_hash / Dashboard 발송)
        const search = window.location.search;
        if (search) {
            const params = new URLSearchParams(search);
            if (isRecoveryType(params.get('type'))) {
                router.replace('/reset-password');
                return;
            }
            // 방법 2-B: Supabase fallback으로 루트 `?code=XXX`만 온 경우
            // (Redirect URLs 미등록 시 Site URL로 fallback되어 루트에 code만 옴)
            // /auth/callback으로 위임 → exchangeCodeForSession → /reset-password 또는 /
            const code = params.get('code');
            if (code && window.location.pathname === '/') {
                // 현재 path가 루트일 때만 (OAuth 콜백 /auth/callback은 이미 code 처리함)
                window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}&type=recovery`);
                return;
            }
        }

        // 방법 3: onAuthStateChange PASSWORD_RECOVERY 이벤트
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
            if (event === 'PASSWORD_RECOVERY') {
                router.replace('/reset-password');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return null;
}
