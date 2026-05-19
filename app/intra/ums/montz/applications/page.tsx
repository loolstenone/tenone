"use client";

import { useState, useEffect, useMemo } from "react";
import { ClipboardList, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AppStatus = "pending" | "seen" | "shortlisted" | "rejected" | "cast";

interface ApplicationRow {
    id: string;
    audition_id: string;
    creator_id: string;
    message: string | null;
    applicant_email: string | null;
    status: AppStatus;
    created_at: string;
    reviewed_at: string | null;
    audition: { company: string; role: string; type: string; deadline: string } | null;
    creator: { handle: string; display_name: string; type: string } | null;
}

const STATUS_LABEL: Record<AppStatus, { l: string; c: string }> = {
    pending:     { l: "대기",      c: "bg-amber-50 text-amber-700" },
    seen:        { l: "확인",      c: "bg-sky-50 text-sky-700" },
    shortlisted: { l: "숏리스트",  c: "bg-indigo-50 text-indigo-700" },
    cast:        { l: "캐스트",    c: "bg-emerald-50 text-emerald-700" },
    rejected:    { l: "거절",      c: "bg-neutral-100 text-neutral-500" },
};

const STATUS_TABS: { key: AppStatus | "all"; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "pending", label: "대기" },
    { key: "seen", label: "확인" },
    { key: "shortlisted", label: "숏리스트" },
    { key: "cast", label: "캐스트" },
    { key: "rejected", label: "거절" },
];

export default function MontzApplicationsPage() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<ApplicationRow[]>([]);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<AppStatus | "all">("all");

    useEffect(() => {
        createClient()
            .from("montz_audition_applications")
            .select("id, audition_id, creator_id, message, applicant_email, status, created_at, reviewed_at, audition:montz_auditions(company, role, type, deadline), creator:montz_creators(handle, display_name, type)")
            .order("created_at", { ascending: false })
            .limit(300)
            .then((res) => {
                setRows((res.data ?? []) as unknown as ApplicationRow[]);
                setLoading(false);
            });
    }, []);

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: rows.length };
        for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
        return c;
    }, [rows]);

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            if (tab !== "all" && r.status !== tab) return false;
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                r.audition?.company?.toLowerCase().includes(q) ||
                r.audition?.role?.toLowerCase().includes(q) ||
                r.creator?.handle?.toLowerCase().includes(q) ||
                r.creator?.display_name?.toLowerCase().includes(q) ||
                r.applicant_email?.toLowerCase().includes(q) ||
                r.message?.toLowerCase().includes(q)
            );
        });
    }, [rows, tab, search]);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">오디션 응시</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">MoNTZ 모델·배우 → 오디션 공고 응시 모니터링</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="오디션·신청자·이메일·메시지"
                            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-64 focus:outline-none focus:border-neutral-400"
                        />
                    </div>
                    <Link
                        href="/intra/ums/montz/auditions"
                        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                        <ExternalLink className="h-3.5 w-3.5" /> 공고 관리
                    </Link>
                </div>
            </div>

            <div className="flex gap-1.5 mb-4 border-b border-neutral-100">
                {STATUS_TABS.map(({ key, label }) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                                active
                                    ? "border-neutral-900 text-neutral-900"
                                    : "border-transparent text-neutral-400 hover:text-neutral-700"
                            }`}
                        >
                            {label} <span className={active ? "text-neutral-500" : "text-neutral-300"}>{counts[key] ?? 0}</span>
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <ClipboardList className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search || tab !== "all" ? "조건에 맞는 응시 없음" : "응시 내역 없음"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left">
                                {["오디션", "신청자", "메시지", "이메일", "상태", "신청일"].map((h) => (
                                    <th key={h} className="px-4 py-3 font-semibold text-neutral-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => {
                                const s = STATUS_LABEL[r.status] ?? { l: r.status, c: "bg-neutral-100 text-neutral-500" };
                                return (
                                    <tr key={r.id} className="border-t border-neutral-100 hover:bg-neutral-50 align-top">
                                        <td className="px-4 py-3">
                                            {r.audition ? (
                                                <>
                                                    <p className="font-medium text-neutral-900">{r.audition.company}</p>
                                                    <p className="text-xs text-neutral-500">{r.audition.role}</p>
                                                    <p className="text-[11px] text-neutral-400 mt-0.5">
                                                        {r.audition.type} · 마감 {r.audition.deadline}
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-xs text-neutral-400">(삭제됨)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {r.creator ? (
                                                <Link href={`/montz/${r.creator.handle}`} target="_blank" className="block hover:underline">
                                                    <p className="font-medium text-neutral-900">{r.creator.display_name}</p>
                                                    <p className="text-xs text-neutral-400">@{r.creator.handle} · {r.creator.type}</p>
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-neutral-400">(삭제됨)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 max-w-md">
                                            {r.message ? (
                                                <p className="line-clamp-3 whitespace-pre-line">{r.message}</p>
                                            ) : (
                                                <span className="text-neutral-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500">
                                            {r.applicant_email ? (
                                                <a href={`mailto:${r.applicant_email}`} className="text-xs hover:underline">{r.applicant_email}</a>
                                            ) : (
                                                <span className="text-xs text-neutral-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${s.c}`}>{s.l}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                                            {new Date(r.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">총 {filtered.length}건</div>
                </div>
            )}
        </div>
    );
}
