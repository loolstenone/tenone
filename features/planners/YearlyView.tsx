"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2, Gift, X } from "lucide-react";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { ConfirmSheet } from "./ConfirmSheet";
import { CalendarEntryList } from "./CalendarEntryList";
import { CalendarEntryEditor } from "./CalendarEntryEditor";
import type { CalendarEntry } from "@/lib/planners/calendar-rules";
import { KIND_COLORS } from "@/lib/planners/calendar-rules";
import { useSwipeNav } from "./useSwipeNav";
import { HOLIDAYS } from "@/lib/planners/holidays";

interface Anniversary {
    id: string;
    date: string;  // MM-DD
    label: string;
    type: 'anniversary' | 'event';
    relationship?: string;
}

const RELATIONSHIP_OPTIONS = ["가족", "연인", "친구", "직장", "기타"] as const;

interface YearlyData {
    id?: string;
    year: number;
    theme: string | null;
    goals: Array<{ id: string; text: string; quarter?: number; done?: boolean }>;
    anniversaries: Anniversary[];
    reflection: string | null;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 3 + i);

export function YearlyView({ initialYear }: { initialYear: number }) {
    const [year, setYear] = useState(initialYear);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const yearPickerRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<YearlyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [theme, setTheme] = useState("");
    const [reflection, setReflection] = useState("");
    const [goals, setGoals] = useState<YearlyData["goals"]>([]);
    const [newGoal, setNewGoal] = useState("");
    const [newGoalQuarter, setNewGoalQuarter] = useState<number>(1);
    const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [editingLabel, setEditingLabel] = useState("");
    const [confirmGoalId, setConfirmGoalId] = useState<string | null>(null);
    const [editingType, setEditingType] = useState<'anniversary' | 'event'>('event');
    const [editingRelationship, setEditingRelationship] = useState("");
    // 캘린더 엔트리 (신규 통합 시스템)
    const [calEntries, setCalEntries] = useState<CalendarEntry[]>([]);
    const [calEditorOpen, setCalEditorOpen] = useState(false);
    const [calEditing, setCalEditing] = useState<Partial<CalendarEntry> | null>(null);
    const [activeQuarter, setActiveQuarter] = useState(1);
    const [viewMode, setViewMode] = useState<"Q" | "H" | "Y">("Y"); // 분기/반기/연간 — 기본 연간 (모바일은 분기)
    const [yearStartMonth, setYearStartMonth] = useState(1);   // 1~12
    const [joinYear, setJoinYear] = useState<number | null>(null);

    // 사용자 시작월 fetch
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/planners/settings');
                if (cancelled || !res.ok) return;
                const d = await res.json();
                if (typeof d.user?.year_start_month === "number") {
                    setYearStartMonth(d.user.year_start_month);
                }
                if (d.user?.created_at) {
                    setJoinYear(new Date(d.user.created_at).getFullYear());
                }
            } catch { /* ignore */ }
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (yearPickerRef.current && !yearPickerRef.current.contains(e.target as Node)) {
                setShowYearPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const [res, calRes] = await Promise.all([
                fetch(`/api/planners/yearly?year=${year}`),
                fetch(`/api/planners/calendar?from=${year}-01-01&to=${year}-12-31`),
            ]);
            if (cancelled) return;
            if (res.ok) {
                const d = await res.json();
                if (d.yearly) {
                    setData(d.yearly);
                    setTheme(d.yearly.theme || "");
                    setReflection(d.yearly.reflection || "");
                    setGoals(d.yearly.goals || []);
                    setAnniversaries(d.yearly.anniversaries || []);
                } else {
                    setData(null);
                    setTheme(""); setReflection(""); setGoals([]); setAnniversaries([]);
                }
            }
            if (calRes.ok) {
                const cd = await calRes.json();
                setCalEntries(cd.entries ?? []);
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [year]);

    async function save(patch: Partial<YearlyData>) {
        setSaving(true);
        try {
            await fetch(`/api/planners/yearly`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year, ...patch }),
            });
        } finally { setSaving(false); }
    }

    function addGoal() {
        if (!newGoal.trim()) return;
        const next = [...goals, { id: `g_${Date.now()}`, text: newGoal.trim(), quarter: newGoalQuarter, done: false }];
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

    const goalsByQuarter = (q: number) => goals.filter(g => (g.quarter || 1) === q);

    function getDayOfWeek(mm: number, dd: number): string {
        const d = new Date(year, mm - 1, dd);
        return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    }

    function openDayEditor(mm: number, dd: number) {
        const dateStr = `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
        // 통합 CalendarEntryEditor 모달로 열기 — 일/주/월/연 입력 방식 통일
        const existing = getEntryAt(mm, dd);
        if (existing) {
            setCalEditing(existing);
        } else {
            setCalEditing({ kind: "anniversary", start_date: dateStr, recurrence: "yearly" });
        }
        setCalEditorOpen(true);
    }

    // 해당 월/일에 노출될 첫 캘린더 엔트리 조회 (yearly 반복 + 정확 일자 포함)
    function getEntryAt(mm: number, dd: number): CalendarEntry | null {
        const mmStr = String(mm).padStart(2, "0");
        const ddStr = String(dd).padStart(2, "0");
        for (const e of calEntries) {
            if (!e.start_date) continue;
            const [, em, ed] = e.start_date.split("-");
            if (em === mmStr && ed === ddStr) {
                if (e.recurrence === "yearly" || e.start_date.startsWith(String(year))) return e;
            }
        }
        return null;
    }

    function saveAnniversary() {
        if (!editingDate) return;
        const existing = anniversaries.find((a) => a.date === editingDate);
        let next: Anniversary[];
        if (!editingLabel.trim()) {
            next = anniversaries.filter((a) => a.date !== editingDate);
        } else if (existing) {
            next = anniversaries.map((a) => a.date === editingDate ? { ...a, label: editingLabel.trim(), type: editingType, relationship: editingRelationship } : a);
        } else {
            next = [...anniversaries, { id: `a_${Date.now()}`, date: editingDate, label: editingLabel.trim(), type: editingType, relationship: editingRelationship }];
        }
        setAnniversaries(next);
        save({ anniversaries: next });
        setEditingDate(null);
    }

    function getAnniversary(mm: number, dd: number): Anniversary | null {
        const dateStr = `${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
        return anniversaries.find((a) => a.date === dateStr) || null;
    }

    function daysInMonth(m: number): number {
        if ([4, 6, 9, 11].includes(m)) return 30;
        if (m === 2) {
            const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
            return isLeap ? 29 : 28;
        }
        return 31;
    }

    // 모바일: 분기 뷰 기본값
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setViewMode("Q");
            setActiveQuarter(Math.ceil((new Date().getMonth() + 1) / 3));
        }
    }, []);

    // 스와이프 내비게이션
    const swipeRef = useSwipeNav(
        () => setYear(y => y + 1),  // 왼쪽 → 다음 연도
        () => setYear(y => y - 1),  // 오른쪽 → 이전 연도
    );

    return (
        <div ref={swipeRef} className="pp-view max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            {/* Header — Daily 패턴 통일 */}
            {(() => {
                const isCurrentYear = year === new Date().getFullYear();
                return (
                    <div className="flex items-center justify-between mb-8">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                <button onClick={() => setYear(year - 1)} className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <div
                                    className={`flex items-center gap-2 min-w-0 ${
                                        isCurrentYear ? "underline decoration-[#0F766E] decoration-2 underline-offset-[6px]" : ""
                                    }`}
                                    title={isCurrentYear ? "올해" : undefined}
                                >
                                    <div ref={yearPickerRef} className="relative">
                                        <button
                                            onClick={() => setShowYearPicker(v => !v)}
                                            className="font-serif text-xl md:text-2xl text-neutral-900 hover:text-[#0F766E] transition-colors whitespace-nowrap"
                                        >
                                            {year}년
                                        </button>
                                        {showYearPicker && (
                                            <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 py-1 min-w-[100px] max-h-60 overflow-y-auto">
                                                {YEAR_RANGE.map(y => (
                                                    <button
                                                        key={y}
                                                        onClick={() => { setYear(y); setShowYearPicker(false); }}
                                                        className={`w-full text-left px-4 py-1.5 text-sm hover:bg-neutral-50 ${y === year ? "text-[#0F766E] font-semibold" : "text-neutral-700"}`}
                                                    >
                                                        {y}년
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setYear(year + 1)} className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
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
                    {/* 올해의 목표 (테마) */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">올해의 목표</label>
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            onBlur={() => save({ theme })}
                            placeholder="예: 깊이의 해"
                            className="w-full text-2xl font-serif text-neutral-900 focus:outline-none bg-transparent border-b border-neutral-200 pb-2"
                        />
                    </section>

                    {/* 분기별 목표 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-neutral-900 mb-4">분기별 목표</h2>
                        <div className="grid md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((q) => (
                                <div key={q} className="bg-neutral-50 rounded-lg p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Q{q}</p>
                                    <div className="space-y-1.5">
                                        {goalsByQuarter(q).length === 0 && (
                                            <p className="text-xs text-neutral-400 py-1">—</p>
                                        )}
                                        {goalsByQuarter(q).map((g) => (
                                            <div key={g.id} className="group flex items-start gap-2">
                                                <button
                                                    onClick={() => toggleGoal(g.id)}
                                                    className={`shrink-0 w-3.5 h-3.5 mt-0.5 rounded border-2 flex items-center justify-center text-[9px] font-bold transition-colors ${
                                                        g.done ? "bg-[#0F766E] border-[#0F766E] text-white" : "border-neutral-300 hover:border-neutral-500"
                                                    }`}
                                                >
                                                    {g.done && "V"}
                                                </button>
                                                <span className={`flex-1 text-xs leading-tight ${g.done ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
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
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
                            <select
                                value={newGoalQuarter}
                                onChange={(e) => setNewGoalQuarter(parseInt(e.target.value, 10))}
                                className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none"
                            >
                                <option value={1}>Q1</option>
                                <option value={2}>Q2</option>
                                <option value={3}>Q3</option>
                                <option value={4}>Q4</option>
                            </select>
                            <input
                                type="text"
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") addGoal(); }}
                                placeholder="목표 입력 후 Enter 또는 추가"
                                className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-300 placeholder:italic focus:outline-none bg-white border border-neutral-200 rounded px-2 py-1.5"
                            />
                            <button
                                type="button"
                                onClick={addGoal}
                                disabled={!newGoal.trim()}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0F766E] text-white text-xs rounded hover:bg-[#0d5e56] disabled:opacity-50"
                            >
                                <Plus className="h-3 w-3" /> 추가
                            </button>
                        </div>
                    </section>

                    {/* Anniversary & Big Event — 분기별 그리드 (행=일, 열=월) */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Gift className="h-4 w-4 text-[#0F766E]" />
                            <h2 className="text-sm font-semibold text-neutral-900">기념일 & 중요 이벤트</h2>
                            <span className="text-[10px] text-neutral-400">· {anniversaries.length}개 등록</span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-4">
                            기념일과 큰 행사를 연간 단위로 한눈에. 각 날짜 셀을 클릭해 추가·편집.
                        </p>

                        {/* 보기 모드 — 분기/반기/연간 + 시작월 안내 */}
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="inline-flex bg-neutral-100 rounded-lg p-0.5">
                                {[
                                    { v: "Q" as const, label: "분기" },
                                    { v: "H" as const, label: "반기" },
                                    { v: "Y" as const, label: "연간" },
                                ].map((m) => (
                                    <button
                                        key={m.v}
                                        onClick={() => { setViewMode(m.v); setActiveQuarter(1); }}
                                        className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                                            viewMode === m.v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                                        }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                            {(() => {
                                const esm = (joinYear !== null && year > joinYear) ? 1 : yearStartMonth;
                                return esm !== 1 ? (
                                    <span className="text-[10px] text-neutral-400">시작월: {esm}월 (가입 첫 해)</span>
                                ) : null;
                            })()}
                        </div>

                        {/* 섹션 네비게이션 — viewMode 에 따라 섹션 수 변동 */}
                        {viewMode !== "Y" && (() => {
                            const sectionCount = viewMode === "Q" ? 4 : 2;
                            const sectionLabel = viewMode === "Q" ? "Q" : "H";
                            return (
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() => setActiveQuarter(q => Math.max(1, q - 1))}
                                        disabled={activeQuarter === 1}
                                        className="hidden md:flex w-7 h-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-400 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <div className="flex gap-1 md:hidden flex-1">
                                        {Array.from({ length: sectionCount }, (_, i) => i + 1).map(q => (
                                            <button
                                                key={q}
                                                onClick={() => setActiveQuarter(q)}
                                                className={`flex-1 py-1.5 text-[10px] font-medium rounded transition-colors ${
                                                    activeQuarter === q
                                                        ? "bg-[#0F766E] text-white"
                                                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                                                }`}
                                            >
                                                {sectionLabel}{q}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="hidden md:block text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                                        {sectionLabel}{activeQuarter} · {viewMode === "Q" ? "3" : "6"}개월
                                    </div>
                                    <button
                                        onClick={() => setActiveQuarter(q => Math.min(sectionCount, q + 1))}
                                        disabled={activeQuarter === sectionCount}
                                        className="hidden md:flex w-7 h-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-400 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })()}

                        {/* 그리드: 행=일(1~31), 열=N개월 (N=3/6/12 따라) */}
                        {(() => {
                            // 처음 가입한 해에만 시작월 적용, 이후 해는 1월 고정
                            const effectiveStartMonth = (joinYear !== null && year > joinYear) ? 1 : yearStartMonth;
                            // 시작월 + 보기 모드에 따른 섹션 계산
                            const sectionSize = viewMode === "Q" ? 3 : viewMode === "H" ? 6 : 12;
                            const monthsRotated: number[] = [];
                            for (let i = 0; i < 12; i++) {
                                monthsRotated.push(((effectiveStartMonth - 1 + i) % 12) + 1);
                            }
                            const allSections: number[][] = [];
                            for (let i = 0; i < monthsRotated.length; i += sectionSize) {
                                allSections.push(monthsRotated.slice(i, i + sectionSize));
                            }
                            const qMonths = allSections[activeQuarter - 1] ?? allSections[0];
                            const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                            const colWidth = `${(100 - 6) / qMonths.length}%`;
                            return (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[10px]" style={{ tableLayout: "fixed" }}>
                                        <colgroup>
                                            <col style={{ width: "6%" }} />
                                            {qMonths.map(m => <col key={m} style={{ width: colWidth }} />)}
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th className="text-left pb-1.5 font-medium text-neutral-400">일</th>
                                                {qMonths.map(m => (
                                                    <th key={m} className="text-center pb-1.5 font-medium text-neutral-500">
                                                        {monthLabels[m - 1]}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                                <tr key={d} className="border-t border-neutral-100">
                                                    <td className="pr-2 py-0.5 text-neutral-400 font-mono">{d}</td>
                                                    {qMonths.map(m => {
                                                        const disabled = d > daysInMonth(m);
                                                        // 우선순위: 사용자 입력 > 국가 기념일·추모일 > 절기
                                                        const dateKey = `${year}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                                                        const entry = disabled ? null : getEntryAt(m, d);
                                                        const holiday = !disabled && !entry ? HOLIDAYS[dateKey] : null;
                                                        const c = entry ? KIND_COLORS[entry.kind] : null;
                                                        const hcls = holiday
                                                            ? holiday.type === "holiday" ? "text-rose-500 hover:bg-neutral-100"
                                                            : holiday.type === "memorial" ? "text-rose-400 hover:bg-neutral-100"
                                                            : holiday.type === "commemoration" ? "text-amber-600 hover:bg-neutral-100"
                                                            : "text-emerald-600 hover:bg-neutral-100"
                                                            : "";
                                                        const label = entry ? entry.title : holiday ? holiday.label : "·";
                                                        const titleAttr = entry ? `[${entry.kind}] ${entry.title}` : holiday ? `[${holiday.type}] ${holiday.label}` : `${m}/${d}`;
                                                        return (
                                                            <td
                                                                key={m}
                                                                className={`p-0.5 overflow-hidden ${disabled ? "pp-cell-na" : ""}`}
                                                                aria-hidden={disabled || undefined}
                                                            >
                                                                {!disabled && (
                                                                    <button
                                                                        onClick={() => openDayEditor(m, d)}
                                                                        className={`w-full min-h-[20px] px-1.5 py-0.5 flex items-center justify-start rounded text-[10px] leading-tight transition-colors overflow-hidden ${
                                                                            entry && c
                                                                                ? `${c.text} hover:bg-neutral-100`
                                                                                : holiday
                                                                                ? hcls
                                                                                : "hover:bg-neutral-100 text-neutral-200"
                                                                        }`}
                                                                        title={titleAttr}
                                                                    >
                                                                        <span className="truncate w-full text-left">{label}</span>
                                                                    </button>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })()}

                        {/* 범례 (하단 목차는 셀에 텍스트가 보이므로 제거) */}
                        <div className="flex items-center gap-4 text-[10px] text-neutral-500 mt-3">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500" /> 기념일
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#0F766E]" /> 행사
                            </span>
                        </div>
                    </section>


                    {/* 연간 통계 — 3-탭 (Task 통계 / 한 줄 모음 / 트래킹) */}
                    <YearlyAnalytics year={year} />

                    {/* 연말 회고 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-neutral-900 mb-3">연말 회고</h2>
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            onBlur={() => save({ reflection })}
                            placeholder="올해를 돌아보며…"
                            rows={10}
                            className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                        />
                    </section>
                </div>
            )}

            <CalendarEntryEditor
                open={calEditorOpen}
                onClose={() => { setCalEditorOpen(false); setCalEditing(null); }}
                onSaved={() => {
                    fetch(`/api/planners/calendar?from=${year}-01-01&to=${year}-12-31`)
                        .then((r) => r.ok ? r.json() : null)
                        .then((d) => { if (d?.entries) setCalEntries(d.entries); });
                }}
                onDeleted={() => {
                    fetch(`/api/planners/calendar?from=${year}-01-01&to=${year}-12-31`)
                        .then((r) => r.ok ? r.json() : null)
                        .then((d) => { if (d?.entries) setCalEntries(d.entries); });
                }}
                initial={calEditing ?? undefined}
                defaultDate={`${year}-01-01`}
            />

            <ConfirmSheet
                open={confirmGoalId !== null}
                message="이 목표를 삭제하시겠어요?"
                onConfirm={() => { if (confirmGoalId) removeGoal(confirmGoalId); setConfirmGoalId(null); }}
                onCancel={() => setConfirmGoalId(null)}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// YearlyAnalytics — 연간 통계 3-탭
// ─────────────────────────────────────────────────────────────────

interface YearMonthStat {
    month: number;
    days_recorded: number;
    tasks: { todo: number; done: number; carried: number; canceled: number; total: number };
    energy_avg: number | null; satisfaction_avg: number | null; mood_avg: number | null;
    exercise_minutes: number; exercise_distance: number; exercise_days: number;
    bp_sys_avg: number | null; bp_dia_avg: number | null;
    sugar_avg: number | null; weight_avg: number | null;
}

const YEAR_ONE_LINER_LABELS: Record<string, string> = {
    summary: "정리", quote: "들은 말", idea: "아이디어",
    insight: "인사이트", emotion: "감정", learning: "배움", free: "자유",
};

function YearlyAnalytics({ year }: { year: number }) {
    const [tab, setTab] = useState<"tasks" | "lines" | "tracking">("tasks");
    const [data, setData] = useState<{
        months: YearMonthStat[];
        one_liners: Array<{ date: string; text: string; category: string | null }>;
        totals: { tasks: { todo: number; done: number; carried: number; canceled: number; total: number }; days_recorded: number };
    } | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await fetch(`/api/planners/daily/year-tracking?year=${year}`);
            if (cancelled || !res.ok) return;
            const d = await res.json();
            setData({ months: d.months, one_liners: d.one_liners, totals: d.totals });
        })();
        return () => { cancelled = true; };
    }, [year]);

    if (!data) return null;
    if (data.totals.days_recorded === 0) return null;

    return (
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="border-b border-neutral-100 flex">
                {([
                    { k: "tasks",    label: "Task 통계" },
                    { k: "lines",    label: "올해의 한 줄" },
                    { k: "tracking", label: "데일리 트래킹" },
                ] as const).map((t) => (
                    <button
                        key={t.k}
                        onClick={() => setTab(t.k)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            tab === t.k
                                ? "text-[#0F766E] border-b-2 border-[#0F766E] -mb-px"
                                : "text-neutral-500 hover:text-neutral-900"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="p-5">
                {tab === "tasks" && <YearTasksTab months={data.months} totals={data.totals.tasks} />}
                {tab === "lines" && <YearLinesTab lines={data.one_liners} />}
                {tab === "tracking" && <YearTrackingTab months={data.months} />}
            </div>
        </section>
    );
}

function YearTasksTab({ months, totals }: { months: YearMonthStat[]; totals: { todo: number; done: number; carried: number; canceled: number; total: number } }) {
    const yMax = Math.max(...months.map((m) => m.tasks.total), 1);
    const monthLabels = ["1","2","3","4","5","6","7","8","9","10","11","12"];

    function pct(v: number) { return totals.total > 0 ? Math.round((v / totals.total) * 1000) / 10 : 0; }

    return (
        <div className="space-y-5">
            {/* 연 전체 분포 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <YearStatCell label="전체"   value={totals.total}    pct={null}              accent="text-neutral-900" />
                <YearStatCell label="완료"   value={totals.done}     pct={pct(totals.done)}  accent="text-emerald-600" />
                <YearStatCell label="미완"   value={totals.todo}     pct={pct(totals.todo)}  accent="text-amber-600" />
                <YearStatCell label="이월"   value={totals.carried}  pct={pct(totals.carried)} accent="text-orange-500" />
                <YearStatCell label="취소"   value={totals.canceled} pct={pct(totals.canceled)} accent="text-neutral-400" />
            </div>

            {/* 월별 누적 막대 (스택) */}
            <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2">월별 분포</p>
                <div className="flex items-end gap-1 h-32">
                    {months.map((m, i) => {
                        const total = m.tasks.total || 1;
                        const h = (m.tasks.total / yMax) * 100;
                        const seg = (v: number) => (v / total) * h;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
                                <div className="w-full flex flex-col-reverse" style={{ height: `${h}%`, minHeight: m.tasks.total > 0 ? "4px" : 0 }}>
                                    <span style={{ height: `${seg(m.tasks.done)}%`, minHeight: m.tasks.done > 0 ? "1px" : 0 }} className="bg-emerald-500" />
                                    <span style={{ height: `${seg(m.tasks.todo)}%`, minHeight: m.tasks.todo > 0 ? "1px" : 0 }} className="bg-amber-400" />
                                    <span style={{ height: `${seg(m.tasks.carried)}%`, minHeight: m.tasks.carried > 0 ? "1px" : 0 }} className="bg-orange-400" />
                                    <span style={{ height: `${seg(m.tasks.canceled)}%`, minHeight: m.tasks.canceled > 0 ? "1px" : 0 }} className="bg-neutral-300" />
                                </div>
                                <span className="text-[9px] text-neutral-400">{monthLabels[i]}</span>
                            </div>
                        );
                    })}
                </div>
                {/* 범례 */}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500">
                    <Legend color="bg-emerald-500" label="완료" />
                    <Legend color="bg-amber-400" label="미완" />
                    <Legend color="bg-orange-400" label="이월" />
                    <Legend color="bg-neutral-300" label="취소" />
                </div>
            </div>
        </div>
    );
}

function YearLinesTab({ lines }: { lines: Array<{ date: string; text: string; category: string | null }> }) {
    if (lines.length === 0) return <p className="text-sm text-neutral-400 text-center py-8">올해 기록한 한 줄이 아직 없습니다.</p>;

    const groups: Record<string, Array<{ date: string; text: string }>> = {};
    lines.forEach((l) => {
        const k = l.category || "_uncategorized";
        (groups[k] = groups[k] || []).push({ date: l.date, text: l.text });
    });
    const order = ["summary", "quote", "idea", "insight", "emotion", "learning", "free", "_uncategorized"];
    const visible = order.filter((k) => groups[k]?.length);

    return (
        <div className="space-y-5">
            <p className="text-xs text-neutral-500">올해 기록한 한 줄 <strong className="text-neutral-900">{lines.length}건</strong> · 카테고리별 모음</p>
            {visible.map((k) => (
                <div key={k}>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2 flex items-baseline gap-1">
                        {k === "_uncategorized" ? "분류 없음" : (YEAR_ONE_LINER_LABELS[k] ?? k)}
                        <span className="text-neutral-300 font-normal">{groups[k].length}</span>
                    </p>
                    <div className="space-y-1.5">
                        {groups[k].map((l, i) => (
                            <div key={i} className="flex items-baseline gap-3 text-sm">
                                <span className="text-[10px] font-mono text-neutral-300 w-14 shrink-0">{l.date.slice(5)}</span>
                                <p className="text-neutral-700 leading-relaxed flex-1 whitespace-pre-wrap">{l.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function YearTrackingTab({ months }: { months: YearMonthStat[] }) {
    const monthLabels = ["1","2","3","4","5","6","7","8","9","10","11","12"];
    const has1to5 = months.some((m) => m.energy_avg !== null || m.satisfaction_avg !== null || m.mood_avg !== null);
    const hasExercise = months.some((m) => m.exercise_days > 0);
    const hasHealth = months.some((m) => m.bp_sys_avg !== null || m.sugar_avg !== null || m.weight_avg !== null);

    if (!has1to5 && !hasExercise && !hasHealth) {
        return <p className="text-sm text-neutral-400 text-center py-8">올해 트래킹 기록이 없습니다.</p>;
    }

    return (
        <div className="space-y-6">
            {has1to5 && (
                <div>
                    <p className="text-xs font-semibold text-neutral-700 mb-3">컨디션 — 월별 평균</p>
                    <YearLineChart
                        labels={monthLabels}
                        max={5}
                        series={[
                            { label: "에너지",   color: "#0F766E", values: months.map((m) => m.energy_avg) },
                            { label: "만족도",   color: "#F59E0B", values: months.map((m) => m.satisfaction_avg) },
                            { label: "기분",     color: "#FB7185", values: months.map((m) => m.mood_avg) },
                        ]}
                    />
                </div>
            )}
            {hasExercise && (
                <div>
                    <p className="text-xs font-semibold text-neutral-700 mb-3">운동 — 월별 누적 시간(분)</p>
                    <YearBarChart
                        labels={monthLabels}
                        values={months.map((m) => m.exercise_minutes)}
                        secondary={months.map((m) => m.exercise_days)}
                        secondaryLabel="운동일"
                        color="var(--planners-accent, #0F766E)"
                    />
                </div>
            )}
            {hasHealth && (
                <div>
                    <p className="text-xs font-semibold text-neutral-700 mb-3">건강 — 월별 평균</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <YearLineChart
                            labels={monthLabels}
                            max={Math.max(...months.map((m) => m.bp_sys_avg || 0), 140)}
                            series={[
                                { label: "수축기",   color: "#DC2626", values: months.map((m) => m.bp_sys_avg) },
                                { label: "이완기",   color: "#2563EB", values: months.map((m) => m.bp_dia_avg) },
                            ]}
                        />
                        <YearLineChart
                            labels={monthLabels}
                            max={Math.max(...months.map((m) => Math.max(m.sugar_avg || 0, m.weight_avg || 0)), 100)}
                            series={[
                                { label: "혈당",   color: "#7C3AED", values: months.map((m) => m.sugar_avg) },
                                { label: "체중",   color: "#0891B2", values: months.map((m) => m.weight_avg) },
                            ]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function YearStatCell({ label, value, pct, accent }: { label: string; value: number; pct: number | null; accent: string }) {
    return (
        <div className="text-center py-2 px-1 rounded-lg bg-neutral-50">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">{label}</p>
            <p className={`text-xl font-semibold ${accent}`}>{value.toLocaleString("ko-KR")}</p>
            {pct !== null && <p className="text-[10px] text-neutral-400 mt-0.5">{pct}%</p>}
        </div>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return <span className="inline-flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${color}`} /> {label}</span>;
}

function YearLineChart({ labels, max, series }: { labels: string[]; max: number; series: Array<{ label: string; color: string; values: Array<number | null> }> }) {
    const w = 320, h = 120, pad = 8;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;

    function path(values: Array<number | null>): string {
        const pts = values.map((v, i) => v === null ? null : [(i / Math.max(values.length - 1, 1)) * innerW + pad, innerH - (v / max) * innerH + pad] as [number, number]);
        const out: string[] = [];
        let started = false;
        pts.forEach((p) => {
            if (!p) { started = false; return; }
            out.push(`${started ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`);
            started = true;
        });
        return out.join(" ");
    }

    return (
        <div>
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
                {/* Grid */}
                {[0.25, 0.5, 0.75].map((t) => (
                    <line key={t} x1={pad} x2={w - pad} y1={innerH * t + pad} y2={innerH * t + pad} stroke="#F3F4F6" strokeWidth={1} />
                ))}
                {series.map((s, si) => (
                    <g key={si}>
                        <path d={path(s.values)} stroke={s.color} strokeWidth={1.6} fill="none" vectorEffect="non-scaling-stroke" />
                        {s.values.map((v, i) => v !== null ? (
                            <circle key={i} cx={(i / Math.max(s.values.length - 1, 1)) * innerW + pad} cy={innerH - (v / max) * innerH + pad} r={1.6} fill={s.color} />
                        ) : null)}
                    </g>
                ))}
            </svg>
            <div className="flex justify-between mt-1 px-2 text-[9px] text-neutral-400">
                {labels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px]">
                {series.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-neutral-500">
                        <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {s.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function YearBarChart({ labels, values, secondary, secondaryLabel, color }: { labels: string[]; values: number[]; secondary?: number[]; secondaryLabel?: string; color: string }) {
    const max = Math.max(...values, 1);
    return (
        <div>
            <div className="flex items-end gap-1 h-28">
                {values.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                        <span className="text-[9px] text-neutral-400 leading-none">{v > 0 ? v : ""}</span>
                        <div
                            className="w-full rounded-t"
                            style={{ height: `${(v / max) * 90}%`, minHeight: v > 0 ? "2px" : 0, background: color }}
                        />
                        <span className="text-[9px] text-neutral-400 leading-none">{labels[i]}</span>
                    </div>
                ))}
            </div>
            {secondary && (
                <p className="text-[10px] text-neutral-400 text-right mt-2">
                    {secondaryLabel}: {secondary.reduce((s, v) => s + v, 0)}일 (월 평균 {Math.round((secondary.reduce((s, v) => s + v, 0) / 12) * 10) / 10}일)
                </p>
            )}
        </div>
    );
}
