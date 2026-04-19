'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

export function BadakOnboardingGate() {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // 온보딩 페이지 자체에서는 체크 안 함
        if (pathname === '/badak/onboard') return;
        if (!isAuthenticated) return;

        const check = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/badak/member', {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (!res.ok) return;

            const { member } = await res.json();
            // member 레코드 없거나 onboarded가 false이면 온보딩으로
            if (!member || member.onboarded === false) {
                router.replace('/badak/onboard');
            }
        };

        check();
    }, [isAuthenticated, pathname, router]);

    return null;
}
