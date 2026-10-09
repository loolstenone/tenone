"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CrmProvider } from "@/lib/crm-context";
import { StaffProvider } from "@/lib/staff-context";
import { GprProvider } from "@/lib/gpr-context";
import { ShieldAlert } from "lucide-react";

export default function ErpLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, isStaff, hasAccess } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) return (
        <div className="h-full bg-neutral-50 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
    );

    if (!isAuthenticated) return null;

    // ERP 접근: 직원이면서 erp-hr, erp-finance, erp-admin 중 하나 이상 필요
    // 조직도는 Workspace에서 쓰는 직원 공용 화면 — 직무 권한 없이 연다 (2026-10-10)
    const isOrgChart = pathname?.startsWith('/intra/erp/hr/people/org');
    const hasErpAccess = isStaff && (isOrgChart || hasAccess('erp-hr') || hasAccess('erp-finance') || hasAccess('erp-admin'));

    if (!hasErpAccess) {
        return (
            <div className="h-full bg-neutral-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-2">ERP 접근 권한이 없습니다</h2>
                    <p className="text-neutral-500 text-sm mb-6">ERP는 담당 직무 권한(인사·급여·재무·회계)이 필요합니다. 내 기록은 상단 아바타 › My에서 볼 수 있습니다.</p>
                    <button onClick={() => router.push('/intra')} className="px-6 py-2.5 bg-neutral-900 text-sm text-white hover:bg-neutral-800 transition-colors">
                        Intra로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <CrmProvider>
                <StaffProvider>
                    <GprProvider>
                        {children}
                    </GprProvider>
                </StaffProvider>
            </CrmProvider>
        </div>
    );
}
