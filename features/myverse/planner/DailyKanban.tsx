"use client";

// 일정 & 업무 — 칸반 뷰 (계획 / 진행 / 완료)
// 컬럼 안에서:
//   1) 시간 있는 미팅(=헤더) + 그 시간대에 매칭되는 메인 태스크들
//   2) 메인 태스크 아래 서브 태스크(parent_id) 들여쓰기 렌더
//   3) 미팅 매칭 없는 메인 태스크 → "기타"
// 드래그&드롭으로 컬럼 이동 → status 변경.

import { useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
import type { PlannerTask } from "@/lib/myverse/types";
import type { CalendarEntry } from "@/lib/myverse/calendar-rules";

type ColKey = "planned" | "doing" | "done";

const COLS: Array<{ key: ColKey; label: string; bar: string; chip: string }> = [
    { key: "planned", label: "계획", bar: "bg-neutral-400",  chip: "bg-neutral-200 text-neutral-700 myverse-dark:bg-white/10 myverse-dark:text-neutral-200" },
    { key: "doing",   label: "진행", bar: "bg-amber-400",     chip: "bg-amber-100 text-amber-800 myverse-dark:bg-amber-500/20 myverse-dark:text-amber-300" },
    { key: "done",    label: "완료", bar: "bg-[#6366F1]",     chip: "bg-[#6366F1]/15 text-[#6366F1] myverse-dark:bg-[#6366F1]/25 myverse-dark:text-[#A5B4FC]" },
];

// 상태 → 컬럼 매핑 (단일 진실):
//   계획 = todo, carried(자동이월), hold(보류), moved(다른 날로 이동)
//   진행 = doing
//   완료 = done, cancelled
function taskColumn(t: PlannerTask): ColKey {
    if (t.status === "done" || t.status === "cancelled") return "done";
    if (t.status === "doing") return "doing";
    return "planned";
}

function toMin(t?: string | null): number | null {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
}

interface MeetingGroup {
    id: string;
    time: string | null;
    title: string;
    location?: string | null;
    startMin: number | null;
    endMin: number | null;
    entry: CalendarEntry;
}

interface Project {
    id: string;
    title: string;
    color: string | null;
}

interface Props {
    tasks: PlannerTask[];
    meetings: CalendarEntry[];
    projects?: Project[];
    onChangeStatus: (taskId: string, next: PlannerTask["status"]) => void;
    onRemoveTask: (taskId: string) => void;
    onOpenMeeting?: (entry: CalendarEntry) => void;
    onAddTask?: () => void;
}

export function DailyKanban({ tasks, meetings, projects = [], onChangeStatus, onRemoveTask, onOpenMeeting, onAddTask }: Props) {
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<ColKey | null>(null);

    const meetingGroups: MeetingGroup[] = meetings
        .filter(m => m.start_time)
        .map(m => ({
            id: m.id,
            time: m.start_time?.slice(0, 5) ?? null,
            title: m.title,
            location: m.location,
            startMin: toMin(m.start_time),
            endMin: toMin(m.end_time ?? m.start_time),
            entry: m,
        }))
        .sort((a, b) => (a.startMin ?? 0) - (b.startMin ?? 0));

    function findMeetingFor(t: PlannerTask): MeetingGroup | null {
        const tm = toMin(t.time);
        if (tm == null) return null;
        // 가장 가까운 미팅(시작 시각이 task 시간 이하 중 최대) 매칭
        let best: MeetingGroup | null = null;
        for (const g of meetingGroups) {
            if (g.startMin == null) continue;
            const end = g.endMin ?? g.startMin + 30;
            if (tm >= g.startMin && tm < end) {
                if (!best || (g.startMin > (best.startMin ?? -1))) best = g;
            }
        }
        return best;
    }

    // 메인 태스크와 서브 태스크 분리
    const parentTasks = tasks.filter(t => !t.parent_id);
    const subtasksByParent = new Map<string, PlannerTask[]>();
    for (const t of tasks) {
        if (t.parent_id) {
            const arr = subtasksByParent.get(t.parent_id) ?? [];
            arr.push(t);
            subtasksByParent.set(t.parent_id, arr);
        }
    }

    function renderCheckbox(t: PlannerTask, size: "sm" | "xs" = "sm") {
        const cycle: Record<string, PlannerTask["status"]> = {
            todo: "doing", doing: "done", done: "todo",
            carried: "doing", hold: "doing", cancelled: "todo", moved: "todo",
        };
        const cls = size === "sm" ? "w-3.5 h-3.5 text-[9px]" : "w-3 h-3 text-[8px]";
        return (
            <button
                type="button"
                onClick={() => onChangeStatus(t.id, cycle[t.status] ?? "todo")}
                className={`shrink-0 ${cls} rounded-sm border mt-0.5 flex items-center justify-center font-bold ${
                    t.status === "done"
                        ? "bg-[#6366F1] border-[#6366F1] text-white"
                        : t.status === "doing"
                        ? "bg-amber-400 border-amber-400 text-white"
                        : "border-neutral-400 myverse-dark:border-white/30 hover:border-[#6366F1]"
                }`}
                title="클릭: 상태 순환 (계획→진행→완료)"
            >
                {t.status === "done" ? "✓" : t.status === "doing" ? "·" : ""}
            </button>
        );
    }

    function renderParentCard(t: PlannerTask) {
        const strike = t.status === "done" || t.status === "cancelled";
        const subs = subtasksByParent.get(t.id) ?? [];
        const isMilestone = t.type === "milestone";
        const project = t.project_id ? projects.find(p => p.id === t.project_id) : null;
        return (
            <div
                key={t.id}
                draggable
                onDragStart={(e) => { setDragId(t.id); e.dataTransfer.effectAllowed = "move"; }}
                onDragEnd={() => { setDragId(null); setDragOverCol(null); }}
                className={`group rounded-md border bg-white myverse-dark:bg-white/[0.04] cursor-grab transition-colors ${
                    isMilestone
                        ? "border-violet-300 myverse-dark:border-violet-500/40"
                        : "border-neutral-200 myverse-dark:border-white/10"
                } hover:border-[#6366F1]/40 ${dragId === t.id ? "opacity-40" : ""}`}
            >
                {project && (
                    <div
                        className="px-2 pt-1 pb-0.5 text-[9px] font-semibold tracking-wide uppercase flex items-center gap-1"
                        style={{ color: project.color ?? "#6366F1" }}
                    >
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: project.color ?? "#6366F1" }} />
                        {project.title}
                    </div>
                )}
                <div className="flex items-start gap-1.5 px-2 py-1.5">
                    {renderCheckbox(t)}
                    <span className={`flex-1 text-xs leading-snug ${strike ? "text-neutral-800 myverse-dark:text-neutral-100 line-through opacity-60" : "text-neutral-800 myverse-dark:text-neutral-100"} ${isMilestone ? "font-semibold" : ""}`}>
                        {t.text}
                    </span>
                    <button
                        type="button"
                        onClick={() => onRemoveTask(t.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-rose-500 transition-opacity"
                        title="삭제"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
                {subs.length > 0 && (
                    <div className="pl-5 pr-2 pb-1.5 space-y-0.5 border-t border-dashed border-neutral-100 myverse-dark:border-white/8 pt-1">
                        {subs.map(s => {
                            const sStrike = s.status === "done" || s.status === "cancelled";
                            return (
                                <div key={s.id} className="flex items-start gap-1.5 py-0.5 group/sub">
                                    {renderCheckbox(s, "xs")}
                                    <span className={`flex-1 text-[11px] leading-snug ${sStrike ? "text-neutral-400 line-through" : "text-neutral-600 myverse-dark:text-neutral-300"}`}>
                                        {s.text}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveTask(s.id)}
                                        className="shrink-0 opacity-0 group-hover/sub:opacity-100 text-neutral-300 hover:text-rose-500 transition-opacity"
                                    >
                                        <Trash2 className="h-2.5 w-2.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    function renderColumn(col: ColKey) {
        const colParents = parentTasks.filter(t => taskColumn(t) === col);
        const groups = new Map<string, { meta: MeetingGroup | null; items: PlannerTask[] }>();
        if (col === "planned") {
            for (const g of meetingGroups) groups.set(g.id, { meta: g, items: [] });
        }
        const others: PlannerTask[] = [];
        for (const t of colParents) {
            const g = findMeetingFor(t);
            if (g) {
                const cur = groups.get(g.id) ?? { meta: g, items: [] };
                cur.items.push(t);
                groups.set(g.id, cur);
            } else {
                others.push(t);
            }
        }

        const colMeta = COLS.find(c => c.key === col)!;
        const totalCount = colParents.length;
        const isDragOver = dragOverCol === col;

        return (
            <div
                key={col}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => {
                    e.preventDefault();
                    if (!dragId) return;
                    const nextStatus: PlannerTask["status"] =
                        col === "done" ? "done" : col === "doing" ? "doing" : "todo";
                    onChangeStatus(dragId, nextStatus);
                    setDragId(null);
                    setDragOverCol(null);
                }}
                className={`flex-1 min-w-0 flex flex-col rounded-lg border transition-colors ${
                    isDragOver
                        ? "border-[#6366F1] bg-[#6366F1]/5"
                        : "border-neutral-200 bg-neutral-50/60 myverse-dark:border-white/10 myverse-dark:bg-white/[0.02]"
                }`}
            >
                <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 myverse-dark:border-white/10 bg-white myverse-dark:bg-white/[0.04] rounded-t-lg">
                    <span className={`w-1.5 h-1.5 rounded-full ${colMeta.bar}`} />
                    <span className="text-xs font-semibold text-neutral-700 myverse-dark:text-neutral-100">{colMeta.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${colMeta.chip}`}>{totalCount}</span>
                </div>

                <div className="flex-1 p-2 space-y-3 min-h-[160px]">
                    {Array.from(groups.values()).map(({ meta, items }) => {
                        if (!meta) return null;
                        return (
                            <div key={meta.id} className="space-y-1.5">
                                <button
                                    type="button"
                                    onClick={() => onOpenMeeting?.(meta.entry)}
                                    className="w-full flex items-center gap-1.5 text-left px-1.5 py-1 rounded hover:bg-white myverse-dark:hover:bg-white/5 transition-colors"
                                    title="미팅 편집"
                                >
                                    <span className="text-[10px] font-mono font-semibold text-[#6366F1] myverse-dark:text-[#A5B4FC]">{meta.time}</span>
                                    {meta.location && (
                                        <span className="flex items-center gap-0.5 text-[10px] text-neutral-500 myverse-dark:text-neutral-400">
                                            <MapPin className="h-2.5 w-2.5" />{meta.location}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-neutral-600 myverse-dark:text-neutral-300 truncate flex-1">{meta.title}</span>
                                </button>
                                {items.length > 0 ? (
                                    <div className="space-y-1 pl-2 border-l-2 border-[#6366F1]/30 myverse-dark:border-[#A5B4FC]/30">
                                        {items.map(renderParentCard)}
                                    </div>
                                ) : col === "planned" ? (
                                    <div className="pl-2 text-[10px] text-neutral-400 myverse-dark:text-neutral-500 italic">
                                        업무 미배정
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}

                    {others.length > 0 && (
                        <div className="space-y-1.5">
                            {(meetingGroups.length > 0) && (
                                <div className="text-[10px] text-neutral-400 myverse-dark:text-neutral-500 px-1 uppercase tracking-widest">
                                    기타
                                </div>
                            )}
                            <div className="space-y-1">{others.map(renderParentCard)}</div>
                        </div>
                    )}

                    {totalCount === 0 && col !== "planned" && (
                        <div className="text-center text-[10px] text-neutral-400 myverse-dark:text-neutral-500 py-6">
                            드래그해서 옮기세요
                        </div>
                    )}
                    {totalCount === 0 && col === "planned" && meetingGroups.length === 0 && (
                        <div className="text-center text-[10px] text-neutral-400 myverse-dark:text-neutral-500 py-6">
                            업무를 추가하세요
                        </div>
                    )}
                </div>

                {col === "planned" && onAddTask && (
                    <button
                        type="button"
                        onClick={onAddTask}
                        className="text-[10px] text-neutral-500 myverse-dark:text-neutral-400 hover:text-[#6366F1] myverse-dark:hover:text-[#A5B4FC] py-1.5 border-t border-dashed border-neutral-200 myverse-dark:border-white/10"
                    >
                        + 빠른 업무 추가
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex gap-3 overflow-x-auto pb-2">
            {COLS.map(c => renderColumn(c.key))}
        </div>
    );
}

export function TaskViewToggle({ value, onChange }: { value: "list" | "kanban"; onChange: () => void }) {
    return (
        <div className="inline-flex items-center rounded-md border border-neutral-200 myverse-dark:border-white/15 overflow-hidden">
            <button
                type="button"
                onClick={() => value !== "list" && onChange()}
                className={`text-[10px] px-2 py-1 transition-colors ${
                    value === "list"
                        ? "bg-neutral-900 text-white myverse-dark:bg-white/15"
                        : "text-neutral-500 myverse-dark:text-neutral-400 hover:bg-neutral-50 myverse-dark:hover:bg-white/5"
                }`}
                title="리스트 보기"
            >
                리스트
            </button>
            <button
                type="button"
                onClick={() => value !== "kanban" && onChange()}
                className={`text-[10px] px-2 py-1 transition-colors ${
                    value === "kanban"
                        ? "bg-neutral-900 text-white myverse-dark:bg-white/15"
                        : "text-neutral-500 myverse-dark:text-neutral-400 hover:bg-neutral-50 myverse-dark:hover:bg-white/5"
                }`}
                title="칸반 보기"
            >
                칸반
            </button>
        </div>
    );
}
