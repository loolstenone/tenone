'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { safeRedirect } from '@/lib/login-href';
import { publishLoginToHub } from '@/lib/sso';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const type = params.get('type');
            const next = safeRedirect(params.get('next'));

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
            const pendingRedirect = authRedirectMatch ? safeRedirect(decodeURIComponent(authRedirectMatch[1]), '') || null : null;
            if (pendingRedirect) {
                document.cookie = 'auth_redirect=;path=/;max-age=0';
            }

            if (type === 'recovery') {
                router.replace('/reset-password');
                return;
            }

            if (pendingRedirect) {
                // /*/app/onboarding 으로 돌아오면 완료된 사용자가 온보딩에 갇히는 루프 발생.
                // 대신 /*/app 으로 보내면 각 서비스 layout이 신규/기존 여부에 따라 라우팅한다.
                const target = pendingRedirect.replace(/\/app\/onboarding(\/.*)?$/, '/app');
                // 독립 도메인이면 허브(auth.tenone.biz)에도 로그인 등록 후 target으로 (One ID — lib/sso-server.ts)
                if (!publishLoginToHub(target)) router.replace(target);
            } else {
                const defaultNext = window.location.hostname.includes('smarcomm') ? '/dashboard' : '/';
                const target = next !== '/' ? next : defaultNext;
                if (!publishLoginToHub(target)) router.replace(target);
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
