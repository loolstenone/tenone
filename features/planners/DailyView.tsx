"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, Trash2, Loader2, ArrowDownToLine } from "lucide-react";
import type { PlannerDaily, PlannerTask } from "@/lib/planners/types";
import { ThisWeekCard } from "./ThisWeekCard";
import { ExternalEventsBanner } from "./ExternalEventsBanner";

type TaskStatus = 'todo' | 'done' | 'carried' | 'cancelled';

export function DailyView({ initialDate }: { initialDate: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [date, setDate] = useState(initialDate);
    const [daily, setDaily] = useState<PlannerDaily | null>(null);
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [notes, setNotes] = useState("");
    const [notes2, setNotes2] = useState("");
    const [energy, setEnergy] = useState<number | null>(null);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newTaskText, setNewTaskText] = useState("");
    const [carrying, setCarrying] = useState(false);
    const [yesterdayHasPending, setYesterdayHasPending] = useState(false);

    // URL query sync
    useEffect(() => {
        const q = searchParams.get("date");
        if (q && q !== date) setDate(q);
    }, [searchParams, date]);

    // Check yesterday's pending tasks
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const y = new Date(date + "T00:00:00");
            y.setDate(y.getDate() - 1);
            const yStr = y.toISOString().slice(0, 10);
            const res = await fetch(`/api/planners/daily?date=${yStr}`);
            if (cancelled) return;
            if (res.ok) {
                const d = await res.json();
                const yTasks = (d.daily?.tasks || []) as PlannerTask[];
                setYesterdayHasPending(yTasks.some((t) => t.status === "todo" || t.status === "carried"));
            }
        })();
        return () => { cancelled = true; };
    }, [date]);

    // Load daily
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/daily?date=${date}`);
            if (cancelled) return;
            if (res.ok) {
                const data = await res.json();
                if (data.daily) {
                    setDaily(data.daily);
                    setTasks(data.daily.tasks || []);
                    setNotes(data.daily.notes || "");
                    setNotes2(data.daily.notes_secondary || "");
                    setEnergy(data.daily.energy_level);
                    setResult(data.daily.daily_result || "");
                } else {
                    setDaily(null);
                    setTasks([]);
                    setNotes("");
                    setNotes2("");
                    setEnergy(null);
                    setResult("");
                }
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [date]);

    async function save(patch: Partial<PlannerDaily>) {
        setSaving(true);
        try {
            const res = await fetch(`/api/planners/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, ...patch }),
            });
            if (res.ok) {
                const data = await res.json();
                setDaily(data.daily);
            }
        } finally {
            setSaving(false);
        }
    }

    async function carryOverYesterday() {
        setCarrying(true);
        try {
            const res = await fetch(`/api/planners/daily/carry-over`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date }),
            });
            if (res.ok) {
                const d = await res.json();
                if (d.carried > 0) {
                    // reload tasks
                    const r2 = await fetch(`/api/planners/daily?date=${date}`);
                    if (r2.ok) {
                        const data = await r2.json();
                        if (data.daily) {
                            setTasks(data.daily.tasks || []);
                        }
                    }
                }
                setYesterdayHasPending(false);
            }
        } finally { setCarrying(false); }
    }

    function addTask() {
        if (!newTaskText.trim()) return;
        const newTask: PlannerTask = {
            id: `t_${Date.now()}`,
            text: newTaskText.trim(),
            status: 'todo',
        };
        const next = [...tasks, newTask];
        setTasks(next);
        setNewTaskText("");
        save({ tasks: next });
    }

    function cycleStatus(taskId: string) {
        const order: TaskStatus[] = ['todo', 'done', 'carried'];
        const next = tasks.map(t => {
            if (t.id !== taskId) return t;
            const idx = order.indexOf(t.status as TaskStatus);
            const nextStatus = order[(idx + 1) % order.length];
            return { ...t, status: nextStatus };
        });
        setTasks(next);
        save({ tasks: next });
    }

    function removeTask(taskId: string) {
        const next = tasks.filter(t => t.id !== taskId);
        setTasks(next);
        save({ tasks: next });
    }

    function navigateDate(deltaDays: number) {
        const d = new Date(date);
        d.setDate(d.getDate() + deltaDays);
        const newDate = d.toISOString().slice(0, 10);
        setDate(newDate);
        router.replace(`/planners/app/today?date=${newDate}`);
    }

    const weekday = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { weekday: 'long' });
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const isToday = date === new Date().toISOString().slice(0, 10);

    return (
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigateDate(-1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <h1 className="font-serif text-3xl text-neutral-900">
                            {formattedDate}
                        </h1>
                        <button
                            onClick={() => navigateDate(1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                        {weekday}{isToday && " · 오늘"}
                    </p>
                </div>
                {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            </div>

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Tasks (col 2) */}
                    <div className="md:col-span-2 space-y-4">
                        <ExternalEventsBanner date={date} />
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs uppercase tracking-widest text-neutral-400">Tasks</h2>
                                {yesterdayHasPending && (
                                    <button
                                        onClick={carryOverYesterday}
                                        disabled={carrying}
                                        className="flex items-center gap-1 text-[10px] px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 transition-colors disabled:opacity-50"
                                    >
                                        {carrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowDownToLine className="h-3 w-3" />}
                                        어제 미완료 이월
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1">
                                {tasks.length === 0 && (
                                    <p className="text-sm text-neutral-400 py-2">오늘의 할 일을 추가해 보세요.</p>
                                )}
                                {tasks.map((t) => (
                                    <TaskRow
                                        key={t.id}
                                        task={t}
                                        onCycle={() => cycleStatus(t.id)}
                                        onRemove={() => removeTask(t.id)}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                                <Plus className="h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                                    placeholder="할 일 추가 후 Enter"
                                    className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                                />
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-3 leading-relaxed">
                                체크박스 클릭 순환: <span className="font-mono">□</span> 미완 → <span className="font-mono">V</span> 완료 → <span className="font-mono">→</span> 이월
                            </p>
                        </section>

                        {/* Notes 2개 슬롯 (PDF N 구조) */}
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">Note 1</h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                onBlur={() => save({ notes })}
                                placeholder="회의록·아이디어·자유 메모…"
                                rows={8}
                                className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                            />
                        </section>

                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">Note 2</h2>
                            <textarea
                                value={notes2}
                                onChange={(e) => setNotes2(e.target.value)}
                                onBlur={() => save({ notes_secondary: notes2 })}
                                placeholder="또 다른 주제의 메모…"
                                rows={6}
                                className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                            />
                        </section>
                    </div>

                    {/* Right column — 하루 닫기 */}
                    <div className="space-y-4">
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Energy</h2>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => {
                                            setEnergy(n);
                                            save({ energy_level: n });
                                        }}
                                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                                            energy && n <= energy
                                                ? "bg-[#0F766E] text-white"
                                                : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">오늘의 한 줄 결과</h2>
                            <textarea
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                onBlur={() => save({ daily_result: result })}
                                placeholder="오늘 어떤 성취가 있었나요?"
                                rows={4}
                                className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                            />
                        </section>

                        <ThisWeekCard date={date} />
                    </div>
                </div>
            )}
        </div>
    );
}

function TaskRow({ task, onCycle, onRemove }: { task: PlannerTask; onCycle: () => void; onRemove: () => void }) {
    const symbol = task.status === 'done' ? 'V' : task.status === 'carried' ? '→' : '';
    const strike = task.status === 'done' || task.status === 'cancelled';

    return (
        <div className="group flex items-center gap-3 py-1.5">
            <button
                onClick={onCycle}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                    task.status === 'done'
                        ? "bg-[#0F766E] border-[#0F766E] text-white"
                        : task.status === 'carried'
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "border-neutral-300 text-neutral-400 hover:border-neutral-500"
                }`}
            >
                {symbol}
            </button>
            <span className={`flex-1 text-sm ${strike ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                {task.text}
            </span>
            <button
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-500 transition-opacity"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
