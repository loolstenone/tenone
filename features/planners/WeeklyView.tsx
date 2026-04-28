"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { getWeekBoundaries, getISOWeek } from "@/lib/planners/types";
import { getLunarDate, HOLIDAYS } from "@/lib/planners/holidays";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { trackPlanners } from "@/lib/planners/analytics";
import type { PlannerWeekly } from "@/lib/planners/types";
import { CalendarEntryEditor } from "./CalendarEntryEditor";
import type { CalendarEntry, CalendarKind } from "@/lib/planners/calendar-rules";
import { useSwipeNav } from "./useSwipeNav";
import { KIND_COLORS, KIND_LABELS, expandOccurrences, isVisible } from "@/lib/planners/calendar-rules";

const MONTHS_KO = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DAYS_KO = ["일","월","화","수","목","금","토"];

interface WeekSummary {
    days_recorded: number;
    total_tasks: number;
    done_tasks: number;
    carried_tasks: number;
    completion_rate: number;
    notes_count: number;
    energy_avg: number | null;
}

interface DayData {
    tasks: Array<{ text: string; status: string }>;
    memo: string;
    weather: { temp: number; code: number } | null;
}

function weatherEmoji(code: number) {
    if (code === 0) return "☀️";
    if (code <= 2) return "🌤️";
    if (code <= 3) return "☁️";
    if (code <= 48) return "🌫️";
    if (code <= 57) return "🌧️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    if (code <= 86) return "🌨️";
    if (code <= 99) return "⛈️";
    return "🌡️";
}

export function WeeklyView({ initialYear, initialWeek }: { initialYear: number; initialWeek: number }) {
    const [year, setYear] = useState(initialYear);
    const [week, setWeek] = useState(initialWeek);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [reflection, setReflection] = useState("");
    const [summary, setSummary] = useState<WeekSummary | null>(null);
    const [dayDataMap, setDayDataMap] = useState<Record<string, DayData>>({});
    const [calEntries, setCalEntries] = useState<CalendarEntry[]>([]);
    const [calEditorOpen, setCalEditorOpen] = useState(false);
    const [calEditing, setCalEditing] = useState<Partial<CalendarEntry> | null>(null);
    const [calDefaultDate, setCalDefaultDate] = useState<string | undefined>(undefined);
    const [activeProjects, setActiveProjects] = useState<Array<{ id: string; title: string; color: string | null }>>([]);

    const boundaries = getWeekBoundaries(year, week);

    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(boundaries.start + "T00:00:00");
        d.setDate(d.getDate() + i);
        return d;
    });

    const startMonth = days[0].getMonth();
    const endMonth = days[6].getMonth();
    const displayMonth = startMonth === endMonth
        ? MONTHS_KO[startMonth]
        : `${MONTHS_KO[startMonth]} · ${MONTHS_KO[endMonth]}`;

    const _td = new Date();
    const today = `${_td.getFullYear()}-${String(_td.getMonth() + 1).padStart(2, "0")}-${String(_td.getDate()).padStart(2, "0")}`;

    function dsOf(d: Date) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    // 활성 프로젝트 1회 로드
    useEffect(() => {
        fetch("/api/planners/projects?status=active&limit=30")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.projects) setActiveProjects(d.projects); });
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const dayDates = days.map(dsOf);
            const [weekRes, sumRes, calRes, ...dailyResults] = await Promise.all([
                fetch(`/api/planners/weekly?year=${year}&week=${week}`),
                fetch(`/api/planners/summary?scope=weekly&year=${year}&week=${week}`),
                fetch(`/api/planners/calendar?from=${boundaries.start}&to=${boundaries.end}`),
                ...dayDates.map(ds => fetch(`/api/planners/daily?date=${ds}`)),
            ]);
            if (cancelled) return;

            const newDayData: Record<string, DayData> = {};
            for (let i = 0; i < dailyResults.length; i++) {
                const r = dailyResults[i];
                const ds = dayDates[i];
                newDayData[ds] = { tasks: [], memo: "", weather: null };
                if (!r.ok) continue;
                const d = await r.json();
                if (d.daily) {
                    newDayData[ds].tasks = Array.isArray(d.daily.tasks) ? d.daily.tasks : [];
                    if (d.daily.weather_temp != null && d.daily.weather_code != null) {
                        newDayData[ds].weather = { temp: d.daily.weather_temp, code: d.daily.weather_code };
                    }
                    try {
                        const arr = JSON.parse(d.daily.notes || "[]");
                        const cornell = Array.isArray(arr) ? arr.find((n: { type?: string }) => !n.type || n.type === "cornell") : null;
                        if (cornell?.content) {
                            // DailyView는 content를 {_cornell:true, rows:[...]} JSON으로 저장
                            try {
                                const parsed = JSON.parse(cornell.content);
                                if (parsed._cornell && Array.isArray(parsed.rows)) {
                                    newDayData[ds].memo = parsed.rows.map((rw: { note?: string }) => rw.note ?? "").join("\n\n").trim();
                                } else {
                                    newDayData[ds].memo = cornell.content;
                                }
                            } catch {
                                newDayData[ds].memo = cornell.content;
                            }
                        }
                    } catch { /* skip */ }
                }
            }
            setDayDataMap(newDayData);

            if (sumRes.ok) {
                const sd = await sumRes.json();
                setSummary(sd.summary || null);
            }
            if (calRes.ok) {
                const cd = await calRes.json();
                setCalEntries(cd.entries ?? []);
            }
            if (weekRes.ok) {
                const d = await weekRes.json();
                if (d.weekly) {
                    setReflection(d.weekly.reflection || "");
                } else {
                    setReflection("");
                }
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [year, week]);

    async function save(patch: Partial<PlannerWeekly>) {
        setSaving(true);
        try {
            await fetch(`/api/planners/weekly`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    year, week,
                    week_start: boundaries.start,
                    week_end: boundaries.end,
                    ...patch,
                }),
            });
            trackPlanners("planners_weekly_saved", { year, week, field: Object.keys(patch)[0] });
        } finally {
            setSaving(false);
        }
    }

    function navigateWeek(delta: number) {
        let newWeek = week + delta;
        let newYear = year;
        if (newWeek < 1) { newYear -= 1; newWeek = 52; }
        if (newWeek > 53) { newYear += 1; newWeek = 1; }
        setWeek(newWeek);
        setYear(newYear);
    }

    const swipeRef = useSwipeNav(
        () => navigateWeek(1),
        () => navigateWeek(-1),
    );

    // 캘린더 엔트리를 날짜별로 그룹핑 (반복 펼침 포함)
    const entriesByDate = useMemo(() => {
        const map: Record<string, CalendarEntry[]> = {};
        calEntries
            .filter((e) => isVisible(e.kind, "weekly"))
            .forEach((e) => {
                expandOccurrences(e, boundaries.start, boundaries.end).forEach(({ date }) => {
                    (map[date] ??= []).push(e);
                });
            });
        return map;
    }, [calEntries, boundaries.start, boundaries.end]);

    async function saveMemoForDay(ds: string, content: string) {
        try {
            const res = await fetch(`/api/planners/daily?date=${ds}`);
            const d = res.ok ? await res.json() : null;
            let arr: Array<Record<string, unknown>>;
            try {
                arr = JSON.parse(d?.daily?.notes || "[]");
                if (!Array.isArray(arr)) arr = [];
            } catch { arr = []; }
            const cornellIdx = arr.findIndex((n: Record<string, unknown>) => !n.type || n.type === "cornell");
            // DailyView 포맷(_cornell JSON)으로 저장해 양방향 호환
            const cornellContent = JSON.stringify({ _cornell: true, rows: [{ id: "r1", cue: "", note: content }] });
            if (cornellIdx >= 0) {
                arr[cornellIdx] = { ...arr[cornellIdx], content: cornellContent };
            } else {
                arr.unshift({
                    id: `n_default_${Date.now()}`,
                    type: "cornell",
                    title: "노트 1",
                    cue: "", content: cornellContent, summary: "",
                });
            }
            await fetch(`/api/planners/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: ds, notes: JSON.stringify(arr) }),
            });
        } catch { /* skip */ }
    }

    function refetchCalendar() {
        fetch(`/api/planners/calendar?from=${boundaries.start}&to=${boundaries.end}`)
            .then((r) => r.ok ? r.json() : null)
            .then((d) => { if (d?.entries) setCalEntries(d.entries); });
    }

    async function handleTaskCreated(task: { text: string; time?: string | null; project_id?: string | null; priority?: string | null; memo?: string | null }) {
        // calDefaultDate가 있으면 그 날, 없으면 오늘
        const targetDate = calDefaultDate || today;
        try {
            const r = await fetch(`/api/planners/daily?date=${targetDate}`);
            const d = r.ok ? await r.json() : null;
            const existing = Array.isArray(d?.daily?.tasks) ? d.daily.tasks : [];
            const newTask = {
                id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                text: task.text,
                status: "todo",
                time: task.time ?? null,
                project_id: task.project_id ?? null,
                priority: task.priority ?? null,
                memo: task.memo ?? null,
            };
            const updated = [...existing, newTask];
            await fetch(`/api/planners/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: targetDate, tasks: updated }),
            });
            // dayDataMap 업데이트
            setDayDataMap(prev => ({
                ...prev,
                [targetDate]: {
                    ...(prev[targetDate] ?? { memo: "", weather: null }),
                    tasks: updated,
                },
            }));
        } catch { /* skip */ }
    }

    return (
        <div ref={swipeRef} className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
            {/* Header */}
            {(() => {
                const sM = days[0].getMonth() + 1;
                const sD = days[0].getDate();
                const eM = days[6].getMonth() + 1;
                const eD = days[6].getDate();
                const rangeText = sM === eM
                    ? `${year}년 ${sM}월 ${sD}일 — ${eD}일`
                    : `${year}년 ${sM}월 ${sD}일 — ${eM}월 ${eD}일`;
                const todayInWeek = days.some(d => dsOf(d) === today);
                return (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={() => navigateWeek(-1)} className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <div className="flex items-center gap-2 min-w-0">
                                    <h1 className="font-serif text-2xl md:text-3xl text-neutral-900 whitespace-nowrap">
                                        {rangeText}
                                    </h1>
                                    {todayInWeek && (
                                        <span className="px-2 py-0.5 bg-[#0F766E] text-white text-xs font-semibold rounded-full shrink-0">
                                            이번 주
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => navigateWeek(1)} className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2">
                                <span className="font-mono text-neutral-400">W{String(week).padStart(2, "0")}</span>
                                <span className="text-neutral-300">·</span>
                                <span>{displayMonth}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => { setCalEditing(null); setCalDefaultDate(undefined); setCalEditorOpen(true); }}
                                title="일정 추가"
                                className="p-1.5 rounded text-neutral-300 hover:text-[#0F766E] hover:bg-neutral-100 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                            <PlannersUtilityLinks />
                            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-300" />}
                        </div>
                    </div>
                );
            })()}

            {loading ? (
                <div className="py-20 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="space-y-3">
                    {/* 7일 세로 목록 */}
                    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white divide-y divide-neutral-100">
                        {days.map((d) => {
                            const ds = dsOf(d);
                            const dayData = dayDataMap[ds] ?? { tasks: [], memo: "", weather: null };
                            const entries = entriesByDate[ds] ?? [];
                            const lunar = getLunarDate(ds);
                            const holiday = HOLIDAYS[ds];
                            const isSun = d.getDay() === 0;
                            const isSat = d.getDay() === 6;
                            const isToday = ds === today;

                            const dateColor = isToday
                                ? "text-[#0F766E]"
                                : isSun ? "text-rose-500"
                                : isSat ? "text-blue-500"
                                : "text-neutral-800";
                            const dayColor = isSun ? "text-rose-400" : isSat ? "text-blue-400" : "text-neutral-400";

                            // 절기 / 기념일 / 공휴일 (calendar entries)
                            const specialEntries = entries.filter(e => e.kind === "solar_term" || e.kind === "anniversary" || e.kind === "public_holiday");
                            const meetingEntries = entries.filter(e => e.kind === "meeting");

                            const todoTasks = dayData.tasks.filter(t => t.status === "todo" || t.status === "done");

                            return (
                                <div key={ds} className={`flex min-h-[100px] ${isToday ? "bg-[#0F766E]/[0.025]" : "bg-white"}`}>
                                    {/* 좌측: 날짜 정보 */}
                                    <div className="w-[32%] shrink-0 border-r border-neutral-100 px-4 py-3 flex flex-col gap-1.5">
                                        {/* 날짜 헤더 */}
                                        <div className="flex items-baseline gap-1.5 mb-0.5">
                                            <span className={`font-serif text-2xl leading-none font-light ${dateColor}`}>
                                                {String(d.getDate()).padStart(2, "0")}
                                            </span>
                                            <span className={`text-xs font-medium ${dayColor}`}>{DAYS_KO[d.getDay()]}</span>
                                            {isToday && <span className="text-[9px] text-[#0F766E] font-semibold ml-0.5">Today</span>}
                                            <span className="ml-auto flex items-center gap-1">
                                                {dayData.weather && (
                                                    <span className="text-[10px] text-neutral-500">
                                                        {weatherEmoji(dayData.weather.code)} {dayData.weather.temp}°
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => { setCalEditing(null); setCalDefaultDate(ds); setCalEditorOpen(true); }}
                                                    title="이 날 일정 추가"
                                                    className="p-0.5 rounded text-neutral-300 hover:text-[#0F766E] hover:bg-neutral-100 transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                                <Link
                                                    href={`/planners/app/daily?date=${ds}`}
                                                    title="Daily 보기"
                                                    className="p-0.5 rounded text-neutral-300 hover:text-[#0F766E] hover:bg-neutral-100 transition-colors"
                                                >
                                                    <ArrowUpRight className="h-3 w-3" />
                                                </Link>
                                            </span>
                                        </div>

                                        {/* 음력 */}
                                        {lunar && (
                                            <p className="text-[9px] text-neutral-300 font-mono leading-none">
                                                음력 {lunar.isLeap ? "윤" : ""}{lunar.month}월 {lunar.day}일
                                            </p>
                                        )}

                                        {/* 공휴일 */}
                                        {holiday && (
                                            <p className={`text-[10px] font-medium leading-tight ${
                                                holiday.type === "holiday" ? "text-rose-500" :
                                                holiday.type === "memorial" ? "text-rose-400" :
                                                holiday.type === "commemoration" ? "text-amber-600" :
                                                "text-emerald-600"
                                            }`}>
                                                {holiday.label}
                                            </p>
                                        )}

                                        {/* 절기 / 기념일 (calendar entries) */}
                                        {specialEntries.map((e) => {
                                            const c = KIND_COLORS[e.kind as CalendarKind];
                                            return (
                                                <p key={e.id} className={`text-[10px] leading-tight flex items-center gap-1 ${c.text}`}>
                                                    <span className={`w-1 h-1 rounded-full ${c.dot} shrink-0`} />
                                                    <span className="truncate">{e.title}</span>
                                                </p>
                                            );
                                        })}

                                        {/* 미팅/일정 */}
                                        {meetingEntries.map((e) => {
                                            const c = KIND_COLORS[e.kind as CalendarKind];
                                            return (
                                                <button
                                                    key={e.id}
                                                    onClick={() => { setCalEditing(e); setCalEditorOpen(true); }}
                                                    className={`text-[10px] leading-tight flex items-center gap-1 text-left hover:opacity-80 transition-opacity ${c.text}`}
                                                >
                                                    <span className={`w-1 h-1 rounded-full ${c.dot} shrink-0`} />
                                                    <span className="truncate">{e.start_time ? `${e.start_time.slice(0,5)} ` : ""}{e.title}</span>
                                                </button>
                                            );
                                        })}

                                        {/* 업무 (Daily tasks) */}
                                        {todoTasks.length > 0 && (
                                            <div className="mt-0.5 space-y-0.5">
                                                {todoTasks.slice(0, 5).map((t, i) => (
                                                    <p key={i} className={`text-[10px] leading-tight truncate ${
                                                        t.status === "done" ? "text-neutral-300 line-through" : "text-neutral-600"
                                                    }`}>
                                                        · {t.text}
                                                    </p>
                                                ))}
                                                {todoTasks.length > 5 && (
                                                    <p className="text-[9px] text-neutral-400">+{todoTasks.length - 5}개</p>
                                                )}
                                            </div>
                                        )}

                                        {/* 아무것도 없을 때 */}
                                        {!holiday && specialEntries.length === 0 && meetingEntries.length === 0 && todoTasks.length === 0 && (
                                            <p className="text-[10px] text-neutral-200">—</p>
                                        )}
                                    </div>

                                    {/* 우측: 메모 */}
                                    <div className="flex-1 px-4 py-3">
                                        <textarea
                                            value={dayData.memo}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setDayDataMap(prev => ({
                                                    ...prev,
                                                    [ds]: { ...prev[ds], memo: v }
                                                }));
                                            }}
                                            onBlur={(e) => saveMemoForDay(ds, e.target.value)}
                                            placeholder="노트…"
                                            className="w-full h-full min-h-[80px] text-sm text-neutral-700 placeholder:text-neutral-200 focus:outline-none bg-transparent resize-none leading-relaxed"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 주간 통계 */}
                    {summary && summary.days_recorded > 0 && (
                        <section className="border border-neutral-200 rounded-xl p-4">
                            <div className="grid grid-cols-5 gap-3">
                                <SummaryStat label="기록 일수" value={`${summary.days_recorded}일`} />
                                <SummaryStat label="완료율" value={`${summary.completion_rate}%`} />
                                <SummaryStat label="완료" value={`${summary.done_tasks}개`} />
                                <SummaryStat label="이월" value={`${summary.carried_tasks}개`} />
                                <SummaryStat label="에너지" value={summary.energy_avg !== null ? `${summary.energy_avg}/5` : "—"} />
                            </div>
                        </section>
                    )}

                    {/* 주간 회고 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-5">
                        <h2 className="text-[10px] font-semibold text-neutral-900 uppercase tracking-widest mb-3">주간 회고</h2>
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            onBlur={() => save({ reflection })}
                            placeholder="이번 주를 돌아보며…"
                            rows={4}
                            className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                        />
                    </section>
                </div>
            )}

            <CalendarEntryEditor
                open={calEditorOpen}
                onClose={() => { setCalEditorOpen(false); setCalEditing(null); setCalDefaultDate(undefined); }}
                onSaved={refetchCalendar}
                onDeleted={refetchCalendar}
                initial={calEditing ?? undefined}
                defaultDate={calDefaultDate}
                onTaskCreated={handleTaskCreated}
                activeProjects={activeProjects}
            />
        </div>
    );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-neutral-50 rounded-lg p-3 text-center">
            <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
            <p className="text-lg font-semibold text-neutral-900">{value}</p>
        </div>
    );
}
