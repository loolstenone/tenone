"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ArrowUpRight, Plus, LayoutList, CalendarDays, Sun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, Thermometer } from "lucide-react";
import Link from "next/link";
import { getWeekBoundaries, getISOWeek } from "@/lib/planners/types";
import { getLunarDate, HOLIDAYS } from "@/lib/planners/holidays";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { trackPlanners } from "@/lib/planners/analytics";
import type { PlannerWeekly } from "@/lib/planners/types";
import type { PlannerRole } from "@/lib/planners/types";
import { CalendarEntryEditor } from "./CalendarEntryEditor";
import type { CalendarEntry, CalendarKind } from "@/lib/planners/calendar-rules";
import { useSwipeNav } from "./useSwipeNav";
import { KIND_COLORS, KIND_LABELS, expandOccurrences, isVisible } from "@/lib/planners/calendar-rules";
import { CATEGORY_SOFT_COLORS as CATEGORY_COLORS } from "@/lib/planners/categories";
import { StudentTimetable } from "./StudentTimetable";

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

interface Routine {
    id: string;
    date: string;
    activity: string;
    start_time: string | null;
    end_time: string | null;
    category: string;
}

const SCHEDULE_START = 6 * 60;
const SLOT_HEIGHT = 56;
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

function timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m ?? 0);
}
function minuteToTop(minutes: number): number {
    return ((minutes - SCHEDULE_START) / 60) * SLOT_HEIGHT;
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
    const cls = className ?? "h-3 w-3";
    if (code === 0) return <Sun className={cls} />;
    if (code <= 2)  return <Cloud className={cls} />;
    if (code <= 3)  return <Cloud className={cls} />;
    if (code <= 48) return <CloudFog className={cls} />;
    if (code <= 57) return <CloudDrizzle className={cls} />;
    if (code <= 67) return <CloudRain className={cls} />;
    if (code <= 77) return <CloudSnow className={cls} />;
    if (code <= 82) return <CloudRain className={cls} />;
    if (code <= 86) return <CloudSnow className={cls} />;
    if (code <= 99) return <CloudLightning className={cls} />;
    return <Thermometer className={cls} />;
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
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<PlannerRole | null>(null);
    const [weekViewMode, setWeekViewMode] = useState<"list" | "schedule">("list");
    const [routinesByDate, setRoutinesByDate] = useState<Record<string, Routine[]>>({});
    const [routinesLoading, setRoutinesLoading] = useState(false);

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

    // 활성 프로젝트 + 역할 1회 로드
    useEffect(() => {
        fetch("/api/planners/projects?status=active&limit=30")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.projects) setActiveProjects(d.projects); });
        fetch("/api/planners/settings")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.user?.user_role) setUserRole(d.user.user_role as PlannerRole); });
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

    useEffect(() => {
        if (weekViewMode !== "schedule") return;
        let cancelled = false;
        (async () => {
            setRoutinesLoading(true);
            const dayDates = days.map(dsOf);
            const results = await Promise.all(
                dayDates.map(ds => fetch(`/api/planners/routines?date=${ds}`).then(r => r.ok ? r.json() : { routines: [] }))
            );
            if (cancelled) return;
            const byDate: Record<string, Routine[]> = {};
            for (let i = 0; i < dayDates.length; i++) {
                byDate[dayDates[i]] = results[i].routines ?? [];
            }
            setRoutinesByDate(byDate);
            setRoutinesLoading(false);
        })();
        return () => { cancelled = true; };
    }, [weekViewMode, year, week]);

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

    // 드래그앤드롭 — task를 다른 날짜로 이동
    async function moveTaskBetweenDays(fromDate: string, toDate: string, taskIndex: number) {
        if (fromDate === toDate) return;
        const fromTasksOrig = dayDataMap[fromDate]?.tasks ?? [];
        if (taskIndex < 0 || taskIndex >= fromTasksOrig.length) return;
        const fromTasks = [...fromTasksOrig];
        const [moved] = fromTasks.splice(taskIndex, 1);
        const toTasks = [...(dayDataMap[toDate]?.tasks ?? []), moved];
        // optimistic update
        setDayDataMap(prev => ({
            ...prev,
            [fromDate]: { ...(prev[fromDate] ?? { memo: "", weather: null, tasks: [] }), tasks: fromTasks },
            [toDate]:   { ...(prev[toDate]   ?? { memo: "", weather: null, tasks: [] }), tasks: toTasks },
        }));
        // server save (병렬)
        try {
            await Promise.all([
                fetch(`/api/planners/daily`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: fromDate, tasks: fromTasks }),
                }),
                fetch(`/api/planners/daily`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: toDate, tasks: toTasks }),
                }),
            ]);
        } catch { /* 실패 시 다음 페치에서 회복 */ }
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
        <div ref={swipeRef} className="pp-view max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
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
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigateWeek(-1)} className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <div className="flex items-center gap-2 min-w-0">
                                    <h1
                                        className={`font-serif text-2xl md:text-3xl text-neutral-900 whitespace-nowrap ${
                                            todayInWeek ? "underline decoration-[#0F766E] decoration-2 underline-offset-[6px]" : ""
                                        }`}
                                        title={todayInWeek ? "이번 주" : undefined}
                                    >
                                        {rangeText}
                                    </h1>
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
                            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setWeekViewMode("list")}
                                    title="목록 보기"
                                    className={`p-1.5 transition-colors ${weekViewMode === "list" ? "bg-neutral-100 text-neutral-700" : "text-neutral-400 hover:text-neutral-600"}`}
                                >
                                    <LayoutList className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => setWeekViewMode("schedule")}
                                    title="스케줄 보기"
                                    className={`p-1.5 transition-colors ${weekViewMode === "schedule" ? "bg-neutral-100 text-neutral-700" : "text-neutral-400 hover:text-neutral-600"}`}
                                >
                                    <CalendarDays className="h-3.5 w-3.5" />
                                </button>
                            </div>
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
                    {weekViewMode === "schedule" ? (
                        /* ── 스케줄 보기 (Google Calendar 스타일) ── */
                        (() => {
                            const now = new Date();
                            const nowMin = now.getHours() * 60 + now.getMinutes();
                            const nowTop = minuteToTop(nowMin);
                            return (
                                <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                                    {routinesLoading ? (
                                        <div className="py-20 text-center text-neutral-400 text-sm">로딩 중…</div>
                                    ) : (
                                        <div className="flex overflow-x-auto">
                                            {/* 시간 라벨 컬럼 */}
                                            <div className="shrink-0 w-14 border-r border-neutral-100">
                                                <div className="h-14 border-b border-neutral-100 flex items-end justify-end pb-1 pr-2">
                                                    <span className="text-[8px] text-neutral-300 font-mono">GMT+9</span>
                                                </div>
                                                <div className="min-h-[28px] border-b border-neutral-100" />
                                                <div className="relative" style={{ height: HOURS.length * SLOT_HEIGHT }}>
                                                    {HOURS.map(h => (
                                                        <div key={h} className="absolute w-full flex justify-end pr-2" style={{ top: (h - 6) * SLOT_HEIGHT - 7 }}>
                                                            <span className="text-[9px] text-neutral-300 font-mono">
                                                                {String(h).padStart(2, "0")}:00
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* 7일 컬럼 */}
                                            {days.map(d => {
                                                const ds = dsOf(d);
                                                const isSun = d.getDay() === 0;
                                                const isSat = d.getDay() === 6;
                                                const isToday = ds === today;
                                                const dayRoutines = routinesByDate[ds] ?? [];
                                                const dayEntries = entriesByDate[ds] ?? [];
                                                const holiday = HOLIDAYS[ds];
                                                // calEntries 기반 종일 항목
                                                const allDayEntries = dayEntries.filter(e =>
                                                    !e.start_time &&
                                                    (e.kind === "public_holiday" || e.kind === "solar_term" || e.kind === "anniversary")
                                                );
                                                // 정적 공휴일/절기 — calEntries에 중복 없을 때만 추가
                                                const staticHolidayItems: { label: string; kind: "public_holiday" | "solar_term" }[] = [];
                                                if (holiday) {
                                                    const alreadyCovered = allDayEntries.some(e => e.title === holiday.label);
                                                    if (!alreadyCovered) {
                                                        staticHolidayItems.push({
                                                            label: holiday.label,
                                                            kind: holiday.type === "solar_term" ? "solar_term" : "public_holiday",
                                                        });
                                                    }
                                                }
                                                const timedEntries = dayEntries.filter(e => e.start_time && (e.kind === "meeting" || e.kind === "task"));
                                                return (
                                                    <div key={ds} className="flex-1 min-w-[80px] border-r border-neutral-100 last:border-r-0">
                                                        {/* 헤더 */}
                                                        <div className={`h-14 border-b border-neutral-100 flex flex-col items-center justify-center gap-0.5 ${isToday ? "bg-[#0F766E]/[0.02]" : ""}`}>
                                                            <span className={`text-[9px] font-medium tracking-wider ${isSun ? "text-rose-400" : isSat ? "text-blue-400" : "text-neutral-400"}`}>
                                                                {DAYS_KO[d.getDay()]}
                                                            </span>
                                                            {isToday ? (
                                                                <span className="w-7 h-7 rounded-full bg-[#0F766E] flex items-center justify-center text-sm font-semibold text-white leading-none">
                                                                    {d.getDate()}
                                                                </span>
                                                            ) : (
                                                                <span className={`text-sm font-semibold leading-none ${isSun ? "text-rose-500" : isSat ? "text-blue-500" : "text-neutral-700"}`}>
                                                                    {d.getDate()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* 종일 이벤트 행 */}
                                                        <div className={`min-h-[28px] border-b border-neutral-100 planners-dark:border-white/[0.06] px-0.5 py-0.5 flex flex-col gap-0.5 ${isToday ? "bg-[#0F766E]/[0.02]" : ""}`}>
                                                            {staticHolidayItems.map(h => {
                                                                const c = KIND_COLORS[h.kind];
                                                                return (
                                                                    <div key={h.label} className={`text-[10px] font-medium leading-tight px-1 py-0.5 rounded ${c.bg} ${c.text} truncate`}>
                                                                        {h.label}
                                                                    </div>
                                                                );
                                                            })}
                                                            {allDayEntries.map(e => {
                                                                const c = KIND_COLORS[e.kind as CalendarKind];
                                                                return (
                                                                    <div key={e.id} className={`text-[10px] font-medium leading-tight px-1 py-0.5 rounded ${c.bg} ${c.text} truncate`}>
                                                                        {e.title}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {/* 시간 그리드 */}
                                                        <div
                                                            className={`group/grid relative cursor-pointer transition-colors hover:bg-[#0F766E]/[0.025] ${isToday ? "bg-[#0F766E]/[0.015]" : ""}`}
                                                            style={{ height: HOURS.length * SLOT_HEIGHT }}
                                                            title="빈 시간대를 클릭해 일정 추가 (30분 단위)"
                                                            onMouseMove={(e) => {
                                                                if ((e.target as HTMLElement).closest("[data-cal-entry]")) {
                                                                    e.currentTarget.style.setProperty("--hover-show", "0");
                                                                    return;
                                                                }
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                const offsetY = e.clientY - rect.top;
                                                                const slotIdx = Math.round(offsetY / (SLOT_HEIGHT / 2));
                                                                const top = Math.max(0, Math.min(slotIdx * (SLOT_HEIGHT / 2), HOURS.length * SLOT_HEIGHT));
                                                                e.currentTarget.style.setProperty("--hover-top", `${top}px`);
                                                                e.currentTarget.style.setProperty("--hover-show", "1");
                                                            }}
                                                            onMouseLeave={(e) => e.currentTarget.style.setProperty("--hover-show", "0")}
                                                            onClick={(e) => {
                                                                // 이미 배치된 이벤트 클릭 시 무시
                                                                if ((e.target as HTMLElement).closest("[data-cal-entry]")) return;
                                                                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                                                                const offsetY = e.clientY - rect.top;
                                                                const rawMin = SCHEDULE_START + (offsetY / SLOT_HEIGHT) * 60;
                                                                const snappedMin = Math.round(rawMin / 30) * 30;
                                                                const clamped = Math.max(SCHEDULE_START, Math.min(snappedMin, 22 * 60));
                                                                const hh = String(Math.floor(clamped / 60)).padStart(2, "0");
                                                                const mm = String(clamped % 60).padStart(2, "0");
                                                                const endMin = Math.min(clamped + 60, 23 * 60);
                                                                const ehh = String(Math.floor(endMin / 60)).padStart(2, "0");
                                                                const emm = String(endMin % 60).padStart(2, "0");
                                                                setCalDefaultDate(ds);
                                                                setCalEditing({ kind: "meeting", start_time: `${hh}:${mm}`, end_time: `${ehh}:${emm}` } as any);
                                                                setCalEditorOpen(true);
                                                            }}
                                                        >
                                                            {/* 시간선 정시 + 30분 */}
                                                            {HOURS.map(h => (
                                                                <div key={h}>
                                                                    <div className="absolute w-full border-t border-neutral-100/70 planners-dark:border-white/[0.05]" style={{ top: (h - 6) * SLOT_HEIGHT }} />
                                                                    <div className="absolute w-full border-t border-neutral-100/40 planners-dark:border-white/[0.025]" style={{ top: (h - 6) * SLOT_HEIGHT + SLOT_HEIGHT / 2 }} />
                                                                </div>
                                                            ))}
                                                            {/* 호버 시 30분 슬롯 미리보기 — 점선 + "+ 일정" 칩 */}
                                                            <div
                                                                className="hidden md:flex absolute left-0 right-0 pointer-events-none border-t border-dashed border-[#0F766E]/50 z-[5] items-start"
                                                                style={{
                                                                    top: "var(--hover-top, 0px)",
                                                                    opacity: "var(--hover-show, 0)",
                                                                    transition: "opacity 80ms",
                                                                }}
                                                            >
                                                                <span className="text-[9px] font-medium text-white bg-[#0F766E] px-1 py-px rounded-sm leading-tight ml-0.5 -mt-px">
                                                                    + 일정
                                                                </span>
                                                            </div>
                                                            {/* 루틴 이벤트 */}
                                                            {dayRoutines.filter(r => r.start_time).map(r => {
                                                                const startMin = timeToMinutes(r.start_time!);
                                                                const endMin = r.end_time ? timeToMinutes(r.end_time) : startMin + 60;
                                                                const top = minuteToTop(Math.max(startMin, SCHEDULE_START));
                                                                const height = Math.max(((endMin - startMin) / 60) * SLOT_HEIGHT, 18);
                                                                const colors = CATEGORY_COLORS[r.category] ?? CATEGORY_COLORS.general;
                                                                return (
                                                                    <div
                                                                        key={r.id}
                                                                        data-cal-entry
                                                                        className={`absolute left-0.5 right-0.5 rounded border-l-2 px-1 py-0.5 overflow-hidden ${colors.bg} ${colors.text} ${colors.border}`}
                                                                        style={{ top, height }}
                                                                    >
                                                                        <p className="text-[11px] font-medium leading-tight truncate">{r.activity}</p>
                                                                        {height > 30 && (
                                                                            <p className="text-[10px] opacity-60 leading-tight mt-0.5">
                                                                                {r.start_time}{r.end_time ? `–${r.end_time}` : ""}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                            {/* 캘린더 엔트리 (미팅 — 시간 있는 것) */}
                                                            {timedEntries.map(e => {
                                                                const startMin = timeToMinutes(e.start_time!);
                                                                const endMin = e.end_time ? timeToMinutes(e.end_time) : startMin + 60;
                                                                const top = minuteToTop(Math.max(startMin, SCHEDULE_START));
                                                                const height = Math.max(((endMin - startMin) / 60) * SLOT_HEIGHT, 18);
                                                                const c = KIND_COLORS[e.kind as CalendarKind];
                                                                return (
                                                                    <div
                                                                        key={e.id}
                                                                        data-cal-entry
                                                                        className={`absolute left-0.5 right-0.5 rounded border-l-2 border-l-sky-400 px-1 py-0.5 overflow-hidden ${c.bg} ${c.text}`}
                                                                        style={{ top, height }}
                                                                    >
                                                                        <p className="text-[11px] font-medium leading-tight truncate">{e.title}</p>
                                                                        {height > 30 && (
                                                                            <p className="text-[10px] opacity-60 leading-tight mt-0.5">
                                                                                {e.start_time}{e.end_time ? `–${e.end_time}` : ""}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                            {/* 현재 시간 인디케이터 (오늘 컬럼만) */}
                                                            {isToday && nowMin >= SCHEDULE_START && nowMin <= 22 * 60 + 59 && (
                                                                <div className="absolute w-full flex items-center pointer-events-none z-10" style={{ top: nowTop - 1 }}>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 -ml-0.5" />
                                                                    <div className="flex-1 h-px bg-rose-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    ) : (
                    /* ── 목록 보기 ── */
                    <div className="border border-neutral-200 planners-dark:border-white/[0.07] rounded-xl overflow-hidden bg-white divide-y divide-neutral-100 planners-dark:divide-white/[0.07]">
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

                            // 절기 / 공휴일 (국가) / 개인 기념일 분리
                            const publicEntries = entries.filter(e => e.kind === "solar_term" || e.kind === "public_holiday");
                            const anniversaryEntries = entries.filter(e => e.kind === "anniversary");
                            const meetingEntries = entries.filter(e => e.kind === "meeting");

                            const todoTasks = dayData.tasks.filter(t => t.status === "todo" || t.status === "done");

                            return (
                                <div
                                    key={ds}
                                    onDragOver={(e) => {
                                        if (e.dataTransfer.types.includes("application/x-pp-task")) {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = "move";
                                            if (dragOverDate !== ds) setDragOverDate(ds);
                                        }
                                    }}
                                    onDragLeave={(e) => {
                                        // 자식 요소로 이동하는 경우는 무시
                                        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                                        if (dragOverDate === ds) setDragOverDate(null);
                                    }}
                                    onDrop={(e) => {
                                        const data = e.dataTransfer.getData("application/x-pp-task");
                                        if (!data) return;
                                        e.preventDefault();
                                        try {
                                            const { fromDate, taskIndex } = JSON.parse(data);
                                            void moveTaskBetweenDays(fromDate, ds, taskIndex);
                                        } catch { /* noop */ }
                                        setDragOverDate(null);
                                    }}
                                    className={`flex min-h-[100px] transition-colors ${
                                        isToday ? "bg-[#0F766E]/[0.025]" : "bg-white"
                                    } ${dragOverDate === ds ? "ring-2 ring-[#0F766E] ring-inset bg-[#0F766E]/[0.04]" : ""}`}
                                >
                                    {/* 좌측: 날짜 정보 — 수직 구조 */}
                                    <div className="w-[32%] shrink-0 border-r border-neutral-100 planners-dark:border-white/[0.07] px-3 py-3 flex flex-col gap-1 overflow-hidden">

                                        {/* ① 날짜 요일 + 화살표 */}
                                        <div className="flex items-baseline gap-1">
                                            <span
                                                className={`font-serif text-2xl leading-none font-light ${dateColor} ${
                                                    isToday ? "underline decoration-[#0F766E] decoration-2 underline-offset-[5px]" : ""
                                                }`}
                                                title={isToday ? "오늘" : undefined}
                                            >
                                                {String(d.getDate()).padStart(2, "0")}
                                            </span>
                                            <span className={`text-xs font-medium ${dayColor}`}>{DAYS_KO[d.getDay()]}</span>
                                            <Link
                                                href={`/planners/app/daily?date=${ds}`}
                                                title="Daily 보기"
                                                className="ml-auto p-0.5 rounded text-neutral-300 hover:text-[#0F766E] hover:bg-neutral-100 transition-colors shrink-0"
                                            >
                                                <ArrowUpRight className="h-3 w-3" />
                                            </Link>
                                        </div>

                                        {/* ② 날씨 */}
                                        {dayData.weather && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {dayData.weather && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] md:text-xs text-neutral-400">
                                                        <WeatherIcon code={dayData.weather.code} />
                                                        {dayData.weather.temp}°
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* ③ 음력 */}
                                        {lunar && (
                                            <p className="text-[9px] md:text-[11px] text-neutral-300 font-mono leading-none">
                                                음{lunar.isLeap ? "윤" : ""}{lunar.month}/{lunar.day}
                                            </p>
                                        )}

                                        {/* ④ 국가 기념일 · 절기 */}
                                        {(holiday || publicEntries.length > 0) && (
                                            <div className="space-y-0.5">
                                                {holiday && (
                                                    <p className={`text-[10px] md:text-xs leading-tight truncate ${
                                                        holiday.type === "holiday" ? "text-rose-500" :
                                                        holiday.type === "memorial" ? "text-rose-400" :
                                                        holiday.type === "commemoration" ? "text-amber-600" :
                                                        "text-emerald-600"
                                                    }`}>{holiday.label}</p>
                                                )}
                                                {publicEntries.map((e) => (
                                                    <p key={e.id} className={`text-[10px] md:text-xs leading-tight truncate ${KIND_COLORS[e.kind as CalendarKind].text}`}>
                                                        {e.title}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* ⑤ 개인 기념일 · 일정(미팅) · 업무 */}
                                        {(anniversaryEntries.length > 0 || meetingEntries.length > 0 || todoTasks.length > 0) && (
                                            <div className="space-y-0.5 mt-0.5">
                                                {anniversaryEntries.map((e) => (
                                                    <p key={e.id} className={`text-[10px] md:text-xs leading-tight truncate ${KIND_COLORS[e.kind as CalendarKind].text}`}>
                                                        {e.title}
                                                    </p>
                                                ))}
                                                {meetingEntries.map((e) => (
                                                    <button
                                                        key={e.id}
                                                        onClick={() => { setCalEditing(e); setCalEditorOpen(true); }}
                                                        className={`w-full text-[10px] md:text-xs leading-tight text-left truncate hover:opacity-80 transition-opacity ${KIND_COLORS[e.kind as CalendarKind].text}`}
                                                    >
                                                        {e.start_time ? `${e.start_time.slice(0,5)} ` : ""}{e.title}
                                                    </button>
                                                ))}
                                                {todoTasks.slice(0, 4).map((t) => {
                                                    const origIdx = dayData.tasks.indexOf(t);
                                                    return (
                                                        <div
                                                            key={origIdx}
                                                            draggable
                                                            onDragStart={(ev) => {
                                                                ev.dataTransfer.effectAllowed = "move";
                                                                ev.dataTransfer.setData("application/x-pp-task", JSON.stringify({ fromDate: ds, taskIndex: origIdx }));
                                                            }}
                                                            title="끌어서 다른 날짜로 이동"
                                                            className={`text-[10px] md:text-xs leading-tight truncate cursor-grab active:cursor-grabbing select-none ${
                                                                t.status === "done" ? "text-neutral-300 line-through" : "text-neutral-600"
                                                            }`}
                                                        >· {t.text}</div>
                                                    );
                                                })}
                                                {todoTasks.length > 4 && (
                                                    <p className="text-[9px] md:text-[11px] text-neutral-400">+{todoTasks.length - 4}개</p>
                                                )}
                                            </div>
                                        )}

                                        {/* 빈 날 — + 버튼 */}
                                        {!holiday && publicEntries.length === 0 && anniversaryEntries.length === 0 && meetingEntries.length === 0 && todoTasks.length === 0 && (
                                            <button
                                                onClick={() => { setCalEditing(null); setCalDefaultDate(ds); setCalEditorOpen(true); }}
                                                title="이 날 일정 추가"
                                                className="p-0.5 rounded text-neutral-200 hover:text-[#0F766E] hover:bg-neutral-100 transition-colors w-fit"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
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
                    )} {/* end list/schedule toggle */}

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

                    {/* 대학생 시간표 */}
                    {userRole === "student" && <StudentTimetable />}

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
