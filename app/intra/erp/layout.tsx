"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ErpShell } from "@/components/ErpShell";
import { CrmProvider } from "@/lib/crm-context";
import { StaffProvider } from "@/lib/staff-context";
import { GprProvider } from "@/lib/gpr-context";
import { ShieldAlert } from "lucide-react";

export default function ErpLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, isStaff } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) return (
        <div className="h-full bg-neutral-50 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
    );

    if (!isAuthenticated) return null;

    if (!isStaff) {
        return (
            <div className="h-full bg-neutral-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">접근 권한이 없습니다</h2>
                    <p className="text-neutral-500 text-sm mb-6">접근이 허용되지 않았습니다. 관리자에게 권한을 요청하세요.</p>
                    <button onClick={() => window.location.href = '/'} className="px-6 py-2.5 rounded-lg bg-neutral-900 text-sm text-neutral-900 hover:bg-neutral-800 transition-colors">
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-neutral-50">
            <CrmProvider>
                <StaffProvider>
                    <GprProvider>
                        <ErpShell>{children}</ErpShell>
                    </GprProvider>
                </StaffProvider>
            </CrmProvider>
        </div>
    );
}
