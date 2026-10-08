'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { safeRedirect } from '@/lib/login-href';
import { publishLoginToHub } from '@/lib/sso';
import { createClient } from '@/lib/supabase/client';

// 콜백 처리는 페이지 로드당 한 번만 — 개발 모드 StrictMode가 useEffect를 두 번 실행하면
// 두 번째 실행이 이미 쓴 code 교환에 실패하거나 지워진 auth_redirect 쿠키를 못 읽어 홈('/')으로 튕겼다 (2026-10-08)
let callbackStarted = false;

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        if (callbackStarted) return;
        callbackStarted = true;

        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            // 복귀 경로는 교환 전에 먼저 읽어 둔다
            const authRedirectMatch = document.cookie.match(/(?:^|; )auth_redirect=([^;]+)/);
            const pendingRedirect = authRedirectMatch ? safeRedirect(decodeURIComponent(authRedirectMatch[1]), '') || null : null;
            const code = params.get('code');
            const type = params.get('type');
            const next = safeRedirect(params.get('next'));

            if (!code) {
                router.replace('/login?error=auth_callback_error&msg=no_code');
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            // 교환 실패여도 세션이 이미 만들어졌으면(다른 경로가 먼저 교환) 성공으로 진행
            const hasSession = !error || !!(await supabase.auth.getSession()).data.session;

            if (!hasSession && error) {
                console.error('[auth/callback] exchange error:', error.message);
                router.replace(`/login?error=auth_callback_error&msg=${encodeURIComponent(error.message)}`);
                return;
            }

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
