"use client";

import { useEffect } from "react";
import { LibraryProvider } from "@/lib/library-context";
import { PointProvider } from "@/lib/point-context";
import { IntraSidebar } from "@/components/IntraSidebar";
import { IntraHeader } from "@/components/IntraHeader";
import { IntraSubTabs } from "@/components/intra/IntraSubTabs";
import { AIContextProvider } from "@/components/intra/AIContextPanel";
import { createClient } from "@/lib/supabase/client";

/**
 * 인트라 껍데기 (사이드바·헤더·하위 탭) — app/intra/layout.tsx(서버)가 **직원으로 확인한 요청에만** 렌더한다.
 * 세션이 끊기면(로그아웃·다른 사이트에서 전체 로그아웃) 새로고침 → 서버가 다시 판단해 로그인 화면으로.
 */
export function IntraShell({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const sb = createClient();
        const { data: { subscription } } = sb.auth.onAuthStateChange((event: string) => {
            if (event === "SIGNED_OUT") window.location.reload();
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <LibraryProvider>
            <PointProvider>
                <AIContextProvider>
                    <div className="min-h-screen bg-white text-neutral-900 flex">
                        <IntraSidebar />
                        <div className="flex-1 ml-0 lg:ml-[240px] flex flex-col min-h-screen">
                            <IntraHeader />
                            <main className="flex-1 p-3 pt-14 sm:p-4 sm:pt-14 lg:px-8 lg:py-6 lg:pt-6 bg-white overflow-x-hidden">
                                <div className="w-full max-w-[1200px]">
                                    <IntraSubTabs />
                                    {children}
                                </div>
                            </main>
                            <footer className="border-t border-neutral-100 px-4 lg:px-8 py-4 flex items-center justify-between">
                                <p className="text-[10px] sm:text-xs text-neutral-400">
                                    &copy; {new Date().getFullYear()} Ten:One&trade; Intra
                                </p>
                                <p className="text-[10px] sm:text-xs text-neutral-300">
                                    Internal Use Only
                                </p>
                            </footer>
                        </div>
                    </div>
                </AIContextProvider>
            </PointProvider>
        </LibraryProvider>
    );
}
