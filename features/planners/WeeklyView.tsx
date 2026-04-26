"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { getWeekBoundaries, getISOWeek } from "@/lib/planners/types";
import { getLunarDate } from "@/lib/planners/holidays";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { trackPlanners } from "@/lib/planners/analytics";
import type { PlannerWeekly } from "@/lib/planners/types";

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
            const months = [...new Set(days.map(d => d.getMonth() + 1))];
            const [res, sumRes, ...hitResults] = await Promise.all([
                fetch(`/api/planners/weekly?year=${year}&week=${week}`),
                fetch(`/api/planners/summary?scope=weekly&year=${year}&week=${week}`),
                ...months.map(m => fetch(`/api/planners/daily/month-hits?year=${year}&month=${m}`)),
            ]);
            if (cancelled) return;
            const hitsMap: Record<string, string[]> = {};
            for (const r of hitResults) {
                if (r.ok) {
                    const d = await r.json();
                    for (const h of d.hits ?? []) {
                        hitsMap[h.date] = h.task_texts ?? [];
                    }
                }
            }
            setDayHits(hitsMap);
            if (sumRes.ok) {
                const sd = await sumRes.json();
                setSummary(sd.summary || null);
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

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateWeek(-1)}
                        className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <div className="flex items-baseline gap-2.5">
                            <h1 className="font-serif text-4xl text-neutral-900 leading-none">Weekly</h1>
                            <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full tracking-widest">
                                W{String(week).padStart(2, "0")}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-1 font-light">{displayMonth} · {year}</p>
                    </div>
                    <button
                        onClick={() => navigateWeek(1)}
                        className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <PlannersUtilityLinks />
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-300 mt-1" />}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="space-y-5">
                    {/* Paper planner day grid */}
                    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                        <div className="grid grid-cols-2 divide-x divide-neutral-200">
                            {/* Left: Mon, Wed, Fri */}
                            <div className="divide-y divide-neutral-200">
                                {leftDays.map((d) => {
                                    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                                    return (
                                        <DayCell key={ds} date={d} ds={ds} isToday={ds === today} lines={8} taskTexts={dayHits[ds] ?? []} />
                                    );
                                })}
                            </div>
                            {/* Right: Tue, Thu, Sat+Sun */}
                            <div className="divide-y divide-neutral-200">
                                {rightMidDays.map((d) => {
                                    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                                    return (
                                        <DayCell key={ds} date={d} ds={ds} isToday={ds === today} lines={8} taskTexts={dayHits[ds] ?? []} />
                                    );
                                })}
                                {/* Weekend: Sat + Sun side by side */}
                                <div className="grid grid-cols-2 divide-x divide-neutral-200">
                                    {weekendDays.map((d) => {
                                        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                                        return (
                                            <DayCell key={ds} date={d} ds={ds} isToday={ds === today} lines={4} compact taskTexts={dayHits[ds] ?? []} />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vrief + GPR */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[10px] font-semibold text-neutral-900 uppercase tracking-widest">Vrief</h2>
                                <span className="text-[9px] text-neutral-400 tracking-wider">WHW</span>
                            </div>
                            <div className="space-y-3">
                                <Field label="What — 이번 주의 핵심" value={what} onChange={setWhat} onBlur={() => save({ vrief_what: what })} rows={2} />
                                <Field label="Why — 왜 중요한가" value={why} onChange={setWhy} onBlur={() => save({ vrief_why: why })} rows={2} />
                                <Field label="How — 어떻게" value={how} onChange={setHow} onBlur={() => save({ vrief_how: how })} rows={2} />
                            </div>
                        </section>

                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[10px] font-semibold text-neutral-900 uppercase tracking-widest">GPR</h2>
                                <span className="text-[9px] text-neutral-400 tracking-wider">GPR</span>
                            </div>
                            <div className="space-y-3">
                                <Field label="Goal" value={goal} onChange={setGoal} onBlur={() => save({ gpr_goal: goal })} rows={2} />
                                <Field label="Plan" value={plan} onChange={setPlan} onBlur={() => save({ gpr_plan: plan })} rows={2} />
                                <Field label="Result" value={result} onChange={setResult} onBlur={() => save({ gpr_result: result })} rows={2} placeholder="금요일 저녁 AI가 정리를 도와줍니다" />
                            </div>
                        </section>
                    </div>

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
        </div>
    );
}

function DayCell({
    date, ds, isToday, lines, compact = false, taskTexts = [],
}: {
    date: Date;
    ds: string;
    isToday: boolean;
    lines: number;
    compact?: boolean;
    taskTexts?: string[];
}) {
    const dayNum = date.getDate();
    const dayKo = DAYS_KO[date.getDay()];
    const isSun = date.getDay() === 0;
    const isSat = date.getDay() === 6;
    const lunar = getLunarDate(ds);

    const dateColor = isToday
        ? "text-[#0F766E]"
        : isSun ? "text-rose-400"
        : isSat ? "text-blue-400"
        : "text-neutral-800";

    const dayColor = isSun ? "text-rose-300" : isSat ? "text-blue-300" : "text-neutral-400";

    return (
        <Link
            href={`/planners/app/daily?date=${ds}`}
            className={`block group transition-colors ${isToday ? "bg-[#0F766E]/[0.03]" : "bg-white hover:bg-neutral-50/70"}`}
        >
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
                </span>
            </div>
            {/* Lined writing area with task preview */}
            <div>
                {Array.from({ length: lines }).map((_, i) => {
                    const task = taskTexts[i];
                    return (
                        <div
                            key={i}
                            className={`border-b border-neutral-100 group-hover:border-neutral-200/60 transition-colors flex items-center px-2.5 ${compact ? "h-6" : "h-7"}`}
                        >
                            {task && (
                                <span className={`truncate leading-none text-neutral-400 ${compact ? "text-[9px]" : "text-[10px]"}`}>
                                    {task}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </Link>
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
