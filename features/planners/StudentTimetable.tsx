"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, GraduationCap, X } from "lucide-react";
import { ConfirmSheet } from "./ConfirmSheet";

// ── 상수 ──────────────────────────────────────────────────────────────
const DAYS = ["월", "화", "수", "목", "금"] as const;
const PERIODS = [
    { label: "1교시", time: "09:00–10:00" },
    { label: "2교시", time: "10:00–11:00" },
    { label: "3교시", time: "11:00–12:00" },
    { label: "4교시", time: "13:00–14:00" },
    { label: "5교시", time: "14:00–15:00" },
    { label: "6교시", time: "15:00–16:00" },
    { label: "7교시", time: "16:00–17:00" },
    { label: "8교시", time: "17:00–18:00" },
] as const;

const LS_KEY = "myverse_student_timetable";

type CellKey = string; // e.g. "월-1"
type TimetableData = Record<CellKey, { name: string; room: string; color: string }>;

const COLORS = [
    { bg: "bg-teal-100",   text: "text-teal-800",   border: "border-teal-300",   val: "teal"   },
    { bg: "bg-violet-100", text: "text-violet-800",  border: "border-violet-300", val: "violet" },
    { bg: "bg-amber-100",  text: "text-amber-800",   border: "border-amber-300",  val: "amber"  },
    { bg: "bg-rose-100",   text: "text-rose-800",    border: "border-rose-300",   val: "rose"   },
    { bg: "bg-sky-100",    text: "text-sky-800",     border: "border-sky-300",    val: "sky"    },
    { bg: "bg-emerald-100",text: "text-emerald-800", border: "border-emerald-300",val: "emerald"},
] as const;

function colorMeta(val: string) {
    return COLORS.find(c => c.val === val) ?? COLORS[0];
}

function loadData(): TimetableData {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
    catch { return {}; }
}
function saveData(d: TimetableData) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch { /* noop */ }
}

// ── 셀 편집 팝오버 ────────────────────────────────────────────────────
function CellEditor({
    cellKey,
    initial,
    onSave,
    onClose,
    onClear,
}: {
    cellKey: string;
    initial: TimetableData[string] | undefined;
    onSave: (v: { name: string; room: string; color: string }) => void;
    onClose: () => void;
    onClear: () => void;
}) {
    const [name, setName]   = useState(initial?.name  ?? "");
    const [room, setRoom]   = useState(initial?.room  ?? "");
    const [color, setColor] = useState(initial?.color ?? "teal");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl w-72 p-4 space-y-3"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">{cellKey} 수업 편집</span>
                    <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100 text-neutral-400">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                <input
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="과목명 (예: 데이터구조론)"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-400"
                />
                <input
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="강의실 (예: 공학관 302)"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-400"
                />

                {/* 색상 선택 */}
                <div className="flex gap-1.5 flex-wrap">
                    {COLORS.map(c => (
                        <button
                            key={c.val}
                            onClick={() => setColor(c.val)}
                            className={`w-5 h-5 rounded-full ${c.bg} ${c.border} border-2 transition-transform ${color === c.val ? "scale-125" : "scale-100"}`}
                        />
                    ))}
                </div>

                <div className="flex gap-2 pt-1">
                    {initial && (
                        <button
                            onClick={onClear}
                            className="flex-1 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-400 hover:bg-neutral-50 hover:text-rose-500 transition-colors"
                        >
                            삭제
                        </button>
                    )}
                    <button
                        onClick={() => { if (name.trim()) onSave({ name: name.trim(), room: room.trim(), color }); }}
                        className="flex-1 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition-colors disabled:opacity-40"
                        disabled={!name.trim()}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────
export function StudentTimetable() {
    const [data, setData]         = useState<TimetableData>(loadData);
    const [editing, setEditing]   = useState<string | null>(null); // cellKey
    const [collapsed, setCollapsed] = useState(false);
    const [confirmClearKey, setConfirmClearKey] = useState<string | null>(null);

    const handleSave = useCallback((cellKey: string, val: { name: string; room: string; color: string }) => {
        setData(prev => {
            const next = { ...prev, [cellKey]: val };
            saveData(next);
            return next;
        });
        setEditing(null);
    }, []);

    const handleClear = useCallback((cellKey: string) => {
        setData(prev => {
            const next = { ...prev };
            delete next[cellKey];
            saveData(next);
            return next;
        });
        setEditing(null);
    }, []);

    return (
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {/* 헤더 */}
            <button
                onClick={() => setCollapsed(v => !v)}
                className="w-full flex items-center gap-2 px-5 py-3 hover:bg-neutral-50 transition-colors"
            >
                <GraduationCap className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 flex-1 text-left">
                    학기 시간표
                </span>
                {collapsed
                    ? <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                    : <ChevronUp   className="h-3.5 w-3.5 text-neutral-400" />
                }
            </button>

            {!collapsed && (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] border-t border-neutral-100">
                        <thead>
                            <tr className="bg-neutral-50">
                                <th className="w-20 px-3 py-1.5 text-[10px] text-neutral-400 font-medium text-left border-r border-neutral-100">
                                    교시
                                </th>
                                {DAYS.map(d => (
                                    <th key={d} className="px-2 py-1.5 text-[11px] font-semibold text-neutral-600 text-center border-r border-neutral-100 last:border-r-0">
                                        {d}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {PERIODS.map((p, pi) => (
                                <tr key={pi} className="divide-x divide-neutral-50">
                                    <td className="px-3 py-1.5 border-r border-neutral-100 shrink-0">
                                        <p className="text-[10px] font-medium text-neutral-500">{p.label}</p>
                                        <p className="text-[9px] text-neutral-300 font-mono">{p.time}</p>
                                    </td>
                                    {DAYS.map(day => {
                                        const cellKey = `${day}-${pi + 1}`;
                                        const cell = data[cellKey];
                                        const cm = cell ? colorMeta(cell.color) : null;
                                        return (
                                            <td
                                                key={day}
                                                className="p-1 min-w-[90px] align-top cursor-pointer hover:bg-neutral-50 transition-colors"
                                                onClick={() => setEditing(cellKey)}
                                            >
                                                {cell ? (
                                                    <div className={`rounded-md px-2 py-1.5 ${cm!.bg} ${cm!.border} border`}>
                                                        <p className={`text-[11px] font-semibold leading-tight ${cm!.text} truncate`}>
                                                            {cell.name}
                                                        </p>
                                                        {cell.room && (
                                                            <p className={`text-[9px] ${cm!.text} opacity-70 truncate mt-0.5`}>
                                                                {cell.room}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-md h-9 flex items-center justify-center border border-dashed border-neutral-100 hover:border-teal-300 transition-colors">
                                                        <span className="text-[9px] text-neutral-200">+</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="text-[9px] text-neutral-300 px-5 py-2">
                        셀을 클릭해 수업을 추가하세요. 시간표는 기기에 저장됩니다.
                    </p>
                </div>
            )}

            {/* 팝오버 */}
            {editing && (
                <CellEditor
                    cellKey={editing}
                    initial={data[editing]}
                    onSave={v => handleSave(editing, v)}
                    onClose={() => setEditing(null)}
                    onClear={() => setConfirmClearKey(editing)}
                />
            )}

            <ConfirmSheet
                open={confirmClearKey !== null}
                message="이 수업을 삭제하시겠어요?"
                onConfirm={() => { if (confirmClearKey) handleClear(confirmClearKey); setConfirmClearKey(null); }}
                onCancel={() => setConfirmClearKey(null)}
            />
        </section>
    );
}
