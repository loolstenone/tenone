"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";
import { Search, Loader2, ChevronDown, ChevronUp, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, X, Check } from "lucide-react";

interface UCTransaction {
    id: string;
    member_id: string;
    type: "earn" | "redeem";
    amount: number;
    action_key: string;
    brand_id: string | null;
    note: string | null;
    reference_id: string | null;
    created_at: string;
    member_name: string;
    member_email: string;
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
    first_purchase: "첫 구매",
    service_onboard: "서비스 가입",
    project_complete: "프로젝트 완료",
    job_complete: "Job 완료",
    education_complete: "교육 이수",
    gpr_evaluation: "GPR 평가",
    community_activity: "커뮤니티 활동",
    attendance_bonus: "근태 우수",
    mentor_bonus: "멘토링",
    event_participation: "이벤트 참여",
    admin_grant: "관리자 지급",
    admin_deduct: "관리자 차감",
    redeem: "UC 사용",
    redeem_restore: "사용 취소 환급",
};

type SortCol = "created_at" | "amount";

interface EditState {
    id: string;
    amount: number;
    note: string;
}

export default function UCTransactionsPage() {
    const [rows, setRows] = useState<UCTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "earn" | "redeem">("all");
    const [actionFilter, setActionFilter] = useState("");
    const [sortBy, setSortBy] = useState<SortCol>("created_at");
    const [sortAsc, setSortAsc] = useState(false);
    const [total, setTotal] = useState(0);
    const PAGE = 50;
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // 수정/삭제 상태
    const [editRow, setEditRow] = useState<EditState | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // transaction id

    const load = useCallback(async (reset = true) => {
        if (reset) setLoading(true);
        else setLoadingMore(true);

        const supabase = createClient();
        const currentOffset = reset ? 0 : offset;

        let query = supabase
            .from("uc_transactions")
            .select("id, member_id, type, amount, action_key, brand_id, note, reference_id, created_at, members!inner(name, email)", { count: "exact" })
            .order(sortBy, { ascending: sortAsc })
            .range(currentOffset, currentOffset + PAGE - 1);

        if (typeFilter !== "all") query = query.eq("type", typeFilter);
        if (actionFilter) query = query.eq("action_key", actionFilter);

        const { data, count } = await query;

        if (data) {
            const mapped = data.map((r: Record<string, unknown>) => {
                const m = r.members as { name: string; email: string } | null;
                return {
                    id: r.id as string,
                    member_id: r.member_id as string,
                    type: r.type as "earn" | "redeem",
                    amount: r.amount as number,
                    action_key: r.action_key as string,
                    brand_id: r.brand_id as string | null,
                    note: r.note as string | null,
                    reference_id: r.reference_id as string | null,
                    created_at: r.created_at as string,
                    member_name: m?.name ?? "—",
                    member_email: m?.email ?? "—",
                };
            });

            if (reset) {
                setRows(mapped);
                setOffset(PAGE);
            } else {
                setRows(prev => [...prev, ...mapped]);
                setOffset(prev => prev + PAGE);
            }
            setHasMore(mapped.length === PAGE);
            setTotal(count ?? 0);
        }

        if (reset) setLoading(false);
        else setLoadingMore(false);
    }, [sortBy, sortAsc, typeFilter, actionFilter, offset]);

    useEffect(() => { load(true); }, [sortBy, sortAsc, typeFilter, actionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    async function getToken() {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token ?? "";
    }

    async function handleEdit(row: UCTransaction) {
        setEditRow({ id: row.id, amount: row.amount, note: row.note ?? "" });
    }

    async function submitEdit() {
        if (!editRow) return;
        setActionLoading(editRow.id);
        try {
            const res = await fetch("/api/uc/admin/transaction", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getToken()}` },
                body: JSON.stringify({ transaction_id: editRow.id, amount: editRow.amount, note: editRow.note || null }),
            });
            if (res.ok) { setEditRow(null); load(true); }
        } finally {
            setActionLoading(null);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("이 거래를 삭제하시겠습니까? 잔액이 자동으로 조정됩니다.")) return;
        setActionLoading(id);
        try {
            const res = await fetch("/api/uc/admin/transaction", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getToken()}` },
                body: JSON.stringify({ transaction_id: id }),
            });
            if (res.ok) load(true);
        } finally {
            setActionLoading(null);
        }
    }

    const filtered = rows.filter(r =>
        !search || r.member_name.includes(search) || r.member_email.includes(search)
    );

    function toggleSort(col: SortCol) {
        if (sortBy === col) setSortAsc(p => !p);
        else { setSortBy(col); setSortAsc(false); }
    }

    const SortIcon = ({ col }: { col: SortCol }) =>
        sortBy === col
            ? sortAsc ? <ChevronUp className="h-3 w-3 inline ml-0.5" /> : <ChevronDown className="h-3 w-3 inline ml-0.5" />
            : null;

    function formatDate(iso: string) {
        return new Date(iso).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    return (
        <div className="p-6 max-w-6xl">
            <PageHeader title="UC 거래 내역" description="전체 회원 UC 적립·사용 트랜잭션 로그" />

            {/* 필터 */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="이름 또는 이메일 검색"
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value as "all" | "earn" | "redeem")}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                    <option value="all">전체 유형</option>
                    <option value="earn">적립</option>
                    <option value="redeem">사용</option>
                </select>
                <select
                    value={actionFilter}
                    onChange={e => setActionFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                    <option value="">전체 액션</option>
                    {Object.entries(ACTION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <span className="self-center text-xs text-gray-400">총 {total.toLocaleString()}건</span>
            </div>

            {/* 테이블 */}
            <div className="tn-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">회원</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">액션</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">브랜드</th>
                            <th
                                className="text-right px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                                onClick={() => toggleSort("amount")}
                            >
                                수량 <SortIcon col="amount" />
                            </th>
                            <th
                                className="text-right px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                                onClick={() => toggleSort("created_at")}
                            >
                                일시 <SortIcon col="created_at" />
                            </th>
                            <th className="px-4 py-3 w-20" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-12">
                                <Loader2 className="h-5 w-5 animate-spin text-gray-300 mx-auto" />
                            </td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">결과 없음</td></tr>
                        ) : filtered.map(r => (
                            <tr key={r.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-800">{r.member_name}</p>
                                    <p className="text-xs text-gray-400">{r.member_email}</p>
                                </td>
                                <td className="px-4 py-3">
                                    {editRow?.id === r.id ? (
                                        <input
                                            value={editRow.note}
                                            onChange={e => setEditRow(p => p ? { ...p, note: e.target.value } : p)}
                                            placeholder="메모"
                                            className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:outline-none"
                                        />
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-1.5">
                                                {r.type === "earn"
                                                    ? <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                                    : <ArrowDownCircle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                                                }
                                                <span className="text-gray-700">{ACTION_LABELS[r.action_key] ?? r.action_key}</span>
                                            </div>
                                            {r.note && <p className="text-xs text-gray-400 mt-0.5 pl-5">{r.note}</p>}
                                        </>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-sm">{r.brand_id ?? "—"}</td>
                                <td className="px-4 py-3 text-right">
                                    {editRow?.id === r.id ? (
                                        <input
                                            type="number"
                                            min={1}
                                            value={editRow.amount}
                                            onChange={e => setEditRow(p => p ? { ...p, amount: parseInt(e.target.value) || 0 } : p)}
                                            className="w-20 px-2 py-1 text-xs text-right border border-amber-300 rounded focus:outline-none"
                                        />
                                    ) : (
                                        <span className={`font-semibold ${r.type === "earn" ? "text-emerald-600" : "text-rose-500"}`}>
                                            {r.type === "earn" ? "+" : "-"}{r.amount.toLocaleString()} UC
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-400 whitespace-nowrap">
                                    {formatDate(r.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    {editRow?.id === r.id ? (
                                        <div className="flex gap-1 justify-end">
                                            <button
                                                onClick={submitEdit}
                                                disabled={actionLoading === r.id}
                                                className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                                            >
                                                {actionLoading === r.id
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    : <Check className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => setEditRow(null)}
                                                className="p-1.5 rounded text-gray-400 hover:bg-gray-100 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(r)}
                                                className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                title="수정"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                disabled={actionLoading === r.id}
                                                className="p-1.5 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                title="삭제"
                                            >
                                                {actionLoading === r.id
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    : <Trash2 className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hasMore && !loading && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => load(false)}
                        disabled={loadingMore}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "더 보기"}
                    </button>
                </div>
            )}
        </div>
    );
}
