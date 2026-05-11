"use client";

// 일간 할 일 행 컴포넌트 — DailyView에서 분리.
// PriorityBadge, PriorityPicker, TaskRow + 관련 타입·상수

import { useState } from "react";
import { GripVertical, Clock, Trash2, CalendarDays } from "lucide-react";
import type { PlannerTask } from "@/lib/myverse/types";

export type TaskStatus = 'todo' | 'done' | 'carried' | 'cancelled' | 'hold' | 'moved';
export type TaskPriority = '급중' | '급경' | '완중' | '완경';

export const PRIORITY_META: Record<TaskPriority, { label: string; cls: string; dotCls: string }> = {
    '급중': { label: "급중", cls: "text-rose-600   bg-rose-50   border-rose-200",     dotCls: "bg-rose-500"    },
    '급경': { label: "급경", cls: "text-amber-600  bg-amber-50  border-amber-200",    dotCls: "bg-amber-500"   },
    '완중': { label: "완중", cls: "text-sky-600    bg-sky-50    border-sky-200",       dotCls: "bg-sky-500"     },
    '완경': { label: "완경", cls: "text-neutral-500 bg-neutral-100 border-neutral-200", dotCls: "bg-neutral-400" },
};

export const QUADRANT_CYCLE: Record<TaskPriority, TaskPriority | null> = {
    '급중': '급경',
    '급경': '완중',
    '완중': '완경',
    '완경': null,
};

export interface TaskRowProps {
    task: PlannerTask;
    index: number;
    isDragOver: boolean;
    onCycle: () => void;
    onRemove: () => void;
    onTimeChange: (time: string) => void;
    onPriorityChange?: (p: PlannerTask["priority"]) => void;
    onProjectChange?: (projectId: string | null) => void;
    onMove?: () => void;
    projects?: Array<{ id: string; title: string; color: string | null }>;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
}

/** 우선순위 뱃지 — 클릭 시 사분면 순환 */
export function PriorityBadge({ priority, onClick }: { priority: TaskPriority | null; onClick: () => void }) {
    if (!priority) return null;
    const m = PRIORITY_META[priority];
    return (
        <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${m.cls}`}
            title="클릭: 사분면 순환"
        >
            {m.label}
        </button>
    );
}

/** 우선순위 선택기 — 2×2 사분면 미니 피커 */
export function PriorityPicker({ value, onChange }: { value: PlannerTask["priority"]; onChange: (p: PlannerTask["priority"]) => void }) {
    const quads: Array<{ q: TaskPriority; activeCls: string; borderCls: string }> = [
        { q: "급경", activeCls: "bg-amber-400 text-white",   borderCls: "border-b border-r border-neutral-200" },
        { q: "급중", activeCls: "bg-rose-500 text-white",    borderCls: "border-b border-neutral-200" },
        { q: "완경", activeCls: "bg-neutral-400 text-white", borderCls: "border-r border-neutral-200" },
        { q: "완중", activeCls: "bg-sky-500 text-white",     borderCls: "" },
    ];
    return (
        <div className="flex flex-col items-start gap-0.5 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 w-[100px]">
            <div className="grid grid-cols-2 w-full rounded overflow-hidden border border-neutral-200">
                {quads.map(({ q, activeCls, borderCls }) => (
                    <button
                        key={q}
                        type="button"
                        onClick={() => onChange(value === q ? null : q)}
                        className={`py-1.5 text-center text-[10px] font-bold transition-colors ${borderCls} ${
                            value === q ? activeCls : "bg-white hover:bg-neutral-50 text-neutral-500"
                        }`}
                    >
                        {q}
                    </button>
                ))}
            </div>
            {value && (
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="w-full text-[9px] text-neutral-400 hover:text-neutral-600 text-center pt-1"
                >
                    없음
                </button>
            )}
        </div>
    );
}

export function TaskRow({ task, isDragOver, onCycle, onRemove, onTimeChange, onPriorityChange, onProjectChange, onMove, projects = [], onDragStart, onDragOver, onDrop, onDragEnd }: TaskRowProps) {
    const [editingTime, setEditingTime] = useState(false);
    const strike = task.status === 'done' || task.status === 'cancelled' || task.status === 'moved';

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={`group flex flex-wrap items-center gap-x-2 gap-y-0.5 py-1.5 rounded transition-colors ${
                isDragOver ? "bg-neutral-50 border-t-2 border-[#6366F1]" : ""
            }`}
        >
            {/* Drag handle */}
            <button className="cursor-grab text-neutral-300 hover:text-neutral-500 shrink-0 touch-none">
                <GripVertical className="h-3.5 w-3.5" />
            </button>

            {/* Status button */}
            <button
                onClick={onCycle}
                title="클릭: 미완 → 완료 → 보류 → 취소 (반복) · 변경은 우측 캘린더 아이콘"
                className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                    task.status === 'done'
                        ? "bg-[#6366F1] border-[#6366F1] text-white"
                        : task.status === 'carried'
                        ? "bg-amber-500 border-amber-500 text-white"
                        : task.status === 'moved'
                        ? "bg-violet-500 border-violet-500 text-white"
                        : task.status === 'hold'
                        ? "bg-amber-200 border-amber-300 text-amber-800"
                        : task.status === 'cancelled'
                        ? "bg-neutral-300 border-neutral-300 text-white"
                        : "border-neutral-300 text-neutral-300 hover:border-[#6366F1] hover:text-[#6366F1]"
                }`}
            >
                {task.status === 'done' ? '✓' : task.status === 'carried' ? '→' : task.status === 'moved' ? '→' : task.status === 'hold' ? '⏸' : task.status === 'cancelled' ? '✕' : '·'}
            </button>

            {/* Time badge */}
            {editingTime ? (
                <span className="inline-flex items-center gap-0.5 shrink-0">
                    <input
                        type="time"
                        defaultValue={task.time || ""}
                        autoFocus
                        onChange={(e) => onTimeChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') {
                                onTimeChange((e.target as HTMLInputElement).value);
                                setEditingTime(false);
                            }
                        }}
                        className="text-xs w-[68px] border border-[#6366F1] rounded px-1 py-0.5 focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setEditingTime(false)}
                        className="px-1.5 py-0.5 rounded bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5]"
                        title="확인"
                    >
                        확인
                    </button>
                    <button
                        type="button"
                        onClick={() => { onTimeChange(""); setEditingTime(false); }}
                        className="px-1 py-0.5 rounded text-neutral-400 hover:text-rose-500 text-xs"
                        title="시간 지우기"
                    >
                        ×
                    </button>
                </span>
            ) : (
                <button
                    onClick={() => setEditingTime(true)}
                    className={`text-xs shrink-0 px-1.5 py-0.5 rounded transition-colors ${
                        task.time
                            ? "text-[#6366F1] bg-[#6366F1]/10 hover:bg-[#6366F1]/20"
                            : "text-neutral-300 hover:text-neutral-400"
                    }`}
                    title="시간 설정"
                >
                    {task.time ? task.time.slice(0, 5) : <Clock className="h-3 w-3" />}
                </button>
            )}

            {/* 우선순위 뱃지 (있을 때만) */}
            {task.priority && PRIORITY_META[task.priority as TaskPriority] && (
                <PriorityBadge
                    priority={task.priority as TaskPriority}
                    onClick={() => onPriorityChange?.(
                        QUADRANT_CYCLE[task.priority as TaskPriority]
                    )}
                />
            )}
            {/* 우선순위 없을 때 — hover 시 빠른 설정 버튼 */}
            {!task.priority && onPriorityChange && (
                <button
                    type="button"
                    onClick={() => onPriorityChange("급중")}
                    className="shrink-0 text-xs text-neutral-300 hover:text-neutral-500 border border-dashed border-neutral-200 rounded px-1 transition-all"
                    title="우선순위 설정"
                >
                    급중
                </button>
            )}

            {/* 모바일 스페이서 — project+delete를 우측으로 밀기 */}
            <span className="flex-1 sm:hidden" />

            {/* Project tag (선택 가능) */}
            {projects.length > 0 && onProjectChange && (() => {
                const project = task.project_id ? projects.find(p => p.id === task.project_id) : null;
                return (
                    <select
                        value={task.project_id ?? ""}
                        onChange={(e) => onProjectChange(e.target.value || null)}
                        title={project ? `프로젝트: ${project.title}` : "프로젝트 태그"}
                        className={`shrink-0 text-xs max-w-[100px] focus:outline-none rounded px-1.5 py-0.5 border transition-colors ${
                            project
                                ? "bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30"
                                : "text-neutral-300 border-transparent opacity-40"
                        }`}
                        style={project?.color ? { color: project.color, borderColor: `${project.color}55`, backgroundColor: `${project.color}11` } : undefined}
                    >
                        <option value="">— 프로젝트 —</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                );
            })()}

            {/* Move (다른 날짜로 이동) */}
            {onMove && (
                <button
                    onClick={onMove}
                    title="다른 날짜로 변경"
                    className="text-neutral-300 hover:text-violet-500 transition-opacity shrink-0 opacity-0 group-hover:opacity-100"
                >
                    <CalendarDays className="h-3.5 w-3.5" />
                </button>
            )}

            {/* Remove */}
            <button
                onClick={onRemove}
                className="text-neutral-300 hover:text-red-500 transition-opacity shrink-0"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>

            {/* Task text — 모바일 2번째 줄, 데스크톱 인라인 */}
            <span className={`basis-full sm:basis-auto sm:flex-1 sm:min-w-0 order-last sm:order-none pl-6 sm:pl-0 text-xs leading-snug ${strike ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                {task.text}
                {task.status === 'moved' && task.moved_to && (
                    <span className="ml-2 text-[10px] text-violet-500 not-italic no-underline">→ {task.moved_to.slice(5)} 변경</span>
                )}
                {task.moved_from && task.status !== 'moved' && (
                    <span className="ml-2 text-[10px] text-violet-400 no-underline">({task.moved_from.slice(5)} 변경)</span>
                )}
            </span>
        </div>
    );
}
