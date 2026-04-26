"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { getISOWeek } from "@/lib/planners/types";
import { getHoliday, getLunarDate } from "@/lib/planners/holidays";

function localDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface MonthlyData {
    id?: string;
    year: number;
    month: number;
    theme: string | null;
    focus_areas: string[] | null;
    goals: Array<{ id: string; text: string; done?: boolean }>;
    reflection: string | null;
}

interface DayHit {
    date: string;
    task_texts: string[];
    energy_level: number | null;
}

export function MonthlyView({ initialYear, initialMonth }: { initialYear: number; initialMonth: number }) {
    const router = useRouter();
    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);

    const [monthly, setMonthly] = useState<MonthlyData | null>(null);
    const [hits, setHits] = useState<DayHit[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [theme, setTheme] = useState("");
    const [focusInput, setFocusInput] = useState("");
    const [reflection, setReflection] = useState("");
    const [goals, setGoals] = useState<Array<{ id: string; text: string; done?: boolean }>>([]);
    const [newGoal, setNewGoal] = useState("");

    // 달력 메트릭스 계산: Mon~Sun 7열
    const calendar = useMemo(() => {
        const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
        const lastOfMonth = new Date(Date.UTC(year, month, 0));
        const firstDow = (firstOfMonth.getUTCDay() + 6) % 7; // Mon=0
        const rows: Array<Array<{ date: string; dom: number; inMonth: boolean; week: number }>> = [];
        let row: Array<{ date: string; dom: number; inMonth: boolean; week: number }> = [];

        // 이전 달 pad
        for (let i = firstDow; i > 0; i--) {
            const d = new Date(firstOfMonth);
            d.setUTCDate(d.getUTCDate() - i);
            const { week } = getISOWeek(d);
            row.push({ date: d.toISOString().slice(0, 10), dom: d.getUTCDate(), inMonth: false, week });
        }

        // 이번 달
        for (let dom = 1; dom <= lastOfMonth.getUTCDate(); dom++) {
            const d = new Date(Date.UTC(year, month - 1, dom));
            const { week } = getISOWeek(d);
            row.push({ date: d.toISOString().slice(0, 10), dom, inMonth: true, week });
            if (row.length === 7) { rows.push(row); row = []; }
        }

        // 다음 달 pad
        if (row.length > 0) {
            const last = new Date(row[row.length - 1].date + "T00:00:00Z");
            let add = 1;
            while (row.length < 7) {
                const d = new Date(last);
                d.setUTCDate(d.getUTCDate() + add);
                const { week } = getISOWeek(d);
                row.push({ date: d.toISOString().slice(0, 10), dom: d.getUTCDate(), inMonth: false, week });
                add++;
            }
            rows.push(row);
        }

        return rows;
    }, [year, month]);

    const weekNumbers = useMemo(() => calendar.map(r => r[0].week), [calendar]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const [monthlyRes, hitsRes] = await Promise.all([
                fetch(`/api/planners/monthly?year=${year}&month=${month}`),
                fetch(`/api/planners/daily/month-hits?year=${year}&month=${month}`),
            ]);
            if (cancelled) return;
            if (monthlyRes.ok) {
                const d = await monthlyRes.json();
                if (d.monthly) {
                    setMonthly(d.monthly);
                    setTheme(d.monthly.theme || "");
                    setReflection(d.monthly.reflection || "");
                    setGoals(d.monthly.goals || []);
                } else {
                    setMonthly(null);
                    setTheme(""); setReflection(""); setGoals([]);
                }
            }
            if (hitsRes.ok) {
                const d = await hitsRes.json();
                setHits(d.hits || []);
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [year, month]);

    async function save(patch: Partial<MonthlyData>) {
        setSaving(true);
        try {
            await fetch(`/api/planners/monthly`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year, month, ...patch }),
            });
        } finally {
            setSaving(false);
        }
    }

    function navigateMonth(delta: number) {
        let newMonth = month + delta;
        let newYear = year;
        if (newMonth < 1) { newYear -= 1; newMonth = 12; }
        if (newMonth > 12) { newYear += 1; newMonth = 1; }
        setMonth(newMonth);
        setYear(newYear);
    }

    function addFocusArea() {
        if (!focusInput.trim()) return;
        const next = [...(monthly?.focus_areas || []), focusInput.trim()];
        save({ focus_areas: next });
        setMonthly(m => m ? { ...m, focus_areas: next } : m);
        setFocusInput("");
    }

    function removeFocusArea(idx: number) {
        const next = (monthly?.focus_areas || []).filter((_, i) => i !== idx);
        save({ focus_areas: next });
        setMonthly(m => m ? { ...m, focus_areas: next } : m);
    }

    function addGoal() {
        if (!newGoal.trim()) return;
        const next = [...goals, { id: `g_${Date.now()}`, text: newGoal.trim(), done: false }];
        setGoals(next);
        save({ goals: next });
        setNewGoal("");
    }

    function toggleGoal(id: string) {
        const next = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
        setGoals(next);
        save({ goals: next });
    }

    function removeGoal(id: string) {
        const next = goals.filter(g => g.id !== id);
        setGoals(next);
        save({ goals: next });
    }

    const hitMap = useMemo(() => {
        const m = new Map<string, DayHit>();
        hits.forEach(h => m.set(h.date, h));
        return m;
    }, [hits]);

    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const yearRef = useRef<HTMLDivElement>(null);
    const monthRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (yearRef.current && !yearRef.current.contains(e.target as Node)) setShowYearPicker(false);
            if (monthRef.current && !monthRef.current.contains(e.target as Node)) setShowMonthPicker(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const MONTHS_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    const yearRange = Array.from({ length: 10 }, (_, i) => 2024 + i);

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Monthly</p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {/* Year picker */}
                        <div ref={yearRef} className="relative">
                            <button
                                onClick={() => { setShowYearPicker(v => !v); setShowMonthPicker(false); }}
                                className="font-serif text-3xl text-neutral-900 hover:text-[#0F766E] transition-colors"
                            >
                                {year}년
                            </button>
                            {showYearPicker && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 py-1 min-w-[100px]">
                                    {yearRange.map(y => (
                                        <button key={y} onClick={() => { setYear(y); setShowYearPicker(false); }}
                                            className={`w-full text-left px-4 py-1.5 text-sm hover:bg-neutral-50 ${y === year ? "text-[#0F766E] font-semibold" : "text-neutral-700"}`}>
                                            {y}년
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Month picker */}
                        <div ref={monthRef} className="relative">
                            <button
                                onClick={() => { setShowMonthPicker(v => !v); setShowYearPicker(false); }}
                                className="font-serif text-3xl text-neutral-900 hover:text-[#0F766E] transition-colors"
                            >
                                {month}월
                            </button>
                            {showMonthPicker && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 py-1 min-w-[80px]">
                                    {MONTHS_KO.map((label, i) => (
                                        <button key={i} onClick={() => { setMonth(i + 1); setShowMonthPicker(false); }}
                                            className={`w-full text-left px-4 py-1.5 text-sm hover:bg-neutral-50 ${i + 1 === month ? "text-[#0F766E] font-semibold" : "text-neutral-700"}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            </div>

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="space-y-6">
                    {/* 테마 + 집중 영역 */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <section className="md:col-span-1 bg-white border border-neutral-200 rounded-xl p-5">
                            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">이달의 테마</label>
                            <input
                                type="text"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                onBlur={() => save({ theme })}
                                placeholder="예: 몰입의 달"
                                className="w-full text-lg font-serif text-neutral-900 focus:outline-none bg-transparent"
                            />
                        </section>

                        <section className="md:col-span-2 bg-white border border-neutral-200 rounded-xl p-5">
                            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">집중 영역</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {(monthly?.focus_areas || []).map((f, i) => (
                                    <span key={i} className="group inline-flex items-center gap-1 bg-[#0F766E]/10 text-[#0F766E] text-xs px-3 py-1 rounded-full">
                                        {f}
                                        <button onClick={() => removeFocusArea(i)} className="opacity-40 group-hover:opacity-100 hover:text-red-500 transition-opacity">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5 text-neutral-400" />
                                <input
                                    type="text"
                                    value={focusInput}
                                    onChange={(e) => setFocusInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") addFocusArea(); }}
                                    placeholder="집중 영역 추가 후 Enter"
                                    className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                                />
                            </div>
                        </section>
                    </div>

                    {/* 달력 */}
                    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-[40px_repeat(7,1fr)] border-b border-neutral-200 bg-neutral-50">
                            <div className="text-[10px] font-semibold text-neutral-400 text-center py-2">W</div>
                            {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
                                <div key={d} className="text-xs font-semibold text-neutral-600 text-center py-2 border-l border-neutral-200">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {calendar.map((row, ri) => (
                            <div key={ri} className="grid grid-cols-[40px_repeat(7,1fr)] border-b border-neutral-100 last:border-0">
                                {/* 주차 */}
                                <Link
                                    href={`/planners/app/weekly?year=${year}&week=${weekNumbers[ri]}`}
                                    className="flex items-center justify-center text-[10px] text-neutral-400 hover:text-[#0F766E] hover:bg-neutral-50 transition-colors"
                                >
                                    W{String(weekNumbers[ri]).padStart(2, "0")}
                                </Link>
                                {row.map((cell) => {
                                    const hit = hitMap.get(cell.date);
                                    const holiday = getHoliday(cell.date);
                                    const lunar = getLunarDate(cell.date);
                                    const isToday = cell.date === localDateStr(new Date());
                                    const isHoliday = holiday?.type === "holiday";
                                    const dow = new Date(cell.date + "T00:00:00Z").getUTCDay();
                                    const isSunday = dow === 0;
                                    return (
                                        <Link
                                            key={cell.date}
                                            href={`/planners/app/daily?date=${cell.date}`}
                                            className={`aspect-square md:aspect-auto md:min-h-[96px] p-2 border-l border-neutral-100 transition-colors flex flex-col ${
                                                cell.inMonth ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/50 text-neutral-300 hover:bg-neutral-50"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-1">
                                                <div className="flex items-start gap-1 min-w-0">
                                                    <span className={`text-sm font-medium shrink-0 ${
                                                        isToday ? "text-[#0F766E] font-bold" :
                                                        !cell.inMonth ? "text-neutral-300" :
                                                        isHoliday || isSunday ? "text-red-500" :
                                                        "text-neutral-900"
                                                    }`}>
                                                        {cell.dom}
                                                    </span>
                                                    {cell.inMonth && (holiday || lunar) && (
                                                        <div className="flex flex-col leading-tight pt-px">
                                                            {lunar && (
                                                                <span className="text-[9px] text-neutral-300">
                                                                    {lunar.isLeap ? "윤" : ""}{lunar.month}/{lunar.day}
                                                                </span>
                                                            )}
                                                            {holiday && (
                                                                <span className={`text-[9px] truncate ${
                                                                    holiday.type === "holiday" ? "text-red-500 font-medium" :
                                                                    holiday.type === "memorial" ? "text-neutral-600" :
                                                                    "text-neutral-400"
                                                                }`}>
                                                                    {holiday.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {isToday && <span className="text-[9px] px-1 py-0.5 bg-[#0F766E] text-white rounded shrink-0">오늘</span>}
                                            </div>
                                            {/* 할일 텍스트 */}
                                            {hit && hit.task_texts.length > 0 && (
                                                <div className="mt-1 space-y-0.5">
                                                    {hit.task_texts.map((t, i) => (
                                                        <p key={i} className="text-[9px] text-neutral-500 leading-tight truncate">{t}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </section>

                    {/* 월간 목표 + 회고 */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-neutral-900 mb-4">월간 목표</h2>
                            <div className="space-y-1.5">
                                {goals.length === 0 && (
                                    <p className="text-xs text-neutral-400 py-2">이달에 이루고 싶은 것을 추가해 보세요.</p>
                                )}
                                {goals.map((g) => (
                                    <div key={g.id} className="group flex items-center gap-3 py-1">
                                        <button
                                            onClick={() => toggleGoal(g.id)}
                                            className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                                                g.done ? "bg-[#0F766E] border-[#0F766E] text-white" : "border-neutral-300 hover:border-neutral-500"
                                            }`}
                                        >
                                            {g.done && "V"}
                                        </button>
                                        <span className={`flex-1 text-sm ${g.done ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                                            {g.text}
                                        </span>
                                        <button
                                            onClick={() => removeGoal(g.id)}
                                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                                <Plus className="h-3.5 w-3.5 text-neutral-400" />
                                <input
                                    type="text"
                                    value={newGoal}
                                    onChange={(e) => setNewGoal(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") addGoal(); }}
                                    placeholder="목표 추가"
                                    className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                                />
                            </div>
                        </section>

                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-neutral-900 mb-3">월간 회고</h2>
                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                onBlur={() => save({ reflection })}
                                placeholder="이달을 돌아보며…"
                                rows={8}
                                className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                            />
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}
