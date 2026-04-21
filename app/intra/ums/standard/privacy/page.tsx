"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileLock2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface DeletionRequest {
    id: string;
    user_id: string;
    email: string | null;
    reason: string | null;
    status: string;
    requested_at: string;
    processed_at: string | null;
}

const POLICIES = [
    { title: "3계층 동의", desc: "Layer 1(Auth) · Layer 2(Profile) · Layer 3(Service) 각각 별도 동의" },
    { title: "크로스 브랜드 공유 금지", desc: "members.affiliations로 이용 중인 서비스만 공개 · 다른 브랜드에 자동 노출 금지" },
    { title: "탈퇴 완전 삭제", desc: "auth.users 삭제 → members cascade → UC 잔액 소멸 (재가입 시 0)" },
    { title: "GDPR / PIPA 준거", desc: "열람 · 정정 · 삭제 · 이동성 · 처리 정지 요청권 보장" },
    { title: "최소 수집 원칙", desc: "필수 필드만 수집 · 선택 필드는 사용자 선택" },
];

const CONSENT_ITEMS = [
    { key: "terms", label: "이용약관 동의", required: true },
    { key: "privacy", label: "개인정보 처리 동의", required: true },
    { key: "marketing", label: "마케팅 정보 수신 동의", required: false },
    { key: "third_party", label: "제3자 제공 동의", required: false },
];

export default function PrivacyStandardPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<DeletionRequest[]>([]);
    const [stats, setStats] = useState<{ pending: number; processed: number; total: number }>({ pending: 0, processed: 0, total: 0 });

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const [rRes, pendingRes, processedRes, totalRes] = await Promise.all([
                sb.from("privacy_deletion_requests").select("*").order("requested_at", { ascending: false }).limit(10),
                sb.from("privacy_deletion_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
                sb.from("privacy_deletion_requests").select("*", { count: "exact", head: true }).eq("status", "processed"),
                sb.from("privacy_deletion_requests").select("*", { count: "exact", head: true }),
            ]);
            setRequests(rRes.data ?? []);
            setStats({
                pending: pendingRes.count ?? 0,
                processed: processedRes.count ?? 0,
                total: totalRes.count ?? 0,
            });
            setLoading(false);
        }
        load();
    }, []);

    function rel(dateStr: string | null): string {
        if (!dateStr) return "-";
        const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (d < 60) return `${d}분 전`;
        const h = Math.floor(d / 60);
        if (h < 24) return `${h}시간 전`;
        return `${Math.floor(h / 24)}일 전`;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="약관 · 개인정보 표준"
                description="유니버스 개인정보 정책 · 동의 항목 · 탈퇴 요청 큐"
            />

            {/* 5 Policies */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">5대 정책</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {POLICIES.map((p) => (
                        <div key={p.title} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-neutral-900 mb-1">{p.title}</p>
                            <p className="text-[10px] text-neutral-600 leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 동의 항목 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">동의 항목 (members.consent)</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">키</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">라벨</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">필수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CONSENT_ITEMS.map((c) => (
                                <tr key={c.key} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-3 py-2 font-mono text-[10px] text-neutral-700">{c.key}</td>
                                    <td className="px-3 py-2 text-neutral-900">{c.label}</td>
                                    <td className="px-3 py-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${c.required ? "bg-rose-100 text-rose-700" : "bg-neutral-100 text-neutral-500"}`}>
                                            {c.required ? "필수" : "선택"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 탈퇴 요청 큐 */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <FileLock2 className="h-4 w-4 text-rose-500" />
                        탈퇴 요청 큐
                    </h2>
                    <Link href="/intra/ums/members/privacy" className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1">
                        전체 관리 <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-white border border-neutral-200 rounded-lg p-3">
                        <p className="text-[10px] text-neutral-500">대기</p>
                        <p className="text-xl font-bold text-rose-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-3">
                        <p className="text-[10px] text-neutral-500">처리됨</p>
                        <p className="text-xl font-bold text-emerald-600">{stats.processed}</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-3">
                        <p className="text-[10px] text-neutral-500">전체</p>
                        <p className="text-xl font-bold text-neutral-900">{stats.total}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
                ) : requests.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                        탈퇴 요청이 없습니다.
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">이메일</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">사유</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">요청</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">처리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((r) => (
                                    <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-3 py-2 text-neutral-900">{r.email || "-"}</td>
                                        <td className="px-3 py-2 text-neutral-600 truncate max-w-[240px]">{r.reason || "-"}</td>
                                        <td className="px-3 py-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                                r.status === "pending" ? "bg-rose-100 text-rose-700" :
                                                r.status === "processed" ? "bg-emerald-100 text-emerald-700" :
                                                "bg-neutral-100 text-neutral-500"
                                            }`}>{r.status}</span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-neutral-500">{rel(r.requested_at)}</td>
                                        <td className="px-3 py-2 text-right text-neutral-500">{rel(r.processed_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 중요 경고 */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-900 leading-relaxed">
                    <strong>auth.users 직접 UPDATE/DELETE 금지.</strong> 탈퇴 처리는 반드시 Auth Admin API로 진행하고, `members.deleted_at` 설정 → 특화 테이블 cascade → UC 잔액 소멸 순서로 실행.
                </p>
            </div>
        </div>
    );
}
