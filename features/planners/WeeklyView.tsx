"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getWeekBoundaries, getISOWeek } from "@/lib/planners/types";
import { getLunarDate, HOLIDAYS } from "@/lib/planners/holidays";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { trackPlanners } from "@/lib/planners/analytics";
import type { PlannerWeekly } from "@/lib/planners/types";
import { CalendarEntryEditor } from "./CalendarEntryEditor";
import type { CalendarEntry, CalendarKind } from "@/lib/planners/calendar-rules";
import { KIND_COLORS, expandOccurrences, isVisible } from "@/lib/planners/calendar-rules";

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

export function WeeklyView({ initialYear, initialWeek }: { initialYear: number; initialWeek: number }) {
    const [year, setYear] = useState(initialYear);
    const [week, setWeek] = useState(initialWeek);
    const [data, setData] = useState<PlannerWeekly | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [what, setWhat] = useState("");
    const [why, setWhy] = useState("");
    const [how, setHow] = useState("");
    const [goal, setGoal] = useState("");
    const [plan, setPlan] = useState("");
    const [result, setResult] = useState("");
    const [reflection, setReflection] = useState("");
    const [summary, setSummary] = useState<WeekSummary | null>(null);
    const [dayHits, setDayHits] = useState<Record<string, string[]>>({});
    // 메모 (각 날의 첫 코넬 노트 content 동기화)
    const [dayMemos, setDayMemos] = useState<Record<string, string>>({});
    const [calEntries, setCalEntries] = useState<CalendarEntry[]>([]);
    const [calEditorOpen, setCalEditorOpen] = useState(false);
    const [calEditing, setCalEditing] = useState<Partial<CalendarEntry> | null>(null);
    const [calDefaultDate, setCalDefaultDate] = useState<string | undefined>(undefined);

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

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const dayDates = days.map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
            const [res, sumRes, calRes, ...dailyResults] = await Promise.all([
                fetch(`/api/planners/weekly?year=${year}&week=${week}`),
                fetch(`/api/planners/summary?scope=weekly&year=${year}&week=${week}`),
                fetch(`/api/planners/calendar?from=${boundaries.start}&to=${boundaries.end}`),
                ...dayDates.map(ds => fetch(`/api/planners/daily?date=${ds}`)),
            ]);
            if (cancelled) return;
            const hitsMap: Record<string, string[]> = {};
            const memoMap: Record<string, string> = {};
            for (let i = 0; i < dailyResults.length; i++) {
                const r = dailyResults[i];
                const ds = dayDates[i];
                if (!r.ok) continue;
                const d = await r.json();
                if (d.daily) {
                    const tasks = Array.isArray(d.daily.tasks) ? d.daily.tasks : [];
                    hitsMap[ds] = tasks.map((t: { text: string }) => t.text);
                    // 첫 코넬 노트의 content를 메모로
                    try {
                        const arr = JSON.parse(d.daily.notes || "[]");
                        const cornell = Array.isArray(arr) ? arr.find((n: { type?: string }) => !n.type || n.type === "cornell") : null;
                        memoMap[ds] = cornell?.content ?? "";
                    } catch { memoMap[ds] = ""; }
                }
            }
            setDayHits(hitsMap);
            setDayMemos(memoMap);
            if (sumRes.ok) {
                const sd = await sumRes.json();
                setSummary(sd.summary || null);
            }
            if (calRes.ok) {
                const cd = await calRes.json();
                setCalEntries(cd.entries ?? []);
            }
            if (res.ok) {
                const d = await res.json();
                if (d.weekly) {
                    setData(d.weekly);
                    setWhat(d.weekly.vrief_what || "");
                    setWhy(d.weekly.vrief_why || "");
                    setHow(d.weekly.vrief_how || "");
                    setGoal(d.weekly.gpr_goal || "");
                    setPlan(d.weekly.gpr_plan || "");
                    setResult(d.weekly.gpr_result || "");
                    setReflection(d.weekly.reflection || "");
                } else {
                    setData(null);
                    setWhat(""); setWhy(""); setHow("");
                    setGoal(""); setPlan(""); setResult(""); setReflection("");
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

    // Left col: Mon(0), Wed(2), Fri(4) | Right col: Tue(1), Thu(3), [Sat(5) | Sun(6)]
    const leftDays = [days[0], days[2], days[4]];
    const rightMidDays = [days[1], days[3]];
    const weekendDays = [days[5], days[6]];

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
            // 첫 코넬 노트 찾아 content 갱신, 없으면 새로 추가
            const cornellIdx = arr.findIndex((n) => !n.type || n.type === "cornell");
            if (cornellIdx >= 0) {
                arr[cornellIdx] = { ...arr[cornellIdx], content };
            } else {
                arr.unshift({
                    id: `n_default_${Date.now()}`,
                    type: "cornell",
                    title: "기본 노트 1",
                    cue: "", content, summary: "",
                    rows: [{ id: "r1", cue: "", note: content }],
                });
            }
            await fetch(`/api/planners/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: ds, notes: JSON.stringify(arr) }),
            });
        } catch {}
    }

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header — Daily 패턴 통일 */}
            {(() => {
                const sM = days[0].getMonth() + 1;
                const sD = days[0].getDate();
                const eM = days[6].getMonth() + 1;
                const eD = days[6].getDate();
                const rangeText = sM === eM
                    ? `${year}년 ${sM}월 ${sD}일 — ${eD}일`
                    : `${year}년 ${sM}월 ${sD}일 — ${eM}월 ${eD}일`;
                const todayInWeek = days.some(d => {
                    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                    return ds === today;
                });
                return (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
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
                            <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-neutral-400">W{String(week).padStart(2, "0")}</span>
                                <span className="text-neutral-300">·</span>
                                <span>{displayMonth}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <PlannersUtilityLinks />
                            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-300" />}
                        </div>
                    </div>
                );
            })()}

            {loading ? (
                <div className="py-20 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="space-y-5">
                    {/* GPR — 목표·계획·결과 (1순위) */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[10px] font-semibold text-neutral-900 uppercase tracking-widest">GPR</h2>
                            <span className="text-[9px] text-neutral-400 tracking-wider">Goal · Plan · Result</span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-3">
                            <Field label="Goal" value={goal} onChange={setGoal} onBlur={() => save({ gpr_goal: goal })} rows={3} />
                            <Field label="Plan" value={plan} onChange={setPlan} onBlur={() => save({ gpr_plan: plan })} rows={3} />
                            <Field label="Result" value={result} onChange={setResult} onBlur={() => save({ gpr_result: result })} rows={3} placeholder="금요일 저녁 AI가 정리를 도와줍니다" />
                        </div>
                    </section>

                    {/* Vrief — What·Why·How (2순위) */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[10px] font-semibold text-neutral-900 uppercase tracking-widest">Vrief</h2>
                            <span className="text-[9px] text-neutral-400 tracking-wider">What · Why · How</span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-3">
                            <Field label="What — 이번 주의 핵심" value={what} onChange={setWhat} onBlur={() => save({ vrief_what: what })} rows={3} />
                            <Field label="Why — 왜 중요한가" value={why} onChange={setWhy} onBlur={() => save({ vrief_why: why })} rows={3} />
                            <Field label="How — 어떻게" value={how} onChange={setHow} onBlur={() => save({ vrief_how: how })} rows={3} />
                        </div>
                    </section>

                    {/* 주간 계획 — 7일 paper planner grid (3순위) */}
                    <section>
                        <h2 className="text-[10px] font-semibold text-neutral-900 uppercase tracking-widest mb-3">주간 계획</h2>
                        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                            <div className="grid grid-cols-2 divide-x divide-neutral-200">
                                {/* Left: Mon, Wed, Fri */}
                                <div className="divide-y divide-neutral-200">
                                    {leftDays.map((d) => {
                                        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                                        return (
                                            <DayCell key={ds} date={d} ds={ds} isToday={ds === today} lines={8} taskTexts={dayHits[ds] ?? []} entries={entriesByDate[ds] ?? []} memo={dayMemos[ds] ?? ""} onMemoChange={(v) => setDayMemos(p => ({ ...p, [ds]: v }))} onMemoBlur={(v) => saveMemoForDay(ds, v)} />
                                        );
                                    })}
                                </div>
                                {/* Right: Tue, Thu, Sat+Sun */}
                                <div className="divide-y divide-neutral-200">
                                    {rightMidDays.map((d) => {
                                        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                                        return (
                                            <DayCell key={ds} date={d} ds={ds} isToday={ds === today} lines={8} taskTexts={dayHits[ds] ?? []} entries={entriesByDate[ds] ?? []} memo={dayMemos[ds] ?? ""} onMemoChange={(v) => setDayMemos(p => ({ ...p, [ds]: v }))} onMemoBlur={(v) => saveMemoForDay(ds, v)} />
                                        );
                                    })}
                                    {/* Weekend: Sat + Sun side by side */}
                                    <div className="grid grid-cols-2 divide-x divide-neutral-200">
                                        {weekendDays.map((d) => {
                                            const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                                            return (
                                                <DayCell key={ds} date={d} ds={ds} isToday={ds === today} lines={4} compact taskTexts={dayHits[ds] ?? []} entries={entriesByDate[ds] ?? []} memo={dayMemos[ds] ?? ""} onMemoChange={(v) => setDayMemos(p => ({ ...p, [ds]: v }))} onMemoBlur={(v) => saveMemoForDay(ds, v)} />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Weekly summary stats */}
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


                    {/* Reflection */}
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
                onSaved={() => {
                    fetch(`/api/planners/calendar?from=${boundaries.start}&to=${boundaries.end}`)
                        .then((r) => r.ok ? r.json() : null)
                        .then((d) => { if (d?.entries) setCalEntries(d.entries); });
                }}
                onDeleted={() => {
                    fetch(`/api/planners/calendar?from=${boundaries.start}&to=${boundaries.end}`)
                        .then((r) => r.ok ? r.json() : null)
                        .then((d) => { if (d?.entries) setCalEntries(d.entries); });
                }}
                initial={calEditing ?? undefined}
                defaultDate={calDefaultDate}
            />
        </div>
    );
}

function DayCell({
    date, ds, isToday, compact = false, taskTexts = [], entries = [],
    memo = "", onMemoChange, onMemoBlur,
}: {
    date: Date;
    ds: string;
    isToday: boolean;
    lines?: number;
    compact?: boolean;
    taskTexts?: string[];
    entries?: CalendarEntry[];
    memo?: string;
    onMemoChange?: (v: string) => void;
    onMemoBlur?: (v: string) => void;
}) {
    const dayNum = date.getDate();
    const dayKo = DAYS_KO[date.getDay()];
    const isSun = date.getDay() === 0;
    const isSat = date.getDay() === 6;
    const lunar = getLunarDate(ds);
    const holiday = HOLIDAYS[ds];
    const dateColor = isToday
        ? "text-[#0F766E]"
        : isSun ? "text-rose-400"
        : isSat ? "text-blue-400"
        : "text-neutral-800";

    const dayColor = isSun ? "text-rose-300" : isSat ? "text-blue-300" : "text-neutral-400";

    const overflowing = entries.length > 3 || taskTexts.length > 6 || (memo && memo.length > 200);

    return (
        <div className={`group transition-colors ${isToday ? "bg-[#0F766E]/[0.03]" : "bg-white hover:bg-neutral-50/30"}`}>
            {/* Date header */}
            <div className={`flex items-baseline gap-1.5 px-3 border-b border-neutral-100 ${compact ? "py-2" : "py-2.5"}`}>
                <span className={`font-serif leading-none font-light ${compact ? "text-xl" : "text-2xl"} ${dateColor}`}>
                    {String(dayNum).padStart(2, "0")}
                </span>
                <span className={`text-[11px] font-medium ${dayColor}`}>{dayKo}</span>
                <span className="ml-auto flex items-center gap-1.5">
                    {lunar && (
                        <span className="text-[9px] text-neutral-300 font-mono">
                            {lunar.isLeap ? "윤" : ""}{lunar.month}/{lunar.day}
                        </span>
                    )}
                    {isToday && (
                        <span className="text-[9px] text-[#0F766E] font-medium">Today</span>
                    )}
                    <Link
                        href={`/planners/app/daily?date=${ds}`}
                        title="Daily 자세히 보기"
                        className="p-0.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-[#0F766E] transition-colors"
                    >
                        <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </span>
            </div>

            {/* 1) 오늘의 일정 (calendar entries + 공휴일/절기) */}
            <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-1">오늘의 일정</p>
                <div className="space-y-0.5">
                    {holiday && (
                        <p className={`text-[10px] font-medium leading-tight truncate ${
                            holiday.type === "holiday" ? "text-rose-500" :
                            holiday.type === "memorial" ? "text-rose-400" :
                            holiday.type === "commemoration" ? "text-amber-600" :
                            "text-emerald-600"
                        }`} title={holiday.label}>
                            · {holiday.label}
                        </p>
                    )}
                    {entries.slice(0, 3).map((e) => {
                        const c = KIND_COLORS[e.kind as CalendarKind];
                        return (
                            <p key={e.id} className={`text-[10px] leading-tight flex items-center gap-1 truncate ${c.text}`} title={e.title}>
                                <span className={`w-1 h-1 rounded-full ${c.dot} shrink-0`} />
                                <span className="truncate">{e.start_time ? `${e.start_time.slice(0,5)} ` : ""}{e.title}</span>
                            </p>
                        );
                    })}
                    {!holiday && entries.length === 0 && <p className="text-[10px] text-neutral-300">—</p>}
                </div>
            </div>

            {/* 2) Task — Daily 동기화 */}
            <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-1">Task</p>
                <div className="space-y-0.5">
                    {taskTexts.length === 0 && <p className="text-[10px] text-neutral-300">—</p>}
                    {taskTexts.slice(0, 6).map((t, i) => (
                        <p key={i} className="text-[11px] leading-tight text-neutral-700 truncate" title={t}>· {t}</p>
                    ))}
                    {taskTexts.length > 6 && (
                        <p className="text-[9px] text-neutral-400">+{taskTexts.length - 6}개</p>
                    )}
                </div>
            </div>

            {/* 3) 메모 — Daily의 첫 코넬 노트 동기화 */}
            <div className="px-3 py-2">
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-1">메모</p>
                <textarea
                    value={memo}
                    onChange={(e) => onMemoChange?.(e.target.value)}
                    onBlur={(e) => onMemoBlur?.(e.target.value)}
                    placeholder="자유롭게 기록…"
                    rows={3}
                    className="w-full text-[11px] text-neutral-700 placeholder:text-neutral-300 focus:outline-none bg-transparent resize-none leading-relaxed"
                />
                {overflowing && (
                    <Link
                        href={`/planners/app/daily?date=${ds}`}
                        className="inline-flex items-center gap-0.5 text-[10px] text-[#0F766E] hover:underline mt-1"
                    >
                        자세히 보기 <ArrowUpRight className="h-2.5 w-2.5" />
                    </Link>
                )}
            </div>
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

function Field({
    label, value, onChange, onBlur, rows = 2, placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    onBlur: () => void;
    rows?: number;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="block text-[9px] uppercase tracking-widest text-neutral-400 mb-1.5">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                rows={rows}
                placeholder={placeholder}
                className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-neutral-50 rounded-lg px-3 py-2 resize-none"
            />
        </div>
    );
}
