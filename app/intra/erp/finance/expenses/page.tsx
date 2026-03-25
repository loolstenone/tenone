"use client";

import { useState } from "react";
import { CreditCard, Plus, Search, FileText, Check, Clock, X as XIcon } from "lucide-react";

interface Expense {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    payMethod: "법인카드" | "개인카드" | "현금";
    status: "승인" | "대기" | "반려" | "처리완료";
    submitter: string;
    receipt: boolean;
}

const mockExpenses: Expense[] = [
    { id: "1", date: "2026-03-19", category: "교통비", description: "출장 택시비", amount: 35000, payMethod: "법인카드", status: "승인", submitter: "Cheonil Jeon", receipt: true },
    { id: "2", date: "2026-03-18", category: "식비", description: "팀 회식", amount: 280000, payMethod: "법인카드", status: "처리완료", submitter: "Sarah Kim", receipt: true },
    { id: "3", date: "2026-03-17", category: "소모품", description: "사무용품 구매", amount: 45000, payMethod: "개인카드", status: "대기", submitter: "김콘텐", receipt: true },
    { id: "4", date: "2026-03-15", category: "접대비", description: "파트너사 미팅 식사", amount: 150000, payMethod: "법인카드", status: "대기", submitter: "김준호", receipt: false },
    { id: "5", date: "2026-03-14", category: "교육비", description: "외부 교육 수강료", amount: 500000, payMethod: "현금", status: "반려", submitter: "정개발", receipt: true },
];

const statusIcon: Record<string, typeof Check> = { "승인": Check, "대기": Clock, "반려": XIcon, "처리완료": Check };
const statusColor: Record<string, string> = {
    "승인": "bg-green-50 text-green-600",
    "대기": "bg-yellow-50 text-yellow-600",
    "반려": "bg-red-50 text-red-600",
    "처리완료": "bg-neutral-100 text-neutral-500",
};

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function ExpensesPage() {
    const [search, setSearch] = useState("");
    const totalPending = mockExpenses.filter(e => e.status === "대기").reduce((s, e) => s + e.amount, 0);
    const totalMonth = mockExpenses.reduce((s, e) => s + e.amount, 0);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold mb-1">경비처리</h1>
                    <p className="text-sm text-neutral-500">경비 사용 내역을 관리하고 정산합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 경비 등록
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "이번 달 총 경비", value: formatKRW(totalMonth) },
                    { label: "미처리 금액", value: formatKRW(totalPending) },
                    { label: "미처리 건수", value: `${mockExpenses.filter(e => e.status === "대기").length}건` },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400" placeholder="경비 내역 검색..." />
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">날짜</th>
                            <th className="text-left p-3 font-medium">분류</th>
                            <th className="text-left p-3 font-medium">내용</th>
                            <th className="text-right p-3 font-medium">금액</th>
                            <th className="text-center p-3 font-medium">결제수단</th>
                            <th className="text-left p-3 font-medium">신청자</th>
                            <th className="text-center p-3 font-medium">영수증</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockExpenses.map(e => (
                            <tr key={e.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 text-neutral-500">{e.date}</td>
                                <td className="p-3"><span className="text-xs px-2 py-0.5 bg-neutral-100 rounded">{e.category}</span></td>
                                <td className="p-3 font-medium">{e.description}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(e.amount)}</td>
                                <td className="p-3 text-center text-xs text-neutral-500">{e.payMethod}</td>
                                <td className="p-3 text-neutral-500">{e.submitter}</td>
                                <td className="p-3 text-center">{e.receipt ? <FileText className="h-3.5 w-3.5 text-green-500 mx-auto" /> : <span className="text-neutral-300">-</span>}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[e.status]}`}>{e.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
