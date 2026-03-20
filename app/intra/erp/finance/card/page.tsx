"use client";

import { CreditCard, Plus, Search } from "lucide-react";

interface CardUsage {
    id: string;
    date: string;
    merchant: string;
    category: string;
    amount: number;
    cardLast4: string;
    holder: string;
    approved: boolean;
}

const mockUsage: CardUsage[] = [
    { id: "1", date: "2026-03-19", merchant: "스타벅스 강남점", category: "식비", amount: 12500, cardLast4: "1234", holder: "Cheonil Jeon", approved: true },
    { id: "2", date: "2026-03-18", merchant: "대한항공", category: "교통비", amount: 350000, cardLast4: "1234", holder: "Cheonil Jeon", approved: true },
    { id: "3", date: "2026-03-18", merchant: "호텔 부산", category: "출장숙박", amount: 180000, cardLast4: "1234", holder: "Cheonil Jeon", approved: true },
    { id: "4", date: "2026-03-17", merchant: "교보문고", category: "도서구입", amount: 45000, cardLast4: "5678", holder: "Sarah Kim", approved: true },
    { id: "5", date: "2026-03-16", merchant: "쿠팡", category: "소모품", amount: 89000, cardLast4: "5678", holder: "Sarah Kim", approved: false },
];

const cards = [
    { last4: "1234", holder: "Cheonil Jeon", limit: 5000000, used: 1200000 },
    { last4: "5678", holder: "Sarah Kim", limit: 3000000, used: 800000 },
];

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function CardPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">법인카드 관리</h1>
                    <p className="text-sm text-neutral-500">법인카드 사용 내역을 확인하고 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 카드 신청
                </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {cards.map(card => (
                    <div key={card.last4} className="bg-neutral-900 text-white p-5 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <CreditCard className="h-6 w-6 text-neutral-400" />
                            <span className="text-xs text-neutral-400">TEN:ONE Corp</span>
                        </div>
                        <p className="text-lg font-mono tracking-wider mb-1">•••• •••• •••• {card.last4}</p>
                        <p className="text-xs text-neutral-400 mb-3">{card.holder}</p>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">사용: {formatKRW(card.used)}</span>
                            <span className="text-neutral-500">한도: {formatKRW(card.limit)}</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-neutral-700 rounded-full">
                            <div className="h-1.5 bg-white rounded-full" style={{ width: `${(card.used / card.limit) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Usage table */}
            <div className="border border-neutral-200 bg-white">
                <div className="p-4 border-b border-neutral-100">
                    <h2 className="text-sm font-bold">사용 내역</h2>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">날짜</th>
                            <th className="text-left p-3 font-medium">가맹점</th>
                            <th className="text-left p-3 font-medium">분류</th>
                            <th className="text-right p-3 font-medium">금액</th>
                            <th className="text-center p-3 font-medium">카드</th>
                            <th className="text-center p-3 font-medium">정산</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockUsage.map(u => (
                            <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 text-neutral-500">{u.date}</td>
                                <td className="p-3 font-medium">{u.merchant}</td>
                                <td className="p-3"><span className="text-[10px] px-2 py-0.5 bg-neutral-100 rounded">{u.category}</span></td>
                                <td className="p-3 text-right font-medium">{formatKRW(u.amount)}</td>
                                <td className="p-3 text-center text-xs text-neutral-400">****{u.cardLast4}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${u.approved ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                                        {u.approved ? "완료" : "미정산"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
