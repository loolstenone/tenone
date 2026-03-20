"use client";

import { useState } from "react";
import { ArrowRightLeft, Plus, X, Check, Clock } from "lucide-react";

interface Delegation {
    id: string;
    from: string;
    to: string;
    scope: string;
    startDate: string;
    endDate: string;
    status: "활성" | "만료" | "대기";
    reason: string;
}

const mockDelegations: Delegation[] = [
    { id: "1", from: "Cheonil Jeon", to: "Sarah Kim", scope: "프로젝트 결재", startDate: "2026-03-18", endDate: "2026-03-25", status: "활성", reason: "출장" },
    { id: "2", from: "Cheonil Jeon", to: "김인사", scope: "인사 승인", startDate: "2026-03-10", endDate: "2026-03-15", status: "만료", reason: "휴가" },
];

const statusColor: Record<string, string> = {
    "활성": "bg-green-50 text-green-600",
    "만료": "bg-neutral-100 text-neutral-400",
    "대기": "bg-yellow-50 text-yellow-600",
};

export default function DelegationPage() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">권한위임</h1>
                    <p className="text-sm text-neutral-500">결재 및 승인 권한을 위임합니다.</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 권한 위임
                </button>
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">위임자</th>
                            <th className="text-left p-3 font-medium">수임자</th>
                            <th className="text-left p-3 font-medium">위임 범위</th>
                            <th className="text-left p-3 font-medium">기간</th>
                            <th className="text-left p-3 font-medium">사유</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockDelegations.map(d => (
                            <tr key={d.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{d.from}</td>
                                <td className="p-3">{d.to}</td>
                                <td className="p-3 text-neutral-600">{d.scope}</td>
                                <td className="p-3 text-xs text-neutral-500">{d.startDate} ~ {d.endDate}</td>
                                <td className="p-3 text-neutral-500">{d.reason}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[d.status]}`}>{d.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">권한 위임 등록</h2>
                            <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-900"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3">
                            {[{ l: "수임자", p: "위임받을 사람" }, { l: "위임 범위", p: "예: 프로젝트 결재, 경비 승인" }, { l: "사유", p: "출장, 휴가 등" }].map(f => (
                                <div key={f.l}><label className="text-xs text-neutral-500 mb-1 block">{f.l}</label><input className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" placeholder={f.p} /></div>
                            ))}
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs text-neutral-500 mb-1 block">시작일</label><input type="date" className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" /></div>
                                <div><label className="text-xs text-neutral-500 mb-1 block">종료일</label><input type="date" className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" /></div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-neutral-200 hover:bg-neutral-50 transition-colors">취소</button>
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
