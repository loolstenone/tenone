"use client";

import { ClipboardCheck, Plus, Check, Clock, AlertTriangle } from "lucide-react";

interface Inspection {
    id: string;
    title: string;
    vendor: string;
    project: string;
    poNo: string;
    amount: number;
    inspectionDate: string;
    status: "검수완료" | "검수중" | "미검수" | "부적합";
    inspector: string;
}

const mockInspections: Inspection[] = [
    { id: "1", title: "녹음실 사용 용역", vendor: "음향스튜디오", project: "LUKI 2nd Single", poNo: "PO-2026-017", amount: 1500000, inspectionDate: "2026-03-18", status: "검수완료", inspector: "김콘텐" },
    { id: "2", title: "팜플렛 인쇄물", vendor: "인쇄소 대한", project: "MADLeap 5기", poNo: "PO-2026-015", amount: 800000, inspectionDate: "2026-03-16", status: "검수완료", inspector: "한마케" },
    { id: "3", title: "촬영장 임대", vendor: "스튜디오 ABC", project: "LUKI 2nd Single", poNo: "PO-2026-018", amount: 5000000, inspectionDate: "-", status: "미검수", inspector: "-" },
    { id: "4", title: "카메라 장비 렌탈", vendor: "장비 렌탈", project: "ABC엔터 영상", poNo: "PO-2026-012", amount: 2000000, inspectionDate: "-", status: "검수중", inspector: "이영상" },
];

const statusColor: Record<string, string> = { "검수완료": "bg-green-50 text-green-600", "검수중": "bg-blue-50 text-blue-600", "미검수": "bg-neutral-100 text-neutral-400", "부적합": "bg-red-50 text-red-600" };
function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function InspectionPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">검수관리</h1>
                    <p className="text-sm text-neutral-500">발주 건의 납품 검수를 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 검수 등록
                </button>
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">검수 대상</th>
                            <th className="text-left p-3 font-medium">거래처</th>
                            <th className="text-left p-3 font-medium">프로젝트</th>
                            <th className="text-left p-3 font-medium">발주번호</th>
                            <th className="text-right p-3 font-medium">금액</th>
                            <th className="text-left p-3 font-medium">검수일</th>
                            <th className="text-left p-3 font-medium">검수자</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockInspections.map(i => (
                            <tr key={i.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{i.title}</td>
                                <td className="p-3 text-neutral-500">{i.vendor}</td>
                                <td className="p-3 text-neutral-500">{i.project}</td>
                                <td className="p-3 font-mono text-xs text-neutral-400">{i.poNo}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(i.amount)}</td>
                                <td className="p-3 text-xs text-neutral-500">{i.inspectionDate}</td>
                                <td className="p-3 text-neutral-500">{i.inspector}</td>
                                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[i.status]}`}>{i.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
