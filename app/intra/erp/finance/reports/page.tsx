"use client";

import { useState } from "react";
import { FileSpreadsheet, Download, BarChart3, TrendingUp } from "lucide-react";

const monthlySummary = [
    { month: "2026-03", revenue: 45000000, expense: 32000000, profit: 13000000 },
    { month: "2026-02", revenue: 52000000, expense: 38000000, profit: 14000000 },
    { month: "2026-01", revenue: 48000000, expense: 35000000, profit: 13000000 },
    { month: "2025-12", revenue: 61000000, expense: 42000000, profit: 19000000 },
];

const expenseByCategory = [
    { category: "인건비", amount: 18000000, ratio: 56 },
    { category: "임차료", amount: 3500000, ratio: 11 },
    { category: "마케팅", amount: 4200000, ratio: 13 },
    { category: "제작비", amount: 3800000, ratio: 12 },
    { category: "기타", amount: 2500000, ratio: 8 },
];

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }
function formatShort(n: number) { return (n / 10000).toFixed(0) + "만"; }

export default function ReportsPage() {
    const [period, setPeriod] = useState("monthly");

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold mb-1">경리 리포트</h1>
                    <p className="text-sm text-neutral-500">개인·조직 단위 재무 현황을 분석합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:border-neutral-400 transition-colors">
                    <Download className="h-3 w-3" /> Excel 내보내기
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "이번 달 매출", value: formatKRW(45000000), change: "+8%", icon: TrendingUp },
                    { label: "이번 달 비용", value: formatKRW(32000000), change: "-5%", icon: BarChart3 },
                    { label: "이번 달 이익", value: formatKRW(13000000), change: "+15%", icon: FileSpreadsheet },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-lg font-bold">{s.value}</p>
                            <span className="text-xs text-green-600">{s.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Monthly summary */}
                <div className="border border-neutral-200 bg-white p-5">
                    <h2 className="text-sm font-bold mb-4">월별 요약</h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-neutral-400 border-b border-neutral-100">
                                <th className="text-left pb-2 font-medium">월</th>
                                <th className="text-right pb-2 font-medium">매출</th>
                                <th className="text-right pb-2 font-medium">비용</th>
                                <th className="text-right pb-2 font-medium">이익</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlySummary.map(m => (
                                <tr key={m.month} className="border-b border-neutral-50">
                                    <td className="py-2 font-medium">{m.month}</td>
                                    <td className="py-2 text-right text-neutral-600">{formatShort(m.revenue)}</td>
                                    <td className="py-2 text-right text-neutral-400">{formatShort(m.expense)}</td>
                                    <td className="py-2 text-right font-medium text-green-600">{formatShort(m.profit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Expense breakdown */}
                <div className="border border-neutral-200 bg-white p-5">
                    <h2 className="text-sm font-bold mb-4">비용 구성</h2>
                    <div className="space-y-3">
                        {expenseByCategory.map(c => (
                            <div key={c.category}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span>{c.category}</span>
                                    <span className="text-neutral-500">{formatShort(c.amount)} ({c.ratio}%)</span>
                                </div>
                                <div className="h-2 bg-neutral-100 rounded-full">
                                    <div className="h-2 bg-neutral-900 rounded-full" style={{ width: `${c.ratio}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
