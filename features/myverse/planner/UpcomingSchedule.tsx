"use client";

// 향후 4주 일정 컴팩트 리스트 — DailyView에서 분리.

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { localDateStr } from "@/lib/myverse/types";
import { expandOccurrences, KIND_COLORS, type CalendarEntry, type CalendarKind } from "@/lib/myverse/calendar-rules";

const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

interface UpcomingTask {
    id: string;
    text: string;
    status: string;
    project_id?: string | null;
    source?: string;
    time?: string | null;
}

export function UpcomingSchedule({ date }: { date: string }) {
    const [offset, setOffset] = useState(0);
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [taskRows, setTaskRows] = useState<Array<{ date: string; tasks: UpcomingTask[] }>>([]);
    const [loading, setLoading] = useState(false);

    // date prop이 없어도 함수가 동작하도록 (현재는 미사용이지만 시그니처 유지)
    void date;

    const { from, to } = useMemo(() => {
        const today = localDateStr(new Date());
        const d1 = new Date(today + "T00:00:00"); d1.setDate(d1.getDate() + 1 + offset);
        const d2 = new Date(today + "T00:00:00"); d2.setDate(d2.getDate() + 28 + offset);
        return { from: localDateStr(d1), to: localDateStr(d2) };
    }, [offset]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([
            fetch(`/api/myverse/calendar?from=${from}&to=${to}`).then(r => r.ok ? r.json() : null),
            fetch(`/api/myverse/daily/range?from=${from}&to=${to}`).then(r => r.ok ? r.json() : null),
        ])
            .then(([cal, daily]) => {
                if (cancelled) return;
                if (cal?.entries) setEntries(cal.entries);
                if (daily?.rows) {
                    const rows = (daily.rows as Array<{ date: string; tasks: unknown }>)
                        .map(r => ({ date: r.date, tasks: Array.isArray(r.tasks) ? (r.tasks as UpcomingTask[]) : [] }))
                        .filter(r => r.tasks.length > 0);
                    setTaskRows(rows);
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [from, to]);

    // 캘린더 + 업무 통합 단일 리스트 (날짜 오름차순)
    const flatItems = useMemo(() => {
        type FlatItem =
            | { kind: Exclude<CalendarKind, "task">; date: string; entry: CalendarEntry; task?: undefined }
            | { kind: "task";       date: string; task: UpcomingTask;   entry?: undefined };
        const out: FlatItem[] = [];

        // 캘린더 엔트리 (anniversary, meeting)
        const calKinds: CalendarKind[] = ["anniversary", "meeting"];
        entries.forEach((e) => {
            if (!calKinds.includes(e.kind as CalendarKind)) return;
            expandOccurrences(e, from, to).forEach((o) => {
                out.push({ kind: e.kind as Exclude<CalendarKind, "task">, date: o.date, entry: e });
            });
        });

        // 업무 (취소·완료 제외)
        for (const row of taskRows) {
            for (const t of row.tasks) {
                if (!t || !t.text) continue;
                if (t.status === "cancelled" || t.status === "done") continue;
                out.push({ kind: "task", date: row.date, task: t });
            }
        }

        out.sort((a, b) => a.date.localeCompare(b.date));
        return out;
    }, [entries, taskRows, from, to]);

    const total = flatItems.length;
    // offset === 0 + 데이터 없음 → 카드 자체 숨김 (오늘 기준 향후 4주 무일정)
    // offset !== 0 + 데이터 없음 → 카드 유지 (과거·미래로 이동 중인 사용자)
    if (total === 0 && offset === 0) return null;

    const today = new Date(localDateStr(new Date()) + "T00:00:00");

    function renderFlatItem(o: typeof flatItems[number], i: number) {
        const d = new Date(o.date + "T00:00:00");
        const days = Math.round((d.getTime() - today.getTime()) / 86400000);
        const mmdd = `${d.getMonth() + 1}/${d.getDate()}`;
        const dow  = DAY_KO[d.getDay()];
        const dStr = days < 0 ? `D+${-days}` : days === 0 ? "D-Day" : `D-${days}`;

        if (o.kind === "task") {
            const isMs = o.task.source === "milestone";
            return (
                <li key={`task-${o.date}-${o.task.id}-${i}`}>
                    <a
                        href={`/myverse/app/daily?date=${o.date}`}
                        className="flex items-center gap-2 min-w-0 py-1 hover:bg-neutral-50 rounded transition-colors"
                    >
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span className="shrink-0 w-10 text-[10px] text-neutral-500 font-mono tabular-nums">
                            {mmdd}<span className="text-neutral-300 ml-0.5">({dow})</span>
                        </span>
                        <span className="flex-1 truncate text-xs text-neutral-700">{o.task.text}</span>
                        {isMs && <span className="shrink-0 text-[8px] uppercase tracking-wider px-1 py-px rounded bg-[#6366F1]/10 text-[#6366F1]">MS</span>}
                        <span className="shrink-0 text-[9px] tabular-nums text-neutral-300">{dStr}</span>
                    </a>
                </li>
            );
        }

        const c = KIND_COLORS[o.entry.kind as CalendarKind];
        return (
            <li key={`cal-${o.date}-${o.entry.id}-${i}`}>
                <a
                    href={`/myverse/app/daily?date=${o.date}`}
                    className="flex items-center gap-2 min-w-0 py-1 hover:bg-neutral-50 rounded transition-colors"
                >
                    <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${c.dot}`} />
                    <span className="shrink-0 w-10 text-[10px] text-neutral-500 font-mono tabular-nums">
                        {mmdd}<span className="text-neutral-300 ml-0.5">({dow})</span>
                    </span>
                    <span className="flex-1 truncate text-xs text-neutral-700">{o.entry.title}</span>
                    <span className="shrink-0 text-[9px] tabular-nums text-neutral-300">{dStr}</span>
                </a>
            </li>
        );
    }

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-center gap-1 mb-3">
                <button
                    onClick={() => setOffset(o => o - 28)}
                    title="이전 4주"
                    className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <div className="flex-1 text-center">
                    <h2 className="text-xs font-medium text-neutral-600">
                        {offset < 0 ? "과거 일정 & 업무" : offset > 0 ? "다음 일정 & 업무" : "향후 일정 & 업무"}
                    </h2>
                    {offset !== 0 && (
                        <button
                            onClick={() => setOffset(0)}
                            className="text-[9px] text-neutral-400 hover:text-[#6366F1] transition-colors mt-0.5"
                        >
                            오늘로 ↺
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setOffset(o => o + 28)}
                    title="다음 4주"
                    className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
            <div>
                {flatItems.length > 0 && (
                    <ul className="pl-1">
                        {flatItems.map((o, i) => renderFlatItem(o, i))}
                    </ul>
                )}
                {total === 0 && (
                    <div className="text-[11px] text-neutral-400 text-center py-6">
                        {loading ? "불러오는 중…" : `${from} ~ ${to} 일정 없음`}
                    </div>
                )}
                {total > 0 && (
                    <div className="flex items-center gap-3 pt-2 mt-1 border-t border-neutral-100">
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-rose-500" />
                            기념일
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-sky-500" />
                            미팅
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-teal-500" />
                            업무
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
}
