'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSite } from '@/lib/site-context';
import { createClient } from '@/lib/supabase/client';

/**
 * 사이트가 닫혀 있으면(is_open = false) 전체 화면 가림막을 표시합니다.
 * root layout에 배치. Staff/Admin/마스터 계정은 bypass.
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

        const supabase = createClient();

        (async () => {
            // 1. 로그인 사용자 확인
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // 마스터 계정 bypass
                if (user.email === 'lools@tenone.biz') {
                    setChecked(true);
                    return;
                }
                // Staff/Admin bypass (auth_id로 조회)
                const { data: member } = await supabase
                    .from('members')
                    .select('account_type')
                    .eq('auth_id', user.id)
                    .single();
                if (member?.account_type === 'staff' || member?.account_type === 'admin') {
                    setChecked(true);
                    return;
                }
            }

            // 2. is_open 확인
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

    const primaryColor = site?.colors?.primary || '#171717';
    const siteName = site?.name || 'Ten:One™';

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white">
            <div className="text-center px-6 max-w-lg">
                {/* 공사 아이콘 */}
                <div className="mx-auto mb-8 w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: primaryColor + '15' }}>
                    <svg className="w-10 h-10" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-neutral-900 mb-3">
                    준비 중입니다
                </h1>
                <p className="text-neutral-500 mb-2 leading-relaxed">
                    <span className="font-semibold" style={{ color: primaryColor }}>{siteName}</span>은
                    더 나은 서비스를 위해 점검 중입니다.
                </p>
                <p className="text-sm text-neutral-400 mb-10">
                    빠른 시일 내에 다시 찾아뵙겠습니다.
                </p>

                <div className="flex items-center justify-center gap-6 text-xs text-neutral-400">
                    <a href="https://www.tenone.biz" className="hover:text-neutral-600 transition-colors">
                        Ten:One™ Universe
                    </a>
                    <span className="w-px h-3 bg-neutral-200" />
                    <a href="mailto:lools@tenone.biz" className="hover:text-neutral-600 transition-colors">
                        문의하기
                    </a>
                </div>
            </div>
        </div>
    );
}
