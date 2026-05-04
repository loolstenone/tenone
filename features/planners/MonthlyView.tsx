"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, Loader2, Plus, Trash2, ArrowUpRight } from "lucide-react";
import { getISOWeek } from "@/lib/planners/types";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { getHoliday, getLunarDate } from "@/lib/planners/holidays";
import { CalendarEntryList } from "./CalendarEntryList";
import { CalendarEntryEditor } from "./CalendarEntryEditor";
import { ConfirmSheet } from "./ConfirmSheet";
import { useSwipeNav } from "./useSwipeNav";
import {
    KIND_COLORS,
    monthlyDisplayMode,
    expandOccurrences,
    isVisible,
    type CalendarEntry,
} from "@/lib/planners/calendar-rules";

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

    // URL의 ?year=&month= 변경(좌측 월 바·외부 링크 등) → 내부 state 동기화
    useEffect(() => {
        setYear(initialYear);
        setMonth(initialMonth);
    }, [initialYear, initialMonth]);

    const [monthly, setMonthly] = useState<MonthlyData | null>(null);
    const [hits, setHits] = useState<DayHit[]>([]);
    const [summary, setSummary] = useState<{
        days_recorded: number;
        total_tasks: number;
        todo_tasks: number;
        done_tasks: number;
        carried_tasks: number;
        canceled_tasks: number;
        completion_rate: number;
        energy_avg: number | null;
        projects_completed: number;
    } | null>(null);
    const [tracking, setTracking] = useState<{
        stats: {
            days_recorded: number;
            energy_avg: number | null; satisfaction_avg: number | null; mood_avg: number | null;
            exercise_minutes_total: number; exercise_distance_total: number; exercise_days: number;
            bp_sys_avg: number | null; bp_dia_avg: number | null; sugar_avg: number | null;
            weight_latest: number | null; temp_latest: number | null;
        };
        series: Array<{ date: string; energy: number | null; satisfaction: number | null; mood: number | null; exercise_min: number | null; weight: number | null; bp_sys: number | null; sugar: number | null }>;
        one_liners: Array<{ date: string; text: string; category: string | null }>;
    } | null>(null);
    const [calEntries, setCalEntries] = useState<CalendarEntry[]>([]);
    const [calEditorOpen, setCalEditorOpen] = useState(false);
    const [calEditing, setCalEditing] = useState<Partial<CalendarEntry> | null>(null);
    const [calDefaultDate, setCalDefaultDate] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [theme, setTheme] = useState("");
    const [focusInput, setFocusInput] = useState("");
    const [reflection, setReflection] = useState("");
    const [goals, setGoals] = useState<Array<{ id: string; text: string; done?: boolean }>>([]);
    const [newGoal, setNewGoal] = useState("");
    const [activeProjects, setActiveProjects] = useState<Array<{ id: string; title: string; color: string | null }>>([]);
    const [confirmGoalId, setConfirmGoalId] = useState<string | null>(null);
    const [confirmFocusIdx, setConfirmFocusIdx] = useState<number | null>(null);
    const [goalsOpen, setGoalsOpen] = useState(true);

    // 활성 프로젝트 목록 — 집중 영역 빠른 추가용
    // 조건: status='active' AND 프로젝트 기간이 보고 있는 월과 겹침
    //   (start_date <= 월말) AND (end_date >= 월초) — 날짜 비어 있으면 항상 겹침으로 간주
    useEffect(() => {
        let cancelled = false;
        const monthFirst = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const monthLast = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

        fetch(`/api/planners/projects`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (cancelled) return;
                const list = (d?.projects ?? [])
                    .filter((p: { status?: string; start_date?: string | null; end_date?: string | null }) => {
                        if (p.status !== "active") return false;
                        // start <= 월말
                        if (p.start_date && p.start_date > monthLast) return false;
                        // end >= 월초
                        if (p.end_date && p.end_date < monthFirst) return false;
                        return true;
                    })
                    .map((p: { id: string; title: string; color: string | null }) => ({ id: p.id, title: p.title, color: p.color }));
                setActiveProjects(list);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [year, month]);

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

    /** 날짜별 캘린더 엔트리 발생 맵 (반복 펼침) — 셀 dot/title 표시용 */
    const entriesByDate = useMemo(() => {
        const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDate = new Date(year, month, 0).getDate();
        const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(lastDate).padStart(2, "0")}`;
        const map: Record<string, CalendarEntry[]> = {};
        calEntries.forEach((e) => {
            if (!isVisible(e.kind, "monthly")) return;
            expandOccurrences(e, firstDay, lastDay).forEach(({ date }) => {
                (map[date] = map[date] || []).push(e);
            });
        });
        return map;
    }, [calEntries, year, month]);

    useEffect(() => {
        let cancelled = false;
        // ⚠️ 월 변경 즉시 이전 달의 데이터 클리어 — fetch 동안 stale 상태 노출 방지
        setMonthly(null);
        setTheme("");
        setReflection("");
        setGoals([]);
        setHits([]);
        setSummary(null);
        setTracking(null);
        setCalEntries([]);
        (async () => {
            setLoading(true);
            const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
            const lastDate = new Date(year, month, 0).getDate();
            const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(lastDate).padStart(2, "0")}`;
            const [monthlyRes, hitsRes, summaryRes, trackingRes, calRes] = await Promise.all([
                fetch(`/api/planners/monthly?year=${year}&month=${month}`),
                fetch(`/api/planners/daily/month-hits?year=${year}&month=${month}`),
                fetch(`/api/planners/summary?scope=monthly&year=${year}&month=${month}`),
                fetch(`/api/planners/daily/month-tracking?year=${year}&month=${month}`),
                fetch(`/api/planners/calendar?from=${firstDay}&to=${lastDay}`),
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
            if (summaryRes.ok) {
                const d = await summaryRes.json();
                setSummary(d.summary ?? null);
            }
            if (trackingRes.ok) {
                const d = await trackingRes.json();
                setTracking({ stats: d.stats, series: d.series ?? [], one_liners: d.one_liners ?? [] });
            }
            if (calRes.ok) {
                const d = await calRes.json();
                setCalEntries(d.entries ?? []);
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
        // URL과 state 동시 갱신 — 좌측 월 바도 함께 업데이트
        router.push(`/planners/app/monthly?year=${newYear}&month=${newMonth}`);
    }

    // 스와이프 내비게이션
    const swipeRef = useSwipeNav(
        () => navigateMonth(1),   // 왼쪽 → 다음 달
        () => navigateMonth(-1),  // 오른쪽 → 이전 달
    );

    function addFocusArea() {
        if (!focusInput.trim()) return;
        const next = [...(monthly?.focus_areas || []), focusInput.trim()];
        save({ focus_areas: next });
        setMonthly(m => m ? { ...m, focus_areas: next } : { year, month, theme: null, focus_areas: next, goals: [], reflection: null });
        setFocusInput("");
    }

    function removeFocusArea(idx: number) {
        const next = (monthly?.focus_areas || []).filter((_, i) => i !== idx);
        save({ focus_areas: next });
        setMonthly(m => m ? { ...m, focus_areas: next } : { year, month, theme: null, focus_areas: next, goals: [], reflection: null });
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
        <div ref={swipeRef} className="pp-view max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            {/* Header — Daily 패턴 통일 */}
            {(() => {
                const now = new Date();
                const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
                return (
                    <div className="flex items-center justify-between mb-8">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                <button onClick={() => navigateMonth(-1)} className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <div
                                    className={`flex items-center gap-2 min-w-0 ${
                                        isCurrentMonth ? "underline decoration-[#0F766E] decoration-2 underline-offset-[6px]" : ""
                                    }`}
                                    title={isCurrentMonth ? "이번 달" : undefined}
                                >
                                    <div ref={yearRef} className="relative">
                                        <button
                                            onClick={() => { setShowYearPicker(v => !v); setShowMonthPicker(false); }}
                                            className="font-serif text-xl md:text-2xl text-neutral-900 hover:text-[#0F766E] transition-colors whitespace-nowrap"
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
                                    <div ref={monthRef} className="relative">
                                        <button
                                            onClick={() => { setShowMonthPicker(v => !v); setShowYearPicker(false); }}
                                            className="font-serif text-xl md:text-2xl text-neutral-900 hover:text-[#0F766E] transition-colors whitespace-nowrap"
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
                                </div>
                                <button onClick={() => navigateMonth(1)} className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <PlannersUtilityLinks />
                            {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                        </div>
                    </div>
                );
            })()}

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="space-y-6">
                    {/* 1) 이달의 방향 — 테마 + 목표 통합 카드 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-[10px] uppercase tracking-widest text-[#0F766E] font-semibold">DIRECTION</span>
                            <h2 className="text-sm font-semibold text-neutral-800">이달의 방향</h2>
                        </div>
                        <div className="grid md:grid-cols-[1fr_1.3fr] gap-6">
                            {/* 좌: 테마 (큰 인용) */}
                            <div className="md:border-r md:border-neutral-100 md:pr-6">
                                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">이달의 테마</label>
                                <input
                                    type="text"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    onBlur={() => save({ theme })}
                                    placeholder="예: 몰입의 달"
                                    className="w-full text-2xl font-serif text-neutral-900 focus:outline-none bg-transparent placeholder:text-neutral-300 placeholder:italic placeholder:text-base"
                                />
                            </div>
                            {/* 우: 월간 목표 체크리스트 */}
                            <div>
                                <button
                                    onClick={() => setGoalsOpen(v => !v)}
                                    className="flex items-center gap-1.5 mb-2 group"
                                >
                                    <span className="text-[10px] uppercase tracking-widest text-neutral-400">월간 목표</span>
                                    <ChevronDown className={`h-3 w-3 text-neutral-400 transition-transform ${goalsOpen ? "" : "-rotate-90"}`} />
                                </button>
                                {goalsOpen && (
                                    <>
                                        <div className="space-y-1.5">
                                            {goals.length === 0 && (
                                                <p className="text-xs text-neutral-400 py-1">이달에 이루고 싶은 것을 추가해 보세요.</p>
                                            )}
                                            {goals.map((g) => (
                                                <div key={g.id} className="group flex items-center gap-3 py-1">
                                                    <button
                                                        onClick={() => toggleGoal(g.id)}
                                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                                                            g.done ? "bg-[#0F766E] border-[#0F766E] text-white" : "border-neutral-300 hover:border-neutral-500"
                                                        }`}
                                                    >
                                                        {g.done && "✓"}
                                                    </button>
                                                    <span className={`flex-1 text-sm ${g.done ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                                                        {g.text}
                                                    </span>
                                                    <button
                                                        onClick={() => setConfirmGoalId(g.id)}
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
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 2) 집중 영역 — 활성 프로젝트 토글 + 자유 텍스트 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-[#0F766E] font-semibold">FOCUS</span>
                            <h2 className="text-sm font-semibold text-neutral-800">집중 영역</h2>
                            <button
                                onClick={() => setShowSuggestions(v => !v)}
                                className="ml-auto flex items-center gap-0.5 text-[11px] text-neutral-400 hover:text-[#0F766E] transition-colors"
                            >
                                제시 항목 <ChevronDown className={`h-3 w-3 transition-transform ${showSuggestions ? "rotate-180" : ""}`} />
                            </button>
                        </div>

                        {/* 선택된 집중 영역 — 위, 강조 */}
                        {(monthly?.focus_areas ?? []).length > 0 ? (
                            <div className="mb-2 bg-[#0F766E]/5 border border-[#0F766E]/20 rounded-lg p-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {(monthly?.focus_areas ?? []).map((f, i) => {
                                        const matched = activeProjects.find(p => p.title === f);
                                        return (
                                            <span key={i} className="group inline-flex items-center gap-1 bg-[#0F766E] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                {matched ? (
                                                    <Link
                                                        href={`/planners/app/projects/${matched.id}`}
                                                        title="프로젝트로 이동"
                                                        className="hover:underline inline-flex items-center gap-0.5"
                                                    >
                                                        {f} <ArrowUpRight className="h-3 w-3" />
                                                    </Link>
                                                ) : (
                                                    <span>{f}</span>
                                                )}
                                                <button
                                                    onClick={() => setConfirmFocusIdx(i)}
                                                    title="제거"
                                                    className="opacity-60 group-hover:opacity-100 hover:bg-white/20 rounded p-0.5 transition-opacity"
                                                >
                                                    <Trash2 className="h-2.5 w-2.5" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="mb-2 border border-dashed border-neutral-200 rounded-lg py-2 text-center">
                                <p className="text-[11px] text-neutral-400">제시 항목에서 클릭하거나 직접 입력하세요.</p>
                            </div>
                        )}

                        {/* 제시 항목 — 펼침 시 활성 프로젝트 표시 */}
                        {showSuggestions && (
                            <div className="mb-2 pb-2 border-b border-neutral-100">
                                <p className="text-[10px] text-neutral-400 mb-1.5">프로젝트 — 클릭으로 추가</p>
                                {activeProjects.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {activeProjects.map((p) => {
                                            const added = (monthly?.focus_areas ?? []).includes(p.title);
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        if (added) {
                                                            const idx = (monthly?.focus_areas ?? []).indexOf(p.title);
                                                            if (idx >= 0) removeFocusArea(idx);
                                                        } else {
                                                            const next = [...(monthly?.focus_areas ?? []), p.title];
                                                            save({ focus_areas: next });
                                                            setMonthly(m => m ? { ...m, focus_areas: next } : { year, month, theme: null, focus_areas: next, goals: [], reflection: null });
                                                        }
                                                    }}
                                                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                                                        added
                                                            ? "bg-neutral-100 border-neutral-200 text-neutral-400 line-through"
                                                            : "bg-white border-neutral-200 text-neutral-500 hover:border-[#0F766E] hover:text-[#0F766E]"
                                                    }`}
                                                    style={!added && p.color ? { borderLeftColor: p.color, borderLeftWidth: 3 } : undefined}
                                                >
                                                    {added ? "✓" : "+"} {p.title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-neutral-300">이달 활성 프로젝트가 없습니다.</p>
                                )}
                            </div>
                        )}

                        {/* 자유 텍스트 추가 */}
                        <div className="flex items-center gap-2">
                            <Plus className="h-3.5 w-3.5 text-neutral-400" />
                            <input
                                type="text"
                                value={focusInput}
                                onChange={(e) => setFocusInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") addFocusArea(); }}
                                placeholder="키워드·영역 직접 입력 후 Enter"
                                className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                            />
                        </div>
                    </section>

                    {/* 캘린더 그리드 */}
                    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
                            {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
                                <div key={d} className={`text-xs font-semibold text-neutral-600 text-center py-2 ${i > 0 ? "border-l border-neutral-200" : ""}`}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {calendar.map((row, ri) => (
                            <div key={ri} className="grid grid-cols-7 border-b border-neutral-100 last:border-0">
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
                                            className={`min-h-[88px] md:min-h-[120px] p-2 border-l border-neutral-100 transition-colors flex flex-col min-w-0 overflow-hidden ${
                                                cell.inMonth ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/50 text-neutral-300 hover:bg-neutral-50"
                                            }`}
                                        >
                                            {/* Row 1: 날짜 + 음력 */}
                                            <div className="flex items-center justify-between gap-0.5">
                                                <div className="flex items-center gap-1 min-w-0">
                                                    <span className={`text-sm shrink-0 ${
                                                        isToday ? "text-[#0F766E] font-bold" :
                                                        !cell.inMonth ? "text-neutral-300" :
                                                        isHoliday || isSunday ? "text-red-500 font-medium" :
                                                        "text-neutral-800"
                                                    }`}>
                                                        {cell.dom}
                                                    </span>
                                                    {cell.inMonth && lunar && (
                                                        <span className="text-[9px] text-neutral-300 leading-tight">
                                                            {lunar.isLeap ? "윤" : ""}{lunar.month}/{lunar.day}
                                                        </span>
                                                    )}
                                                </div>
                                                {isToday && <span className="text-[9px] px-1 bg-[#0F766E] text-white rounded shrink-0 leading-4">오</span>}
                                            </div>
                                            {/* Row 2+: 공휴일·절기·기념일·업무 통합 최대 3개 */}
                                            {cell.inMonth && (() => {
                                                type DisplayItem = {
                                                    key: string;
                                                    label: string;
                                                    kind: "public_holiday" | "solar_term" | "anniversary" | "meeting" | "task";
                                                };
                                                const items: DisplayItem[] = [];
                                                // 1순위: 사용자 calEntries
                                                for (const e of (entriesByDate[cell.date] ?? [])) {
                                                    items.push({ key: e.id, label: e.title, kind: e.kind as DisplayItem["kind"] });
                                                }
                                                // 2순위: 정적 공휴일/절기 (중복 제외)
                                                if (holiday && !items.some(i => i.label === holiday.label)) {
                                                    const kind: DisplayItem["kind"] = holiday.type === "solar_term" ? "solar_term" : "public_holiday";
                                                    // 공휴일·추모일은 앞에, 절기·기념일은 뒤에
                                                    if (holiday.type === "holiday" || holiday.type === "memorial") {
                                                        items.unshift({ key: `hol-${cell.date}`, label: holiday.label, kind });
                                                    } else {
                                                        items.push({ key: `hol-${cell.date}`, label: holiday.label, kind });
                                                    }
                                                }
                                                const visible = items.slice(0, 3);
                                                if (visible.length === 0) return null;
                                                return (
                                                    <div className="flex flex-col gap-[1px] mt-0.5">
                                                        {visible.map(item => {
                                                            const c = KIND_COLORS[item.kind];
                                                            return (
                                                                <div key={item.key} className={`flex items-start gap-0.5 text-[10px] leading-tight ${c.text}`}>
                                                                    <span className={`w-1 h-1 rounded-full ${c.dot} shrink-0 mt-1`} />
                                                                    <span className="line-clamp-3 break-words">{item.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </section>

                    {/* 4) 월간 분석 — 3-탭 (통계 / 한 줄 / 트래킹) — Yearly 와 일관: 통계 먼저 */}
                    {(summary && summary.total_tasks > 0) || (tracking && (tracking.one_liners.length > 0 || tracking.stats.days_recorded > 0)) ? (
                        <MonthlyAnalytics summary={summary} tracking={tracking} />
                    ) : null}

                    {/* 5) 월간 회고 — Yearly 와 일관: 회고가 마지막 (한 사이클을 닫는 섹션) */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-neutral-900 mb-3">월간 회고</h2>
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            onBlur={() => save({ reflection })}
                            placeholder="이달을 돌아보며…"
                            rows={6}
                            className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                        />
                    </section>
                </div>
            )}

            <CalendarEntryEditor
                open={calEditorOpen}
                onClose={() => { setCalEditorOpen(false); setCalEditing(null); setCalDefaultDate(undefined); }}
                onSaved={() => {
                    fetch(`/api/planners/calendar?from=${year}-${String(month).padStart(2,"0")}-01&to=${year}-${String(month).padStart(2,"0")}-${String(new Date(year, month, 0).getDate()).padStart(2,"0")}`)
                        .then((r) => r.ok ? r.json() : null)
                        .then((d) => { if (d?.entries) setCalEntries(d.entries); });
                }}
                onDeleted={() => {
                    fetch(`/api/planners/calendar?from=${year}-${String(month).padStart(2,"0")}-01&to=${year}-${String(month).padStart(2,"0")}-${String(new Date(year, month, 0).getDate()).padStart(2,"0")}`)
                        .then((r) => r.ok ? r.json() : null)
                        .then((d) => { if (d?.entries) setCalEntries(d.entries); });
                }}
                initial={calEditing ?? undefined}
                defaultDate={calDefaultDate}
            />

            <ConfirmSheet
                open={confirmGoalId !== null}
                message="이 목표를 삭제하시겠어요?"
                onConfirm={() => { if (confirmGoalId) removeGoal(confirmGoalId); setConfirmGoalId(null); }}
                onCancel={() => setConfirmGoalId(null)}
            />
            <ConfirmSheet
                open={confirmFocusIdx !== null}
                message="이 집중 영역을 제거하시겠어요?"
                onConfirm={() => { if (confirmFocusIdx !== null) removeFocusArea(confirmFocusIdx); setConfirmFocusIdx(null); }}
                onCancel={() => setConfirmFocusIdx(null)}
            />
        </div>
    );
}

const ONE_LINER_LABELS: Record<string, string> = {
    summary: "정리", quote: "들은 말", idea: "아이디어",
    insight: "인사이트", emotion: "감정", learning: "배움", free: "자유",
};

// ─────────────────────────────────────────────────────────────────
// MonthlyAnalytics — 월간 통계/한 줄/트래킹 3-탭 통합
// ─────────────────────────────────────────────────────────────────

interface MonthlyAnalyticsProps {
    summary: {
        days_recorded: number;
        total_tasks: number;
        todo_tasks: number;
        done_tasks: number;
        carried_tasks: number;
        canceled_tasks: number;
        completion_rate: number;
        energy_avg: number | null;
        projects_completed: number;
    } | null;
    tracking: {
        stats: TrackingStats;
        series: TrackingSeries[];
        one_liners: Array<{ date: string; text: string; category: string | null }>;
    } | null;
}

function MonthlyAnalytics({ summary, tracking }: MonthlyAnalyticsProps) {
    const [tab, setTab] = useState<"tasks" | "lines" | "tracking">("tasks");
    const hasTasks = !!summary && summary.total_tasks > 0;
    const hasLines = !!tracking && tracking.one_liners.length > 0;
    const hasTracking = !!tracking && tracking.stats.days_recorded > 0;

    return (
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="border-b border-neutral-100 flex">
                {([
                    { k: "tasks",    label: "업무",         enabled: hasTasks },
                    { k: "lines",    label: "이달의 한 줄", enabled: hasLines },
                    { k: "tracking", label: "데일리 트래킹", enabled: hasTracking },
                ] as const).map((t) => (
                    <button
                        key={t.k}
                        onClick={() => setTab(t.k)}
                        disabled={!t.enabled}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            tab === t.k
                                ? "text-[#0F766E] border-b-2 border-[#0F766E] -mb-px"
                                : t.enabled
                                    ? "text-neutral-500 hover:text-neutral-900"
                                    : "text-neutral-300 cursor-not-allowed"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="p-5">
                {tab === "tasks" && summary && summary.total_tasks > 0 && <MonthlyTasksTab summary={summary} />}
                {tab === "tasks" && (!summary || summary.total_tasks === 0) && (
                    <p className="text-sm text-neutral-400 text-center py-8">이달 태스크 기록이 없습니다.</p>
                )}
                {tab === "lines" && tracking && tracking.one_liners.length > 0 && (
                    <OneLinersGrouped lines={tracking.one_liners} />
                )}
                {tab === "lines" && (!tracking || tracking.one_liners.length === 0) && (
                    <p className="text-sm text-neutral-400 text-center py-8">이달 한 줄 기록이 없습니다.</p>
                )}
                {tab === "tracking" && tracking && tracking.stats.days_recorded > 0 && (
                    <TrackingSummary stats={tracking.stats} series={tracking.series} />
                )}
                {tab === "tracking" && (!tracking || tracking.stats.days_recorded === 0) && (
                    <p className="text-sm text-neutral-400 text-center py-8">이달 트래킹 기록이 없습니다.</p>
                )}
            </div>
        </section>
    );
}

function MonthlyTasksTab({ summary }: { summary: NonNullable<MonthlyAnalyticsProps["summary"]> }) {
    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <StatCell label="전체"  value={summary.total_tasks}    pct={null}                                                          accent="text-neutral-900" />
                <StatCell label="완료"  value={summary.done_tasks}     pct={percent(summary.done_tasks, summary.total_tasks)}             accent="text-emerald-600" />
                <StatCell label="미완"  value={summary.todo_tasks}     pct={percent(summary.todo_tasks, summary.total_tasks)}             accent="text-amber-600" />
                <StatCell label="이월"  value={summary.carried_tasks}  pct={percent(summary.carried_tasks, summary.total_tasks)}          accent="text-orange-500" />
                <StatCell label="취소"  value={summary.canceled_tasks} pct={percent(summary.canceled_tasks, summary.total_tasks)}         accent="text-neutral-400" />
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-neutral-100 flex mb-4">
                {summary.done_tasks > 0     && <span className="bg-emerald-500" style={{ width: `${percent(summary.done_tasks, summary.total_tasks)}%` }} />}
                {summary.todo_tasks > 0     && <span className="bg-amber-400"   style={{ width: `${percent(summary.todo_tasks, summary.total_tasks)}%` }} />}
                {summary.carried_tasks > 0  && <span className="bg-orange-400"  style={{ width: `${percent(summary.carried_tasks, summary.total_tasks)}%` }} />}
                {summary.canceled_tasks > 0 && <span className="bg-neutral-300" style={{ width: `${percent(summary.canceled_tasks, summary.total_tasks)}%` }} />}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
                <SubStat label="에너지 평균"   value={summary.energy_avg !== null ? `${summary.energy_avg}/5` : "—"} />
                <SubStat label="일간 계획 수립" value={`${summary.days_recorded}일`} />
                <SubStat label="완료한 프로젝트" value={`${summary.projects_completed}개`} />
            </div>
        </div>
    );
}

function OneLinersGrouped({ lines }: { lines: Array<{ date: string; text: string; category: string | null }> }) {
    const groups: Record<string, Array<{ date: string; text: string }>> = {};
    lines.forEach((l) => {
        const k = l.category || "_uncategorized";
        (groups[k] = groups[k] || []).push({ date: l.date, text: l.text });
    });
    const order = ["summary", "quote", "idea", "insight", "emotion", "learning", "free", "_uncategorized"];
    const visible = order.filter((k) => groups[k]?.length);
    if (visible.length === 0) return null;
    return (
        <div className="space-y-4">
            {visible.map((k) => (
                <div key={k}>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                        {k === "_uncategorized" ? "분류 없음" : (ONE_LINER_LABELS[k] ?? k)}
                        <span className="ml-1 text-neutral-300">{groups[k].length}</span>
                    </p>
                    <div className="space-y-1.5">
                        {groups[k].map((l, i) => (
                            <div key={i} className="flex items-baseline gap-3 text-sm">
                                <span className="text-[10px] font-mono text-neutral-300 w-8 shrink-0">
                                    {l.date.slice(8, 10)}
                                </span>
                                <p className="text-neutral-700 leading-relaxed flex-1 whitespace-pre-wrap">{l.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

interface TrackingStats {
    days_recorded: number;
    energy_avg: number | null; satisfaction_avg: number | null; mood_avg: number | null;
    exercise_minutes_total: number; exercise_distance_total: number; exercise_days: number;
    bp_sys_avg: number | null; bp_dia_avg: number | null; sugar_avg: number | null;
    weight_latest: number | null; temp_latest: number | null;
}

interface TrackingSeries {
    date: string;
    energy: number | null; satisfaction: number | null; mood: number | null;
    exercise_min: number | null; weight: number | null; bp_sys: number | null; sugar: number | null;
}

function TrackingSummary({ stats, series }: { stats: TrackingStats; series: TrackingSeries[] }) {
    const has1to5 = stats.energy_avg !== null || stats.satisfaction_avg !== null || stats.mood_avg !== null;
    const hasExercise = stats.exercise_days > 0;
    const hasHealth = stats.bp_sys_avg !== null || stats.sugar_avg !== null || stats.weight_latest !== null || stats.temp_latest !== null;

    return (
        <div className="space-y-5">
            {has1to5 && (
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2">컨디션 평균</p>
                    <div className="grid grid-cols-3 gap-3">
                        <AvgCard label="에너지" value={stats.energy_avg} suffix="/5" color="bg-[#0F766E]" />
                        <AvgCard label="만족도" value={stats.satisfaction_avg} suffix="/5" color="bg-amber-500" />
                        <AvgCard label="기분" value={stats.mood_avg} suffix="/5" color="bg-rose-400" />
                    </div>
                    <SparkRow data={series.map((s) => ({ x: s.date, y: s.energy }))} color="var(--planners-accent, #0F766E)" max={5} label="에너지" />
                    <SparkRow data={series.map((s) => ({ x: s.date, y: s.satisfaction }))} color="#F59E0B" max={5} label="만족도" />
                    <SparkRow data={series.map((s) => ({ x: s.date, y: s.mood }))} color="#FB7185" max={5} label="기분" />
                </div>
            )}
            {hasExercise && (
                <div className="pt-4 border-t border-neutral-100">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2">운동</p>
                    <div className="grid grid-cols-3 gap-3">
                        <AvgCard label="누적 시간" value={stats.exercise_minutes_total} suffix="분" />
                        <AvgCard label="누적 거리" value={stats.exercise_distance_total} suffix="km" />
                        <AvgCard label="운동 일수" value={stats.exercise_days} suffix="일" />
                    </div>
                </div>
            )}
            {hasHealth && (
                <div className="pt-4 border-t border-neutral-100">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2">건강</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stats.bp_sys_avg !== null && stats.bp_dia_avg !== null && (
                            <AvgCard label="혈압 평균" value={`${stats.bp_sys_avg}/${stats.bp_dia_avg}`} suffix="" />
                        )}
                        {stats.sugar_avg !== null && (
                            <AvgCard label="혈당 평균" value={stats.sugar_avg} suffix="mg/dL" />
                        )}
                        {stats.weight_latest !== null && (
                            <AvgCard label="체중 최근" value={stats.weight_latest} suffix="kg" />
                        )}
                        {stats.temp_latest !== null && (
                            <AvgCard label="체온 최근" value={stats.temp_latest} suffix="°C" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function AvgCard({ label, value, suffix, color }: { label: string; value: number | string | null; suffix: string; color?: string }) {
    return (
        <div className="rounded-lg bg-neutral-50 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">{label}</p>
            <p className="flex items-baseline justify-center gap-0.5">
                <span className={`text-xl font-semibold text-neutral-900 ${color ? "" : ""}`}>
                    {value ?? "—"}
                </span>
                {value != null && <span className="text-[10px] text-neutral-400">{suffix}</span>}
            </p>
            {color && <span className={`block mt-1 mx-auto h-0.5 w-6 rounded-full ${color}`} />}
        </div>
    );
}

function SparkRow({ data, color, max, label }: { data: Array<{ x: string; y: number | null }>; color: string; max: number; label: string }) {
    const points = data.filter((p) => p.y !== null) as Array<{ x: string; y: number }>;
    if (points.length === 0) return null;
    const w = 100, h = 28;

    // 실제 데이터 범위에 맞춰 스케일 — 좁은 범위(예: 4~5) 변동도 보이게
    const ys = points.map(p => p.y);
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const flat = lo === hi;
    // 위·아래 5% 패딩 + 평탄선이면 중앙 고정
    const span = flat ? 1 : (hi - lo);
    const padTop = h * 0.1;
    const padBot = h * 0.1;
    const drawH = h - padTop - padBot;

    const path = points.map((p, i) => {
        const px = (i / Math.max(points.length - 1, 1)) * w;
        const norm = flat ? 0.5 : (p.y - lo) / span;
        const py = padTop + (1 - norm) * drawH;
        return `${i === 0 ? "M" : "L"}${px},${py}`;
    }).join(" ");

    // 채움 영역 (반투명)
    const area = path + ` L${w},${h} L0,${h} Z`;

    // 마지막 값
    const last = points[points.length - 1].y;

    return (
        <div className="flex items-center gap-2 mt-2 first:mt-3">
            <span className="text-[10px] text-neutral-400 w-12 shrink-0">{label}</span>
            <svg viewBox={`0 0 ${w} ${h}`} className="flex-1 h-7" preserveAspectRatio="none">
                <path d={area} style={{ fill: color, fillOpacity: 0.08 }} />
                <path d={path} style={{ stroke: color }} strokeWidth={1.4} fill="none" vectorEffect="non-scaling-stroke" />
                {/* 첫·마지막 포인트만 점 표시 */}
                {points.length > 1 && (() => {
                    const lastP = points[points.length - 1];
                    const px = w;
                    const norm = flat ? 0.5 : (lastP.y - lo) / span;
                    const py = padTop + (1 - norm) * drawH;
                    return <circle cx={px} cy={py} r={1.4} style={{ fill: color }} vectorEffect="non-scaling-stroke" />;
                })()}
            </svg>
            <span className="text-[9px] text-neutral-500 font-mono w-20 text-right shrink-0 tabular-nums">
                {flat ? `${lo}/${max}` : `${lo}~${hi}/${max}`}
                <span className="text-neutral-300 ml-1">→{last}</span>
            </span>
        </div>
    );
}

function percent(part: number, total: number): number {
    if (!total) return 0;
    return Math.round((part / total) * 1000) / 10;
}

function StatCell({ label, value, pct, accent }: { label: string; value: number; pct: number | null; accent: string }) {
    return (
        <div className="text-center py-2 px-1 rounded-lg bg-neutral-50">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">{label}</p>
            <p className={`text-xl font-semibold ${accent}`}>{value.toLocaleString("ko-KR")}</p>
            {pct !== null && (
                <p className="text-[10px] text-neutral-400 mt-0.5">{pct}%</p>
            )}
        </div>
    );
}

function SubStat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">{label}</p>
            <p className="text-sm font-medium text-neutral-900">{value}</p>
        </div>
    );
}
