"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader } from "@/components/intra/IntraUI";

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

// 카드 한도는 카드 자체 정보가 없을 때 사용하는 기본값
const DEFAULT_CARD_LIMIT = 5000000;

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

function dbRowToUsage(r: Record<string, unknown>): CardUsage {
    return {
        id: r.id as string,
        date: ((r.used_at as string) || (r.created_at as string) || "").slice(0, 10),
        merchant: (r.merchant as string) || (r.description as string) || "-",
        category: (r.category as string) || "기타",
        amount: (r.amount as number) || 0,
        cardLast4: (r.card_last4 as string) || "****",
        holder: (r.holder_name as string) || "-",
        approved: (r.status as string) === "approved" || (r.approved as boolean) || false,
    };
}

export default function CardPage() {
    const [usage, setUsage] = useState<CardUsage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const rows = await erpDb.fetchCardUsage({ limit: 50 });
                if (!cancelled) {
                    setUsage(rows.length > 0 ? rows.map((r: any) => dbRowToUsage(r as Record<string, unknown>)) : mockUsage);
                }
            } catch {
                if (!cancelled) setUsage(mockUsage);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;
    }

    // 카드별 집계 — DB 사용 내역에서 카드 목록 도출
    const cardMap = new Map<string, { last4: string; holder: string; used: number }>();
    for (const u of usage) {
        const key = u.cardLast4;
        const existing = cardMap.get(key);
        if (existing) {
            existing.used += u.amount;
        } else {
            cardMap.set(key, { last4: key, holder: u.holder, used: u.amount });
        }
    }
    const cardSummary = Array.from(cardMap.values()).map(c => ({
        ...c,
        limit: DEFAULT_CARD_LIMIT,
    }));

    return (
        <div className="space-y-6">
            <PageHeader title="법인카드 관리" description="법인카드 사용 내역을 확인하고 관리합니다.">
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 카드 신청
                </button>
            </PageHeader>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {cardSummary.map(card => (
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
                            <div className="h-1.5 bg-white rounded-full" style={{ width: `${Math.min((card.used / card.limit) * 100, 100)}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="border border-neutral-200 bg-white">
                <div className="p-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold">사용 내역</h2>
                </div>
                {usage.length === 0 ? (
                    <div className="py-12 text-center text-sm text-neutral-400">사용 내역이 없습니다</div>
                ) : (
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
                            {usage.map(u => (
                                <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3 text-neutral-500">{u.date}</td>
                                    <td className="p-3 font-medium">{u.merchant}</td>
                                    <td className="p-3"><span className="text-xs px-2 py-0.5 bg-neutral-100 rounded">{u.category}</span></td>
                                    <td className="p-3 text-right font-medium">{formatKRW(u.amount)}</td>
                                    <td className="p-3 text-center text-xs text-neutral-400">****{u.cardLast4}</td>
                                    <td className="p-3 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${u.approved ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                                            {u.approved ? "완료" : "미정산"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
