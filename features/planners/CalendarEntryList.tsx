"use client";

// 캘린더 엔트리 리스트 — Daily/Weekly 본문에서 시간 기반 표시
// Monthly/Yearly 는 캘린더 셀 안에 dot/title 만 보여주므로 별도 렌더 사용

import { Plus, Repeat, Lock } from "lucide-react";
import type { CalendarEntry, ViewScope } from "@/lib/planners/calendar-rules";
import { entriesForView, KIND_COLORS, KIND_LABELS, monthlyDisplayMode } from "@/lib/planners/calendar-rules";

interface Props {
    entries: CalendarEntry[];
    view: ViewScope;
    /** 날짜 범위 — Daily 면 from===to */
    from: string;
    to: string;
    onAdd?: () => void;
    onEdit?: (entry: CalendarEntry) => void;
    /** 그룹 헤더 라벨 — 기본 'Schedule' */
    label?: string;
}

export function CalendarEntryList({ entries, view, from, to, onAdd, onEdit, label = "Schedule" }: Props) {
    const occurrences = entriesForView(entries, view, from, to);
    const sorted = [...occurrences].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        const ta = a.entry.start_time || "00:00";
        const tb = b.entry.start_time || "00:00";
        return ta.localeCompare(tb);
    });

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs uppercase tracking-widest text-neutral-400">{label}</h2>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#0F766E] hover:bg-[#0F766E]/10"
                    >
                        <Plus className="h-3 w-3" /> 추가
                    </button>
                )}
            </div>
            {sorted.length === 0 ? (
                <p className="text-sm text-neutral-300 italic py-2">일정이 없습니다.</p>
            ) : (
                <ul className="space-y-1">
                    {sorted.map(({ date, entry }) => {
                        const c = KIND_COLORS[entry.kind];
                        const monthlyMode = view === "monthly" ? monthlyDisplayMode(entry.kind) : null;
                        const showTime = view !== "monthly" && view !== "yearly" && entry.start_time && entry.kind !== "anniversary";
                        const titleOnly = monthlyMode === "title";
                        return (
                            <li key={`${entry.id}-${date}`}>
                                <button
                                    type="button"
                                    onClick={() => onEdit?.(entry)}
                                    className={`w-full flex items-start gap-2 px-2 py-1.5 rounded hover:bg-neutral-50 text-left transition-colors`}
                                >
                                    <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${c.dot}`} />
                                    {view !== "daily" && (
                                        <span className="text-[10px] font-mono text-neutral-300 w-12 shrink-0 mt-0.5">
                                            {date.slice(5)}
                                        </span>
                                    )}
                                    {showTime && !titleOnly && (
                                        <span className="text-[11px] font-mono text-neutral-400 w-12 shrink-0 mt-0.5">
                                            {entry.start_time?.slice(0, 5)}
                                        </span>
                                    )}
                                    <span className="flex-1 min-w-0">
                                        <span className="text-sm text-neutral-800">
                                            {entry.title}
                                        </span>
                                        {!titleOnly && entry.description && (
                                            <span className="block text-[11px] text-neutral-400 truncate">
                                                {entry.description}
                                            </span>
                                        )}
                                    </span>
                                    <span className="flex items-center gap-1 shrink-0 mt-0.5">
                                        {entry.recurrence !== "none" && (
                                            <Repeat className="h-3 w-3 text-neutral-300" />
                                        )}
                                        {entry.is_system && (
                                            <Lock className="h-3 w-3 text-neutral-300" />
                                        )}
                                        <span className={`text-[9px] uppercase tracking-wider ${c.text} opacity-60`}>
                                            {KIND_LABELS[entry.kind]}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
