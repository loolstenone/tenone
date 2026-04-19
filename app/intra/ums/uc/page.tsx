"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";
import { Search, Coins, TrendingUp, Gift, Loader2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

interface UCMember {
    member_id: string;
    balance: number;
    lifetime_earned: number;
    name: string;
    email: string;
}

interface GrantForm {
    memberId: string;
    actionKey: string;
    amount: number;
    brandId: string;
    note: string;
}

const ACTION_LABELS: Record<string, string> = {
    signup_complete: "회원가입 완료",
    profile_complete: "프로필 완성",
    profile_advanced: "고급 프로필",
    refer_join: "친구 초대",
    write_post: "게시글 작성",
    write_comment: "댓글 작성",
    write_review: "리뷰 작성",
    submit_story: "스토리 제출",
    create_group: "모임 개설",
    join_group: "모임 참여",
    admin_grant: "관리자 지급",
    admin_deduct: "관리자 차감",
    redeem: "UC 사용",
    redeem_restore: "사용 취소 환급",
};

export default function UCBalancesPage() {
    const [members, setMembers] = useState<UCMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"balance" | "lifetime_earned">("balance");
    const [sortAsc, setSortAsc] = useState(false);
    const [totalBalance, setTotalBalance] = useState(0);
    const [totalLifetime, setTotalLifetime] = useState(0);

    // 지급/차감 모달
    const [showGrant, setShowGrant] = useState(false);
    const [grantForm, setGrantForm] = useState<GrantForm>({ memberId: "", actionKey: "admin_grant", amount: 0, brandId: "", note: "" });
    const [grantLoading, setGrantLoading] = useState(false);
    const [grantResult, setGrantResult] = useState<string | null>(null);

    // 미지급 UC 일괄 지급
    const [backfillLoading, setBackfillLoading] = useState(false);
    const [backfillResult, setBackfillResult] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();
        const { data } = await supabase
            .from("uc_balances")
            .select("member_id, balance, lifetime_earned, members!inner(name, email)")
            .order(sortBy, { ascending: sortAsc });

        if (data) {
            const rows = data.map((r: Record<string, unknown>) => {
                const m = r.members as { name: string; email: string } | null;
                return {
                    member_id: r.member_id as string,
                    balance: r.balance as number,
                    lifetime_earned: r.lifetime_earned as number,
                    name: m?.name ?? "—",
                    email: m?.email ?? "—",
                };
            });
            setMembers(rows);
            setTotalBalance(rows.reduce((s: number, r: UCMember) => s + r.balance, 0));
            setTotalLifetime(rows.reduce((s: number, r: UCMember) => s + r.lifetime_earned, 0));
        }
        setLoading(false);
    }, [sortBy, sortAsc]);

    useEffect(() => { load(); }, [load]);

    const filtered = members.filter(m =>
        m.name.includes(search) || m.email.includes(search)
    );

    function toggleSort(col: "balance" | "lifetime_earned") {
        if (sortBy === col) setSortAsc(p => !p);
        else { setSortBy(col); setSortAsc(false); }
    }

    async function handleGrant() {
        if (!grantForm.memberId || !grantForm.amount) return;
        setGrantLoading(true);
        setGrantResult(null);
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/uc/admin/grant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    member_id: grantForm.memberId,
                    action_key: grantForm.actionKey,
                    amount: grantForm.amount,
                    brand_id: grantForm.brandId || null,
                    note: grantForm.note || null,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                setGrantResult("완료");
                load();
                setTimeout(() => { setShowGrant(false); setGrantResult(null); }, 1200);
            } else {
                setGrantResult(`오류: ${result.error}`);
            }
        } finally {
            setGrantLoading(false);
        }
    }

    async function handleBackfill() {
        setBackfillLoading(true);
        setBackfillResult(null);
        try {
            const res = await fetch("/api/uc/admin/backfill", { method: "POST" });
            const result = await res.json();
            if (res.ok) {
                if (result.granted === 0) {
                    setBackfillResult("지급 대상 없음");
                } else {
                    setBackfillResult(`${result.granted}명에게 ${result.amount?.toLocaleString()} UC 지급 완료`);
                    load();
                }
            } else {
                setBackfillResult(`오류: ${result.error}`);
            }
        } finally {
            setBackfillLoading(false);
            setTimeout(() => setBackfillResult(null), 4000);
        }
    }

    const SortIcon = ({ col }: { col: "balance" | "lifetime_earned" }) =>
        sortBy === col
            ? sortAsc ? <ChevronUp className="h-3 w-3 inline ml-0.5" /> : <ChevronDown className="h-3 w-3 inline ml-0.5" />
            : null;

    return (
        <div className="p-6 max-w-5xl">
            <PageHeader title="Universe Coin 잔액" description="전체 회원 UC 보유 현황 및 수동 지급/차감">
                <div className="flex items-center gap-2">
                    {backfillResult && (
                        <span className="text-xs text-emerald-600 font-medium">{backfillResult}</span>
                    )}
                    <button
                        onClick={handleBackfill}
                        disabled={backfillLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {backfillLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        미지급 일괄 지급
                    </button>
                    <button
                        onClick={() => setShowGrant(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Gift className="h-4 w-4" /> 수동 지급/차감
                    </button>
                </div>
            </PageHeader>

            {/* 요약 통계 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="tn-card p-4">
                    <div className="flex items-center gap-2 mb-1 text-amber-600">
                        <Coins className="h-4 w-4" />
                        <span className="text-xs font-medium">총 유통 UC</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">회원 보유 합산</p>
                </div>
                <div className="tn-card p-4">
                    <div className="flex items-center gap-2 mb-1 text-emerald-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">누적 발행</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalLifetime.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">전체 적립 합산</p>
                </div>
                <div className="tn-card p-4">
                    <div className="flex items-center gap-2 mb-1 text-blue-600">
                        <Coins className="h-4 w-4" />
                        <span className="text-xs font-medium">회원 수</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{members.length.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">UC 보유 회원</p>
                </div>
            </div>

            {/* 검색 */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="이름 또는 이메일 검색"
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
            </div>

            {/* 테이블 */}
            <div className="tn-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">회원</th>
                            <th
                                className="text-right px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                                onClick={() => toggleSort("balance")}
                            >
                                보유 UC <SortIcon col="balance" />
                            </th>
                            <th
                                className="text-right px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                                onClick={() => toggleSort("lifetime_earned")}
                            >
                                누적 적립 <SortIcon col="lifetime_earned" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-300 mx-auto" /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={3} className="text-center py-10 text-gray-400 text-sm">결과 없음</td></tr>
                        ) : filtered.map(m => (
                            <tr key={m.member_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-800">{m.name}</p>
                                    <p className="text-xs text-gray-400">{m.email}</p>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-semibold text-amber-600">{m.balance.toLocaleString()} UC</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-gray-600">{m.lifetime_earned.toLocaleString()} UC</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 수동 지급/차감 모달 */}
            {showGrant && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">UC 수동 지급 / 차감</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">회원 ID</label>
                                <input
                                    placeholder="members.id (UUID)"
                                    value={grantForm.memberId}
                                    onChange={e => setGrantForm(p => ({ ...p, memberId: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">종류</label>
                                <select
                                    value={grantForm.actionKey}
                                    onChange={e => setGrantForm(p => ({ ...p, actionKey: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                >
                                    <option value="admin_grant">관리자 지급</option>
                                    <option value="admin_deduct">관리자 차감</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">UC 수량</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={grantForm.amount || ""}
                                    onChange={e => setGrantForm(p => ({ ...p, amount: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">브랜드 (선택)</label>
                                <input
                                    placeholder="badak, wio, ..."
                                    value={grantForm.brandId}
                                    onChange={e => setGrantForm(p => ({ ...p, brandId: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">메모 (선택)</label>
                                <input
                                    placeholder="이벤트 당첨, 오류 보상 등"
                                    value={grantForm.note}
                                    onChange={e => setGrantForm(p => ({ ...p, note: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>
                        </div>
                        {grantResult && (
                            <p className={`mt-3 text-sm text-center font-medium ${grantResult === "완료" ? "text-emerald-600" : "text-rose-500"}`}>
                                {grantResult}
                            </p>
                        )}
                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => { setShowGrant(false); setGrantResult(null); }}
                                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleGrant}
                                disabled={grantLoading || !grantForm.memberId || !grantForm.amount}
                                className="flex-1 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {grantLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "실행"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

void ACTION_LABELS;
