"use client";

import { useState } from "react";
import { CircleDollarSign, Plus, Search, FileText } from "lucide-react";

interface Invoice {
    id: string;
    invoiceNo: string;
    client: string;
    project: string;
    amount: number;
    issueDate: string;
    dueDate: string;
    status: "발행" | "입금완료" | "미발행" | "연체";
}

const mockInvoices: Invoice[] = [
    { id: "1", invoiceNo: "INV-2026-032", client: "ABC엔터", project: "LUKI 2nd Single MV", amount: 15000000, issueDate: "2026-03-15", dueDate: "2026-04-15", status: "발행" },
    { id: "2", invoiceNo: "INV-2026-028", client: "XYZ미디어", project: "브랜드 영상 제작", amount: 8000000, issueDate: "2026-03-01", dueDate: "2026-03-31", status: "발행" },
    { id: "3", invoiceNo: "INV-2026-025", client: "DEF기획", project: "MADLeap 5기 협찬", amount: 5000000, issueDate: "2026-02-20", dueDate: "2026-03-20", status: "입금완료" },
    { id: "4", invoiceNo: "INV-2026-020", client: "GHI스튜디오", project: "콘텐츠 제작 용역", amount: 12000000, issueDate: "2026-02-10", dueDate: "2026-03-10", status: "연체" },
    { id: "5", invoiceNo: "-", client: "JKL커뮤니케이션", project: "Badak 네트워크 컨설팅", amount: 3000000, issueDate: "-", dueDate: "-", status: "미발행" },
];

const statusColor: Record<string, string> = {
    "발행": "bg-blue-50 text-blue-600",
    "입금완료": "bg-green-50 text-green-600",
    "미발행": "bg-neutral-100 text-neutral-400",
    "연체": "bg-red-50 text-red-600",
};

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function BillingPage() {
    const totalOutstanding = mockInvoices.filter(i => i.status === "발행" || i.status === "연체").reduce((s, i) => s + i.amount, 0);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold mb-1">청구관리</h1>
                    <p className="text-sm text-neutral-500">청구서 발행 및 입금 현황을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 청구서 발행
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "미수금 합계", value: formatKRW(totalOutstanding) },
                    { label: "발행 건", value: `${mockInvoices.filter(i => i.status === "발행").length}건` },
                    { label: "연체 건", value: `${mockInvoices.filter(i => i.status === "연체").length}건` },
                    { label: "이번 달 입금", value: formatKRW(5000000) },
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
                            <th className="text-left p-3 font-medium">청구번호</th>
                            <th className="text-left p-3 font-medium">거래처</th>
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
                                <td className="p-3 font-medium">{inv.client}</td>
                                <td className="p-3 text-neutral-500">{inv.project}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(inv.amount)}</td>
                                <td className="p-3 text-neutral-500 text-xs">{inv.issueDate}</td>
                                <td className="p-3 text-neutral-500 text-xs">{inv.dueDate}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[inv.status]}`}>{inv.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
