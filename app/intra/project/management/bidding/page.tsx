"use client";

import { Gavel, Plus, Calendar, DollarSign } from "lucide-react";

interface Bid {
    id: string;
    title: string;
    client: string;
    type: "공개입찰" | "제한입찰" | "수의계약";
    submitDeadline: string;
    estimatedAmount: number;
    status: "준비중" | "제출완료" | "낙찰" | "유찰" | "심사중";
    assignee: string;
}

const mockBids: Bid[] = [
    { id: "1", title: "2026 OO기관 홍보영상 제작", client: "OO기관", type: "공개입찰", submitDeadline: "2026-03-25", estimatedAmount: 80000000, status: "준비중", assignee: "Sarah Kim" },
    { id: "2", title: "XX대학교 브랜드 필름", client: "XX대학교", type: "제한입찰", submitDeadline: "2026-03-20", estimatedAmount: 30000000, status: "제출완료", assignee: "김콘텐" },
    { id: "3", title: "YY그룹 사내 교육 콘텐츠", client: "YY그룹", type: "수의계약", submitDeadline: "2026-03-15", estimatedAmount: 50000000, status: "낙찰", assignee: "Cheonil Jeon" },
    { id: "4", title: "ZZ엔터 아티스트 MV", client: "ZZ엔터", type: "제한입찰", submitDeadline: "2026-03-10", estimatedAmount: 120000000, status: "유찰", assignee: "이영상" },
];

const typeColor: Record<string, string> = { "공개입찰": "bg-blue-50 text-blue-600", "제한입찰": "bg-purple-50 text-purple-600", "수의계약": "bg-green-50 text-green-600" };
const statusColor: Record<string, string> = { "준비중": "bg-yellow-50 text-yellow-600", "제출완료": "bg-blue-50 text-blue-600", "낙찰": "bg-green-50 text-green-600", "유찰": "bg-red-50 text-red-600", "심사중": "bg-orange-50 text-orange-600" };
function formatKRW(n: number) { return (n / 10000).toFixed(0) + "만원"; }

export default function BiddingPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">입찰관리</h1>
                    <p className="text-sm text-neutral-500">입찰 참여 현황을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 입찰 등록
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "준비중", value: mockBids.filter(b => b.status === "준비중").length },
                    { label: "제출완료", value: mockBids.filter(b => b.status === "제출완료").length },
                    { label: "낙찰", value: mockBids.filter(b => b.status === "낙찰").length },
                    { label: "유찰", value: mockBids.filter(b => b.status === "유찰").length },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {mockBids.map(b => (
                    <div key={b.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-bold">{b.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeColor[b.type]}`}>{b.type}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[b.status]}`}>{b.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-neutral-400 mt-1">
                                    <span>발주처: {b.client}</span>
                                    <span>담당: {b.assignee}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> 마감: {b.submitDeadline}</span>
                                </div>
                            </div>
                            <p className="text-lg font-bold">{formatKRW(b.estimatedAmount)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
