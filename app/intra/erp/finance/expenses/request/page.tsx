"use client";

import { useState } from "react";
import { FileText, Plus, Clock, Check, X as XIcon } from "lucide-react";

interface ExpenseRequest {
    id: string;
    title: string;
    date: string;
    totalAmount: number;
    items: number;
    purpose: string;
    status: "결재대기" | "결재완료" | "반려" | "임시저장";
    approver: string;
}

const mockRequests: ExpenseRequest[] = [
    { id: "1", title: "3월 출장 경비 품의", date: "2026-03-18", totalAmount: 850000, items: 5, purpose: "서울-부산 출장", status: "결재대기", approver: "Cheonil Jeon" },
    { id: "2", title: "사무용품 구매 품의", date: "2026-03-15", totalAmount: 120000, items: 3, purpose: "팀 업무용", status: "결재완료", approver: "Sarah Kim" },
    { id: "3", title: "교육비 지원 요청", date: "2026-03-10", totalAmount: 500000, items: 1, purpose: "외부 교육 수강", status: "반려", approver: "김인사" },
];

const statusColor: Record<string, string> = {
    "결재대기": "bg-yellow-50 text-yellow-600",
    "결재완료": "bg-green-50 text-green-600",
    "반려": "bg-red-50 text-red-600",
    "임시저장": "bg-neutral-100 text-neutral-400",
};

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function ExpenseRequestPage() {
    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">경비품의서</h1>
                    <p className="text-sm text-neutral-500">경비 사용 품의서를 작성하고 결재를 요청합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 품의서 작성
                </button>
            </div>

            <div className="space-y-3">
                {mockRequests.map(r => (
                    <div key={r.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-4 w-4 text-neutral-400" />
                                    <h3 className="text-sm font-bold">{r.title}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[r.status]}`}>{r.status}</span>
                                </div>
                                <p className="text-xs text-neutral-500">{r.purpose}</p>
                            </div>
                            <p className="text-lg font-bold">{formatKRW(r.totalAmount)}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-[10px] text-neutral-400">
                            <span>신청일: {r.date}</span>
                            <span>항목: {r.items}건</span>
                            <span>결재자: {r.approver}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
