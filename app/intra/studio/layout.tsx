"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { StudioShell } from "@/components/StudioShell";
import { ShieldAlert } from "lucide-react";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, hasAccess } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, isAuthenticated, router, pathname]);

    if (isLoading) return (
        <div className="h-full bg-neutral-50 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
    );

    if (!isAuthenticated) return null;

    if (!hasAccess('studio')) {
        return (
            <div className="h-full bg-neutral-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">접근 권한이 없습니다</h2>
                    <p className="text-neutral-500 text-sm mb-6">관리자에게 권한을 요청하세요.</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2.5 rounded-lg bg-neutral-900 text-sm text-neutral-900 hover:bg-neutral-800 transition-colors">홈으로 돌아가기</button>
                </div>
            </div>
        );
    }

    return <div className="h-full bg-neutral-50"><StudioShell>{children}</StudioShell></div>;
}
