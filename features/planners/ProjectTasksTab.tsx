"use client";

// 프로젝트별 Task 합산 뷰 — Daily에서 project_id로 태깅된 모든 task를 한 곳에 모음
// 데이터 소스: planners_daily.tasks (단일 SSOT)

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowUpRight, CheckCircle2, Circle, RotateCw, X as XIcon } from "lucide-react";

interface TaskItem {
    date: string;
    task: {
        id: string;
        text: string;
        status: string;
        time?: string | null;
        project_id?: string | null;
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
    done: { icon: CheckCircle2, label: "완료", cls: "text-[#0F766E]" },
    carried: { icon: RotateCw, label: "이월", cls: "text-amber-500" },
    cancelled: { icon: XIcon, label: "취소", cls: "text-neutral-300 line-through" },
};

export function ProjectTasksTab({ projectId, projectColor }: { projectId: string; projectColor: string }) {
    const [items, setItems] = useState<TaskItem[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "todo" | "done" | "carried">("all");

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/planners/projects/${projectId}/tasks`);
                if (res.ok) {
                    const d = await res.json();
                    setItems(d.items ?? []);
                    setStats(d.stats ?? null);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [projectId]);

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

    return (
        <div className="space-y-4">
            {/* 통계 */}
            {stats && (
                <section className="bg-white border border-neutral-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs uppercase tracking-widest text-neutral-400">집계</h2>
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
                        <Cell label="완료" value={stats.done} accent="text-[#0F766E]" />
                        <Cell label="이월" value={stats.carried} accent="text-amber-600" />
                    </div>
                </section>
            )}

            {/* 필터 */}
            <div className="flex items-center gap-1.5">
                {([
                    { k: "all" as const,     label: "전체" },
                    { k: "todo" as const,    label: "미완" },
                    { k: "done" as const,    label: "완료" },
                    { k: "carried" as const, label: "이월" },
                ]).map(({ k, label }) => (
                    <button
                        key={k}
                        onClick={() => setFilter(k)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                            filter === k
                                ? "bg-[#0F766E] text-white"
                                : "bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* 태스크 리스트 (날짜 그룹) */}
            {filtered.length === 0 ? (
                <div className="py-12 text-center bg-white border border-neutral-200 rounded-xl">
                    <p className="text-sm text-neutral-400">
                        {filter === "all"
                            ? "이 프로젝트에 연결된 Task가 없습니다. Daily에서 Task를 추가할 때 이 프로젝트로 태그하세요."
                            : "해당 상태의 Task가 없습니다."}
                    </p>
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
                                        href={`/planners/app/daily?date=${date}`}
                                        className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400 hover:text-[#0F766E] transition-colors"
                                    >
                                        Daily <ArrowUpRight className="h-2.5 w-2.5" />
                                    </Link>
                                </div>
                                <ul className="space-y-1">
                                    {list.map((i) => {
                                        const meta = STATUS_META[i.task.status] ?? STATUS_META.todo;
                                        const Icon = meta.icon;
                                        const strike = i.task.status === "done" || i.task.status === "cancelled";
                                        return (
                                            <li key={i.task.id} className="flex items-center gap-2 py-0.5">
                                                <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.cls}`} />
                                                {i.task.time && (
                                                    <span className="text-[10px] text-[#0F766E] font-mono shrink-0">{i.task.time.slice(0, 5)}</span>
                                                )}
                                                <span className={`text-sm ${strike ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                                                    {i.task.text}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ));
                    })()}
                </section>
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
