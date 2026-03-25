"use client";

import { useState, useEffect } from "react";
import { Wallet, Users, TrendingUp, Download, Search, CheckCircle2 } from "lucide-react";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader, Card, Spinner } from "@/components/intra/IntraUI";
import { useAuth } from "@/lib/auth-context";

interface PayrollRecord {
    id: string;
    name: string;
    department: string;
    position: string;
    base: number;
    bonus: number;
    deductions: number;
    net: number;
    status: string;
}

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function PayrollAdminPage() {
    const { user } = useAuth();
    const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"monthly" | "pension">("monthly");
    const [search, setSearch] = useState("");

    useEffect(() => {
        setLoading(true);
        erpDb.fetchPayroll()
            .then((data) => {
                setPayroll(data.map((p: Record<string, unknown>) => ({
                    id: (p.id as string) || '',
                    name: (p.member_name as string) || (p.name as string) || '',
                    department: (p.department as string) || '',
                    position: (p.position as string) || '',
                    base: (p.base_salary as number) || (p.base as number) || 0,
                    bonus: (p.bonus as number) || 0,
                    deductions: (p.deductions as number) || 0,
                    net: (p.net_salary as number) || (p.net as number) || 0,
                    status: (p.status as string) || '지급예정',
                })));
            })
            .catch(() => {
                setPayroll([]);
            })
            .finally(() => setLoading(false));
    }, [user?.id]);

    const totalNet = payroll.reduce((s, p) => s + p.net, 0);
    const totalBase = payroll.reduce((s, p) => s + p.base, 0);
    const totalDeductions = payroll.reduce((s, p) => s + p.deductions, 0);
    const totalBonus = payroll.reduce((s, p) => s + p.bonus, 0);

    const filtered = search
        ? payroll.filter(p => p.name.includes(search) || p.department.includes(search))
        : payroll;

    if (loading) return <div className="max-w-5xl"><Spinner /></div>;

    return (
        <div className="max-w-5xl">
            <PageHeader title="급여 관리" description="전체 구성원의 급여, 퇴직연금을 관리합니다.">
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:border-neutral-400 transition-colors">
                    <Download className="h-3 w-3" /> 급여대장 다운로드
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <CheckCircle2 className="h-3 w-3" /> 일괄 지급 확정
                </button>
            </PageHeader>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "총 지급 인원", value: `${payroll.length}명`, icon: Users },
                    { label: "총 기본급", value: formatKRW(totalBase), icon: Wallet },
                    { label: "총 공제액", value: formatKRW(totalDeductions), icon: TrendingUp },
                    { label: "총 실지급액", value: formatKRW(totalNet), icon: Wallet },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-1 mb-4">
                {([["monthly", "급여 현황"], ["pension", "퇴직연금 현황"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key as typeof tab)}
                        className={`px-4 py-2 text-sm rounded-t border-b-2 transition-all ${tab === key ? "border-neutral-900 font-medium" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === "monthly" && (
                <Card padding={false}>
                    <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                        <h2 className="text-sm font-bold">급여 대장</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-3 py-1.5 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400 w-48"
                                placeholder="이름, 부서 검색..." />
                        </div>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                <th className="text-left p-3 font-medium">이름</th>
                                <th className="text-left p-3 font-medium">부서</th>
                                <th className="text-left p-3 font-medium">직급</th>
                                <th className="text-right p-3 font-medium">기본급</th>
                                <th className="text-right p-3 font-medium">상여</th>
                                <th className="text-right p-3 font-medium">공제</th>
                                <th className="text-right p-3 font-medium">실지급</th>
                                <th className="text-center p-3 font-medium">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id || p.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3 font-medium">{p.name}</td>
                                    <td className="p-3 text-neutral-500 text-xs">{p.department}</td>
                                    <td className="p-3 text-neutral-500 text-xs">{p.position}</td>
                                    <td className="p-3 text-right text-neutral-600">{formatKRW(p.base)}</td>
                                    <td className="p-3 text-right text-neutral-600">{p.bonus > 0 ? formatKRW(p.bonus) : "-"}</td>
                                    <td className="p-3 text-right text-neutral-400">{formatKRW(p.deductions)}</td>
                                    <td className="p-3 text-right font-medium">{formatKRW(p.net)}</td>
                                    <td className="p-3 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                            p.status === "지급완료" ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-500"
                                        }`}>{p.status}</span>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-xs text-neutral-400">
                                        데이터가 없습니다
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {filtered.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-neutral-200 bg-neutral-50">
                                    <td colSpan={3} className="p-3 text-xs font-bold text-neutral-500">합계</td>
                                    <td className="p-3 text-right font-bold text-xs">{formatKRW(totalBase)}</td>
                                    <td className="p-3 text-right font-bold text-xs">{formatKRW(totalBonus)}</td>
                                    <td className="p-3 text-right font-bold text-xs">{formatKRW(totalDeductions)}</td>
                                    <td className="p-3 text-right font-bold text-xs">{formatKRW(totalNet)}</td>
                                    <td className="p-3" />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </Card>
            )}

            {tab === "pension" && (
                <Card>
                    <div className="py-12 text-center text-sm text-neutral-400">
                        데이터가 없습니다
                    </div>
                </Card>
            )}
        </div>
    );
}
