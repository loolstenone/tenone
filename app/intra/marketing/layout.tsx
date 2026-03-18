"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MarketingShell } from "@/components/MarketingShell";
import { MarketingProvider } from "@/lib/marketing-context";
import { CrmProvider } from "@/lib/crm-context";
import { ShieldAlert } from "lucide-react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, hasAccess } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) return <div className="h-full bg-black flex items-center justify-center"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;
    if (!isAuthenticated) return null;

    if (!hasAccess('marketing')) {
        return (
            <div className="h-full bg-black flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">접근 권한이 없습니다</h2>
                    <p className="text-zinc-400 text-sm mb-6">관리자에게 권한을 요청하세요.</p>
                    <button onClick={() => window.location.href = '/'} className="px-6 py-2.5 rounded-lg bg-zinc-800 text-sm text-white hover:bg-zinc-700 transition-colors">홈으로 돌아가기</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-black">
            <MarketingProvider>
                <CrmProvider>
                    <MarketingShell>{children}</MarketingShell>
                </CrmProvider>
            </MarketingProvider>
        </div>
    );
}
