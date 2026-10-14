"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Star } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { adminTitle } from "@/lib/brand-site-menus";

// 플래너'스 PAD › 후기 — 아임웹 쇼핑 › 구매평 화면 기준 (전체·답글 대기·숨김 · 검색 · 운영자 답글 · 숨기기)
interface Review {
    id: string; fileId: string; source: "badak" | "site"; name: string; edition: string | null; rating: number; body: string;
    isVisible: boolean; adminReply: string | null; createdAt: string; fileTitle: string; thumbnail: string | null;
}
type Tab = "all" | "unanswered" | "hidden";
const API = "/api/intra/planners/reviews";

export default function PlannersReviewsAdmin() {
    const [rows, setRows] = useState<Review[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>("all");
    const [q, setQ] = useState("");

    useEffect(() => {
        fetch(API).then((r) => r.json()).then((d) => (d.reviews ? setRows(d.reviews) : setError(d.error ?? "불러오지 못했습니다."))).catch(() => setError("불러오지 못했습니다."));
    }, []);

    const counts = useMemo(() => ({
        all: rows?.length ?? 0,
        unanswered: rows?.filter((r) => r.isVisible && !r.adminReply && r.source === "site").length ?? 0,
        hidden: rows?.filter((r) => !r.isVisible).length ?? 0,
    }), [rows]);

    const shown = (rows ?? [])
        .filter((r) => tab === "all" || (tab === "hidden" ? !r.isVisible : r.isVisible && !r.adminReply && r.source === "site"))
        .filter((r) => !q || r.body.includes(q) || r.fileTitle.includes(q));

    async function patch(id: string, change: { is_visible?: boolean; admin_reply?: string }) {
        const res = await fetch(API, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...change }) });
        if (!res.ok) { setError((await res.json().catch(() => ({}))).error ?? "저장하지 못했습니다."); return false; }
        setRows((prev) => prev?.map((r) => (r.id === id ? {
            ...r,
            ...(change.is_visible !== undefined && { isVisible: change.is_visible }),
            ...(change.admin_reply !== undefined && { adminReply: change.admin_reply.trim() || null }),
        } : r)) ?? prev);
        return true;
    }

    return (
        <div>
            <PageHeader title={adminTitle("/intra/ums/planners/reviews", "후기")} description="플래너'스 PAD 상품 후기 — 바닥상회에서 옮긴 후기(이름 가림)와 사이트 회원 후기. 숨기면 사이트에 보이지 않습니다." />
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="mb-4 flex gap-1 border-b border-neutral-200 text-sm">
                {([["all", "전체"], ["unanswered", "답글 대기"], ["hidden", "숨김"]] as [Tab, string][]).map(([k, label]) => (
                    <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-3 py-2 ${tab === k ? "border-neutral-900 font-bold" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}>
                        {label} <span className="ml-1 rounded-full bg-neutral-100 px-1.5 text-xs text-neutral-600">{counts[k]}</span>
                    </button>
                ))}
            </div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="후기 내용·상품명으로 검색" className="w-full border border-neutral-200 py-2 pl-9 pr-3 text-sm focus:border-neutral-400 focus:outline-none" />
            </div>

            {!rows ? (
                <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : shown.length === 0 ? (
                <p className="border border-neutral-200 py-16 text-center text-sm text-neutral-400">후기가 없습니다.</p>
            ) : (
                <ul className="divide-y divide-neutral-100 border border-neutral-200 bg-white">
                    {shown.map((r) => <ReviewRow key={r.id} r={r} onPatch={patch} />)}
                </ul>
            )}
        </div>
    );
}

function ReviewRow({ r, onPatch }: { r: Review; onPatch: (id: string, c: { is_visible?: boolean; admin_reply?: string }) => Promise<boolean> }) {
    const [editing, setEditing] = useState(false);
    const [reply, setReply] = useState(r.adminReply ?? "");
    const [busy, setBusy] = useState(false);

    async function saveReply() {
        setBusy(true);
        if (await onPatch(r.id, { admin_reply: reply })) setEditing(false);
        setBusy(false);
    }

    return (
        <li className={`flex gap-4 px-4 py-4 ${r.isVisible ? "" : "bg-neutral-50 opacity-70"}`}>
            <Link href={`/intra/ums/planners/pad/${r.fileId}`} className="h-12 w-12 shrink-0 overflow-hidden border border-neutral-100 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {r.thumbnail && <img src={r.thumbnail} alt="" className="h-full w-full object-contain" />}
            </Link>
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-neutral-500">{r.fileTitle}{r.edition ? ` · ${r.edition}` : ""}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`} />)}</span>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-neutral-400">{new Date(r.createdAt).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}</span>
                    <span className={`px-1.5 text-[10px] ${r.source === "badak" ? "bg-neutral-100 text-neutral-500" : "bg-[#0F766E]/10 text-[#0F766E]"}`}>{r.source === "badak" ? "바닥상회" : "사이트"}</span>
                </div>
                <p className="mt-2 whitespace-pre-line break-keep text-sm text-neutral-800">{r.body}</p>

                {editing ? (
                    <div className="mt-3">
                        <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder="운영자 답글 (사이트에 'Planner's'로 표시)" className="w-full border border-neutral-200 px-3 py-2 text-sm" />
                        <div className="mt-2 flex justify-end gap-2 text-sm">
                            <button onClick={() => { setEditing(false); setReply(r.adminReply ?? ""); }} className="px-3 py-1.5 text-neutral-500">취소</button>
                            <button onClick={saveReply} disabled={busy} className="bg-neutral-900 px-3 py-1.5 text-white disabled:opacity-50">답글 저장</button>
                        </div>
                    </div>
                ) : r.adminReply ? (
                    <div className="mt-3 border-l-2 border-[#0F766E] bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                        <b className="mr-1.5 text-[#0F766E]">답글</b>{r.adminReply}
                    </div>
                ) : null}

                {!editing && (
                    <div className="mt-2 flex gap-3 text-xs">
                        <button onClick={() => setEditing(true)} className="text-neutral-500 hover:text-neutral-900">{r.adminReply ? "답글 고치기" : "답글 쓰기"}</button>
                        <button onClick={() => onPatch(r.id, { is_visible: !r.isVisible })} className="text-neutral-500 hover:text-neutral-900">{r.isVisible ? "숨기기" : "다시 보이기"}</button>
                    </div>
                )}
            </div>
        </li>
    );
}
