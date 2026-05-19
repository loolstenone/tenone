"use client";

import { useState, useEffect, useMemo } from "react";
import { Mail, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type ContactStatus = "pending" | "seen" | "accepted" | "declined";

interface ContactRow {
    id: string;
    target_creator_id: string;
    sender_name: string;
    sender_email: string;
    sender_company: string | null;
    role_title: string | null;
    message: string;
    status: ContactStatus;
    created_at: string;
    responded_at: string | null;
    target: { handle: string; display_name: string } | null;
}

const STATUS_LABEL: Record<ContactStatus, { l: string; c: string }> = {
    pending:  { l: "대기", c: "bg-amber-50 text-amber-700" },
    seen:     { l: "확인", c: "bg-sky-50 text-sky-700" },
    accepted: { l: "수락", c: "bg-emerald-50 text-emerald-700" },
    declined: { l: "거절", c: "bg-neutral-100 text-neutral-500" },
};

const STATUS_TABS: { key: ContactStatus | "all"; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "pending", label: "대기" },
    { key: "seen", label: "확인" },
    { key: "accepted", label: "수락" },
    { key: "declined", label: "거절" },
];

export default function MontzContactsPage() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<ContactRow[]>([]);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<ContactStatus | "all">("all");

    useEffect(() => {
        createClient()
            .from("montz_contact_requests")
            .select("id, target_creator_id, sender_name, sender_email, sender_company, role_title, message, status, created_at, responded_at, target:montz_creators!target_creator_id(handle, display_name)")
            .order("created_at", { ascending: false })
            .limit(300)
            .then((res) => {
                setRows((res.data ?? []) as unknown as ContactRow[]);
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
                r.sender_name?.toLowerCase().includes(q) ||
                r.sender_email?.toLowerCase().includes(q) ||
                r.sender_company?.toLowerCase().includes(q) ||
                r.target?.handle?.toLowerCase().includes(q) ||
                r.target?.display_name?.toLowerCase().includes(q) ||
                r.role_title?.toLowerCase().includes(q) ||
                r.message?.toLowerCase().includes(q)
            );
        });
    }, [rows, tab, search]);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">캐스팅 컨택</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">MoNTZ 캐스팅 디렉터 → 모델·배우 컨택 모니터링</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="이름·이메일·회사·핸들·메시지"
                            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-64 focus:outline-none focus:border-neutral-400"
                        />
                    </div>
                    <Link
                        href="/montz/explore"
                        target="_blank"
                        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                        <ExternalLink className="h-3.5 w-3.5" /> 사이트
                    </Link>
                </div>
            </div>

            {/* 상태별 카운트 탭 */}
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
                    <Mail className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search || tab !== "all" ? "조건에 맞는 컨택 없음" : "캐스팅 제안 없음"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left">
                                {["대상 모델", "발신자", "회사·역할", "메시지", "상태", "발송일"].map((h) => (
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
                                            {r.target ? (
                                                <Link href={`/montz/${r.target.handle}`} target="_blank" className="block hover:underline">
                                                    <p className="font-medium text-neutral-900">{r.target.display_name}</p>
                                                    <p className="text-xs text-neutral-400">@{r.target.handle}</p>
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-neutral-400">(삭제됨)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-neutral-900">{r.sender_name}</p>
                                            <a href={`mailto:${r.sender_email}`} className="text-xs text-neutral-500 hover:underline">{r.sender_email}</a>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600">
                                            <p>{r.sender_company || <span className="text-neutral-300">-</span>}</p>
                                            <p className="text-xs text-neutral-500">{r.role_title || ""}</p>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 max-w-md">
                                            <p className="line-clamp-3 whitespace-pre-line">{r.message}</p>
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
