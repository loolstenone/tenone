"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    Plus, X, Check, ChevronDown, Briefcase, Calendar,
    Clock, User, AlignLeft, Pencil, Trash2, MoveRight,
    CheckCircle2, Circle, Ban, LayoutGrid,
} from "lucide-react";
import { DomainBackLink } from "@/features/myverse/app/DomainBackLink";

// ─── 타입 ──────────────────────────────────────────────
type Quadrant = "급중" | "급경" | "완중" | "완경";
type WorkStatus = "active" | "completed" | "archived";
type TaskStatus = "todo" | "done" | "cancelled";

interface Work {
    id: string;
    title: string;
    description?: string | null;
    start_date?: string | null;
    due_date?: string | null;
    color: string;
    quadrant: Quadrant;
    status: WorkStatus;
    myverse_work_tasks?: WorkTask[];
}

interface WorkTask {
    id: string;
    work_id: string;
    title: string;
    due_date?: string | null;
    due_time?: string | null;
    assignee?: string | null;
    method?: string | null;
    quadrant: Quadrant;
    status: TaskStatus;
    memo?: string | null;
}

// ─── 사분면 정의 ──────────────────────────────────────
const QUADRANTS: { key: Quadrant; label: string; sub: string; bg: string; border: string; pill: string }[] = [
    { key: "급중", label: "중급",  sub: "중요·급함",   bg: "bg-rose-50",   border: "border-rose-200",   pill: "bg-rose-100 text-rose-700" },
    { key: "급경", label: "경급",  sub: "경량·급함",   bg: "bg-amber-50",  border: "border-amber-200",  pill: "bg-amber-100 text-amber-700" },
    { key: "완중", label: "중완",  sub: "중요·여유",   bg: "bg-blue-50",   border: "border-blue-200",   pill: "bg-blue-100 text-blue-700" },
    { key: "완경", label: "경완",  sub: "경량·여유",   bg: "bg-neutral-50",border: "border-neutral-200",pill: "bg-neutral-100 text-neutral-500" },
];

const STATUS_CYCLE: Record<WorkStatus, WorkStatus> = {
    active: "completed", completed: "active", archived: "active",
};
const TASK_STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
    todo: "done", done: "cancelled", cancelled: "todo",
};

function fmtDate(d?: string | null) {
    if (!d) return "";
    const dt = new Date(d + "T00:00:00");
    return `${dt.getMonth() + 1}/${dt.getDate()}(${["일","월","화","수","목","금","토"][dt.getDay()]})`;
}
function fmtTime(t?: string | null) { return t ? t.slice(0, 5) : ""; }

// ─── 상태 아이콘 ──────────────────────────────────────
function WorkStatusIcon({ status }: { status: WorkStatus }) {
    if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
    if (status === "archived")  return <Ban className="h-4 w-4 text-neutral-400 shrink-0" />;
    return <Circle className="h-4 w-4 text-neutral-300 shrink-0" />;
}
function TaskStatusIcon({ status }: { status: TaskStatus }) {
    if (status === "done")      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
    if (status === "cancelled") return <Ban className="h-3.5 w-3.5 text-neutral-400 shrink-0" />;
    return <Circle className="h-3.5 w-3.5 text-neutral-300 shrink-0" />;
}

// ─── Work 생성 폼 ─────────────────────────────────────
function WorkForm({ onSave, onCancel }: { onSave: (w: Work) => void; onCancel: () => void }) {
    const [title, setTitle]       = useState("");
    const [startDate, setStart]   = useState("");
    const [dueDate, setDue]       = useState("");
    const [quadrant, setQuadrant] = useState<Quadrant>("완중");
    const [color, setColor]       = useState("#3B82F6");
    const [desc, setDesc]         = useState("");
    const [saving, setSaving]     = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        const r = await fetch("/api/myverse/works", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description: desc, start_date: startDate || null, due_date: dueDate || null, quadrant, color }),
        });
        if (r.ok) { const { work } = await r.json(); onSave(work); }
        setSaving(false);
    }

    return (
        <form onSubmit={submit} className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3 shadow-sm">
            <input
                autoFocus value={title} onChange={e => setTitle(e.target.value)}
                placeholder="업무 제목"
                className="w-full text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none border-b border-neutral-100 pb-2"
            />
            <textarea
                value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="내용 (선택)"
                rows={2}
                className="w-full text-xs text-neutral-600 placeholder:text-neutral-400 focus:outline-none resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider">시작</label>
                    <input type="date" value={startDate} onChange={e => setStart(e.target.value)}
                        className="w-full text-xs text-neutral-700 focus:outline-none mt-0.5" />
                </div>
                <div>
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider">마감</label>
                    <input type="date" value={dueDate} onChange={e => setDue(e.target.value)}
                        className="w-full text-xs text-neutral-700 focus:outline-none mt-0.5" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider shrink-0">분류</label>
                <select value={quadrant} onChange={e => setQuadrant(e.target.value as Quadrant)}
                    className="text-xs text-neutral-700 border border-neutral-200 rounded px-2 py-1 focus:outline-none">
                    {QUADRANTS.map(q => <option key={q.key} value={q.key}>{q.label} — {q.sub}</option>)}
                </select>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border border-neutral-200 ml-auto" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onCancel} className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1.5">취소</button>
                <button type="submit" disabled={saving || !title.trim()}
                    className="text-xs bg-[#3B82F6] text-white rounded-lg px-4 py-1.5 disabled:opacity-40">
                    {saving ? "저장 중…" : "업무 추가"}
                </button>
            </div>
        </form>
    );
}

// ─── Task 생성 폼 ─────────────────────────────────────
function TaskForm({ workId, onSave, onCancel }: { workId: string; onSave: (t: WorkTask) => void; onCancel: () => void }) {
    const [title, setTitle]       = useState("");
    const [dueDate, setDue]       = useState("");
    const [dueTime, setTime]      = useState("");
    const [assignee, setAssignee] = useState("");
    const [method, setMethod]     = useState("");
    const [quadrant, setQuadrant] = useState<Quadrant>("완중");
    const [saving, setSaving]     = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        const r = await fetch(`/api/myverse/works/${workId}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, due_date: dueDate || null, due_time: dueTime || null, assignee: assignee || null, method: method || null, quadrant }),
        });
        if (r.ok) { const { task } = await r.json(); onSave(task); }
        setSaving(false);
    }

    return (
        <form onSubmit={submit} className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2.5 mt-2">
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Task 제목"
                className="w-full text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent border-b border-neutral-200 pb-1.5" />
            <div className="grid grid-cols-2 gap-2">
                <input type="date" value={dueDate} onChange={e => setDue(e.target.value)}
                    className="text-xs text-neutral-600 bg-white border border-neutral-200 rounded px-2 py-1 focus:outline-none" />
                <input type="time" value={dueTime} onChange={e => setTime(e.target.value)}
                    className="text-xs text-neutral-600 bg-white border border-neutral-200 rounded px-2 py-1 focus:outline-none" />
            </div>
            <div className="relative">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
                <input value={assignee} onChange={e => setAssignee(e.target.value)}
                    placeholder="누구와"
                    className="w-full pl-6 text-xs text-neutral-700 bg-white border border-neutral-200 rounded px-2 py-1.5 focus:outline-none" />
            </div>
            <div className="relative">
                <AlignLeft className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
                <input value={method} onChange={e => setMethod(e.target.value)}
                    placeholder="어떻게 (계획)"
                    className="w-full pl-6 text-xs text-neutral-700 bg-white border border-neutral-200 rounded px-2 py-1.5 focus:outline-none" />
            </div>
            <select value={quadrant} onChange={e => setQuadrant(e.target.value as Quadrant)}
                className="w-full text-xs text-neutral-700 bg-white border border-neutral-200 rounded px-2 py-1.5 focus:outline-none">
                {QUADRANTS.map(q => <option key={q.key} value={q.key}>{q.label} — {q.sub}</option>)}
            </select>
            <div className="flex justify-end gap-2 pt-0.5">
                <button type="button" onClick={onCancel} className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1.5">취소</button>
                <button type="submit" disabled={saving || !title.trim()}
                    className="text-xs bg-[#6366F1] text-white rounded-lg px-4 py-1.5 disabled:opacity-40">
                    {saving ? "저장 중…" : "Task 추가"}
                </button>
            </div>
        </form>
    );
}

// ─── 보드 카드 ────────────────────────────────────────
interface CardProps {
    item: BoardItem;
    worksMap: Record<string, Work>;
    onMoveQuadrant: (item: BoardItem, q: Quadrant) => void;
    onToggleStatus: (item: BoardItem) => void;
    onDelete: (item: BoardItem) => void;
}

type BoardItem =
    | { kind: "work"; work: Work }
    | { kind: "task"; task: WorkTask };

function BoardCard({ item, worksMap, onMoveQuadrant, onToggleStatus, onDelete }: CardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
        }
        if (menuOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    if (item.kind === "work") {
        const { work } = item;
        const taskCount = work.myverse_work_tasks?.length ?? 0;
        const doneTasks = work.myverse_work_tasks?.filter(t => t.status === "done").length ?? 0;
        const isDone = work.status === "completed";
        return (
            <div className={`group rounded-xl border p-3 bg-white shadow-sm transition-opacity ${isDone ? "opacity-60" : ""}`}
                style={{ borderLeftWidth: 3, borderLeftColor: work.color }}>
                <div className="flex items-start gap-2">
                    <button onClick={() => onToggleStatus(item)} className="mt-0.5">
                        <WorkStatusIcon status={work.status} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold text-neutral-900 leading-snug ${isDone ? "line-through text-neutral-400" : ""}`}>
                            {work.title}
                        </p>
                        {work.description && (
                            <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">{work.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {work.due_date && (
                                <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                                    <Calendar className="h-3 w-3" />{fmtDate(work.due_date)}
                                </span>
                            )}
                            {taskCount > 0 && (
                                <span className="text-[10px] text-neutral-400">
                                    Task {doneTasks}/{taskCount}
                                </span>
                            )}
                        </div>
                    </div>
                    <div ref={ref} className="relative shrink-0">
                        <button onClick={() => setMenuOpen(v => !v)}
                            className="p-1 rounded text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoveRight className="h-3.5 w-3.5" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden min-w-[120px]">
                                <p className="text-[10px] text-neutral-400 px-3 pt-2 pb-1 uppercase tracking-wider">이동</p>
                                {QUADRANTS.filter(q => q.key !== work.quadrant).map(q => (
                                    <button key={q.key} onClick={() => { onMoveQuadrant(item, q.key); setMenuOpen(false); }}
                                        className="w-full text-left text-xs px-3 py-2 hover:bg-neutral-50 text-neutral-700">
                                        {q.label} <span className="text-neutral-400">— {q.sub}</span>
                                    </button>
                                ))}
                                <div className="border-t border-neutral-100 mt-1">
                                    <button onClick={() => { onDelete(item); setMenuOpen(false); }}
                                        className="w-full text-left text-xs px-3 py-2 hover:bg-red-50 text-red-500">
                                        삭제
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Task 카드
    const { task } = item;
    const parentWork = worksMap[task.work_id];
    const isDone = task.status === "done";
    const isCancelled = task.status === "cancelled";

    return (
        <div className={`group rounded-xl border border-neutral-200 p-3 bg-white shadow-sm transition-opacity ${isCancelled ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-2">
                <button onClick={() => onToggleStatus(item)} className="mt-0.5">
                    <TaskStatusIcon status={task.status} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-neutral-900 leading-snug ${isDone ? "line-through text-neutral-400" : ""} ${isCancelled ? "line-through" : ""}`}>
                        {task.title}
                    </p>
                    {parentWork && (
                        <span className="inline-flex items-center gap-1 text-[10px] rounded px-1.5 py-0.5 mt-1"
                            style={{ backgroundColor: parentWork.color + "20", color: parentWork.color }}>
                            <Briefcase className="h-2.5 w-2.5" />{parentWork.title}
                        </span>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {task.due_date && (
                            <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                                <Calendar className="h-3 w-3" />{fmtDate(task.due_date)}
                                {task.due_time && <><Clock className="h-3 w-3 ml-1" />{fmtTime(task.due_time)}</>}
                            </span>
                        )}
                        {task.assignee && (
                            <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                                <User className="h-3 w-3" />{task.assignee}
                            </span>
                        )}
                    </div>
                    {task.method && (
                        <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">→ {task.method}</p>
                    )}
                </div>
                <div ref={ref} className="relative shrink-0">
                    <button onClick={() => setMenuOpen(v => !v)}
                        className="p-1 rounded text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoveRight className="h-3.5 w-3.5" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden min-w-[120px]">
                            <p className="text-[10px] text-neutral-400 px-3 pt-2 pb-1 uppercase tracking-wider">이동</p>
                            {QUADRANTS.filter(q => q.key !== task.quadrant).map(q => (
                                <button key={q.key} onClick={() => { onMoveQuadrant(item, q.key); setMenuOpen(false); }}
                                    className="w-full text-left text-xs px-3 py-2 hover:bg-neutral-50 text-neutral-700">
                                    {q.label} <span className="text-neutral-400">— {q.sub}</span>
                                </button>
                            ))}
                            <div className="border-t border-neutral-100 mt-1">
                                <button onClick={() => { onDelete(item); setMenuOpen(false); }}
                                    className="w-full text-left text-xs px-3 py-2 hover:bg-red-50 text-red-500">
                                    삭제
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Work 사이드바 아이템 ─────────────────────────────
function WorkItem({
    work, selected, onSelect, onAddTask,
}: { work: Work; selected: boolean; onSelect: () => void; onAddTask: (t: WorkTask) => void }) {
    const [addingTask, setAddingTask] = useState(false);
    const taskCount = work.myverse_work_tasks?.length ?? 0;
    const doneCount = work.myverse_work_tasks?.filter(t => t.status === "done").length ?? 0;

    return (
        <div className={`rounded-xl border transition-all ${selected ? "border-[#6366F1] bg-[#6366F1]/5" : "border-neutral-200 bg-white hover:border-neutral-300"}`}>
            <button onClick={onSelect} className="w-full text-left p-3">
                <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: work.color }} />
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-snug ${work.status === "completed" ? "line-through text-neutral-400" : "text-neutral-900"}`}>
                            {work.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            {work.due_date && (
                                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                                    <Calendar className="h-2.5 w-2.5" />{fmtDate(work.due_date)}
                                </span>
                            )}
                            {taskCount > 0 && (
                                <span className="text-[10px] text-neutral-400">{doneCount}/{taskCount} Task</span>
                            )}
                        </div>
                    </div>
                    {work.status === "completed" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
                </div>
            </button>
            {selected && (
                <div className="px-3 pb-3">
                    {addingTask ? (
                        <TaskForm workId={work.id}
                            onSave={t => { onAddTask(t); setAddingTask(false); }}
                            onCancel={() => setAddingTask(false)} />
                    ) : (
                        <button onClick={() => setAddingTask(true)}
                            className="flex items-center gap-1.5 text-xs text-[#6366F1] hover:text-[#4F46E5] mt-1">
                            <Plus className="h-3.5 w-3.5" /> Task 추가
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── 메인 뷰 ─────────────────────────────────────────
export function WorkView() {
    const [works, setWorks]           = useState<Work[]>([]);
    const [loading, setLoading]       = useState(true);
    const [addingWork, setAddingWork] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showDone, setShowDone]     = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch("/api/myverse/works");
            if (r.ok) { const { works: w } = await r.json(); setWorks(w ?? []); }
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Works Map (id → Work)
    const worksMap: Record<string, Work> = {};
    for (const w of works) worksMap[w.id] = w;

    // 보드 아이템 수집 (Work 단건 + Tasks)
    const boardItems: BoardItem[] = [];
    for (const w of works) {
        const tasks = w.myverse_work_tasks ?? [];
        if (tasks.length === 0) {
            // 단건 Work → 보드에 직접 표시
            boardItems.push({ kind: "work", work: w });
        } else {
            // Tasks → 각각 보드 아이템
            for (const t of tasks) boardItems.push({ kind: "task", task: t });
        }
    }

    // quadrant별 분류 + 시간순 정렬
    function itemDate(item: BoardItem) {
        if (item.kind === "work") return item.work.due_date ?? "9999-12-31";
        return (item.task.due_date ?? "9999-12-31") + (item.task.due_time ? "T" + item.task.due_time : "");
    }

    function itemStatus(item: BoardItem) {
        if (item.kind === "work") return item.work.status === "completed" ? "done" : "active";
        return item.task.status;
    }

    function getColumn(q: Quadrant) {
        return boardItems
            .filter(item => {
                const quad = item.kind === "work" ? item.work.quadrant : item.task.quadrant;
                if (quad !== q) return false;
                if (!showDone && itemStatus(item) !== "active" && itemStatus(item) !== "todo") return false;
                return true;
            })
            .sort((a, b) => itemDate(a).localeCompare(itemDate(b)));
    }

    async function handleMoveQuadrant(item: BoardItem, newQ: Quadrant) {
        if (item.kind === "work") {
            const r = await fetch(`/api/myverse/works/${item.work.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quadrant: newQ }),
            });
            if (r.ok) {
                setWorks(ws => ws.map(w => w.id === item.work.id ? { ...w, quadrant: newQ } : w));
            }
        } else {
            const r = await fetch(`/api/myverse/work-tasks/${item.task.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quadrant: newQ }),
            });
            if (r.ok) {
                setWorks(ws => ws.map(w => ({
                    ...w,
                    myverse_work_tasks: w.myverse_work_tasks?.map(t =>
                        t.id === item.task.id ? { ...t, quadrant: newQ } : t
                    ),
                })));
            }
        }
    }

    async function handleToggleStatus(item: BoardItem) {
        if (item.kind === "work") {
            const next = STATUS_CYCLE[item.work.status];
            const r = await fetch(`/api/myverse/works/${item.work.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: next }),
            });
            if (r.ok) {
                setWorks(ws => ws.map(w => w.id === item.work.id ? { ...w, status: next } : w));
            }
        } else {
            const next = TASK_STATUS_CYCLE[item.task.status];
            const r = await fetch(`/api/myverse/work-tasks/${item.task.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: next }),
            });
            if (r.ok) {
                setWorks(ws => ws.map(w => ({
                    ...w,
                    myverse_work_tasks: w.myverse_work_tasks?.map(t =>
                        t.id === item.task.id ? { ...t, status: next } : t
                    ),
                })));
            }
        }
    }

    async function handleDelete(item: BoardItem) {
        if (item.kind === "work") {
            if (!confirm(`"${item.work.title}" 업무를 삭제할까요? 포함된 Task도 모두 삭제됩니다.`)) return;
            const r = await fetch(`/api/myverse/works/${item.work.id}`, { method: "DELETE" });
            if (r.ok) setWorks(ws => ws.filter(w => w.id !== item.work.id));
        } else {
            if (!confirm(`"${item.task.title}" Task를 삭제할까요?`)) return;
            const r = await fetch(`/api/myverse/work-tasks/${item.task.id}`, { method: "DELETE" });
            if (r.ok) {
                setWorks(ws => ws.map(w => ({
                    ...w,
                    myverse_work_tasks: w.myverse_work_tasks?.filter(t => t.id !== item.task.id),
                })));
            }
        }
    }

    function handleWorkSaved(w: Work) {
        setWorks(ws => [w, ...ws]);
        setAddingWork(false);
        setSelectedId(w.id);
    }

    function handleTaskSaved(task: WorkTask) {
        setWorks(ws => ws.map(w => w.id === task.work_id
            ? { ...w, myverse_work_tasks: [...(w.myverse_work_tasks ?? []), task] }
            : w
        ));
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* 헤더 */}
            <div className="mb-2"><DomainBackLink domain="work" /></div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-[#3B82F6]" />
                    <h1 className="font-serif text-2xl text-neutral-900">일정 업무</h1>
                    <span className="text-xs text-neutral-400 mt-0.5">{works.filter(w => w.status === "active").length}건 진행 중</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowDone(v => !v)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${showDone ? "bg-neutral-100 border-neutral-300 text-neutral-700" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}>
                        {showDone ? "완료 숨기기" : "완료 보기"}
                    </button>
                    <button onClick={() => setAddingWork(true)}
                        className="flex items-center gap-1.5 text-xs bg-[#3B82F6] text-white rounded-lg px-3 py-1.5 hover:bg-blue-600 transition-colors">
                        <Plus className="h-3.5 w-3.5" /> 업무 추가
                    </button>
                </div>
            </div>

            {addingWork && (
                <div className="mb-6">
                    <WorkForm onSave={handleWorkSaved} onCancel={() => setAddingWork(false)} />
                </div>
            )}

            <div className="flex gap-5">
                {/* 좌측 Works 목록 */}
                <aside className="w-56 shrink-0 space-y-2">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider px-1 mb-3">업무 목록</p>
                    {loading ? (
                        <div className="text-xs text-neutral-400 px-1">로딩 중…</div>
                    ) : works.length === 0 ? (
                        <div className="text-xs text-neutral-400 px-1">업무를 추가해 보세요.</div>
                    ) : (
                        works.map(w => (
                            <WorkItem key={w.id} work={w}
                                selected={selectedId === w.id}
                                onSelect={() => setSelectedId(selectedId === w.id ? null : w.id)}
                                onAddTask={handleTaskSaved} />
                        ))
                    )}
                </aside>

                {/* 우측 칸반 보드 */}
                <div className="flex-1 grid grid-cols-4 gap-4 min-w-0">
                    {QUADRANTS.map(col => {
                        const items = getColumn(col.key);
                        return (
                            <div key={col.key} className="flex flex-col min-h-[60vh]">
                                {/* 컬럼 헤더 */}
                                <div className={`rounded-xl border px-3 py-2.5 mb-3 ${col.bg} ${col.border}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-neutral-800">{col.label}</span>
                                        <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${col.pill}`}>
                                            {items.length}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 mt-0.5">{col.sub}</p>
                                </div>

                                {/* 카드 목록 */}
                                <div className="space-y-2.5 flex-1">
                                    {items.map((item, i) => (
                                        <BoardCard
                                            key={item.kind === "work" ? item.work.id : item.task.id}
                                            item={item}
                                            worksMap={worksMap}
                                            onMoveQuadrant={handleMoveQuadrant}
                                            onToggleStatus={handleToggleStatus}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                    {items.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-24 text-neutral-300">
                                            <LayoutGrid className="h-5 w-5 mb-1" />
                                            <p className="text-xs">비어 있음</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
