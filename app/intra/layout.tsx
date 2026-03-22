"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LibraryProvider } from "@/lib/library-context";
import { IntraSidebar } from "@/components/IntraSidebar";
import { IntraHeader } from "@/components/IntraHeader";
import { ShieldAlert } from "lucide-react";

export default function IntraLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, canAccessIntra } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/intra');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) return (
        <div className="h-full bg-white flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
    );

    if (!isAuthenticated) return null;

    // 일반회원(member)은 Intra 접근 불가. 나머지(staff/partner/junior-partner/crew)는 접근 가능.
    if (!canAccessIntra) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">접근 권한이 없습니다</h2>
                    <p className="text-neutral-500 text-sm mb-6">Intra는 내부 구성원 전용입니다. 관리자에게 권한을 요청하세요.</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-neutral-900 text-sm text-white hover:bg-neutral-800 transition-colors">홈으로 돌아가기</button>
                </div>
            </div>
        );
    }

    return (
        <LibraryProvider>
            <div className="min-h-screen bg-white text-neutral-900 flex">
                {/* Dark sidebar */}
                <IntraSidebar />

                {/* Main content */}
                <div className="flex-1 ml-0 lg:ml-[240px] flex flex-col min-h-screen">
                    <IntraHeader />
                    <main className="flex-1 p-4 pt-14 lg:p-8 lg:pt-8">
                        {children}
                    </main>
                    <footer className="border-t border-neutral-100 px-8 py-4 flex items-center justify-between">
                        <p className="text-xs text-neutral-400">© {new Date().getFullYear()} Ten:One™ Intra Office</p>
                        <p className="text-xs text-neutral-300">Internal Use Only</p>
                    </footer>
                </div>
            </div>
        </LibraryProvider>
    );
}
