"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Calendar, MapPin, Users, Image as ImageIcon, Check, X, Clock, AlertCircle, ExternalLink, CheckCircle2, XCircle } from "lucide-react";

interface ShowcaseRow {
    id: string;
    slug: string;
    handle: string | null;
    title: string;
    subtitle: string | null;
    cover_image: string | null;
    category: string | null;
    location: string | null;
    start_date: string;
    end_date: string;
    start_time: string | null;
    end_time: string | null;
    status: string;
    publish_mode: string;
    approval_count: number;
    interests_count: number;
    created_at: string;
    approved_at: string | null;
    rejected_at: string | null;
    organizer: { handle: string; display_name: string; email: string } | null;
    approvals_summary: { approved: number; rejected: number; pending: number; emails: string[] };
    artist_count: number;
    work_count: number;
}

type Tab = "all" | "pending" | "approved" | "rejected" | "ended";

const TAB_LABEL: Record<Tab, string> = {
    all: "전체",
    pending: "승인 대기",
    approved: "승인됨",
    rejected: "반려",
    ended: "종료",
};

const STATUS_STYLE: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    approved: "bg-green-100 text-green-900",
    rejected: "bg-red-100 text-red-900",
    ended: "bg-neutral-200 text-neutral-700",
};

export default function IntraJakkaShowcasesPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>("all");
    const [rows, setRows] = useState<ShowcaseRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ShowcaseRow | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const r = await fetch(`/api/intra/jakka/showcases?status=${tab}`);
        const j = await r.json();
        setRows(j.showcases ?? []);
        setLoading(false);
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    async function handleAction(action: "approve" | "reject" | "end") {
        if (!selected || !user?.id) return;
        if (!confirm(`이 쇼케이스를 ${action === "approve" ? "강제 승인" : action === "reject" ? "반려" : "종료"}할까요?`)) return;
        setSubmitting(true);
        const r = await fetch("/api/intra/jakka/showcases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ showcaseId: selected.id, action, reviewerId: user.id }),
        });
        setSubmitting(false);
        if (r.ok) { setSelected(null); await load(); }
        else { const j = await r.json().catch(() => ({})); alert(`실패: ${j.error ?? r.statusText}`); }
    }

    const counts = {
        all: rows.length,
        pending: rows.filter((r) => r.status === "pending").length,
        approved: rows.filter((r) => r.status === "approved").length,
        rejected: rows.filter((r) => r.status === "rejected").length,
        ended: rows.filter((r) => r.status === "ended").length,
    };

    return (
        <div className="min-h-screen bg-neutral-50 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-[20px] font-black text-neutral-900 mb-1">Jakka 쇼케이스 관리</h1>
                <p className="text-[12px] text-neutral-600 mb-6">승인 대기·진행 중·종료된 전시 모니터링과 강제 조치</p>

                <div className="flex gap-1 mb-4 border-b border-neutral-200">
                    {(["all", "pending", "approved", "rejected", "ended"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`text-[12px] font-bold px-4 py-2.5 border-b-2 -mb-px transition-colors ${
                                tab === t ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"
                            }`}
                        >
                            {TAB_LABEL[t]}
                            {tab === t && <span className="ml-1.5 text-[10px] text-neutral-500">{counts[t]}</span>}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12 text-[12px] text-neutral-500">로딩 중…</div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-12 text-[12px] text-neutral-500">쇼케이스가 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {rows.map((s) => {
                            const apsum = s.approvals_summary;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setSelected(s)}
                                    className="text-left border border-neutral-200 bg-white hover:border-neutral-900 transition-colors overflow-hidden"
                                >
                                    {s.cover_image ? (
                                        <div
                                            className="aspect-[16/9] bg-neutral-100 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${s.cover_image})` }}
                                        />
                                    ) : (
                                        <div className="aspect-[16/9] bg-neutral-100 flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-neutral-300" />
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <p className="text-[13px] font-bold text-neutral-900 line-clamp-2 flex-1">{s.title}</p>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 shrink-0 ${STATUS_STYLE[s.status] ?? "bg-neutral-100 text-neutral-700"}`}>
                                                {s.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-neutral-500 mb-2">
                                            {s.organizer?.display_name} · <span className="font-mono">{s.organizer?.handle}</span>
                                        </p>
                                        <div className="flex items-center gap-2.5 text-[11px] text-neutral-500 mb-2">
                                            <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{s.start_date}{s.start_time ? ` ${s.start_time.substring(0, 5)}` : ""}</span>
                                            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{s.artist_count}</span>
                                            <span>작품 {s.work_count}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px]">
                                            <span className="flex items-center gap-0.5 text-green-700"><CheckCircle2 className="w-2.5 h-2.5" />{apsum.approved}</span>
                                            <span className="flex items-center gap-0.5 text-red-700"><XCircle className="w-2.5 h-2.5" />{apsum.rejected}</span>
                                            <span className="flex items-center gap-0.5 text-neutral-500"><Clock className="w-2.5 h-2.5" />{apsum.pending}</span>
                                            <span className="ml-auto text-neutral-400">{s.publish_mode === "scheduled" ? "예약" : "즉시"}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {selected && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center overflow-y-auto p-4">
                        <div className="relative w-full max-w-2xl bg-white">
                            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-3 border-b border-neutral-200">
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">쇼케이스 상세</p>
                                <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-neutral-900"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="px-5 py-4 space-y-5">
                                {selected.cover_image && (
                                    <div className="aspect-[21/9] bg-neutral-100 bg-cover bg-center" style={{ backgroundImage: `url(${selected.cover_image})` }} />
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 ${STATUS_STYLE[selected.status] ?? "bg-neutral-100"}`}>{selected.status}</span>
                                        {selected.publish_mode === "scheduled" && <span className="text-[10px] text-neutral-500">예약 공개</span>}
                                    </div>
                                    <p className="text-[18px] font-black text-neutral-900">{selected.title}</p>
                                    {selected.subtitle && <p className="text-[13px] text-neutral-700 mt-0.5">{selected.subtitle}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-[12px]">
                                    <div>
                                        <p className="text-neutral-500 mb-0.5">기간</p>
                                        <p className="text-neutral-900">{selected.start_date} ~ {selected.end_date}</p>
                                        {(selected.start_time || selected.end_time) && (
                                            <p className="text-[11px] text-neutral-500 mt-0.5">
                                                {selected.start_time?.substring(0,5) ?? "—"} ~ {selected.end_time?.substring(0,5) ?? "—"}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 mb-0.5">장소</p>
                                        <p className="text-neutral-900">{selected.location ?? "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 mb-0.5">카테고리</p>
                                        <p className="text-neutral-900">{selected.category ?? "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 mb-0.5">핸들</p>
                                        <p className="text-neutral-900 font-mono">{selected.handle ?? `(slug) ${selected.slug}`}</p>
                                    </div>
                                </div>

                                <div className="border border-neutral-200 bg-neutral-50 p-3">
                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">대표자</p>
                                    <p className="text-[13px] text-neutral-900">{selected.organizer?.display_name}</p>
                                    <p className="text-[11px] font-mono text-neutral-500">{selected.organizer?.handle}</p>
                                    <p className="text-[11px] text-neutral-500">{selected.organizer?.email}</p>
                                </div>

                                <div>
                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">3명 승인 현황</p>
                                    <div className="space-y-1">
                                        {selected.approvals_summary.emails.length === 0 ? (
                                            <p className="text-[12px] text-neutral-500">승인자 정보 없음</p>
                                        ) : (
                                            <>
                                                <p className="text-[12px] text-neutral-700">
                                                    승인 <b className="text-green-700">{selected.approvals_summary.approved}</b> ·
                                                    반려 <b className="text-red-700">{selected.approvals_summary.rejected}</b> ·
                                                    대기 <b>{selected.approvals_summary.pending}</b>
                                                </p>
                                                <ul className="text-[11px] text-neutral-500 space-y-0.5">
                                                    {selected.approvals_summary.emails.map((e, i) => <li key={i}>· {e}</li>)}
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="border border-neutral-200 p-2">
                                        <p className="text-[18px] font-black text-neutral-900">{selected.artist_count}</p>
                                        <p className="text-[10px] text-neutral-500">참가 작가</p>
                                    </div>
                                    <div className="border border-neutral-200 p-2">
                                        <p className="text-[18px] font-black text-neutral-900">{selected.work_count}</p>
                                        <p className="text-[10px] text-neutral-500">작품</p>
                                    </div>
                                    <div className="border border-neutral-200 p-2">
                                        <p className="text-[18px] font-black text-neutral-900">{selected.interests_count}</p>
                                        <p className="text-[10px] text-neutral-500">관심</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                                    <Link
                                        href={`/jakka/showcase/${selected.handle ?? selected.slug}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-[12px] text-neutral-700 hover:text-neutral-900 underline underline-offset-2"
                                    >
                                        실제 페이지 보기
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                    <div className="ml-auto flex gap-2">
                                        {selected.status === "pending" && (
                                            <>
                                                <button onClick={() => handleAction("reject")} disabled={submitting} className="text-[11px] font-bold text-red-700 border border-red-300 px-3 py-1.5 hover:bg-red-50 disabled:opacity-50">반려</button>
                                                <button onClick={() => handleAction("approve")} disabled={submitting} className="text-[11px] font-bold text-white bg-green-700 px-3 py-1.5 hover:bg-green-800 disabled:opacity-50">강제 승인</button>
                                            </>
                                        )}
                                        {selected.status === "approved" && (
                                            <button onClick={() => handleAction("end")} disabled={submitting} className="text-[11px] font-bold text-neutral-900 border border-neutral-900 px-3 py-1.5 hover:bg-neutral-900 hover:text-white disabled:opacity-50">종료 처리</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
