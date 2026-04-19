'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const type = params.get('type');
            const next = params.get('next') ?? '/';

            if (!code) {
                router.replace('/login?error=auth_callback_error&msg=no_code');
                return;
            }

            const supabase = createClient();
            const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error('[auth/callback] exchange error:', error.message);
                router.replace(`/login?error=auth_callback_error&msg=${encodeURIComponent(error.message)}`);
                return;
            }

            // auth_redirect 쿠키에서 최초 요청 경로 복원
            const authRedirectMatch = document.cookie.match(/(?:^|; )auth_redirect=([^;]+)/);
            const pendingRedirect = authRedirectMatch ? decodeURIComponent(authRedirectMatch[1]) : null;
            if (pendingRedirect) {
                document.cookie = 'auth_redirect=;path=/;max-age=0';
            }

            if (type === 'recovery') {
                router.replace('/reset-password');
                return;
            }

            // 소셜 신규 가입 온보딩 체크
            if (sessionData?.user) {
                const { data: member } = await supabase
                    .from('members')
                    .select('onboarding_completed')
                    .eq('auth_id', sessionData.user.id)
                    .single();
                if (member && member.onboarding_completed === false) {
                    router.replace('/onboarding');
                    return;
                }
            }

            if (pendingRedirect) {
                router.replace(pendingRedirect);
            } else {
                const defaultNext = window.location.hostname.includes('smarcomm') ? '/dashboard' : '/';
                router.replace(next !== '/' ? next : defaultNext);
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <p style={{ color: '#666' }}>로그인 처리 중...</p>
        </div>
    );
}
