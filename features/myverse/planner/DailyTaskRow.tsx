"use client";

// 일간 할 일 행 컴포넌트 — DailyView에서 분리.
// TaskRow + 관련 타입·상수 (경중완급 우선순위는 폐기)

import { useState } from "react";
import { GripVertical, Clock, Trash2, CalendarDays, Flag, DollarSign, Users, Settings } from "lucide-react";
import type { PlannerTask, TaskType } from "@/lib/myverse/types";

export type TaskStatus = 'todo' | 'doing' | 'done' | 'carried' | 'cancelled' | 'hold' | 'moved';

export const TASK_TYPE_META: Record<Exclude<TaskType, 'normal'>, { label: string; icon: React.ReactNode; cls: string }> = {
    milestone: { label: "마일스톤", icon: <Flag className="h-2.5 w-2.5" />, cls: "text-violet-600 bg-violet-50 border-violet-200" },
    finance:   { label: "비용",     icon: <DollarSign className="h-2.5 w-2.5" />, cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    people:    { label: "인력",     icon: <Users className="h-2.5 w-2.5" />, cls: "text-sky-600 bg-sky-50 border-sky-200" },
    admin:     { label: "관리",     icon: <Settings className="h-2.5 w-2.5" />, cls: "text-neutral-500 bg-neutral-100 border-neutral-200" },
};

export interface TaskRowProps {
    task: PlannerTask;
    index: number;
    isDragOver: boolean;
    onCycle: () => void;
    onRemove: () => void;
    onTimeChange: (time: string) => void;
    onProjectChange?: (projectId: string | null) => void;
    onMove?: () => void;
    projects?: Array<{ id: string; title: string; color: string | null }>;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
}

export function TaskRow({ task, isDragOver, onCycle, onRemove, onTimeChange, onProjectChange, onMove, projects = [], onDragStart, onDragOver, onDrop, onDragEnd }: TaskRowProps) {
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

            {/* Task type badge */}
            {task.type && task.type !== 'normal' && TASK_TYPE_META[task.type as Exclude<TaskType, 'normal'>] && (() => {
                const m = TASK_TYPE_META[task.type as Exclude<TaskType, 'normal'>];
                return (
                    <span className={`shrink-0 inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded border ${m.cls}`}>
                        {m.icon}{m.label}
                    </span>
                );
            })()}

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
