"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getISOWeek, getWeekBoundaries } from "@/lib/planners/types";
import { trackPlanners } from "@/lib/planners/analytics";
import type { PlannerWeekly } from "@/lib/planners/types";

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

    const boundaries = getWeekBoundaries(year, week);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const [res, sumRes] = await Promise.all([
                fetch(`/api/planners/weekly?year=${year}&week=${week}`),
                fetch(`/api/planners/summary?scope=weekly&year=${year}&week=${week}`),
            ]);
            if (cancelled) return;
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
                    year,
                    week,
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

    // 7일 배열
    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(boundaries.start + 'T00:00:00');
        d.setDate(d.getDate() + i);
        return d;
    });

    return (
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigateWeek(-1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <h1 className="font-serif text-3xl text-neutral-900">
                            {year}년 W{String(week).padStart(2, '0')}
                        </h1>
                        <button
                            onClick={() => navigateWeek(1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                        {boundaries.start} ~ {boundaries.end}
                    </p>
                </div>
                {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            </div>

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="space-y-6">
                    {/* Vrief Light + GPR 2 columns */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Light Vrief */}
                        <section className="bg-white border border-neutral-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-neutral-900">이번 주 Vrief</h2>
                                <span className="text-[10px] px-2 py-0.5 bg-[#0F766E]/10 text-[#0F766E] rounded uppercase tracking-wider">Light</span>
                            </div>
                            <div className="space-y-4">
                                <Field label="What — 이번 주의 핵심" value={what} onChange={setWhat} onBlur={() => save({ vrief_what: what })} rows={2} />
                                <Field label="Why — 왜 중요한가" value={why} onChange={setWhy} onBlur={() => save({ vrief_why: why })} rows={2} />
                                <Field label="How — 어떻게" value={how} onChange={setHow} onBlur={() => save({ vrief_how: how })} rows={2} />
                            </div>
                        </section>

                        {/* Weekly GPR */}
                        <section className="bg-white border border-neutral-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-neutral-900">이번 주 GPR</h2>
                                <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-700 rounded uppercase tracking-wider">Weekly</span>
                            </div>
                            <div className="space-y-4">
                                <Field label="Goal" value={goal} onChange={setGoal} onBlur={() => save({ gpr_goal: goal })} rows={2} />
                                <Field label="Plan" value={plan} onChange={setPlan} onBlur={() => save({ gpr_plan: plan })} rows={2} />
                                <Field label="Result" value={result} onChange={setResult} onBlur={() => save({ gpr_result: result })} rows={2} placeholder="금요일 저녁 AI가 정리를 도와줍니다" />
                            </div>
                        </section>
                    </div>

                    {/* 주간 집계 */}
                    {summary && summary.days_recorded > 0 && (
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4 text-[#0F766E]" />
                                <h2 className="text-sm font-semibold text-neutral-900">이번 주 기록 집계</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <SummaryStat label="기록 일수" value={`${summary.days_recorded}일`} />
                                <SummaryStat label="태스크 완료율" value={`${summary.completion_rate}%`} />
                                <SummaryStat label="완료 태스크" value={`${summary.done_tasks}개`} />
                                <SummaryStat label="이월 태스크" value={`${summary.carried_tasks}개`} />
                                <SummaryStat label="평균 에너지" value={summary.energy_avg !== null ? `${summary.energy_avg}/5` : "—"} />
                            </div>
                        </section>
                    )}

                    {/* 7일 미니 캘린더 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-neutral-900 mb-4">이번 주 일별</h2>
                        <div className="grid grid-cols-7 gap-2">
                            {days.map((d) => {
                                const ds = d.toISOString().slice(0, 10);
                                const dayLabel = d.toLocaleDateString('ko-KR', { weekday: 'short' });
                                const isToday = ds === new Date().toISOString().slice(0, 10);
                                return (
                                    <Link
                                        key={ds}
                                        href={`/planners/app/today?date=${ds}`}
                                        className={`aspect-square flex flex-col items-center justify-center rounded-lg border text-center transition-colors ${
                                            isToday
                                                ? "border-[#0F766E] bg-[#0F766E]/5"
                                                : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                                        }`}
                                    >
                                        <span className="text-[10px] text-neutral-500">{dayLabel}</span>
                                        <span className={`text-lg font-semibold mt-1 ${isToday ? "text-[#0F766E]" : "text-neutral-900"}`}>
                                            {d.getDate()}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* 주간 회고 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-neutral-900 mb-3">주간 회고</h2>
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            onBlur={() => save({ reflection })}
                            placeholder="이번 주를 돌아보며…"
                            rows={5}
                            className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                        />
                    </section>
                </div>
            )}
        </div>
    );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-neutral-50 rounded-lg p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
            <p className="text-lg font-semibold text-neutral-900">{value}</p>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    onBlur,
    rows = 2,
    placeholder,
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
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">{label}</label>
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
