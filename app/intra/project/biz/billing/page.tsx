"use client";

import { Receipt, Plus } from "lucide-react";
import Link from "next/link";

interface BizInvoice {
    id: string;
    invoiceNo: string;
    target: string;
    project: string;
    amount: number;
    issueDate: string;
    dueDate: string;
    status: "청구완료" | "입금확인" | "미청구" | "연체";
}

const mockInvoices: BizInvoice[] = [
    { id: "1", invoiceNo: "BIZ-2026-015", target: "ABC엔터", project: "브랜드 영상 제작", amount: 8000000, issueDate: "2026-03-01", dueDate: "2026-03-31", status: "청구완료" },
    { id: "2", invoiceNo: "BIZ-2026-018", target: "DEF기획", project: "MADLeap 5기 협찬", amount: 5000000, issueDate: "2026-02-20", dueDate: "2026-03-20", status: "입금확인" },
    { id: "3", invoiceNo: "-", target: "GHI스튜디오", project: "콘텐츠 제작 용역", amount: 12000000, issueDate: "-", dueDate: "-", status: "미청구" },
];

const statusColor: Record<string, string> = { "청구완료": "bg-blue-50 text-blue-600", "입금확인": "bg-green-50 text-green-600", "미청구": "bg-neutral-100 text-neutral-400", "연체": "bg-red-50 text-red-600" };
function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function BizBillingPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">청구 요청</h1>
                    <p className="text-sm text-neutral-500">CFO에게 청구 발행을 요청합니다.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/intra/project/biz/billing/payment" className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:border-neutral-400 transition-colors">
                        지급관리 →
                    </Link>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                        <Plus className="h-3 w-3" /> 청구 등록
                    </button>
                </div>
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">청구번호</th>
                            <th className="text-left p-3 font-medium">청구 대상</th>
                            <th className="text-left p-3 font-medium">프로젝트</th>
                            <th className="text-right p-3 font-medium">금액</th>
                            <th className="text-left p-3 font-medium">발행일</th>
                            <th className="text-left p-3 font-medium">만기일</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockInvoices.map(inv => (
                            <tr key={inv.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                                <td className="p-3 font-mono text-xs">{inv.invoiceNo}</td>
                                <td className="p-3 font-medium">{inv.target}</td>
                                <td className="p-3 text-neutral-500">{inv.project}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(inv.amount)}</td>
                                <td className="p-3 text-xs text-neutral-500">{inv.issueDate}</td>
                                <td className="p-3 text-xs text-neutral-500">{inv.dueDate}</td>
                                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[inv.status]}`}>{inv.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
