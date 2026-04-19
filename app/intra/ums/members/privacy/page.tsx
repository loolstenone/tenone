"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, CheckCircle, Clock, AlertTriangle, Trash2, Users, Loader2, Plus, X, ChevronRight, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";

/* ── 타입 ── */
interface DeletionRequest {
    id: string;
    name: string;
    email: string | null;
    member_id: string | null;
    type: "member" | "guest";
    reason: string | null;
    status: "pending" | "processing" | "completed" | "rejected";
    requested_at: string;
    deadline_at: string;
    completed_at: string | null;
    completed_by: string | null;
    note: string | null;
}

interface Stats {
    marketingRate: string;
    totalMembers: number;
    pendingCount: number;
    completedCount: number;
    overdueCount: number;
}

/* ── D-day 계산 ── */
function calcDday(deadline: string): { label: string; color: string; urgent: boolean } {
    const now = new Date();
    const due = new Date(deadline);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: `D+${Math.abs(diff)}`, color: "text-red-600 font-bold", urgent: true };
    if (diff === 0) return { label: "D-Day", color: "text-red-600 font-bold", urgent: true };
    if (diff <= 7) return { label: `D-${diff}`, color: "text-amber-600 font-semibold", urgent: true };
    return { label: `D-${diff}`, color: "text-neutral-400", urgent: false };
}

/* ── 상태 배지 ── */
function StatusBadge({ status }: { status: DeletionRequest["status"] }) {
    const map = {
        pending:    { label: "대기", cls: "bg-amber-100 text-amber-700" },
        processing: { label: "처리중", cls: "bg-blue-100 text-blue-700" },
        completed:  { label: "완료", cls: "bg-green-100 text-green-700" },
        rejected:   { label: "거부", cls: "bg-neutral-100 text-neutral-500" },
    };
    const { label, cls } = map[status];
    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

/* ── 컴플라이언스 항목 ── */
const COMPLIANCE_ITEMS = [
    { label: "개인정보 처리방침 고지", done: true, link: "/intra/ums/privacy-policy" },
    { label: "수집 목적 및 항목 명시", done: true, link: null },
    { label: "제3자 제공 동의 절차", done: true, link: null },
    { label: "마케팅 수신 동의 분리", done: true, link: null },
    { label: "게스트 자동삭제 (30일)", done: true, link: null },
    { label: "삭제 요청 처리 (30일 이내)", done: true, link: null },
    { label: "접근 권한 최소화 (RLS 전면 적용)", done: true, link: null },
    { label: "개인정보 암호화 저장", done: true, link: null },
];

/* ── 신규 요청 폼 기본값 ── */
interface FormState { name: string; email: string; type: "member" | "guest"; reason: string; }
const EMPTY_FORM: FormState = { name: "", email: "", type: "member", reason: "" };

export default function PrivacyPage() {
    const [requests, setRequests] = useState<DeletionRequest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<"all" | DeletionRequest["status"]>("all");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [formLoading, setFormLoading] = useState(false);
    const [noteModal, setNoteModal] = useState<{ id: string; note: string } | null>(null);

    async function getToken() {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token ?? "";
    }

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const supabase = createClient();

            // 통계는 service role API 경유 (RLS 우회)
            const [membersApiRes, requestsRes] = await Promise.all([
                fetch('/api/intra/members'),
                supabase.from("privacy_deletion_requests")
                    .select("*")
                    .order("deadline_at", { ascending: true }),
            ]);

            const membersJson = membersApiRes.ok ? await membersApiRes.json() : {};
            const totalMembers: number = membersJson.totalMembersCount ?? 0;
            const newsletterCount: number = membersJson.newsletterCount ?? 0;

            // 마케팅 동의율: newsletter_subscribers / members
            const marketingRate = totalMembers > 0
                ? ((newsletterCount / totalMembers) * 100).toFixed(1)
                : "0";

            const reqs = (requestsRes.data ?? []) as DeletionRequest[];
            const now = new Date();

            setRequests(reqs);
            setStats({
                marketingRate: `${marketingRate}%`,
                totalMembers,
                pendingCount: reqs.filter(r => r.status === "pending" || r.status === "processing").length,
                completedCount: reqs.filter(r => r.status === "completed").length,
                overdueCount: reqs.filter(r =>
                    (r.status === "pending" || r.status === "processing") &&
                    new Date(r.deadline_at) < now
                ).length,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    async function updateStatus(id: string, status: DeletionRequest["status"], note?: string) {
        setActionLoading(id);
        const supabase = createClient();
        const updates: Record<string, unknown> = { status };
        if (status === "completed" || status === "rejected") {
            updates.completed_at = new Date().toISOString();
            const { data: { user } } = await supabase.auth.getUser();
            updates.completed_by = user?.email ?? "staff";
        }
        if (note !== undefined) updates.note = note;
        await supabase.from("privacy_deletion_requests").update(updates).eq("id", id);
        setActionLoading(null);
        setNoteModal(null);
        loadData();
    }

    async function submitRequest() {
        if (!form.name) return;
        setFormLoading(true);
        const supabase = createClient();
        await supabase.from("privacy_deletion_requests").insert({
            name: form.name,
            email: form.email || null,
            type: form.type,
            reason: form.reason || null,
        });
        setFormLoading(false);
        setShowForm(false);
        setForm(EMPTY_FORM);
        loadData();
    }

    const filtered = requests.filter(r => statusFilter === "all" || r.status === statusFilter);
    const activeRequests = requests.filter(r => r.status === "pending" || r.status === "processing");
    const overdueList = activeRequests.filter(r => new Date(r.deadline_at) < new Date());

    return (
        <div className="space-y-6">
            <PageHeader title="유니버스 개인정보 관리" description="삭제 요청 처리 및 개인정보보호법 컴플라이언스">
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" /> 삭제 요청 등록
                </button>
            </PageHeader>

            {/* 통계 카드 */}
            {loading ? (
                <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <Users className="h-4 w-4 text-blue-500 mb-2" />
                        <p className="text-xl font-bold text-blue-600">{stats?.marketingRate}</p>
                        <p className="text-[11px] text-neutral-500">마케팅 수신 동의율</p>
                        <p className="text-[10px] text-neutral-300 mt-0.5">뉴스레터 구독자 / 전체</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <Shield className="h-4 w-4 text-green-500 mb-2" />
                        <p className="text-xl font-bold text-green-600">100%</p>
                        <p className="text-[11px] text-neutral-500">개인정보 처리 동의</p>
                        <p className="text-[10px] text-neutral-300 mt-0.5">가입 시 필수 동의</p>
                    </div>
                    <div className={`bg-white border rounded-lg p-4 ${stats?.overdueCount ? "border-red-200" : "border-neutral-200"}`}>
                        <Clock className={`h-4 w-4 mb-2 ${stats?.overdueCount ? "text-red-500" : "text-amber-500"}`} />
                        <p className={`text-xl font-bold ${stats?.overdueCount ? "text-red-600" : "text-amber-600"}`}>
                            {stats?.pendingCount ?? 0}건
                            {!!stats?.overdueCount && <span className="text-sm ml-1">({stats.overdueCount} 기한초과)</span>}
                        </p>
                        <p className="text-[11px] text-neutral-500">처리 대기 중</p>
                        <p className="text-[10px] text-neutral-300 mt-0.5">법정 기한 30일</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <CheckCircle className="h-4 w-4 text-neutral-400 mb-2" />
                        <p className="text-xl font-bold text-neutral-700">{stats?.completedCount ?? 0}건</p>
                        <p className="text-[11px] text-neutral-500">처리 완료</p>
                        <p className="text-[10px] text-neutral-300 mt-0.5">누적 완료 건수</p>
                    </div>
                </div>
            )}

            {/* 기한 초과 알림 */}
            {overdueList.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-red-700">법정 기한 초과 {overdueList.length}건</p>
                        <p className="text-xs text-red-500 mt-0.5">
                            {overdueList.map(r => r.name).join(", ")} — 개인정보보호법 제36조 위반 위험
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 삭제 요청 목록 */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-neutral-900">삭제 요청 목록</h2>
                        <div className="flex gap-1">
                            {(["all", "pending", "processing", "completed", "rejected"] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                                        statusFilter === s
                                            ? "bg-neutral-900 text-white"
                                            : "text-neutral-500 hover:bg-neutral-100"
                                    }`}
                                >
                                    {s === "all" ? "전체" : s === "pending" ? "대기" : s === "processing" ? "처리중" : s === "completed" ? "완료" : "거부"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <p className="text-center py-10 text-sm text-neutral-400">요청 없음</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50">
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">요청자</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">유형</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 text-center">D-day</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">상태</th>
                                        <th className="px-4 py-3 w-28" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {filtered.map(r => {
                                        const dday = calcDday(r.deadline_at);
                                        const isActive = r.status === "pending" || r.status === "processing";
                                        return (
                                            <tr key={r.id} className={`hover:bg-neutral-50 transition-colors ${dday.urgent && isActive ? "bg-red-50/30" : ""}`}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-neutral-900">{r.name}</p>
                                                    {r.email && <p className="text-[10px] text-neutral-400">{r.email}</p>}
                                                    {r.reason && <p className="text-[10px] text-neutral-300">{r.reason}</p>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                        r.type === "member" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                                                    }`}>
                                                        {r.type === "member" ? "회원" : "게스트"}
                                                    </span>
                                                </td>
                                                <td className={`px-4 py-3 text-xs text-center ${dday.color}`}>
                                                    {r.status === "completed" || r.status === "rejected"
                                                        ? <span className="text-neutral-300">—</span>
                                                        : dday.label
                                                    }
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={r.status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    {actionLoading === r.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400 mx-auto" />
                                                    ) : r.status === "pending" ? (
                                                        <div className="flex gap-1 justify-end">
                                                            <button
                                                                onClick={() => updateStatus(r.id, "processing")}
                                                                className="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                            >처리 시작</button>
                                                            <button
                                                                onClick={() => setNoteModal({ id: r.id, note: r.note ?? "" })}
                                                                className="text-[11px] px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            >완료</button>
                                                        </div>
                                                    ) : r.status === "processing" ? (
                                                        <div className="flex gap-1 justify-end">
                                                            <button
                                                                onClick={() => setNoteModal({ id: r.id, note: r.note ?? "" })}
                                                                className="text-[11px] px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            >완료 처리</button>
                                                        </div>
                                                    ) : r.note ? (
                                                        <button
                                                            onClick={() => setNoteModal({ id: r.id, note: r.note ?? "" })}
                                                            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600"
                                                        >
                                                            <FileText className="h-3 w-3" /> 메모
                                                        </button>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* 컴플라이언스 체크리스트 */}
                <div>
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">컴플라이언스 체크리스트</h2>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-neutral-500">
                                완료 {COMPLIANCE_ITEMS.filter(c => c.done).length}/{COMPLIANCE_ITEMS.length}
                            </p>
                            <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${(COMPLIANCE_ITEMS.filter(c => c.done).length / COMPLIANCE_ITEMS.length) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            {COMPLIANCE_ITEMS.map((c, i) => (
                                <div key={i} className="flex items-center gap-3 py-1.5">
                                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${c.done ? "bg-green-100" : "bg-amber-50 border border-amber-200"}`}>
                                        {c.done
                                            ? <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                            : <AlertTriangle className="h-3 w-3 text-amber-500" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-xs ${c.done ? "text-neutral-700" : "text-amber-700 font-medium"}`}>
                                            {c.label}
                                        </span>
                                    </div>
                                    {c.link && (
                                        <ChevronRight className="h-3 w-3 text-neutral-300 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-neutral-100">
                            <p className="text-[11px] text-neutral-400 leading-relaxed">
                                개인정보보호법 기준. 미완료 항목은 우선 조치 필요.
                            </p>
                        </div>
                    </div>

                    {/* 자동삭제 안내 */}
                    <div className="mt-4 bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Trash2 className="h-4 w-4 text-neutral-400" />
                            <h3 className="text-xs font-semibold text-neutral-700">자동삭제 정책</h3>
                        </div>
                        <div className="space-y-2 text-[11px] text-neutral-500">
                            <div className="flex justify-between">
                                <span>게스트 미인증 데이터</span>
                                <span className="font-medium text-neutral-700">30일</span>
                            </div>
                            <div className="flex justify-between">
                                <span>삭제 요청 법정 기한</span>
                                <span className="font-medium text-neutral-700">30일</span>
                            </div>
                            <div className="flex justify-between">
                                <span>탈퇴 회원 보존 기간</span>
                                <span className="font-medium text-neutral-700">1년</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 신규 요청 등록 모달 */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-neutral-900">삭제 요청 등록</h3>
                            <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">이름 *</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300"
                                    placeholder="요청자 이름"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">이메일</label>
                                <input
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300"
                                    placeholder="이메일 주소"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">유형</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm(p => ({ ...p, type: e.target.value as "member" | "guest" }))}
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300"
                                >
                                    <option value="member">회원</option>
                                    <option value="guest">게스트</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">사유</label>
                                <input
                                    value={form.reason}
                                    onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300"
                                    placeholder="삭제 요청 사유"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                            >취소</button>
                            <button
                                onClick={submitRequest}
                                disabled={formLoading || !form.name}
                                className="flex-1 py-2 text-sm bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {formLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "등록"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 완료 처리 메모 모달 */}
            {noteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-neutral-900">완료 처리</h3>
                            <button onClick={() => setNoteModal(null)} className="text-neutral-400 hover:text-neutral-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="text-xs text-neutral-500 mb-1 block">처리 메모 (선택)</label>
                            <textarea
                                value={noteModal.note}
                                onChange={e => setNoteModal(p => p ? { ...p, note: e.target.value } : p)}
                                rows={3}
                                placeholder="삭제 완료 확인 내용, 담당자 등"
                                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setNoteModal(null)}
                                className="flex-1 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                            >취소</button>
                            <button
                                onClick={() => updateStatus(noteModal.id, "completed", noteModal.note)}
                                className="flex-1 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >완료 확인</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
