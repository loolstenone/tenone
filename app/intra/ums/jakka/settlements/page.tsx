"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, RefreshCw, ChevronDown, CheckCircle, Banknote } from "lucide-react";

interface Settlement {
    id: string;
    creator_id: string;
    month: string;
    order_count: number;
    gross_amount: number;
    commission_rate: number;
    commission_amount: number;
    net_amount: number;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_holder: string | null;
    status: "draft" | "confirmed" | "paid";
    confirmed_at: string | null;
    paid_at: string | null;
    note: string | null;
    creator: { id: string; handle: string; display_name: string; email: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
    draft: "초안",
    confirmed: "확정",
    paid: "지급 완료",
};
const STATUS_STYLE: Record<string, string> = {
    draft: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
};

function fmt(n: number) {
    return n.toLocaleString("ko-KR") + "원";
}

function getMonthOptions() {
    const opts: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return opts;
}

export default function IntraJakkaSettlementsPage() {
    const months = getMonthOptions();
    const [month, setMonth] = useState(months[1]); // 지난달 기본
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const load = useCallback(async (m: string) => {
        setLoading(true);
        setMsg(null);
        const res = await fetch(`/api/intra/jakka/settlements?month=${m}`);
        const data = await res.json();
        setSettlements(data.settlements ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { load(month); }, [load, month]);

    async function generate() {
        if (!confirm(`${month} 정산 초안을 생성할까요?\n이미 존재하는 작가는 건너뜁니다.`)) return;
        setGenerating(true);
        setMsg(null);
        const res = await fetch("/api/intra/jakka/settlements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month }),
        });
        const data = await res.json();
        if (res.ok) {
            setMsg(`✅ ${data.created}건 생성 완료 (주문 ${data.total_orders ?? 0}건 집계)`);
            load(month);
        } else {
            setMsg(`❌ ${data.error}`);
        }
        setGenerating(false);
    }

    async function changeStatus(id: string, status: string) {
        const label = STATUS_LABEL[status];
        if (!confirm(`상태를 "${label}"(으)로 변경할까요?`)) return;
        const res = await fetch("/api/intra/jakka/settlements", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        });
        if (res.ok) {
            load(month);
        } else {
            const data = await res.json();
            alert(data.error ?? "오류 발생");
        }
    }

    const totals = settlements.reduce(
        (acc, s) => ({
            gross: acc.gross + s.gross_amount,
            commission: acc.commission + s.commission_amount,
            net: acc.net + s.net_amount,
        }),
        { gross: 0, commission: 0, net: 0 },
    );

    return (
        <div className="min-h-screen bg-neutral-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* 헤더 */}
                <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-5 h-5 text-neutral-900" />
                    <h1 className="text-[20px] font-black text-neutral-900">Jakka 정산 관리</h1>
                </div>
                <p className="text-[12px] text-neutral-600 mb-6">월별 작가 정산 내역 · 상태 관리</p>

                {/* 컨트롤 */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative">
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 text-[13px] border border-neutral-200 rounded-lg bg-white focus:outline-none"
                        >
                            {months.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => load(month)}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-2 text-[13px] border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        새로고침
                    </button>

                    <button
                        onClick={generate}
                        disabled={generating}
                        className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50"
                    >
                        <Banknote className="w-3.5 h-3.5" />
                        {generating ? "생성 중…" : `${month} 정산 생성`}
                    </button>

                    {msg && (
                        <span className="text-[12px] text-neutral-600">{msg}</span>
                    )}
                </div>

                {/* 요약 카드 */}
                {settlements.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { label: "총 매출", value: fmt(totals.gross), sub: `${settlements.length}명` },
                            { label: "플랫폼 수수료", value: fmt(totals.commission), sub: "15% 평균" },
                            { label: "작가 정산 합계", value: fmt(totals.net), sub: "이체 예정" },
                        ].map((c) => (
                            <div key={c.label} className="bg-white border border-neutral-200 rounded-xl p-4">
                                <p className="text-[11px] text-neutral-500 mb-1">{c.label}</p>
                                <p className="text-[20px] font-black text-neutral-900">{c.value}</p>
                                <p className="text-[11px] text-neutral-400 mt-0.5">{c.sub}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* 테이블 */}
                {loading ? (
                    <div className="text-center py-20 text-[13px] text-neutral-400">불러오는 중…</div>
                ) : settlements.length === 0 ? (
                    <div className="text-center py-20 text-[13px] text-neutral-400">
                        {month} 정산 내역이 없습니다.<br />
                        <span className="text-[12px]">위 "정산 생성" 버튼으로 completed 주문을 집계하세요.</span>
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left px-4 py-3 font-semibold text-neutral-600">작가</th>
                                    <th className="text-right px-4 py-3 font-semibold text-neutral-600">주문</th>
                                    <th className="text-right px-4 py-3 font-semibold text-neutral-600">매출</th>
                                    <th className="text-right px-4 py-3 font-semibold text-neutral-600">수수료</th>
                                    <th className="text-right px-4 py-3 font-semibold text-neutral-900">정산금</th>
                                    <th className="text-left px-4 py-3 font-semibold text-neutral-600">계좌</th>
                                    <th className="text-center px-4 py-3 font-semibold text-neutral-600">상태</th>
                                    <th className="text-center px-4 py-3 font-semibold text-neutral-600">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settlements.map((s) => {
                                    const creator = Array.isArray(s.creator) ? s.creator[0] : s.creator;
                                    return (
                                        <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-neutral-900">{creator?.display_name ?? "-"}</p>
                                                <p className="text-[11px] text-neutral-400">@{creator?.handle}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right text-neutral-700">{s.order_count}건</td>
                                            <td className="px-4 py-3 text-right text-neutral-700">{fmt(s.gross_amount)}</td>
                                            <td className="px-4 py-3 text-right text-neutral-500">
                                                {fmt(s.commission_amount)}
                                                <span className="text-[10px] ml-1 text-neutral-400">({s.commission_rate}%)</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-neutral-900">{fmt(s.net_amount)}</td>
                                            <td className="px-4 py-3">
                                                {s.bank_name ? (
                                                    <div>
                                                        <p className="text-[12px] text-neutral-700">{s.bank_name} {s.bank_account_number}</p>
                                                        <p className="text-[11px] text-neutral-400">{s.bank_account_holder}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-neutral-300">정보 없음</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLE[s.status]}`}>
                                                    {STATUS_LABEL[s.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {s.status === "draft" && (
                                                    <button
                                                        onClick={() => changeStatus(s.id, "confirmed")}
                                                        className="flex items-center gap-1 mx-auto px-2.5 py-1 text-[11px] font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        <CheckCircle className="w-3 h-3" /> 확정
                                                    </button>
                                                )}
                                                {s.status === "confirmed" && (
                                                    <button
                                                        onClick={() => changeStatus(s.id, "paid")}
                                                        className="flex items-center gap-1 mx-auto px-2.5 py-1 text-[11px] font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                    >
                                                        <Banknote className="w-3 h-3" /> 지급 완료
                                                    </button>
                                                )}
                                                {s.status === "paid" && (
                                                    <span className="text-[11px] text-neutral-400">
                                                        {s.paid_at ? new Date(s.paid_at).toLocaleDateString("ko-KR") : "완료"}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
