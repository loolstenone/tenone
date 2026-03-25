"use client";

import { useState } from "react";
import { Wallet, Users, TrendingUp, Download, Search, CheckCircle2, Clock } from "lucide-react";

interface StaffPayroll {
    name: string;
    department: string;
    position: string;
    base: number;
    bonus: number;
    deductions: number;
    net: number;
    status: "지급완료" | "지급예정" | "보류";
}

const monthlyPayroll: StaffPayroll[] = [
    { name: "Cheonil Jeon", department: "경영기획", position: "대표이사", base: 5000000, bonus: 0, deductions: 820000, net: 4180000, status: "지급예정" },
    { name: "Sarah Kim", department: "브랜드관리", position: "매니저", base: 3500000, bonus: 0, deductions: 575000, net: 2925000, status: "지급예정" },
    { name: "김준호", department: "커뮤니티운영", position: "주임", base: 2800000, bonus: 0, deductions: 460000, net: 2340000, status: "지급예정" },
    { name: "박영상", department: "콘텐츠제작", position: "선임", base: 3200000, bonus: 200000, deductions: 558000, net: 2842000, status: "지급예정" },
    { name: "이수진", department: "디자인", position: "사원", base: 2600000, bonus: 0, deductions: 427000, net: 2173000, status: "지급예정" },
    { name: "최민호", department: "AI크리에이티브", position: "선임", base: 3400000, bonus: 0, deductions: 558000, net: 2842000, status: "지급예정" },
];

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function PayrollAdminPage() {
    const [tab, setTab] = useState<"monthly" | "pension">("monthly");
    const [search, setSearch] = useState("");

    const totalNet = monthlyPayroll.reduce((s, p) => s + p.net, 0);
    const totalBase = monthlyPayroll.reduce((s, p) => s + p.base, 0);
    const totalDeductions = monthlyPayroll.reduce((s, p) => s + p.deductions, 0);

    const filtered = search
        ? monthlyPayroll.filter(p => p.name.includes(search) || p.department.includes(search))
        : monthlyPayroll;

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold">급여 관리</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:border-neutral-400 transition-colors">
                        <Download className="h-3 w-3" /> 급여대장 다운로드
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                        <CheckCircle2 className="h-3 w-3" /> 일괄 지급 확정
                    </button>
                </div>
            </div>
            <p className="text-sm text-neutral-500 mb-6">전체 구성원의 급여, 퇴직연금을 관리합니다.</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "총 지급 인원", value: `${monthlyPayroll.length}명`, icon: Users },
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
                {([["monthly", "2026년 3월 급여"], ["pension", "퇴직연금 현황"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key as typeof tab)}
                        className={`px-4 py-2 text-sm rounded-t border-b-2 transition-all ${tab === key ? "border-neutral-900 font-medium" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === "monthly" && (
                <div className="border border-neutral-200 bg-white">
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
                                <tr key={p.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
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
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-neutral-200 bg-neutral-50">
                                <td colSpan={3} className="p-3 text-xs font-bold text-neutral-500">합계</td>
                                <td className="p-3 text-right font-bold text-xs">{formatKRW(totalBase)}</td>
                                <td className="p-3 text-right font-bold text-xs">{formatKRW(monthlyPayroll.reduce((s, p) => s + p.bonus, 0))}</td>
                                <td className="p-3 text-right font-bold text-xs">{formatKRW(totalDeductions)}</td>
                                <td className="p-3 text-right font-bold text-xs">{formatKRW(totalNet)}</td>
                                <td className="p-3" />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {tab === "pension" && (
                <div className="border border-neutral-200 bg-white">
                    <div className="p-4 border-b border-neutral-100">
                        <h2 className="text-sm font-bold">퇴직연금 현황</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                <th className="text-left p-3 font-medium">이름</th>
                                <th className="text-left p-3 font-medium">부서</th>
                                <th className="text-center p-3 font-medium">유형</th>
                                <th className="text-right p-3 font-medium">월 적립</th>
                                <th className="text-right p-3 font-medium">총 적립</th>
                                <th className="text-center p-3 font-medium">근속</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: "Cheonil Jeon", dept: "경영기획", type: "DB", monthly: 250000, total: 18500000, years: 6 },
                                { name: "Sarah Kim", dept: "브랜드관리", type: "DC", monthly: 175000, total: 3500000, years: 1 },
                                { name: "김준호", dept: "커뮤니티운영", type: "DC", monthly: 140000, total: 1400000, years: 1 },
                                { name: "박영상", dept: "콘텐츠제작", type: "DB", monthly: 160000, total: 5760000, years: 3 },
                            ].map(r => (
                                <tr key={r.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3 font-medium">{r.name}</td>
                                    <td className="p-3 text-neutral-500 text-xs">{r.dept}</td>
                                    <td className="p-3 text-center">
                                        <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">{r.type}</span>
                                    </td>
                                    <td className="p-3 text-right text-neutral-600">{formatKRW(r.monthly)}</td>
                                    <td className="p-3 text-right font-medium">{formatKRW(r.total)}</td>
                                    <td className="p-3 text-center text-neutral-500">{r.years}년</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
