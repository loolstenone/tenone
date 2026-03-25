"use client";

import { DollarSign, Plus, AlertTriangle } from "lucide-react";

interface Payment {
    id: string;
    vendor: string;
    description: string;
    amount: number;
    dueDate: string;
    type: "정발행" | "역발행";
    status: "지급완료" | "지급예정" | "미지급";
}

const mockPayments: Payment[] = [
    { id: "1", vendor: "프리랜서 박영상", description: "LUKI MV 편집비", amount: 3000000, dueDate: "2026-03-25", type: "정발행", status: "지급예정" },
    { id: "2", vendor: "스튜디오 ABC", description: "촬영장 임대료", amount: 5000000, dueDate: "2026-03-20", type: "정발행", status: "지급예정" },
    { id: "3", vendor: "디자인랩", description: "그래픽 디자인 용역", amount: 2000000, dueDate: "2026-03-15", type: "역발행", status: "지급완료" },
    { id: "4", vendor: "음향스튜디오", description: "녹음실 사용료", amount: 1500000, dueDate: "2026-03-10", type: "정발행", status: "지급완료" },
    { id: "5", vendor: "IT서비스", description: "서버 호스팅비", amount: 800000, dueDate: "2026-03-31", type: "역발행", status: "미지급" },
];

const statusColor: Record<string, string> = {
    "지급완료": "bg-green-50 text-green-600",
    "지급예정": "bg-blue-50 text-blue-600",
    "미지급": "bg-red-50 text-red-600",
};

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function PaymentPage() {
    const unpaid = mockPayments.filter(p => p.status !== "지급완료").reduce((s, p) => s + p.amount, 0);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold mb-1">지급관리</h1>
                    <p className="text-sm text-neutral-500">협력사 및 외주 지급 현황을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 지급 등록
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "미지급 합계", value: formatKRW(unpaid) },
                    { label: "이번 달 지급 완료", value: formatKRW(3500000) },
                    { label: "미지급 건수", value: `${mockPayments.filter(p => p.status === "미지급").length}건` },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">거래처</th>
                            <th className="text-left p-3 font-medium">내용</th>
                            <th className="text-right p-3 font-medium">금액</th>
                            <th className="text-center p-3 font-medium">발행유형</th>
                            <th className="text-left p-3 font-medium">지급일</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockPayments.map(p => (
                            <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{p.vendor}</td>
                                <td className="p-3 text-neutral-600">{p.description}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(p.amount)}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded ${p.type === "정발행" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>{p.type}</span>
                                </td>
                                <td className="p-3 text-neutral-500 text-xs">{p.dueDate}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[p.status]}`}>{p.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
