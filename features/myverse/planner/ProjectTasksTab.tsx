"use client";

// 프로젝트별 업무 합산 뷰 — Daily에서 project_id로 태깅된 모든 업무를 한 곳에 모음
// 데이터 소스: myverse_daily.tasks (단일 SSOT)
// "업무" = task — 유니버스 전반에서 통일된 표기

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowUpRight, CheckCircle2, Circle, RotateCw, X as XIcon, Plus } from "lucide-react";
import { localDateStr } from "@/lib/myverse/types";

interface TaskItem {
    date: string;
    task: {
        id: string;
        text: string;
        status: string;
        time?: string | null;
        project_id?: string | null;
        source?: string;
    };
}

interface Stats {
    total: number;
    todo: number;
    done: number;
    carried: number;
    cancelled: number;
}

const STATUS_META: Record<string, { icon: typeof Circle; label: string; cls: string }> = {
    todo: { icon: Circle, label: "미완", cls: "text-neutral-400" },
    done: { icon: CheckCircle2, label: "완료", cls: "text-[#6366F1]" },
    carried: { icon: RotateCw, label: "이월", cls: "text-amber-500" },
    cancelled: { icon: XIcon, label: "취소", cls: "text-neutral-300 line-through" },
};

export function ProjectTasksTab({ projectId, projectColor }: { projectId: string; projectColor: string }) {
    const [items, setItems] = useState<TaskItem[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "todo" | "done" | "carried">("all");

    // 새 업무 입력
    const today = useMemo(() => localDateStr(new Date()), []);
    const [newDate, setNewDate] = useState(today);
    const [newText, setNewText] = useState("");
    const [adding, setAdding] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch(`/api/myverse/projects/${projectId}/tasks`);
            if (res.ok) {
                const d = await res.json();
                setItems(d.items ?? []);
                setStats(d.stats ?? null);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [projectId]);

    async function addTask() {
        const text = newText.trim();
        if (!text || !newDate) return;
        setAdding(true);
        try {
            const res = await fetch(`/api/myverse/projects/${projectId}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: newDate, text }),
            });
            if (res.ok) {
                setNewText("");
                await load();
            }
        } finally {
            setAdding(false);
        }
    }

    const filtered = items.filter(i => filter === "all" ? true : i.task.status === filter);
    const completionRate = stats && stats.total > 0
        ? Math.round((stats.done / stats.total) * 100)
        : 0;

    if (loading) {
        return (
            <div className="py-16 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
            </div>
        );
    }

    const isEmpty = !stats || stats.total === 0;

    return (
        <div className="space-y-3">
            {/* 새 업무 추가 — 항상 노출 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-3 flex items-center gap-2">
                <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="text-xs px-2 py-1.5 border border-neutral-200 rounded font-mono focus:outline-none focus:border-[#6366F1]"
                />
                <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
                    placeholder="이 프로젝트의 새 업무 추가…"
                    className="flex-1 text-sm bg-transparent focus:outline-none px-1"
                />
                <button
                    onClick={addTask}
                    disabled={adding || !newText.trim() || !newDate}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#6366F1] text-white text-xs rounded hover:bg-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                    {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    추가
                </button>
            </section>

            {isEmpty ? (
                <div className="bg-white border border-dashed border-neutral-300 rounded-xl py-8 px-5 text-center">
                    <p className="text-sm text-neutral-500 mb-1">아직 연결된 업무가 없어요.</p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                        위에서 직접 추가하거나, <Link href="/myverse/app/daily" className="text-[#6366F1] hover:underline">일간</Link>·<Link href="/myverse/app/weekly" className="text-[#6366F1] hover:underline">주간</Link>에서 업무 추가 시 이 프로젝트를 태그하세요.
                    </p>
                </div>
            ) : (
                <>
                    {/* 통계 */}
                    {stats && (
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xs tracking-widest text-neutral-500">집계</h2>
                                <span className="text-2xl font-serif text-neutral-900">{completionRate}<span className="text-sm text-neutral-400">%</span></span>
                            </div>
                            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${completionRate}%`, backgroundColor: projectColor }}
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <Cell label="전체" value={stats.total} />
                                <Cell label="미완" value={stats.todo} accent="text-neutral-700" />
                                <Cell label="완료" value={stats.done} accent="text-[#6366F1]" />
                                <Cell label="이월" value={stats.carried} accent="text-amber-600" />
                            </div>
                        </section>
                    )}

                    {/* 상태 탭 — IdentitySubNav 일관 패턴 */}
                    <nav className="flex items-center gap-1 border-b border-neutral-200">
                        {([
                            { k: "all" as const,     label: "전체" },
                            { k: "todo" as const,    label: "미완" },
                            { k: "done" as const,    label: "완료" },
                            { k: "carried" as const, label: "이월" },
                        ]).map(({ k, label }) => {
                            const isActive = filter === k;
                            return (
                                <button
                                    key={k}
                                    onClick={() => setFilter(k)}
                                    className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
                                        isActive
                                            ? "text-[#6366F1] font-semibold"
                                            : "text-neutral-500 hover:text-neutral-900"
                                    }`}
                                >
                                    {label}
                                    {isActive && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#6366F1]" />}
                                </button>
                            );
                        })}
                    </nav>

                    {/* 업무 리스트 (날짜 그룹) */}
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center bg-white border border-neutral-200 rounded-xl">
                            <p className="text-sm text-neutral-400">해당 상태의 업무가 없습니다.</p>
                        </div>
                    ) : (
                <section className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
                    {(() => {
                        const grouped: Record<string, TaskItem[]> = {};
                        for (const it of filtered) {
                            (grouped[it.date] ??= []).push(it);
                        }
                        return Object.entries(grouped).map(([date, list]) => (
                            <div key={date} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-neutral-500 font-mono">{date}</h3>
                                    <Link
                                        href={`/myverse/app/daily?date=${date}`}
                                        className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400 hover:text-[#6366F1] transition-colors"
                                    >
                                        일간 <ArrowUpRight className="h-2.5 w-2.5" />
                                    </Link>
                                </div>
                                <ul className="space-y-1">
                                    {list.map((i) => {
                                        const meta = STATUS_META[i.task.status] ?? STATUS_META.todo;
                                        const Icon = meta.icon;
                                        const strike = i.task.status === "done" || i.task.status === "cancelled";
                                        const isMilestone = i.task.source === "milestone";
                                        return (
                                            <li key={i.task.id} className="flex items-center gap-2 py-0.5">
                                                <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.cls}`} />
                                                {i.task.time && (
                                                    <span className="text-[10px] text-[#6366F1] font-mono shrink-0">{i.task.time.slice(0, 5)}</span>
                                                )}
                                                <span className={`text-sm ${strike ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                                                    {i.task.text}
                                                </span>
                                                {isMilestone && (
                                                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1] shrink-0">마일스톤</span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ));
                    })()}
                </section>
                    )}
                </>
            )}
        </div>
    );
}

function Cell({ label, value, accent = "text-neutral-900" }: { label: string; value: number; accent?: string }) {
    return (
        <div className="bg-neutral-50 rounded-lg py-2">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
            <p className={`text-lg font-semibold ${accent}`}>{value}</p>
        </div>
    );
}
