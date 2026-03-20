"use client";

import { Calculator, Plus } from "lucide-react";

interface Settlement {
    id: string;
    project: string;
    period: string;
    totalBudget: number;
    totalSpent: number;
    settled: number;
    remaining: number;
    status: "정산완료" | "정산중" | "미정산";
}

const mockSettlements: Settlement[] = [
    { id: "1", project: "LUKI 2nd Single", period: "2026-02 ~ 2026-03", totalBudget: 50000000, totalSpent: 22000000, settled: 15000000, remaining: 7000000, status: "정산중" },
    { id: "2", project: "MADLeap 5기", period: "2026-03", totalBudget: 30000000, totalSpent: 8000000, settled: 8000000, remaining: 0, status: "정산완료" },
    { id: "3", project: "ABC엔터 영상", period: "2026-03", totalBudget: 15000000, totalSpent: 3000000, settled: 0, remaining: 3000000, status: "미정산" },
];

const statusColor: Record<string, string> = { "정산완료": "bg-green-50 text-green-600", "정산중": "bg-blue-50 text-blue-600", "미정산": "bg-neutral-100 text-neutral-400" };
function formatKRW(n: number) { return (n / 10000).toFixed(0) + "만원"; }

export default function SettlementPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">중간정산</h1>
                    <p className="text-sm text-neutral-500">프로젝트별 중간정산 현황을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 정산 등록
                </button>
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">프로젝트</th>
                            <th className="text-left p-3 font-medium">정산기간</th>
                            <th className="text-right p-3 font-medium">예산</th>
                            <th className="text-right p-3 font-medium">지출</th>
                            <th className="text-right p-3 font-medium">정산액</th>
                            <th className="text-right p-3 font-medium">미정산</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockSettlements.map(s => (
                            <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{s.project}</td>
                                <td className="p-3 text-neutral-500 text-xs">{s.period}</td>
                                <td className="p-3 text-right text-neutral-500">{formatKRW(s.totalBudget)}</td>
                                <td className="p-3 text-right text-neutral-600">{formatKRW(s.totalSpent)}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(s.settled)}</td>
                                <td className="p-3 text-right text-red-500">{s.remaining > 0 ? formatKRW(s.remaining) : "-"}</td>
                                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[s.status]}`}>{s.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
