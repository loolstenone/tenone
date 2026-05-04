"use client";

import { useEffect, useState, useRef } from "react";
import { ListChecks, Plus, Trash2, Clock, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { ROUTINE_CATEGORIES, categoryMeta as catMeta } from "@/lib/planners/categories";

type Routine = {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    activity: string;
    category: string;
    note: string | null;
};

function fmtTime(t: string | null) {
    if (!t) return "";
    return t.slice(0, 5);
}

function fmtRange(start: string | null, end: string | null) {
    if (!start && !end) return "";
    if (start && end) return `${fmtTime(start)} – ${fmtTime(end)}`;
    if (start) return `${fmtTime(start)}~`;
    return `~${fmtTime(end)}`;
}

export function DailyRoutinesCard({ date, bare = false }: { date: string; bare?: boolean }) {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const [inputActivity, setInputActivity] = useState("");
    const [inputStart, setInputStart] = useState("");
    const [inputEnd, setInputEnd] = useState("");
    const [inputCat, setInputCat] = useState("general");
    const [inputNote, setInputNote] = useState("");
    const activityRef = useRef<HTMLInputElement>(null);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch(`/api/planners/routines?date=${date}`);
            if (res.ok) {
                const d = await res.json();
                setRoutines(d.routines ?? []);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [date]);

    async function addRoutine() {
        if (!inputActivity.trim()) return;
        const res = await fetch("/api/planners/routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date,
                activity: inputActivity.trim(),
                start_time: inputStart || null,
                end_time: inputEnd || null,
                category: inputCat,
                note: inputNote.trim() || null,
            }),
        });
        if (res.ok) {
            const d = await res.json();
            setRoutines(prev => [...prev, d.routine].sort((a, b) => {
                if (!a.start_time) return 1;
                if (!b.start_time) return -1;
                return a.start_time.localeCompare(b.start_time);
            }));
            setInputActivity("");
            setInputStart("");
            setInputEnd("");
            setInputCat("general");
            setInputNote("");
            setAdding(false);
        }
    }

    async function deleteRoutine(id: string) {
        const res = await fetch(`/api/planners/routines?id=${id}`, { method: "DELETE" });
        if (res.ok) setRoutines(prev => prev.filter(r => r.id !== id));
    }

    const Wrapper = bare ? "div" : "section";
    return (
        <Wrapper
            className={bare ? "" : "bg-white planners-dark:bg-[#1C1C1C] border border-neutral-200 planners-dark:border-[#2A2A2A] rounded-xl"}
            style={{ color: "var(--planners-font, inherit)" }}
        >
            {/* 헤더 */}
            <div className={`flex items-center justify-between ${bare ? "px-5 pt-4 pb-2" : "px-5 py-3.5 border-b border-neutral-100 planners-dark:border-[#2A2A2A]"}`}>
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 planners-dark:text-neutral-500 hover:text-neutral-600 transition-colors"
                >
                    <ListChecks className="h-3.5 w-3.5" />
                    일과 기록
                    {collapsed
                        ? <ChevronDown className="h-3 w-3 ml-1" />
                        : <ChevronUp className="h-3 w-3 ml-1" />
                    }
                </button>
                <button
                    onClick={() => { setAdding(a => !a); setTimeout(() => activityRef.current?.focus(), 50); }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 planners-dark:hover:text-neutral-200 hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] transition-colors"
                    title="일과 추가"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {!collapsed && (
                <div className="p-4 space-y-2">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                        </div>
                    ) : routines.length === 0 && !adding ? (
                        <p className="text-xs text-neutral-300 planners-dark:text-neutral-600 text-center py-4 italic">
                            오늘의 일과를 기록하세요
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            {routines.map((r) => {
                                const meta = catMeta(r.category);
                                const timeRange = fmtRange(r.start_time, r.end_time);
                                return (
                                    <div
                                        key={r.id}
                                        className="group flex items-start gap-3 py-2 px-1 rounded-lg hover:bg-neutral-50 planners-dark:hover:bg-[#252525] transition-colors"
                                    >
                                        <div className="mt-1.5 shrink-0">
                                            <div className={`h-2 w-2 rounded-full ${meta.dot}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="text-sm font-medium text-neutral-800 planners-dark:text-neutral-100 truncate">
                                                    {r.activity}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 planners-dark:text-neutral-500 shrink-0">
                                                    {meta.label}
                                                </span>
                                            </div>
                                            {timeRange && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Clock className="h-2.5 w-2.5 text-neutral-400" />
                                                    <span className="text-[11px] text-neutral-400">{timeRange}</span>
                                                </div>
                                            )}
                                            {r.note && (
                                                <p className="text-xs text-neutral-500 planners-dark:text-neutral-400 mt-0.5 line-clamp-1 italic">
                                                    {r.note}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => deleteRoutine(r.id)}
                                            className="md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded text-neutral-300 hover:text-rose-400 transition-all shrink-0"
                                            title="삭제"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 입력 폼 */}
                    {adding && (
                        <div className="border border-neutral-200 planners-dark:border-[#333] rounded-xl p-3 space-y-2 mt-2">
                            <input
                                ref={activityRef}
                                type="text"
                                value={inputActivity}
                                onChange={e => setInputActivity(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") addRoutine(); if (e.key === "Escape") setAdding(false); }}
                                placeholder="활동 내용"
                                className="w-full text-sm bg-transparent text-neutral-800 planners-dark:text-neutral-100 placeholder:text-neutral-300 focus:outline-none"
                            />

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-wide">시작</label>
                                    <input
                                        type="time"
                                        value={inputStart}
                                        onChange={e => setInputStart(e.target.value)}
                                        className="w-full text-sm bg-transparent text-neutral-700 planners-dark:text-neutral-200 focus:outline-none mt-0.5"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-wide">종료</label>
                                    <input
                                        type="time"
                                        value={inputEnd}
                                        onChange={e => setInputEnd(e.target.value)}
                                        className="w-full text-sm bg-transparent text-neutral-700 planners-dark:text-neutral-200 focus:outline-none mt-0.5"
                                    />
                                </div>
                            </div>

                            {/* 카테고리 pill 선택 */}
                            <div className="flex flex-wrap gap-1">
                                {ROUTINE_CATEGORIES.map(c => (
                                    <button
                                        key={c.key}
                                        onClick={() => setInputCat(c.key)}
                                        className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                                            inputCat === c.key
                                                ? "bg-[#0F766E] text-white"
                                                : "bg-neutral-100 planners-dark:bg-[#2A2A2A] text-neutral-500 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                value={inputNote}
                                onChange={e => setInputNote(e.target.value)}
                                placeholder="메모 (선택)"
                                className="w-full text-xs bg-transparent text-neutral-600 planners-dark:text-neutral-300 placeholder:text-neutral-300 focus:outline-none"
                            />

                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={addRoutine}
                                    disabled={!inputActivity.trim()}
                                    className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-[#0F766E] text-white disabled:opacity-40 hover:bg-[#0d5e56] transition-colors"
                                >
                                    추가
                                </button>
                                <button
                                    onClick={() => setAdding(false)}
                                    className="px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] transition-colors"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Wrapper>
    );
}
