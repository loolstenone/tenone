"use client";

import { FileSignature, Plus, AlertTriangle } from "lucide-react";

interface PurchaseOrder {
    id: string;
    poNo: string;
    vendor: string;
    description: string;
    amount: number;
    orderDate: string;
    deliveryDate: string;
    status: "발주완료" | "진행중" | "납품완료" | "취소";
    project: string;
}

const mockOrders: PurchaseOrder[] = [
    { id: "1", poNo: "PO-2026-018", vendor: "스튜디오 ABC", description: "촬영장 임대 (3일)", amount: 5000000, orderDate: "2026-03-15", deliveryDate: "2026-03-25", status: "발주완료", project: "LUKI 2nd Single" },
    { id: "2", poNo: "PO-2026-017", vendor: "음향스튜디오", description: "녹음실 사용 (2일)", amount: 1500000, orderDate: "2026-03-10", deliveryDate: "2026-03-18", status: "납품완료", project: "LUKI 2nd Single" },
    { id: "3", poNo: "PO-2026-015", vendor: "인쇄소 대한", description: "팜플렛 500부 인쇄", amount: 800000, orderDate: "2026-03-08", deliveryDate: "2026-03-15", status: "납품완료", project: "MADLeap 5기" },
    { id: "4", poNo: "PO-2026-012", vendor: "장비 렌탈", description: "카메라 장비 렌탈", amount: 2000000, orderDate: "2026-03-05", deliveryDate: "2026-03-20", status: "진행중", project: "ABC엔터 영상" },
];

const statusColor: Record<string, string> = { "발주완료": "bg-blue-50 text-blue-600", "진행중": "bg-yellow-50 text-yellow-600", "납품완료": "bg-green-50 text-green-600", "취소": "bg-red-50 text-red-600" };
function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function ProcurementPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">발주관리</h1>
                    <p className="text-sm text-neutral-500">발주 현황 및 업무 현황을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 발주 등록
                </button>
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">발주번호</th>
                            <th className="text-left p-3 font-medium">거래처</th>
                            <th className="text-left p-3 font-medium">내용</th>
                            <th className="text-left p-3 font-medium">프로젝트</th>
                            <th className="text-right p-3 font-medium">금액</th>
                            <th className="text-left p-3 font-medium">납기일</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockOrders.map(o => (
                            <tr key={o.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                                <td className="p-3 font-mono text-xs">{o.poNo}</td>
                                <td className="p-3 font-medium">{o.vendor}</td>
                                <td className="p-3 text-neutral-600">{o.description}</td>
                                <td className="p-3 text-neutral-500">{o.project}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(o.amount)}</td>
                                <td className="p-3 text-xs text-neutral-500">{o.deliveryDate}</td>
                                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[o.status]}`}>{o.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
