"use client";

/**
 * My — 나에 관한 기록 (2026-10-10 Workspace/My 체계)
 *   Workspace = 회사 일을 하는 곳(동료와 공유) · My = 본인만 보는 인사·보상·근무 기록 · ERP = 회사 전체 관리(담당 직무만)
 *   같은 데이터라도 "내 것"은 여기, "전원 것"은 ERP. 접근은 DB가 막는다 (본인 + 직무 권한 — sql/staff-duty-roles.sql)
 */
import Link from "next/link";
import { Award, CalendarCheck, ChevronRight, Receipt, Target, Wallet } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { useAuth } from "@/lib/auth-context";

const RECORDS = [
    { href: "/intra/my/attendance", icon: CalendarCheck, label: "근태", desc: "출퇴근 기록 · 휴가" },
    { href: "/intra/my/payroll", icon: Wallet, label: "급여명세", desc: "월별 급여 · 공제 내역" },
    { href: "/intra/my/gpr", icon: Target, label: "GPR", desc: "내 목표 · 평가" },
    { href: "/intra/my/points", icon: Award, label: "포인트", desc: "적립 · 사용 내역" },
    { href: "/intra/my/expenses", icon: Receipt, label: "경비", desc: "경비 신청 · 처리 상태" },
];

function Info({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-[11px] text-neutral-400">{label}</p>
            <p className="mt-0.5 text-sm text-neutral-900">{value || "-"}</p>
        </div>
    );
}

export default function MyPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <PageHeader title="My" description="나에 관한 기록 — 본인과 담당 직무(인사·급여·재무)만 볼 수 있습니다" />

            <div className="rounded-lg border border-neutral-200 bg-white p-5">
                <p className="text-base font-semibold text-neutral-900">{user?.name ?? ""}</p>
                <p className="text-xs text-neutral-500">{user?.email ?? ""}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Info label="소속" value={user?.department} />
                    <Info label="직위" value={user?.position} />
                    <Info label="사번" value={user?.employeeId} />
                </div>
                <Link href="/profile" className="mt-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900">
                    공통 프로필 수정 <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {RECORDS.map(r => (
                    <Link key={r.href} href={r.href} className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400">
                        <r.icon className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-neutral-900">{r.label}</p>
                            <p className="text-[11px] text-neutral-500">{r.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
