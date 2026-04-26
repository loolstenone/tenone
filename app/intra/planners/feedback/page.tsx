"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader, StatCard, Card } from "@/components/intra/IntraUI";
import {
    Inbox,
    CheckCircle2,
    Clock,
    Archive,
    AlertTriangle,
    Loader2,
    Mail,
    ExternalLink,
    Trash2,
    Search,
} from "lucide-react";

type Status = "new" | "read" | "in_progress" | "resolved" | "archived";
type Priority = "low" | "normal" | "high" | "critical";

interface FeedbackItem {
    id: string;
    user_id: string | null;
    user_email: string | null;
    message: string;
    user_agent: string | null;
    page_path: string | null;
    status: Status;
    priority: Priority;
    notes: string | null;
    handled_at: string | null;
    created_at: string;
    updated_at: string;
}

const STATUS_LABEL: Record<Status, string> = {
    new: "신규",
    read: "확인",
    in_progress: "처리 중",
    resolved: "해결",
    archived: "보관",
};
const STATUS_COLOR: Record<Status, string> = {
    new: "bg-rose-50 text-rose-700 border-rose-200",
    read: "bg-amber-50 text-amber-700 border-amber-200",
    in_progress: "bg-sky-50 text-sky-700 border-sky-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    archived: "bg-neutral-100 text-neutral-500 border-neutral-200",
};
const PRIORITY_LABEL: Record<Priority, string> = {
    low: "낮음",
    normal: "보통",
    high: "높음",
    critical: "긴급",
};
const PRIORITY_COLOR: Record<Priority, string> = {
    low: "text-neutral-400",
    normal: "text-neutral-600",
    high: "text-amber-700",
    critical: "text-rose-700 font-semibold",
};

export default function PlannersFeedbackPage() {
    const params = useSearchParams();
    const focusId = params.get("id");

    const [items, setItems] = useState<FeedbackItem[]>([]);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Status | "all">("all");
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<FeedbackItem | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const url = filter === "all"
                ? "/api/intra/planners/feedback"
                : `/api/intra/planners/feedback?status=${filter}`;
            const res = await fetch(url);
            if (res.ok) {
                const d = await res.json();
                setItems(d.feedback ?? []);
                setStats(d.stats ?? {});
                if (focusId && !selected) {
                    const found = (d.feedback ?? []).find((x: FeedbackItem) => x.id === focusId);
                    if (found) setSelected(found);
                }
            }
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

    async function patch(id: string, body: Partial<{ status: Status; priority: Priority; notes: string | null }>) {
        setSavingId(id);
        try {
            await fetch("/api/intra/planners/feedback", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...body }),
            });
            // 낙관적 업데이트
            setItems(prev => prev.map(x => x.id === id ? { ...x, ...body } as FeedbackItem : x));
            setSelected(prev => prev && prev.id === id ? { ...prev, ...body } as FeedbackItem : prev);
        } finally {
            setSavingId(null);
        }
    }

    async function remove(id: string) {
        if (!confirm("이 피드백을 영구 삭제할까요? (보관(Archive) 으로도 충분합니다)")) return;
        await fetch(`/api/intra/planners/feedback?id=${id}`, { method: "DELETE" });
        setItems(prev => prev.filter(x => x.id !== id));
        setSelected(null);
    }

    const filtered = useMemo(() => {
        if (!query.trim()) return items;
        const q = query.trim().toLowerCase();
        return items.filter(x =>
            (x.message ?? "").toLowerCase().includes(q)
            || (x.user_email ?? "").toLowerCase().includes(q)
            || (x.page_path ?? "").toLowerCase().includes(q)
        );
    }, [items, query]);

    return (
        <div className="max-w-7xl mx-auto p-6">
            <PageHeader
                title="PP AI 베타 피드백 인박스"
                description="사용자가 BetaFeedbackButton 으로 보낸 메시지를 처리합니다."
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <StatCard label="신규"   value={stats.new ?? 0}        icon={<Inbox className="h-4 w-4" />} />
                <StatCard label="확인"   value={stats.read ?? 0}       icon={<Mail className="h-4 w-4" />} />
                <StatCard label="처리 중" value={stats.in_progress ?? 0} icon={<Clock className="h-4 w-4" />} />
                <StatCard label="해결"   value={stats.resolved ?? 0}   icon={<CheckCircle2 className="h-4 w-4" />} />
                <StatCard label="보관"   value={stats.archived ?? 0}   icon={<Archive className="h-4 w-4" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                {/* List */}
                <div>
                    {/* Filter + search */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {(["all", "new", "read", "in_progress", "resolved", "archived"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                    filter === f
                                        ? "bg-neutral-900 text-white border-neutral-900"
                                        : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                                }`}
                            >
                                {f === "all" ? "전체" : STATUS_LABEL[f as Status]}
                                {f !== "all" && (stats[f] ?? 0) > 0 && (
                                    <span className="ml-1.5 text-[10px] opacity-70">{stats[f]}</span>
                                )}
                            </button>
                        ))}
                        <div className="ml-auto flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5">
                            <Search className="h-3 w-3 text-neutral-400" />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="이메일·내용·경로 검색"
                                className="text-xs bg-transparent focus:outline-none w-44"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
                        </div>
                    ) : filtered.length === 0 ? (
                        <Card>
                            <p className="py-12 text-center text-sm text-neutral-400">
                                {query ? "검색 결과가 없습니다." : "이 상태의 피드백이 없습니다."}
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map(item => (
                                <FeedbackRow
                                    key={item.id}
                                    item={item}
                                    active={selected?.id === item.id}
                                    onClick={() => {
                                        setSelected(item);
                                        if (item.status === "new") patch(item.id, { status: "read" });
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail panel */}
                <div className="lg:sticky lg:top-6 self-start">
                    {selected ? (
                        <DetailPanel
                            item={selected}
                            saving={savingId === selected.id}
                            onPatch={(body) => patch(selected.id, body)}
                            onDelete={() => remove(selected.id)}
                            onClose={() => setSelected(null)}
                        />
                    ) : (
                        <Card>
                            <p className="py-12 text-center text-sm text-neutral-400">
                                좌측에서 피드백을 선택하세요.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function FeedbackRow({
    item,
    active,
    onClick,
}: {
    item: FeedbackItem;
    active: boolean;
    onClick: () => void;
}) {
    const date = new Date(item.created_at);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return (
        <button
            onClick={onClick}
            className={`w-full text-left bg-white border transition-colors ${
                active ? "border-neutral-900 ring-1 ring-neutral-900/10" : "border-neutral-200 hover:border-neutral-400"
            } p-4`}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLOR[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                </span>
                {item.priority !== "normal" && (
                    <span className={`inline-flex items-center gap-1 text-[10px] ${PRIORITY_COLOR[item.priority]}`}>
                        {item.priority === "critical" && <AlertTriangle className="h-3 w-3" />}
                        {PRIORITY_LABEL[item.priority]}
                    </span>
                )}
                <span className="text-[10px] text-neutral-400 ml-auto font-mono">{dateStr}</span>
            </div>
            <p className="text-sm text-neutral-900 line-clamp-2 leading-relaxed">{item.message}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-400">
                <span className="truncate">{item.user_email ?? "anonymous"}</span>
                {item.page_path && <span className="font-mono truncate">{item.page_path}</span>}
            </div>
        </button>
    );
}

function DetailPanel({
    item,
    saving,
    onPatch,
    onDelete,
    onClose,
}: {
    item: FeedbackItem;
    saving: boolean;
    onPatch: (body: Partial<{ status: Status; priority: Priority; notes: string | null }>) => void;
    onDelete: () => void;
    onClose: () => void;
}) {
    const [notes, setNotes] = useState(item.notes ?? "");
    useEffect(() => { setNotes(item.notes ?? ""); }, [item.id, item.notes]);

    return (
        <Card>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] text-neutral-400">{new Date(item.created_at).toLocaleString("ko-KR")}</p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">{item.user_email ?? "anonymous"}</p>
                </div>
                <button onClick={onClose} className="text-xs text-neutral-400 hover:text-neutral-700">닫기</button>
            </div>

            <div className="my-4 p-4 bg-neutral-50 border border-neutral-200 rounded">
                <p className="text-sm text-neutral-900 whitespace-pre-wrap leading-relaxed">{item.message}</p>
            </div>

            <div className="space-y-3 text-xs">
                {item.page_path && (
                    <div className="flex items-center gap-2">
                        <span className="text-neutral-400 w-16">경로</span>
                        <a
                            href={`https://planners.tenone.biz${item.page_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neutral-700 font-mono hover:underline inline-flex items-center gap-1"
                        >
                            {item.page_path}
                            <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                    </div>
                )}
                {item.user_agent && (
                    <div className="flex gap-2">
                        <span className="text-neutral-400 w-16 shrink-0">UA</span>
                        <span className="text-neutral-500 break-all">{item.user_agent}</span>
                    </div>
                )}
            </div>

            <div className="border-t border-neutral-100 mt-4 pt-4 space-y-3">
                {/* Status */}
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">상태</p>
                    <div className="flex gap-1 flex-wrap">
                        {(["new", "read", "in_progress", "resolved", "archived"] as Status[]).map(s => (
                            <button
                                key={s}
                                onClick={() => onPatch({ status: s })}
                                className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
                                    item.status === s
                                        ? STATUS_COLOR[s] + " font-semibold"
                                        : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                                }`}
                            >
                                {STATUS_LABEL[s]}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Priority */}
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">우선순위</p>
                    <div className="flex gap-1 flex-wrap">
                        {(["low", "normal", "high", "critical"] as Priority[]).map(p => (
                            <button
                                key={p}
                                onClick={() => onPatch({ priority: p })}
                                className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
                                    item.priority === p
                                        ? "bg-neutral-900 text-white border-neutral-900"
                                        : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                                }`}
                            >
                                {PRIORITY_LABEL[p]}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Notes */}
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">내부 메모</p>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        onBlur={() => { if ((notes || null) !== (item.notes ?? null)) onPatch({ notes: notes || null }); }}
                        rows={3}
                        placeholder="처리 내역·재현 노트…"
                        className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:border-neutral-400 resize-none"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                {saving && <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400"><Loader2 className="h-3 w-3 animate-spin" /> 저장 중</span>}
                <button
                    onClick={onDelete}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-600 transition-colors"
                >
                    <Trash2 className="h-3 w-3" /> 영구 삭제
                </button>
            </div>
        </Card>
    );
}
