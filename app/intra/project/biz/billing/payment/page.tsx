"use client";

import { DollarSign, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface BizPayment {
    id: string;
    vendor: string;
    description: string;
    project: string;
    amount: number;
    dueDate: string;
    type: "정발행" | "역발행";
    status: "지급완료" | "지급예정" | "미지급";
}

const mockPayments: BizPayment[] = [
    { id: "1", vendor: "스튜디오 ABC", description: "촬영장 임대 잔금", project: "LUKI 2nd Single", amount: 2500000, dueDate: "2026-03-28", type: "정발행", status: "지급예정" },
    { id: "2", vendor: "프리랜서 박영상", description: "MV 편집비 1차", project: "LUKI 2nd Single", amount: 1500000, dueDate: "2026-03-20", type: "정발행", status: "지급완료" },
    { id: "3", vendor: "디자인랩", description: "아트워크 디자인비", project: "LUKI 2nd Single", amount: 2000000, dueDate: "2026-03-30", type: "역발행", status: "미지급" },
];

const statusColor: Record<string, string> = { "지급완료": "bg-green-50 text-green-600", "지급예정": "bg-blue-50 text-blue-600", "미지급": "bg-red-50 text-red-600" };
function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function BizPaymentPage() {
    const unpaid = mockPayments.filter(p => p.status !== "지급완료").reduce((s, p) => s + p.amount, 0);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">지급 요청</h1>
                    <p className="text-sm text-neutral-500">CFO에게 협력사 지급을 요청합니다. (CHO/CFO 확인 후 처리)</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/intra/project/biz/billing" className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:border-neutral-400 transition-colors">
                        ← 청구관리
                    </Link>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                        <Plus className="h-3 w-3" /> 지급 등록
                    </button>
                </div>
            </div>

            {unpaid > 0 && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-yellow-50 border border-yellow-200 text-sm text-yellow-700">
                    <AlertTriangle className="h-4 w-4" />
                    미지급 잔액: {formatKRW(unpaid)}
                </div>
            )}

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">거래처</th>
                            <th className="text-left p-3 font-medium">내용</th>
                            <th className="text-left p-3 font-medium">프로젝트</th>
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
                                <td className="p-3 text-neutral-500">{p.project}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(p.amount)}</td>
                                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded ${p.type === "정발행" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>{p.type}</span></td>
                                <td className="p-3 text-xs text-neutral-500">{p.dueDate}</td>
                                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[p.status]}`}>{p.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
