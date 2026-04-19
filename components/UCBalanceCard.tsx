"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Coins, TrendingUp, ChevronDown } from "lucide-react";

interface UCTransaction {
    id: string;
    action_key: string;
    brand_id: string | null;
    amount: number;
    type: "earn" | "redeem";
    created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
    signup_complete: "회원가입 완료",
    profile_complete: "프로필 완성",
    profile_advanced: "고급 프로필 완성",
    refer_join: "친구 초대",
    write_post: "게시글 작성",
    write_comment: "댓글 작성",
    write_review: "리뷰 작성",
    submit_story: "스토리 제출",
    create_group: "모임 개설",
    join_group: "모임 참여",
    first_purchase: "첫 구매",
    service_onboard: "서비스 가입",
    redeem: "UC 사용",
    redeem_restore: "사용 취소 환급",
};

const BRAND_LABELS: Record<string, string> = {
    badak: "Badak",
    madleague: "MADLeague",
    madleap: "MADLeap",
    hero: "HeRo",
    tenone: "TenOne",
};

function formatAmount(amount: number, type: "earn" | "redeem") {
    const sign = type === "earn" ? "+" : "-";
    return `${sign}${amount.toLocaleString()} UC`;
}

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export function UCBalanceCard() {
    const [balance, setBalance] = useState(0);
    const [lifetimeEarned, setLifetimeEarned] = useState(0);
    const [transactions, setTransactions] = useState<UCTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const LIMIT = 10;

    useEffect(() => {
        (async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { setLoading(false); return; }

            const token = session.access_token;
            const headers = { Authorization: `Bearer ${token}` };

            const [balRes, txRes] = await Promise.all([
                fetch("/api/uc/balance", { headers }),
                fetch(`/api/uc/transactions?limit=${LIMIT}&offset=0`, { headers }),
            ]);

            if (balRes.ok) {
                const b = await balRes.json();
                setBalance(b.balance ?? 0);
                setLifetimeEarned(b.lifetime_earned ?? 0);
            }
            if (txRes.ok) {
                const t = await txRes.json();
                const list = t.transactions ?? [];
                setTransactions(list);
                setHasMore(list.length === LIMIT);
                setOffset(LIMIT);
            }
            setLoading(false);
        })();
    }, []);

    async function loadMore() {
        setLoadingMore(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoadingMore(false); return; }

        const res = await fetch(`/api/uc/transactions?limit=${LIMIT}&offset=${offset}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
            const t = await res.json();
            const list = t.transactions ?? [];
            setTransactions(prev => [...prev, ...list]);
            setHasMore(list.length === LIMIT);
            setOffset(prev => prev + LIMIT);
        }
        setLoadingMore(false);
    }

    if (loading) {
        return (
            <div className="tn-card p-5 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-8 bg-gray-200 rounded w-36" />
                <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
        );
    }

    return (
        <div className="tn-card overflow-hidden">
            {/* 잔액 헤더 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 border-b border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                    <Coins className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Universe Coin</span>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{balance.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-0.5">UC 보유</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-sm font-medium">{lifetimeEarned.toLocaleString()} UC</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">누적 적립</p>
                    </div>
                </div>
                <p className="text-xs text-amber-600/80 mt-3">1 UC = 1원 · 결제 금액의 최대 10% 사용 가능</p>
            </div>

            {/* 거래 내역 */}
            <div className="p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">적립·사용 내역</p>
                {transactions.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">아직 내역이 없어요</p>
                ) : (
                    <ul className="space-y-2.5">
                        {transactions.map(tx => (
                            <li key={tx.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tx.type === "earn" ? "bg-emerald-400" : "bg-rose-400"}`} />
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-800 truncate">
                                            {ACTION_LABELS[tx.action_key] ?? tx.action_key}
                                        </p>
                                        {tx.brand_id && (
                                            <p className="text-xs text-gray-400">{BRAND_LABELS[tx.brand_id] ?? tx.brand_id}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-3">
                                    <p className={`text-sm font-semibold ${tx.type === "earn" ? "text-emerald-600" : "text-rose-500"}`}>
                                        {formatAmount(tx.amount, tx.type)}
                                    </p>
                                    <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {hasMore && (
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-1.5 transition-colors"
                    >
                        {loadingMore ? "불러오는 중..." : (<><ChevronDown className="h-4 w-4" /> 더 보기</>)}
                    </button>
                )}
            </div>
        </div>
    );
}
