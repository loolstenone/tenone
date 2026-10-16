"use client";

/** 인트라 › 통합 회원 › 프로필 신고 — 공개 프로필 신고 처리 (숨김·문제 없음·숨김 해제) */
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader, TabNav, EmptyState } from "@/components/intra/IntraUI";

interface Person { id: string; name: string | null; handle: string | null; profile_visibility: string | null; profile_blocked_at: string | null }
interface Report {
    id: string;
    reason_label: string;
    detail: string | null;
    status: "pending" | "hidden" | "dismissed";
    created_at: string;
    handled_at: string | null;
    handled_note: string | null;
    target: Person | null;
    reporter: { name: string | null; handle: string | null } | null;
}

const TABS = [
    { id: "pending", label: "대기" },
    { id: "hidden", label: "숨김" },
    { id: "dismissed", label: "문제 없음" },
    { id: "all", label: "전체" },
];
const STATUS_LABEL = { pending: "대기", hidden: "숨김", dismissed: "문제 없음" } as const;

function fmt(iso: string) {
    return new Date(iso).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ProfileReportsPage() {
    const [tab, setTab] = useState("pending");
    const [reports, setReports] = useState<Report[] | null>(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(async () => {
        setReports(null); setError("");
        const res = await fetch(`/api/intra/profile-reports?status=${tab}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) { setError(json.error ?? "불러오지 못했습니다."); setReports([]); return; }
        setReports(json.reports ?? []);
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    async function act(id: string, action: "hide" | "dismiss" | "unhide") {
        const confirmText = action === "hide"
            ? "이 프로필을 숨길까요? 비공개로 바뀌고 공유 링크가 모두 회수됩니다. 본인은 다시 공개할 수 없습니다."
            : action === "unhide" ? "숨김을 해제할까요? 공개는 본인이 다시 켜야 합니다." : "문제 없음으로 처리할까요?";
        if (!window.confirm(confirmText)) return;
        setBusy(id);
        const res = await fetch("/api/intra/profile-reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action }),
        });
        setBusy(null);
        if (!res.ok) { setError((await res.json().catch(() => ({}))).error ?? "처리하지 못했습니다."); return; }
        load();
    }

    return (
        <div>
            <PageHeader title="프로필 신고" description="공개 프로필(tenone.biz/@핸들)에 들어온 신고. 숨기면 비공개 전환·검색 제외·공유 링크 회수가 함께 됩니다." />
            <TabNav tabs={TABS} active={tab} onChange={setTab} />
            {error && <p className="text-xs text-red-600 my-3">{error}</p>}
            {reports === null ? (
                <div className="py-16 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
            ) : reports.length === 0 ? (
                <EmptyState title="신고가 없습니다" />
            ) : (
                <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white">
                    {reports.map(r => {
                        const blocked = !!r.target?.profile_blocked_at;
                        return (
                            <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="font-medium text-neutral-900">{r.target?.name ?? "(탈퇴 회원)"}</span>
                                        {r.target?.handle && (
                                            <a href={`/@${r.target.handle}`} target="_blank" rel="noreferrer" className="text-xs text-neutral-500 underline">@{r.target.handle}</a>
                                        )}
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{STATUS_LABEL[r.status]}</span>
                                        {blocked && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">숨김 중</span>}
                                    </div>
                                    <p className="text-xs text-neutral-700"><b>{r.reason_label}</b>{r.detail ? ` · ${r.detail}` : ""}</p>
                                    <p className="text-[11px] text-neutral-400">
                                        신고 {fmt(r.created_at)} · {r.reporter?.name ?? "알 수 없음"}{r.reporter?.handle ? ` (@${r.reporter.handle})` : ""}
                                        {r.handled_at && ` · 처리 ${fmt(r.handled_at)}`}{r.handled_note ? ` · ${r.handled_note}` : ""}
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {r.status === "pending" && (
                                        <>
                                            <button onClick={() => act(r.id, "dismiss")} disabled={busy === r.id}
                                                className="text-xs px-3 py-1.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50">문제 없음</button>
                                            <button onClick={() => act(r.id, "hide")} disabled={busy === r.id}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">프로필 숨기기</button>
                                        </>
                                    )}
                                    {blocked && r.status === "hidden" && (
                                        <button onClick={() => act(r.id, "unhide")} disabled={busy === r.id}
                                            className="text-xs px-3 py-1.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50">숨김 해제</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
