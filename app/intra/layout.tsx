"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LibraryProvider } from "@/lib/library-context";
import { PointProvider } from "@/lib/point-context";
import { IntraSidebar } from "@/components/IntraSidebar";
import { IntraHeader } from "@/components/IntraHeader";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Google SSO 모델: 별도 로그인 폼 없음. /login으로 통일.
export default function IntraLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'ok' | 'no-auth' | 'no-access'>('loading');
    const checked = useRef(false);

    useEffect(() => {
        if (checked.current) return;
        checked.current = true;

        const check = async () => {
            try {
                const sb = createClient();
                const { data: { user } } = await sb.auth.getUser();

                if (!user) {
                    // 미로그인 → /login으로 리다이렉트
                    window.location.href = '/login?redirect=/intra';
                    return;
                }

                // 로그인됨 → members에서 권한 확인
                const { data: member } = await sb.from('members')
                    .select('account_type,role')
                    .eq('auth_id', user.id)
                    .single();

                if (member && member.account_type !== 'member') {
                    setStatus('ok');
                } else {
                    setStatus('no-access');
                }
            } catch {
                setStatus('no-access');
            }
        };
        check();
    }, []);

    if (status === 'loading') return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
        </div>
    );

    if (status === 'no-access') {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <ShieldAlert className="h-12 w-12 text-red-500/70 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">접근 권한이 없습니다</h2>
                    <p className="text-neutral-500 text-sm mb-6">Intra는 내부 구성원 전용입니다.</p>
                    <div className="flex gap-3 justify-center">
                        <a href="/" className="px-5 py-2.5 text-sm border border-neutral-700 text-neutral-300 rounded-lg hover:border-neutral-500 transition-colors">홈으로</a>
                        <a href="/login?redirect=/intra" className="px-5 py-2.5 text-sm bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors">다른 계정으로 로그인</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <LibraryProvider>
        <PointProvider>
            <div className="min-h-screen bg-white text-neutral-900 flex">
                {/* Dark sidebar */}
                <IntraSidebar />

                {/* Main content */}
                <div className="flex-1 ml-0 lg:ml-[240px] flex flex-col min-h-screen">
                    <IntraHeader />
                    <main className="flex-1 p-3 pt-14 sm:p-4 sm:pt-14 lg:px-8 lg:py-6 lg:pt-6 bg-white">
                        <div className="max-w-[1200px]">
                            {children}
                        </div>
                    </main>
                    <footer className="border-t border-neutral-100 px-4 lg:px-8 py-4 flex items-center justify-between">
                        <p className="text-[10px] sm:text-xs text-neutral-400">© {new Date().getFullYear()} Ten:One™ Intra</p>
                        <p className="text-[10px] sm:text-xs text-neutral-300">Internal Use Only</p>
                    </footer>
                </div>
            </div>
        </PointProvider>
        </LibraryProvider>
    );
}
