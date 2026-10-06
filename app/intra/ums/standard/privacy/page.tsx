"use client";

/**
 * 약관 · 개인정보 표준 — CLAUDE.md §0.1 데이터 계약 4·5조, §1.2.0 가입 동의 표준
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileLock2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface DeletionRequest {
    id: string;
    email: string | null;
    type: string;
    reason: string | null;
    status: string;
    requested_at: string;
    deadline_at: string | null;
    completed_at: string | null;
}

interface Withdrawal {
    id: string;
    brand_id: string | null;
    scope: string;
    withdrawn_at: string;
    data_deleted_at: string | null;
}

const POLICIES = [
    { title: "개인정보처리방침은 하나", desc: "운영사 TenOne 명의 단일 방침. 브랜드별 수집 항목은 방침에 브랜드 단위로 명시" },
    { title: "동의는 서비스별", desc: "브랜드 첫 진입 시 해당 브랜드 약관 동의를 member_brand_joins에 버전과 함께 기록" },
    { title: "브랜드 간 활용은 별도 동의", desc: "한 브랜드 데이터를 다른 브랜드에서 쓰거나 노출하려면 별도 동의 (개인정보보호법 제18조)" },
    { title: "탈퇴 범위 구분", desc: "\"이 서비스만\"(scope=brand) / \"계정 전체\"(scope=account). 브랜드별 처리 기준은 docs/Data_Lifecycle.md" },
    { title: "파기와 법정 보관", desc: "목적 달성·탈퇴 시 지체 없이 파기(제21조). 법정 보관 기록(결제 5년 등)만 그 기간 보관, 영구 보관은 익명화 정보만" },
    { title: "최소 수집", desc: "목적·항목·보관기간 고지 후 필수 항목만 수집 (제15·16조)" },
];

const CONSENT_ITEMS = [
    { key: "age_14", label: "만 14세 이상", required: true, note: "미만은 법정대리인 동의 필요 (제22조의2)" },
    { key: "terms", label: "이용약관 동의", required: true, note: "terms_version 기록" },
    { key: "privacy", label: "개인정보처리방침", required: null, note: "고지 링크 (동의 체크 아님) · privacy_version 기록" },
    { key: "marketing", label: "광고성 정보 수신", required: false, note: "기본값 false 고정 · 야간(21~08시)은 별도 동의 (정보통신망법 제50조)" },
];

const REQ_STATUS: Record<string, { label: string; cls: string }> = {
    pending: { label: "대기", cls: "bg-rose-100 text-rose-700" },
    processing: { label: "처리 중", cls: "bg-amber-100 text-amber-700" },
    completed: { label: "완료", cls: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "반려", cls: "bg-neutral-100 text-neutral-500" },
};

function rel(dateStr: string | null): string {
    if (!dateStr) return "-";
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 60) return `${d}분 전`;
    const h = Math.floor(d / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

export default function PrivacyStandardPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<DeletionRequest[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [joins, setJoins] = useState(0);

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("privacy_deletion_requests").select("id, email, type, reason, status, requested_at, deadline_at, completed_at")
                .order("requested_at", { ascending: false }).limit(20),
            sb.from("member_brand_withdrawals").select("id, brand_id, scope, withdrawn_at, data_deleted_at")
                .order("withdrawn_at", { ascending: false }).limit(20),
            sb.from("member_brand_joins").select("*", { count: "exact", head: true }).eq("status", "active"),
        ]).then(([r, w, j]) => {
            setRequests((r.data ?? []) as DeletionRequest[]);
            setWithdrawals((w.data ?? []) as Withdrawal[]);
            setJoins(j.count ?? 0);
            setLoading(false);
        });
    }, []);

    const pending = requests.filter(r => r.status === "pending" || r.status === "processing").length;
    const undeleted = withdrawals.filter(w => !w.data_deleted_at).length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="약관 · 개인정보 표준"
                description="데이터 계약 4조(동의는 서비스별) · 5조(생애주기) · 가입 동의 표준 §1.2.0"
            />

            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">정책</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {POLICIES.map(p => (
                        <div key={p.title} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-neutral-900 mb-1">{p.title}</p>
                            <p className="text-[11px] text-neutral-600 leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">가입 동의 항목 (members.consent · SignupConsent)</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">키</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">항목</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">구분</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">비고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CONSENT_ITEMS.map(c => (
                                <tr key={c.key} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-3 py-2 font-mono text-[10px] text-neutral-700">{c.key}</td>
                                    <td className="px-3 py-2 text-neutral-900">{c.label}</td>
                                    <td className="px-3 py-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                            c.required === true ? "bg-rose-100 text-rose-700" : c.required === false ? "bg-neutral-100 text-neutral-500" : "bg-sky-50 text-sky-700"}`}>
                                            {c.required === true ? "필수" : c.required === false ? "선택" : "고지"}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-[11px] text-neutral-500">{c.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                    브랜드 약관 동의(활성) <strong className="text-neutral-900">{joins}건</strong> — member_brand_joins
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-24"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                                <FileLock2 className="h-4 w-4 text-rose-500" /> 삭제 요청 (처리 대기 {pending})
                            </h2>
                            <Link href="/intra/ums/members/privacy" className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1">
                                처리하기 <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                        {requests.length === 0 ? (
                            <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">요청 없음</div>
                        ) : (
                            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <tbody>
                                        {requests.map(r => (
                                            <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                                                <td className="px-3 py-2 text-neutral-900">{r.email || "-"}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${REQ_STATUS[r.status]?.cls ?? "bg-neutral-100"}`}>
                                                        {REQ_STATUS[r.status]?.label ?? r.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right text-neutral-500">{rel(r.requested_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-neutral-900 mb-3">탈퇴 기록 (데이터 미파기 {undeleted})</h2>
                        {withdrawals.length === 0 ? (
                            <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">탈퇴 없음</div>
                        ) : (
                            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <tbody>
                                        {withdrawals.map(w => (
                                            <tr key={w.id} className="border-b border-neutral-100 last:border-0">
                                                <td className="px-3 py-2">{w.scope === "account" ? "계정 전체" : `이 서비스만 · ${w.brand_id ?? "-"}`}</td>
                                                <td className="px-3 py-2 text-neutral-500">{w.data_deleted_at ? "파기 완료" : "파기 대기"}</td>
                                                <td className="px-3 py-2 text-right text-neutral-500">{rel(w.withdrawn_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-900 leading-relaxed">
                    <strong>auth.users 직접 UPDATE/DELETE 금지.</strong> 계정 삭제는 Supabase Dashboard·Auth Admin API로만.
                    브랜드 탈퇴는 해당 브랜드 데이터만 docs/Data_Lifecycle.md 기준(삭제·익명화·법정 보관)으로 처리하고 data_deleted_at을 기록.
                </p>
            </div>
        </div>
    );
}
