'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSite } from '@/lib/site-context';
import { createClient } from '@/lib/supabase/client';

/**
 * 사이트가 닫혀 있으면(is_open = false) 전체 화면 가림막을 표시합니다.
 * root layout에 배치. 마스터 계정(lools@tenone.biz)만 bypass.
 *
 * 인증 확인은 /api/auth/me (서버 쿠키 기반)를 사용하여
 * 크로스 서브도메인(*.tenone.biz) 세션을 올바르게 읽는다.
 */
export function SiteClosedOverlay() {
    const { siteId, site } = useSite();
    const pathname = usePathname();
    const [closed, setClosed] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // siteId 변경 시 상태 리셋
        setClosed(false);
        setChecked(false);

        // intra, login, auth 경로는 가림막 제외
        if (pathname.startsWith('/intra') || pathname.startsWith('/login') || pathname.startsWith('/auth')) {
            setChecked(true);
            return;
        }

        // tenone 자체는 항상 열려 있으므로 체크 불필요
        if (siteId === 'tenone') {
            setChecked(true);
            return;
        }

        (async () => {
            // 1. 서버 쿠키 기반 인증 확인 (크로스 서브도메인 지원)
            try {
                const res = await fetch('/api/auth/me');
                const { email } = await res.json();
                if (email === 'lools@tenone.biz') {
                    setChecked(true);
                    return;
                }
            } catch {
                // API 실패 시 인증 없음으로 처리
            }

            // 2. is_open 확인
            const supabase = createClient();
            const { data } = await supabase
                .from('ums_sites')
                .select('is_open')
                .eq('slug', siteId)
                .single();

            if (data && data.is_open === false) {
                setClosed(true);
            }
            setChecked(true);
        })();
    }, [siteId, pathname]);

    if (!checked || !closed) return null;
    const siteName = site?.name || 'Ten:One™';

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white">
            {/* 무엇이 안 되는지 · 할 수 있는 일 · 연락처 (tenone-ui 3 Error) — 장식 아이콘 없음 */}
            <div className="px-6 max-w-lg">
                <h1 className="text-[28px] leading-9 font-bold text-neutral-900 mb-4">준비 중입니다</h1>
                <p className="text-sm leading-5 text-neutral-600">
                    <span className="font-bold text-neutral-900">{siteName}</span>은(는) 아직 공개하지 않았습니다.
                </p>
                <p className="text-sm leading-5 text-neutral-600 mt-1">
                    궁금한 점은 <a href="mailto:lools@tenone.biz" className="underline">lools@tenone.biz</a>로 보내 주세요.
                </p>
                <p className="text-sm leading-5 mt-8">
                    <a href="https://www.tenone.biz" className="underline text-neutral-600">Ten:One™ Universe</a>
                </p>
            </div>
        </div>
    );
}
