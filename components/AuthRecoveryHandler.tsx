'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Supabase recovery 이메일 클릭 시 hash fragment로 돌아오는 경우 처리
 * site_url로 리다이렉트되면서 #access_token=...&type=recovery 가 붙음
 * 이걸 감지해서 /reset-password로 보냄
 */
export function AuthRecoveryHandler() {
    const router = useRouter();

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;

        const params = new URLSearchParams(hash.substring(1));
        const type = params.get('type');

        if (type === 'recovery') {
            // recovery 토큰이 hash에 있으면 /reset-password로 이동
            // Supabase client가 자동으로 hash의 access_token을 세션에 저장함
            router.replace('/reset-password');
        }
    }, [router]);

    return null;
}
