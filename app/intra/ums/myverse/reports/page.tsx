"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Flag, Check, X, EyeOff, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

type Status = "open" | "reviewing" | "resolved" | "dismissed";

interface MemberLite { id: string; name: string | null; handle: string | null; avatar_url: string | null; email: string | null }
interface MomentLite {
    id: string; member_id: string; date: string; domain: string | null;
    sub_tags: string[] | null; media_type: string; media_url: string;
    thumbnail_url: string | null; caption: string | null; visibility: string;
}
interface Report {
    id: string; moment_id: string; reporter_id: string; reason: string;
    detail: string | null; status: Status; created_at: string; resolved_at: string | null;
    moment: MomentLite | null; author: MemberLite | null; reporter: MemberLite | null;
}

const REASON_LABEL: Record<string, string> = {
    spam: "스팸·광고", sexual: "성적", violence: "폭력", hate: "혐오", self_harm: "자해", illegal: "불법", other: "기타",
};

const STATUS_TABS: { key: Status; label: string }[] = [
    { key: "open",      label: "처리 대기" },
    { key: "reviewing", label: "검토 중" },
    { key: "resolved",  label: "처리됨" },
    { key: "dismissed", label: "기각" },
];

export default function ReportsPage() {
    const [tab, setTab] = useState<Status>("open");
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/intra/myverse/reports?status=${tab}`);
            if (r.ok) {
                const d = await r.json();
                setReports(d.reports ?? []);
            } else {
                setReports([]);
            }
        } finally { setLoading(false); }
    }, [tab]);

    useEffect(() => { void load(); }, [load]);

    async function act(id: string, status: Exclude<Status, "open">, hide_moment = false) {
        setActing(id);
        try {
            const r = await fetch(`/api/intra/myverse/reports/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, hide_moment }),
            });
            if (r.ok) await load();
        } finally { setActing(null); }
    }

    return (
        <div>
            <Link href="/intra/ums/myverse" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 mb-3">
                <ArrowLeft className="h-3 w-3" /> Myverse 대시보드
            </Link>
            <PageHeader title="모먼트 신고 검토" description="사용자가 신고한 흔적을 검토하고 처리합니다." />

            <div className="flex items-center gap-1 mb-4 border-b border-neutral-200">
                {STATUS_TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                            tab === t.key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800"
                        }`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-4 w-4 animate-spin text-neutral-300" /></div>
            ) : reports.length === 0 ? (
                <div className="border border-neutral-200 bg-white p-10 text-center">
                    <Flag className="h-6 w-6 text-neutral-200 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">해당 상태의 신고가 없습니다.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {reports.map(r => (
                        <li key={r.id} className="border border-neutral-200 bg-white p-4">
                            <div className="flex gap-4">
                                {/* 썸네일 */}
                                <div className="shrink-0 w-24 h-24 bg-neutral-100 overflow-hidden rounded">
                                    {r.moment?.media_type === "image" && r.moment?.media_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={r.moment.thumbnail_url ?? r.moment.media_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                            <ImageIcon className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>

                                {/* 본문 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-600 rounded">
                                            {REASON_LABEL[r.reason] ?? r.reason}
                                        </span>
                                        {r.moment?.visibility === "public" && (
                                            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-600 rounded">공개</span>
                                        )}
                                        {r.moment?.domain && (
                                            <span className="px-1.5 py-0.5 text-[10px] bg-neutral-100 text-neutral-600 rounded">{r.moment.domain}</span>
                                        )}
                                        <span className="text-[10px] text-neutral-400 tabular-nums">
                                            {new Date(r.created_at).toLocaleString("ko-KR")}
                                        </span>
                                    </div>

                                    {r.moment?.caption && (
                                        <p className="text-xs text-neutral-700 line-clamp-2 mb-2">{r.moment.caption}</p>
                                    )}

                                    <div className="grid grid-cols-2 gap-x-4 text-[11px] text-neutral-600">
                                        <div>
                                            <span className="text-neutral-400">작성자: </span>
                                            {r.author ? (
                                                <span>{r.author.name ?? "—"} {r.author.handle && `@${r.author.handle}`}</span>
                                            ) : <span className="text-neutral-300">(삭제됨)</span>}
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">신고자: </span>
                                            {r.reporter ? (
                                                <span>{r.reporter.name ?? "—"} {r.reporter.handle && `@${r.reporter.handle}`}</span>
                                            ) : <span className="text-neutral-300">(삭제됨)</span>}
                                        </div>
                                    </div>

                                    {r.detail && (
                                        <p className="mt-2 text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-100 rounded p-2">
                                            “{r.detail}”
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 액션 */}
                            {r.status === "open" || r.status === "reviewing" ? (
                                <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap gap-2 justify-end">
                                    {r.status === "open" && (
                                        <button onClick={() => act(r.id, "reviewing")} disabled={acting === r.id}
                                            className="px-3 py-1.5 text-xs text-neutral-700 border border-neutral-200 hover:bg-neutral-50 rounded disabled:opacity-50">
                                            검토 시작
                                        </button>
                                    )}
                                    <button onClick={() => act(r.id, "dismissed")} disabled={acting === r.id}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-neutral-700 border border-neutral-200 hover:bg-neutral-50 rounded disabled:opacity-50">
                                        <X className="h-3 w-3" /> 기각
                                    </button>
                                    <button onClick={() => act(r.id, "resolved", true)} disabled={acting === r.id}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-rose-500 hover:bg-rose-600 rounded disabled:opacity-50">
                                        <EyeOff className="h-3 w-3" /> 비공개 처리 + 처리 완료
                                    </button>
                                    <button onClick={() => act(r.id, "resolved")} disabled={acting === r.id}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded disabled:opacity-50">
                                        <Check className="h-3 w-3" /> 처리 완료 (게시 유지)
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                                    {r.status === "resolved" ? "처리됨" : "기각됨"}
                                    {r.resolved_at && ` · ${new Date(r.resolved_at).toLocaleString("ko-KR")}`}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
