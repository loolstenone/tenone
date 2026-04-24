"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2, Gift, X } from "lucide-react";

interface Anniversary {
    id: string;
    date: string;  // MM-DD
    label: string;
    type: 'anniversary' | 'event';
}

interface YearlyData {
    id?: string;
    year: number;
    theme: string | null;
    goals: Array<{ id: string; text: string; quarter?: number; done?: boolean }>;
    anniversaries: Anniversary[];
    reflection: string | null;
}

export function YearlyView({ initialYear }: { initialYear: number }) {
    const [year, setYear] = useState(initialYear);
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
    const [editingType, setEditingType] = useState<'anniversary' | 'event'>('event');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/yearly?year=${year}`);
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

    function openDayEditor(mm: number, dd: number) {
        const dateStr = `${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
        const existing = anniversaries.find((a) => a.date === dateStr);
        setEditingDate(dateStr);
        setEditingLabel(existing?.label || "");
        setEditingType(existing?.type || "event");
    }

    function saveAnniversary() {
        if (!editingDate) return;
        const existing = anniversaries.find((a) => a.date === editingDate);
        let next: Anniversary[];
        if (!editingLabel.trim()) {
            next = anniversaries.filter((a) => a.date !== editingDate);
        } else if (existing) {
            next = anniversaries.map((a) => a.date === editingDate ? { ...a, label: editingLabel.trim(), type: editingType } : a);
        } else {
            next = [...anniversaries, { id: `a_${Date.now()}`, date: editingDate, label: editingLabel.trim(), type: editingType }];
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

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => setYear(year - 1)} className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h1 className="font-serif text-3xl text-neutral-900">{year}</h1>
                    <button onClick={() => setYear(year + 1)} className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            </div>

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="space-y-6">
                    {/* 테마 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">올해의 테마</label>
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            onBlur={() => save({ theme })}
                            placeholder="예: 깊이의 해"
                            className="w-full text-2xl font-serif text-neutral-900 focus:outline-none bg-transparent border-b border-neutral-200 pb-2"
                        />
                    </section>

                    {/* 12개월 그리드 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-neutral-900 mb-4">월별 바로가기</h2>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {Array.from({ length: 12 }).map((_, i) => {
                                const m = i + 1;
                                const monthName = new Date(year, i, 1).toLocaleDateString('ko-KR', { month: 'short' });
                                const currentMonth = new Date();
                                const isCurrent = year === currentMonth.getFullYear() && m === currentMonth.getMonth() + 1;
                                return (
                                    <Link
                                        key={m}
                                        href={`/planners/app/monthly?year=${year}&month=${m}`}
                                        className={`aspect-square flex flex-col items-center justify-center rounded-lg border text-center transition-colors ${
                                            isCurrent
                                                ? "border-[#0F766E] bg-[#0F766E]/5"
                                                : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                                        }`}
                                    >
                                        <span className="text-xs text-neutral-500">{i + 1}</span>
                                        <span className={`text-sm font-semibold mt-1 ${isCurrent ? "text-[#0F766E]" : "text-neutral-900"}`}>
                                            {monthName}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* 분기별 목표 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-neutral-900 mb-4">연간 목표 (분기별)</h2>
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
                                                    onClick={() => removeGoal(g.id)}
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
                            <Plus className="h-3.5 w-3.5 text-neutral-400" />
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
                                placeholder="목표 추가"
                                className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                            />
                        </div>
                    </section>

                    {/* Anniversary & Big Event 2p 스프레드 */}
                    <section className="bg-white border border-neutral-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Gift className="h-4 w-4 text-[#0F766E]" />
                            <h2 className="text-sm font-semibold text-neutral-900">Anniversary & Big Event</h2>
                            <span className="text-[10px] text-neutral-400">· {anniversaries.length}개 등록</span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-4">
                            기념일과 큰 행사를 연간 단위로 한눈에. 각 날짜 셀을 클릭해 추가·편집.
                        </p>

                        {/* 상반기 (1~6월) */}
                        <div className="mb-6 overflow-x-auto">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">상반기 · Jan–Jun</p>
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr>
                                        <th className="text-left pr-2 pb-1 w-12 font-medium text-neutral-400">월</th>
                                        {Array.from({ length: 31 }).map((_, i) => (
                                            <th key={i} className="text-center pb-1 font-normal text-neutral-400 w-6">{i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5, 6].map((m) => (
                                        <tr key={m} className="border-t border-neutral-100">
                                            <td className="pr-2 py-1 font-medium text-neutral-700">
                                                {new Date(year, m - 1, 1).toLocaleDateString('ko-KR', { month: 'short' })}
                                            </td>
                                            {Array.from({ length: 31 }).map((_, i) => {
                                                const d = i + 1;
                                                const anno = d <= daysInMonth(m) ? getAnniversary(m, d) : null;
                                                const disabled = d > daysInMonth(m);
                                                return (
                                                    <td
                                                        key={d}
                                                        className={`text-center p-0.5 ${disabled ? "bg-neutral-50" : ""}`}
                                                    >
                                                        {!disabled && (
                                                            <button
                                                                onClick={() => openDayEditor(m, d)}
                                                                className={`w-full aspect-square flex items-center justify-center rounded text-[8px] transition-colors ${
                                                                    anno
                                                                        ? anno.type === 'anniversary'
                                                                            ? "bg-red-500 text-white hover:bg-red-600"
                                                                            : "bg-[#0F766E] text-white hover:bg-[#0d5e56]"
                                                                        : "hover:bg-neutral-100 text-neutral-300"
                                                                }`}
                                                                title={anno?.label || `${m}/${d}`}
                                                            >
                                                                {anno ? "●" : ""}
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

                        {/* 하반기 (7~12월) */}
                        <div className="mb-4 overflow-x-auto">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">하반기 · Jul–Dec</p>
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr>
                                        <th className="text-left pr-2 pb-1 w-12 font-medium text-neutral-400">월</th>
                                        {Array.from({ length: 31 }).map((_, i) => (
                                            <th key={i} className="text-center pb-1 font-normal text-neutral-400 w-6">{i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[7, 8, 9, 10, 11, 12].map((m) => (
                                        <tr key={m} className="border-t border-neutral-100">
                                            <td className="pr-2 py-1 font-medium text-neutral-700">
                                                {new Date(year, m - 1, 1).toLocaleDateString('ko-KR', { month: 'short' })}
                                            </td>
                                            {Array.from({ length: 31 }).map((_, i) => {
                                                const d = i + 1;
                                                const anno = d <= daysInMonth(m) ? getAnniversary(m, d) : null;
                                                const disabled = d > daysInMonth(m);
                                                return (
                                                    <td
                                                        key={d}
                                                        className={`text-center p-0.5 ${disabled ? "bg-neutral-50" : ""}`}
                                                    >
                                                        {!disabled && (
                                                            <button
                                                                onClick={() => openDayEditor(m, d)}
                                                                className={`w-full aspect-square flex items-center justify-center rounded text-[8px] transition-colors ${
                                                                    anno
                                                                        ? anno.type === 'anniversary'
                                                                            ? "bg-red-500 text-white hover:bg-red-600"
                                                                            : "bg-[#0F766E] text-white hover:bg-[#0d5e56]"
                                                                        : "hover:bg-neutral-100 text-neutral-300"
                                                                }`}
                                                                title={anno?.label || `${m}/${d}`}
                                                            >
                                                                {anno ? "●" : ""}
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

                        {/* 범례 + 목록 */}
                        <div className="flex items-center gap-4 text-[10px] text-neutral-500 mb-3">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500" /> 기념일
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#0F766E]" /> 행사
                            </span>
                        </div>

                        {anniversaries.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-neutral-100">
                                {[...anniversaries].sort((a, b) => a.date.localeCompare(b.date)).map((a) => (
                                    <span
                                        key={a.id}
                                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                                            a.type === 'anniversary' ? 'bg-red-50 text-red-700' : 'bg-[#0F766E]/10 text-[#0F766E]'
                                        }`}
                                    >
                                        {a.date.replace('-', '/')} {a.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* 편집 모달 */}
                    {editingDate && (
                        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl max-w-sm w-full p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-neutral-900">
                                        {year}.{editingDate.replace('-', '.')}
                                    </h3>
                                    <button onClick={() => setEditingDate(null)}>
                                        <X className="h-4 w-4 text-neutral-400" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editingLabel}
                                        onChange={(e) => setEditingLabel(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') saveAnniversary(); }}
                                        placeholder="기념일 또는 행사 이름 (비우면 삭제)"
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0F766E]"
                                        autoFocus
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['anniversary', 'event'] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setEditingType(t)}
                                                className={`py-2 text-xs rounded-lg transition-colors ${
                                                    editingType === t
                                                        ? t === 'anniversary'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-[#0F766E] text-white'
                                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                }`}
                                            >
                                                {t === 'anniversary' ? '기념일' : '행사'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-5">
                                    <button
                                        onClick={() => setEditingDate(null)}
                                        className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={saveAnniversary}
                                        className="px-4 py-1.5 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56]"
                                    >
                                        저장
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
        </div>
    );
}
