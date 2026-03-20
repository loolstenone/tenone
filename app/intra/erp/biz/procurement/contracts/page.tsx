"use client";

import { FileSignature, Plus, Calendar, AlertTriangle } from "lucide-react";

interface Contract {
    id: string;
    contractNo: string;
    title: string;
    counterparty: string;
    type: "용역" | "구매" | "임대" | "라이선스" | "파트너십";
    amount: number;
    startDate: string;
    endDate: string;
    status: "유효" | "만료예정" | "만료" | "해지";
}

const mockContracts: Contract[] = [
    { id: "1", contractNo: "CT-2026-008", title: "LUKI MV 제작 용역 계약", counterparty: "스튜디오 ABC", type: "용역", amount: 25000000, startDate: "2026-03-01", endDate: "2026-05-31", status: "유효" },
    { id: "2", contractNo: "CT-2026-005", title: "사무실 임대 계약", counterparty: "강남빌딩", type: "임대", amount: 36000000, startDate: "2026-01-01", endDate: "2026-12-31", status: "유효" },
    { id: "3", contractNo: "CT-2025-042", title: "AI 엔진 라이선스", counterparty: "AI Corp", type: "라이선스", amount: 12000000, startDate: "2025-07-01", endDate: "2026-06-30", status: "만료예정" },
    { id: "4", contractNo: "CT-2025-030", title: "Badak 네트워크 파트너십", counterparty: "대학교 연합", type: "파트너십", amount: 0, startDate: "2025-09-01", endDate: "2026-08-31", status: "유효" },
];

const typeColor: Record<string, string> = { "용역": "bg-blue-50 text-blue-600", "구매": "bg-green-50 text-green-600", "임대": "bg-purple-50 text-purple-600", "라이선스": "bg-orange-50 text-orange-600", "파트너십": "bg-pink-50 text-pink-600" };
const statusColor: Record<string, string> = { "유효": "bg-green-50 text-green-600", "만료예정": "bg-yellow-50 text-yellow-600", "만료": "bg-neutral-100 text-neutral-400", "해지": "bg-red-50 text-red-600" };
function formatKRW(n: number) { return n === 0 ? "-" : new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function ContractsPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">계약관리</h1>
                    <p className="text-sm text-neutral-500">계약서를 등록하고 만기를 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 계약 등록
                </button>
            </div>

            {mockContracts.some(c => c.status === "만료예정") && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-yellow-50 border border-yellow-200 text-sm text-yellow-700">
                    <AlertTriangle className="h-4 w-4" />
                    만료 예정 계약이 {mockContracts.filter(c => c.status === "만료예정").length}건 있습니다.
                </div>
            )}

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">계약번호</th>
                            <th className="text-left p-3 font-medium">계약명</th>
                            <th className="text-left p-3 font-medium">상대방</th>
                            <th className="text-center p-3 font-medium">유형</th>
                            <th className="text-right p-3 font-medium">금액</th>
                            <th className="text-left p-3 font-medium">기간</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockContracts.map(c => (
                            <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                                <td className="p-3 font-mono text-xs">{c.contractNo}</td>
                                <td className="p-3 font-medium">{c.title}</td>
                                <td className="p-3 text-neutral-500">{c.counterparty}</td>
                                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded font-medium ${typeColor[c.type]}`}>{c.type}</span></td>
                                <td className="p-3 text-right font-medium">{formatKRW(c.amount)}</td>
                                <td className="p-3 text-xs text-neutral-500">{c.startDate} ~ {c.endDate}</td>
                                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[c.status]}`}>{c.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
