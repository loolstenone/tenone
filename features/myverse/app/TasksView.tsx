"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CheckSquare, ChevronRight, ArrowRight, X, Clock, RotateCcw } from "lucide-react";
import type { MyverseTask } from "@/lib/myverse/types";

interface TaskWithDate extends MyverseTask {
    date: string;
}

type TabKey = "todo" | "done" | "carried" | "cancelled";
type SortKey = "time_asc" | "time_desc" | "alpha";

const TABS: { key: TabKey; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "todo",      label: "미완",  icon: <Clock className="h-3.5 w-3.5" />,        color: "text-neutral-600" },
    { key: "done",      label: "완료",  icon: <CheckSquare className="h-3.5 w-3.5" />,  color: "text-[#6366F1]" },
    { key: "carried",   label: "이월",  icon: <ArrowRight className="h-3.5 w-3.5" />,   color: "text-blue-500" },
    { key: "cancelled", label: "취소",  icon: <X className="h-3.5 w-3.5" />,            color: "text-neutral-400" },
];

const STATUS_ICONS: Record<string, string> = {
    todo: "□",
    done: "✓",
    carried: "→",
    cancelled: "✕",
};

function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}(${["일","월","화","수","목","금","토"][d.getDay()]})`;
}

function groupByDate(tasks: TaskWithDate[]) {
    const map: Record<string, TaskWithDate[]> = {};
    for (const t of tasks) {
        (map[t.date] ??= []).push(t);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

export function TasksView() {
    const [activeTab, setActiveTab] = useState<TabKey>("todo");
    const [grouped, setGrouped] = useState<Record<TabKey, TaskWithDate[]>>({
        todo: [], done: [], carried: [], cancelled: [],
    });
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<SortKey>("time_asc");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch("/api/myverse/tasks");
            if (!r.ok) return;
            const d = await r.json();
            setGrouped(d.grouped);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const current = grouped[activeTab];

    function sortTasks(tasks: TaskWithDate[]): TaskWithDate[] {
        return [...tasks].sort((a, b) => {
            if (sortKey === "alpha") return a.text.localeCompare(b.text, "ko");
            const ta = a.time ?? "99:99";
            const tb = b.time ?? "99:99";
            return sortKey === "time_asc" ? ta.localeCompare(tb) : tb.localeCompare(ta);
        });
    }

    const byDate = groupByDate(current).map(([date, tasks]) => [date, sortTasks(tasks)] as [string, TaskWithDate[]]);

    return (
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <h1 className="font-serif text-2xl text-neutral-900">할 일</h1>
                <span className="text-sm text-neutral-400">· 상태별 모아보기</span>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 mb-6 border-b border-neutral-200">
                {TABS.map((tab) => {
                    const count = grouped[tab.key].length;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
                                active
                                    ? "text-[#6366F1] font-semibold"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            <span className={active ? "text-[#6366F1]" : tab.color}>{tab.icon}</span>
                            {tab.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                                active ? "bg-[#6366F1]/10 text-[#6366F1]" : "bg-neutral-100 text-neutral-400"
                            }`}>
                                {count}
                            </span>
                            {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#6366F1]" />}
                        </button>
                    );
                })}

                <div className="ml-auto flex items-center gap-1">
                    {(["time_asc", "time_desc", "alpha"] as SortKey[]).map((sk) => (
                        <button
                            key={sk}
                            onClick={() => setSortKey(sk)}
                            className={`px-2 py-1 text-[10px] rounded transition-colors font-mono ${
                                sortKey === sk
                                    ? "bg-neutral-900 text-white"
                                    : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                            }`}
                        >
                            {sk === "time_asc" ? "시간↑" : sk === "time_desc" ? "시간↓" : "가나다"}
                        </button>
                    ))}
                    <button
                        onClick={load}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors ml-0.5"
                        title="새로고침"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-neutral-400 text-sm">불러오는 중…</div>
            ) : current.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-2">
                    <span className="text-3xl font-mono text-neutral-200">{STATUS_ICONS[activeTab]}</span>
                    <span className="text-sm">
                        {activeTab === "todo" ? "미완료 태스크가 없습니다" :
                         activeTab === "done" ? "완료된 태스크가 없습니다" :
                         activeTab === "carried" ? "이월된 태스크가 없습니다" :
                         "취소된 태스크가 없습니다"}
                    </span>
                </div>
            ) : (
                <div className="space-y-6">
                    {byDate.map(([date, tasks]) => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-2">
                                <Link
                                    href={`/myverse/app/daily?date=${date}`}
                                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-[#6366F1] transition-colors group"
                                >
                                    <span className="font-mono">{formatDate(date)}</span>
                                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <span className="text-[10px] text-neutral-300 font-mono">({tasks.length})</span>
                            </div>
                            <ul className="space-y-1 pl-1">
                                {tasks.map((task) => (
                                    <li key={task.id} className="flex items-start gap-2.5">
                                        <span className={`text-xs font-mono mt-0.5 shrink-0 w-4 text-center ${
                                            task.status === "done" ? "text-[#6366F1]" :
                                            task.status === "carried" ? "text-blue-400" :
                                            task.status === "cancelled" ? "text-neutral-300" :
                                            "text-neutral-400"
                                        }`}>
                                            {STATUS_ICONS[task.status]}
                                        </span>
                                        <span className={`text-sm leading-relaxed flex-1 ${
                                            task.status === "done" ? "text-neutral-500 line-through decoration-neutral-300" :
                                            task.status === "cancelled" ? "text-neutral-300 line-through" :
                                            task.status === "carried" ? "text-neutral-600" :
                                            "text-neutral-800"
                                        }`}>
                                            {task.text}
                                        </span>
                                        {task.time && (
                                            <span className="text-[10px] text-neutral-400 font-mono shrink-0 mt-0.5">
                                                {task.time}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
