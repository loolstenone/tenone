"use client";

// 프로젝트별 업무 합산 뷰 — Daily에서 project_id로 태깅된 모든 업무를 한 곳에 모음
// 데이터 소스: myverse_daily.tasks (단일 SSOT)
// "업무" = task — 유니버스 전반에서 통일된 표기

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowUpRight, CheckCircle2, Circle, RotateCw, X as XIcon, Plus, List, LayoutGrid, BarChart3, Link2, Unlink, AlertTriangle, Wand2, Image as ImageIcon, FileImage } from "lucide-react";
import { toPng, toSvg } from "html-to-image";
import { localDateStr } from "@/lib/myverse/types";

interface TaskItem {
    date: string;
    task: {
        id: string;
        text: string;
        status: string;
        time?: string | null;
        project_id?: string | null;
        source?: string;
        duration_days?: number | null;
        depends_on?: string[] | null;
    };
}

interface Stats {
    total: number;
    todo: number;
    done: number;
    carried: number;
    cancelled: number;
}

const STATUS_META: Record<string, { icon: typeof Circle; label: string; cls: string }> = {
    todo: { icon: Circle, label: "미완", cls: "text-neutral-400" },
    done: { icon: CheckCircle2, label: "완료", cls: "text-[#6366F1]" },
    carried: { icon: RotateCw, label: "이월", cls: "text-amber-500" },
    cancelled: { icon: XIcon, label: "취소", cls: "text-neutral-300 line-through" },
};

export function ProjectTasksTab({ projectId, projectColor }: { projectId: string; projectColor: string }) {
    const [items, setItems] = useState<TaskItem[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "todo" | "done" | "carried">("all");
    const [viewMode, setViewMode] = useState<"list" | "kanban" | "gantt">("list");
    const [milestones, setMilestones] = useState<Array<{ id: string; title: string; due_date: string | null; done_at: string | null }>>([]);

    // 새 업무 입력
    const today = useMemo(() => localDateStr(new Date()), []);
    const [newDate, setNewDate] = useState(today);
    const [newText, setNewText] = useState("");
    const [adding, setAdding] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const [tRes, mRes] = await Promise.all([
                fetch(`/api/myverse/projects/${projectId}/tasks`),
                fetch(`/api/myverse/projects/${projectId}/milestones`),
            ]);
            if (tRes.ok) {
                const d = await tRes.json();
                // 마일스톤 sync 마커(ms_ 접두사)는 마일스톤 탭/간트에서 별도 표시되므로 업무에서 제외
                const filtered = (d.items ?? []).filter((it: TaskItem) => !it.task.id?.startsWith("ms_"));
                setItems(filtered);
                // stats도 마일스톤 마커 제외해서 재계산
                const recompute = (s: string) => filtered.filter((i: TaskItem) => i.task.status === s).length;
                setStats({
                    total: filtered.length,
                    todo: recompute("todo"),
                    done: recompute("done"),
                    carried: recompute("carried"),
                    cancelled: recompute("cancelled"),
                });
            }
            if (mRes.ok) {
                const d = await mRes.json();
                setMilestones(d.milestones ?? []);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [projectId]);

    async function changeTaskStatus(taskId: string, nextStatus: string) {
        const item = items.find(i => i.task.id === taskId);
        if (!item) return;
        // 낙관적 업데이트
        setItems(prev => prev.map(i => i.task.id === taskId ? { ...i, task: { ...i.task, status: nextStatus } } : i));
        try {
            const res = await fetch(`/api/myverse/daily/${item.date}/task/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            if (!res.ok) await load();
            else await load(); // stats 재계산용
        } catch {
            await load();
        }
    }

    async function addTask() {
        const text = newText.trim();
        if (!text || !newDate) return;
        setAdding(true);
        try {
            const res = await fetch(`/api/myverse/projects/${projectId}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: newDate, text }),
            });
            if (res.ok) {
                setNewText("");
                await load();
            }
        } finally {
            setAdding(false);
        }
    }

    const filtered = items.filter(i => filter === "all" ? true : i.task.status === filter);
    const completionRate = stats && stats.total > 0
        ? Math.round((stats.done / stats.total) * 100)
        : 0;

    if (loading) {
        return (
            <div className="py-16 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
            </div>
        );
    }

    const isEmpty = !stats || stats.total === 0;

    return (
        <div className="space-y-3">
            {/* 새 업무 추가 — 항상 노출 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-3 flex items-center gap-2">
                <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="text-xs px-2 py-1.5 border border-neutral-200 rounded font-mono focus:outline-none focus:border-[#6366F1]"
                />
                <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
                    placeholder="이 프로젝트의 새 업무 추가…"
                    className="flex-1 text-sm bg-transparent focus:outline-none px-1"
                />
                <button
                    onClick={addTask}
                    disabled={adding || !newText.trim() || !newDate}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#6366F1] text-white text-xs rounded hover:bg-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                    {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    추가
                </button>
            </section>

            {isEmpty ? (
                <div className="bg-white border border-dashed border-neutral-300 rounded-xl py-8 px-5 text-center">
                    <p className="text-sm text-neutral-500 mb-1">아직 연결된 업무가 없어요.</p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                        위에서 직접 추가하거나, <Link href="/myverse/app/daily" className="text-[#6366F1] hover:underline">일간</Link>·<Link href="/myverse/app/weekly" className="text-[#6366F1] hover:underline">주간</Link>에서 업무 추가 시 이 프로젝트를 태그하세요.
                    </p>
                </div>
            ) : (
                <>
                    {/* 통계 */}
                    {stats && (
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xs tracking-widest text-neutral-500">집계</h2>
                                <span className="text-2xl font-serif text-neutral-900">{completionRate}<span className="text-sm text-neutral-400">%</span></span>
                            </div>
                            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${completionRate}%`, backgroundColor: projectColor }}
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <Cell label="전체" value={stats.total} />
                                <Cell label="미완" value={stats.todo} accent="text-neutral-700" />
                                <Cell label="완료" value={stats.done} accent="text-[#6366F1]" />
                                <Cell label="이월" value={stats.carried} accent="text-amber-600" />
                            </div>
                        </section>
                    )}

                    {/* 뷰 토글 — 리스트 / 칸반 / 간트 */}
                    <div className="flex items-center gap-1.5 bg-neutral-100 rounded-lg p-0.5 self-start inline-flex w-fit">
                        {([
                            { k: "list" as const,   label: "리스트", Icon: List },
                            { k: "kanban" as const, label: "칸반",   Icon: LayoutGrid },
                            { k: "gantt" as const,  label: "간트",   Icon: BarChart3 },
                        ]).map(({ k, label, Icon }) => (
                            <button
                                key={k}
                                onClick={() => setViewMode(k)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                    viewMode === k
                                        ? "bg-white text-neutral-900 shadow-sm"
                                        : "text-neutral-500 hover:text-neutral-900"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* 상태 탭 — IdentitySubNav 일관 패턴 (리스트 뷰에서만) */}
                    {viewMode === "list" && (
                    <nav className="flex items-center gap-1 border-b border-neutral-200">
                        {([
                            { k: "all" as const,     label: "전체" },
                            { k: "todo" as const,    label: "미완" },
                            { k: "done" as const,    label: "완료" },
                            { k: "carried" as const, label: "이월" },
                        ]).map(({ k, label }) => {
                            const isActive = filter === k;
                            return (
                                <button
                                    key={k}
                                    onClick={() => setFilter(k)}
                                    className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
                                        isActive
                                            ? "text-[#6366F1] font-semibold"
                                            : "text-neutral-500 hover:text-neutral-900"
                                    }`}
                                >
                                    {label}
                                    {isActive && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#6366F1]" />}
                                </button>
                            );
                        })}
                    </nav>
                    )}

                    {/* 리스트 뷰 */}
                    {viewMode === "list" && (
                    filtered.length === 0 ? (
                        <div className="py-8 text-center bg-white border border-neutral-200 rounded-xl">
                            <p className="text-sm text-neutral-400">해당 상태의 업무가 없습니다.</p>
                        </div>
                    ) : (
                <section className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
                    {(() => {
                        const grouped: Record<string, TaskItem[]> = {};
                        for (const it of filtered) {
                            (grouped[it.date] ??= []).push(it);
                        }
                        return Object.entries(grouped).map(([date, list]) => (
                            <div key={date} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-neutral-500 font-mono">{date}</h3>
                                    <Link
                                        href={`/myverse/app/daily?date=${date}`}
                                        className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400 hover:text-[#6366F1] transition-colors"
                                    >
                                        일간 <ArrowUpRight className="h-2.5 w-2.5" />
                                    </Link>
                                </div>
                                <ul className="space-y-1">
                                    {list.map((i) => {
                                        const meta = STATUS_META[i.task.status] ?? STATUS_META.todo;
                                        const Icon = meta.icon;
                                        const strike = i.task.status === "done" || i.task.status === "cancelled";
                                        const isMilestone = i.task.source === "milestone";
                                        return (
                                            <li key={i.task.id} className="flex items-center gap-2 py-0.5">
                                                <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.cls}`} />
                                                {i.task.time && (
                                                    <span className="text-[10px] text-[#6366F1] font-mono shrink-0">{i.task.time.slice(0, 5)}</span>
                                                )}
                                                <span className={`text-sm ${strike ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                                                    {i.task.text}
                                                </span>
                                                {isMilestone && (
                                                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1] shrink-0">마일스톤</span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ));
                    })()}
                </section>
                    )
                    )}

                    {/* 칸반 뷰 */}
                    {viewMode === "kanban" && <ProjectKanbanView items={items} onChangeStatus={changeTaskStatus} />}

                    {/* 간트 뷰 */}
                    {viewMode === "gantt" && <ProjectGanttView items={items} milestones={milestones} projectColor={projectColor} projectId={projectId} onReload={load} />}
                </>
            )}
        </div>
    );
}

function Cell({ label, value, accent = "text-neutral-900" }: { label: string; value: number; accent?: string }) {
    return (
        <div className="bg-neutral-50 rounded-lg py-2">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
            <p className={`text-lg font-semibold ${accent}`}>{value}</p>
        </div>
    );
}

/** 칸반 뷰 — 계획 / 진행 / 완료 (status 기반) + 드래그&드롭으로 status 변경 */
function ProjectKanbanView({ items, onChangeStatus }: { items: TaskItem[]; onChangeStatus: (taskId: string, nextStatus: string) => void }) {
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<"planned" | "doing" | "done" | null>(null);

    function col(s: string): "planned" | "doing" | "done" {
        if (s === "done" || s === "cancelled") return "done";
        if (s === "doing") return "doing";
        return "planned";
    }
    function colToStatus(c: "planned" | "doing" | "done"): string {
        if (c === "done") return "done";
        if (c === "doing") return "doing";
        return "todo";
    }
    const cols = [
        { k: "planned" as const, label: "계획", dot: "bg-neutral-400" },
        { k: "doing"   as const, label: "진행", dot: "bg-amber-400" },
        { k: "done"    as const, label: "완료", dot: "bg-[#6366F1]" },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cols.map(c => {
                const colItems = items.filter(i => col(i.task.status) === c.k);
                const isDragOver = dragOverCol === c.k;
                return (
                    <div
                        key={c.k}
                        onDragOver={(e) => { e.preventDefault(); setDragOverCol(c.k); }}
                        onDragLeave={() => setDragOverCol(null)}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (!dragId) return;
                            const current = items.find(i => i.task.id === dragId);
                            if (current && col(current.task.status) !== c.k) {
                                onChangeStatus(dragId, colToStatus(c.k));
                            }
                            setDragId(null);
                            setDragOverCol(null);
                        }}
                        className={`rounded-lg border bg-neutral-50/60 min-h-[200px] transition-colors ${
                            isDragOver ? "border-[#6366F1] bg-[#6366F1]/5" : "border-neutral-200"
                        }`}
                    >
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 bg-white rounded-t-lg">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                            <span className="text-xs font-semibold text-neutral-700">{c.label}</span>
                            <span className="text-[10px] text-neutral-500">{colItems.length}</span>
                        </div>
                        <div className="p-2 space-y-1.5">
                            {colItems.length === 0 ? (
                                <div className="text-center text-[10px] text-neutral-300 py-6">{c.k === "planned" ? "비어 있음" : "드래그해서 옮기세요"}</div>
                            ) : colItems.map(({ task, date }) => {
                                const strike = task.status === "done" || task.status === "cancelled";
                                const isMilestone = task.source === "milestone";
                                return (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => { setDragId(task.id); e.dataTransfer.effectAllowed = "move"; }}
                                        onDragEnd={() => { setDragId(null); setDragOverCol(null); }}
                                        className={`rounded-md border border-neutral-200 bg-white px-2 py-1.5 cursor-grab active:cursor-grabbing transition-opacity ${
                                            dragId === task.id ? "opacity-40" : ""
                                        }`}
                                    >
                                        <div className={`text-xs leading-snug ${strike ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                                            {task.text}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] text-neutral-400 font-mono">
                                                {date}{task.time ? ` · ${task.time.slice(0,5)}` : ""}
                                            </span>
                                            {isMilestone && (
                                                <span className="text-[9px] uppercase tracking-wider px-1 py-0 rounded bg-[#6366F1]/10 text-[#6366F1]">M</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/** 간트 뷰 — 날짜 기반 가로 타임라인 + 드래그(이동/늘리기/시작일) + 마일스톤 ◆ 드래그 + 의존성 화살표 + 자율 헤더 */
function ProjectGanttView({
    items: initialItems,
    milestones,
    projectColor,
    projectId,
    onReload,
}: {
    items: TaskItem[];
    milestones: Array<{ id: string; title: string; due_date: string | null; done_at: string | null }>;
    projectColor: string;
    projectId: string;
    onReload?: () => void;
}) {
    const [items, setItems] = useState(initialItems);
    useEffect(() => { setItems(initialItems); }, [initialItems]);

    const [msState, setMsState] = useState(milestones);
    useEffect(() => { setMsState(milestones); }, [milestones]);

    const [editingTask, setEditingTask] = useState<{ id: string; date: string } | null>(null);
    const [zoomMode, setZoomMode] = useState<"auto" | "day" | "week" | "month">("auto");
    const [exporting, setExporting] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    async function exportChart(format: "png" | "svg") {
        if (!chartRef.current || exporting) return;
        setExporting(true);
        try {
            const opts = {
                backgroundColor: "#FFFFFF",
                pixelRatio: format === "png" ? 2 : 1,
                cacheBust: false,
            };
            const dataUrl = format === "png"
                ? await toPng(chartRef.current, opts)
                : await toSvg(chartRef.current, opts);
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `gantt-${new Date().toISOString().slice(0, 10)}.${format}`;
            a.click();
        } catch (e) {
            console.warn("gantt export failed", e);
        } finally {
            setExporting(false);
        }
    }

    const dated = msState.filter(m => m.due_date) as Array<{ id: string; title: string; due_date: string; done_at: string | null }>;

    if (items.length === 0 && dated.length === 0) {
        return <div className="py-12 text-center text-sm text-neutral-400 bg-white border border-neutral-200 rounded-xl">표시할 업무·마일스톤이 없습니다.</div>;
    }
    const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));

    // 범위: 모든 task/milestone 시작/종료 포함
    const candidates: string[] = [
        ...sorted.map(i => i.date),
        ...sorted.map(i => addDays(i.date, Math.max(1, i.task.duration_days ?? 1) - 1)),
        ...dated.map(m => m.due_date),
    ];
    const minDate = candidates.reduce((a, b) => (a < b ? a : b));
    const maxEndRaw = candidates.reduce((a, b) => (a > b ? a : b));
    const today = new Date().toISOString().slice(0, 10);
    const maxDate = addDays(maxEndRaw > today ? maxEndRaw : today, 3);
    const totalDays = Math.max(7, dayDiff(minDate, maxDate) + 1);

    // 자율 헤더 — 줌 단계 (자동 또는 수동)
    let zoom: "day" | "3day" | "week" | "month";
    let colWidth: number;
    if (zoomMode === "day") { zoom = "day"; colWidth = 28; }
    else if (zoomMode === "week") { zoom = "week"; colWidth = 12; }
    else if (zoomMode === "month") { zoom = "month"; colWidth = 10; }
    else {
        if (totalDays <= 30) { zoom = "day"; colWidth = 28; }
        else if (totalDays <= 90) { zoom = "3day"; colWidth = 14; }
        else if (totalDays <= 365) { zoom = "week"; colWidth = 12; }
        else { zoom = "month"; colWidth = 10; }
    }
    const chartWidth = totalDays * colWidth;
    const todayOffset = dayDiff(minDate, today);

    const ticks: Array<{ label: string; offset: number; major?: boolean }> = [];
    if (zoom === "day") {
        for (let d = 0; d < totalDays; d++) {
            const dt = addDate(minDate, d);
            ticks.push({ label: `${dt.getMonth() + 1}/${dt.getDate()}`, offset: d, major: dt.getDate() === 1 });
        }
    } else if (zoom === "3day") {
        for (let d = 0; d < totalDays; d += 3) {
            const dt = addDate(minDate, d);
            ticks.push({ label: `${dt.getMonth() + 1}/${dt.getDate()}`, offset: d, major: dt.getDate() <= 3 });
        }
    } else if (zoom === "week") {
        for (let d = 0; d < totalDays; d += 7) {
            const dt = addDate(minDate, d);
            ticks.push({ label: `${dt.getMonth() + 1}/${dt.getDate()}`, offset: d, major: dt.getDate() <= 7 });
        }
    } else {
        for (let d = 0; d < totalDays; d += 30) {
            const dt = addDate(minDate, d);
            ticks.push({ label: `${dt.getFullYear()}.${dt.getMonth() + 1}`, offset: d, major: true });
        }
    }

    function barColor(s: string): string {
        if (s === "done") return projectColor || "#6366F1";
        if (s === "doing") return "#F59E0B";
        if (s === "cancelled") return "#9CA3AF";
        return "#A5B4FC";
    }

    async function patch(taskId: string, taskDate: string, body: Record<string, unknown>) {
        await fetch(`/api/myverse/daily/${taskDate}/task/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).catch(() => {});
        onReload?.();
    }

    async function patchMilestone(id: string, body: Record<string, unknown>) {
        await fetch(`/api/myverse/projects/${projectId}/milestones`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...body }),
        }).catch(() => {});
        onReload?.();
    }

    function startDrag(e: React.MouseEvent, taskId: string, taskDate: string, mode: "move" | "resize-right" | "resize-left") {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const item = items.find(i => i.task.id === taskId);
        if (!item) return;
        const startOffset = Math.max(0, dayDiff(minDate, taskDate));
        const startDuration = Math.max(1, item.task.duration_days ?? 1);

        function onMove(ev: MouseEvent) {
            const dx = ev.clientX - startX;
            const deltaDays = Math.round(dx / colWidth);
            if (mode === "resize-right") {
                const nextDur = Math.max(1, startDuration + deltaDays);
                setItems(prev => prev.map(i => i.task.id === taskId ? { ...i, task: { ...i.task, duration_days: nextDur } } : i));
            } else if (mode === "resize-left") {
                // 좌측 핸들 — 시작일 이동 + duration 반대로 보정 (끝점 고정)
                const capDelta = Math.min(deltaDays, startDuration - 1); // 최소 1일 보존
                const nextOffset = Math.max(0, startOffset + capDelta);
                const actualDelta = nextOffset - startOffset;
                const nextDate = addDays(minDate, nextOffset);
                const nextDur = Math.max(1, startDuration - actualDelta);
                setItems(prev => prev.map(i => i.task.id === taskId ? { ...i, date: nextDate, task: { ...i.task, duration_days: nextDur } } : i));
            } else {
                const nextOffset = Math.max(0, startOffset + deltaDays);
                const nextDate = addDays(minDate, nextOffset);
                setItems(prev => prev.map(i => i.task.id === taskId ? { ...i, date: nextDate } : i));
            }
        }
        function onUp() {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            setItems(prev => {
                const cur = prev.find(i => i.task.id === taskId);
                if (cur) {
                    if (mode === "resize-right") {
                        patch(taskId, cur.date, { duration_days: cur.task.duration_days ?? 1 });
                    } else if (mode === "resize-left") {
                        // 날짜 + duration 동시 패치 (date 이동은 PATCH 핸들러가 행 간 이관)
                        if (cur.date !== taskDate) {
                            patch(taskId, taskDate, { date: cur.date, duration_days: cur.task.duration_days ?? 1 });
                        } else {
                            patch(taskId, taskDate, { duration_days: cur.task.duration_days ?? 1 });
                        }
                    } else {
                        patch(taskId, taskDate, { date: cur.date });
                    }
                }
                return prev;
            });
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    function startMilestoneDrag(e: React.MouseEvent, m: { id: string; due_date: string }) {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startOffset = Math.max(0, dayDiff(minDate, m.due_date));

        function onMove(ev: MouseEvent) {
            const dx = ev.clientX - startX;
            const deltaDays = Math.round(dx / colWidth);
            const nextOffset = Math.max(0, startOffset + deltaDays);
            const nextDate = addDays(minDate, nextOffset);
            setMsState(prev => prev.map(x => x.id === m.id ? { ...x, due_date: nextDate } : x));
        }
        function onUp() {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            setMsState(prev => {
                const cur = prev.find(x => x.id === m.id);
                if (cur && cur.due_date && cur.due_date !== m.due_date) {
                    patchMilestone(m.id, { due_date: cur.due_date });
                }
                return prev;
            });
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    // 의존성 위반 자동 일정 조정 — 각 위반 task의 시작일을 dep 종료일 + 1일로 push
    async function autoFixDependencies() {
        // 위반 정보 수집 + 적용 순서 결정 (위상정렬 비슷하게: 의존받는 게 먼저 fix되어야)
        const updates: Array<{ id: string; oldDate: string; newDate: string }> = [];
        const taskById = new Map<string, TaskItem>();
        for (const it of sorted) taskById.set(it.task.id, it);
        // 의존 깊이 우선순위: 의존이 없는 노드부터 처리, 처리할 때마다 캐시 갱신
        const currentDates = new Map<string, string>();
        const currentDurations = new Map<string, number>();
        for (const it of sorted) {
            currentDates.set(it.task.id, it.date);
            currentDurations.set(it.task.id, Math.max(1, it.task.duration_days ?? 1));
        }
        // 단순 반복: 모든 task에 대해 deps 검사, 위반이면 push. 위상정렬 없이 N회 반복 (사이클 무시)
        for (let pass = 0; pass < 5; pass++) {
            let any = false;
            for (const it of sorted) {
                const deps = Array.isArray(it.task.depends_on) ? it.task.depends_on : [];
                if (deps.length === 0) continue;
                let latestEnd = "";
                for (const dId of deps) {
                    const dDate = currentDates.get(dId);
                    const dDur = currentDurations.get(dId);
                    if (!dDate || !dDur) continue;
                    const dEndDate = addDays(dDate, dDur - 1);
                    if (!latestEnd || dEndDate > latestEnd) latestEnd = dEndDate;
                }
                if (!latestEnd) continue;
                const minStart = addDays(latestEnd, 1);
                const curStart = currentDates.get(it.task.id);
                if (curStart && curStart < minStart) {
                    currentDates.set(it.task.id, minStart);
                    any = true;
                }
            }
            if (!any) break;
        }
        for (const it of sorted) {
            const newDate = currentDates.get(it.task.id);
            if (newDate && newDate !== it.date) {
                updates.push({ id: it.task.id, oldDate: it.date, newDate });
            }
        }
        if (updates.length === 0) return;
        // 낙관적 업데이트 후 일괄 patch
        setItems(prev => prev.map(i => {
            const u = updates.find(x => x.id === i.task.id);
            return u ? { ...i, date: u.newDate } : i;
        }));
        // PATCH 호출 (daily 행 간 이관)
        for (const u of updates) {
            await fetch(`/api/myverse/daily/${u.oldDate}/task/${u.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: u.newDate }),
            }).catch(() => {});
        }
        onReload?.();
    }

    // 의존성 추가/제거
    async function toggleDependency(targetId: string, depId: string) {
        const target = items.find(i => i.task.id === targetId);
        if (!target) return;
        const current = Array.isArray(target.task.depends_on) ? [...target.task.depends_on] : [];
        const idx = current.indexOf(depId);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(depId);
        setItems(prev => prev.map(i => i.task.id === targetId ? { ...i, task: { ...i.task, depends_on: current } } : i));
        await patch(targetId, target.date, { depends_on: current });
    }

    // 의존성 화살표용 좌표 계산
    const taskRowH = 36;
    const msRowH = 28;
    const headerH = 28;
    const labelW = 240;

    type Coord = { x: number; y: number };
    function barStart(i: number, date: string): Coord {
        const offset = Math.max(0, dayDiff(minDate, date));
        return { x: labelW + offset * colWidth + 2, y: headerH + dated.length * msRowH + i * taskRowH + taskRowH / 2 };
    }
    function barEnd(i: number, date: string, duration: number): Coord {
        const offset = Math.max(0, dayDiff(minDate, date));
        return { x: labelW + (offset + duration) * colWidth - 2, y: headerH + dated.length * msRowH + i * taskRowH + taskRowH / 2 };
    }

    const taskIndexById = new Map<string, number>();
    sorted.forEach((it, i) => taskIndexById.set(it.task.id, i));

    const arrows: Array<{ from: Coord; to: Coord; key: string; violated: boolean }> = [];
    const violatingTaskIds = new Set<string>();
    sorted.forEach((it, i) => {
        const deps = Array.isArray(it.task.depends_on) ? it.task.depends_on : [];
        deps.forEach(depId => {
            const depIdx = taskIndexById.get(depId);
            if (depIdx == null) return;
            const dep = sorted[depIdx];
            const depDuration = Math.max(1, dep.task.duration_days ?? 1);
            const from = barEnd(depIdx, dep.date, depDuration);
            const to = barStart(i, it.date);
            // 의존성 위반: dep의 종료일 >= it의 시작일 (Finish-to-Start 깨짐)
            // 또는 dep이 done이 아니고 it의 시작일이 dep 종료보다 이르거나 같음
            const gap = dayDiff(dep.date, it.date) - depDuration; // 종료일~시작일 사이 일 수
            const violated = gap < 0;
            if (violated) violatingTaskIds.add(it.task.id);
            arrows.push({ from, to, key: `${depId}->${it.task.id}`, violated });
        });
    });

    const svgHeight = headerH + dated.length * msRowH + sorted.length * taskRowH;

    return (
        <>
        {/* 의존성 위반 알림 + auto-fix */}
        {violatingTaskIds.size > 0 && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="text-rose-700">
                    의존성 위반 <strong>{violatingTaskIds.size}개</strong> — 선행 업무 종료 전에 시작됨
                </span>
                <button
                    type="button"
                    onClick={autoFixDependencies}
                    className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-white bg-rose-500 hover:bg-rose-600 rounded transition-colors"
                    title="위반된 업무의 시작일을 선행 종료 다음날로 자동 조정"
                >
                    <Wand2 className="h-3 w-3" />
                    자동 일정 조정
                </button>
            </div>
        )}

        {/* 줌 컨트롤 */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-3 text-[10px] text-neutral-500 flex-wrap">
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#A5B4FC" }} />계획</span>
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />진행</span>
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: projectColor || "#6366F1" }} />완료</span>
                <span className="inline-flex items-center gap-1"><span className="text-[#6366F1]">◆</span>마일스톤</span>
                <span className="inline-flex items-center gap-1"><span className="w-px h-3 bg-rose-500" />오늘</span>
                {arrows.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                        <svg width="14" height="6"><path d="M 0 3 L 14 3" stroke="#6366F1" strokeWidth="1.5" /></svg>
                        의존성
                    </span>
                )}
                {violatingTaskIds.size > 0 && (
                    <span className="inline-flex items-center gap-1 text-rose-600">
                        <svg width="14" height="6"><path d="M 0 3 L 14 3" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 3" /></svg>
                        위반
                    </span>
                )}
            </div>
            <div className="inline-flex items-center gap-2">
                <div className="inline-flex bg-neutral-100 rounded-md p-0.5">
                    {([
                        { k: "auto" as const, label: "자동" },
                        { k: "day" as const, label: "일" },
                        { k: "week" as const, label: "주" },
                        { k: "month" as const, label: "월" },
                    ]).map(z => (
                        <button
                            key={z.k}
                            onClick={() => setZoomMode(z.k)}
                            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                                zoomMode === z.k ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {z.label}
                        </button>
                    ))}
                </div>
                <div className="inline-flex items-center gap-0.5 border border-neutral-200 rounded-md overflow-hidden">
                    <button
                        type="button"
                        onClick={() => exportChart("png")}
                        disabled={exporting}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                        title="간트 차트를 PNG로 내보내기"
                    >
                        {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
                        PNG
                    </button>
                    <button
                        type="button"
                        onClick={() => exportChart("svg")}
                        disabled={exporting}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 text-neutral-600 hover:bg-neutral-50 border-l border-neutral-200 disabled:opacity-50"
                        title="간트 차트를 SVG로 내보내기"
                    >
                        {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileImage className="h-3 w-3" />}
                        SVG
                    </button>
                </div>
            </div>
        </div>
        <div ref={chartRef} className="bg-white border border-neutral-200 rounded-xl overflow-x-auto select-none">
            <div style={{ minWidth: chartWidth + 240 }}>
                <div className="flex sticky top-0 bg-neutral-50 border-b border-neutral-200 z-10">
                    <div className="w-60 shrink-0 px-3 py-2 text-[10px] uppercase tracking-widest text-neutral-500">
                        업무·마일스톤
                    </div>
                    <div className="relative" style={{ width: chartWidth, height: 28 }}>
                        {ticks.map(t => (
                            <div
                                key={t.offset}
                                className={`absolute top-0 bottom-0 border-l text-[9px] px-1 py-2 font-mono ${
                                    t.major ? "border-neutral-300 text-neutral-600 font-semibold" : "border-neutral-100 text-neutral-400"
                                }`}
                                style={{ left: t.offset * colWidth, width: colWidth }}
                            >
                                {t.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="divide-y divide-neutral-100 relative">
                    {/* 의존성 화살표 SVG 오버레이 */}
                    {arrows.length > 0 && (
                        <svg
                            className="absolute pointer-events-none z-10"
                            style={{ left: 0, top: 0, width: chartWidth + labelW, height: svgHeight - headerH }}
                            viewBox={`0 ${headerH} ${chartWidth + labelW} ${svgHeight - headerH}`}
                        >
                            <defs>
                                <marker id="dep-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366F1" />
                                </marker>
                                <marker id="dep-arrow-violated" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                                </marker>
                            </defs>
                            {arrows.map(({ from, to, key, violated }) => {
                                // 직각 경로: 출발 → 오른쪽으로 살짝 → 위/아래 → 도착 좌측
                                const gap = 8;
                                const mid = from.x + gap;
                                const targetMid = to.x - gap;
                                const d = `M ${from.x} ${from.y} L ${mid} ${from.y} L ${mid} ${to.y} L ${targetMid} ${to.y} L ${to.x} ${to.y}`;
                                return (
                                    <path
                                        key={key}
                                        d={d}
                                        fill="none"
                                        stroke={violated ? "#EF4444" : "#6366F1"}
                                        strokeWidth={violated ? 2 : 1.5}
                                        strokeOpacity={violated ? 0.9 : 0.7}
                                        strokeDasharray={violated ? "4 3" : undefined}
                                        markerEnd={violated ? "url(#dep-arrow-violated)" : "url(#dep-arrow)"}
                                    />
                                );
                            })}
                        </svg>
                    )}

                    {/* 오늘 표시줄 (전체 행 overlay) */}
                    {todayOffset >= 0 && todayOffset < totalDays && (
                        <div
                            className="absolute top-0 bottom-0 pointer-events-none z-20"
                            style={{ left: 240 + todayOffset * colWidth + colWidth / 2 }}
                        >
                            <div className="w-px h-full bg-rose-500" />
                            <div className="absolute -top-2 -left-3 w-6 text-center text-[8px] font-bold text-rose-500 bg-white px-0.5">오늘</div>
                        </div>
                    )}

                    {/* 마일스톤 행 — ◆ 드래그로 due_date 이동 */}
                    {dated.map(m => {
                        const offset = Math.max(0, dayDiff(minDate, m.due_date));
                        const isDone = !!m.done_at;
                        return (
                            <div key={m.id} className="flex items-center min-h-[28px] bg-[#6366F1]/[0.03]">
                                <div className="w-60 shrink-0 px-3 py-1 text-xs text-neutral-700 truncate flex items-center gap-1">
                                    <span className={`text-[10px] ${isDone ? "text-neutral-400" : "text-[#6366F1]"}`}>◆</span>
                                    <span className={isDone ? "text-neutral-400 line-through" : ""}>{m.title}</span>
                                </div>
                                <div className="relative h-6 my-1" style={{ width: chartWidth }}>
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
                                        style={{ left: offset * colWidth + colWidth / 2 }}
                                        onMouseDown={(e) => startMilestoneDrag(e, { id: m.id, due_date: m.due_date })}
                                        title={`${m.title} · ${m.due_date}${isDone ? " · 완료" : ""} · 드래그로 일정 이동`}
                                    >
                                        <span className={`block w-3 h-3 rotate-45 transition-transform hover:scale-125 ${isDone ? "bg-neutral-300" : "bg-[#6366F1]"}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {sorted.map(({ task, date }) => {
                        const offset = Math.max(0, dayDiff(minDate, date));
                        const duration = Math.max(1, task.duration_days ?? 1);
                        const barWidth = duration * colWidth;
                        const isMilestone = task.source === "milestone";
                        return (
                            <div key={task.id} className="flex items-center min-h-[36px]">
                                <button
                                    type="button"
                                    onClick={() => setEditingTask({ id: task.id, date })}
                                    className="w-60 shrink-0 px-3 py-1.5 text-xs text-neutral-800 truncate flex items-center gap-1 hover:bg-neutral-50 text-left"
                                    title={violatingTaskIds.has(task.id) ? "의존성 위반 — 선행 업무가 끝나기 전에 시작" : "클릭: 날짜·기간 편집"}
                                >
                                    {isMilestone && <span className="text-[9px] text-[#6366F1]">◆</span>}
                                    {violatingTaskIds.has(task.id) && <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />}
                                    {task.text}
                                </button>
                                <div className="relative h-7 my-1" style={{ width: chartWidth }}>
                                    <div
                                        className="absolute top-0 bottom-0 rounded flex items-center px-1.5 text-[10px] font-medium text-white whitespace-nowrap cursor-move group"
                                        style={{
                                            left: offset * colWidth + 2,
                                            width: Math.max(barWidth - 4, 24),
                                            backgroundColor: barColor(task.status),
                                            opacity: task.status === "cancelled" ? 0.4 : 1,
                                        }}
                                        onMouseDown={(e) => startDrag(e, task.id, date, "move")}
                                        title={`${task.text} · ${date} · ${duration}일`}
                                    >
                                        {/* 좌측 리사이즈 핸들 — 시작일 이동(끝점 고정) */}
                                        <span
                                            onMouseDown={(e) => startDrag(e, task.id, date, "resize-left")}
                                            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-black/0 hover:bg-black/20 rounded-l"
                                            title="드래그: 시작일 이동 (끝점 고정)"
                                        />
                                        <span className="truncate flex-1 pl-1">
                                            {task.status === "done" ? "완료" : task.status === "doing" ? "진행" : task.status === "carried" ? "이월" : task.status === "cancelled" ? "취소" : "계획"}
                                            <span className="ml-1 opacity-80">{duration}d</span>
                                        </span>
                                        {/* 우측 리사이즈 핸들 — 기간 늘리기/줄이기 */}
                                        <span
                                            onMouseDown={(e) => startDrag(e, task.id, date, "resize-right")}
                                            className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-black/0 hover:bg-black/20 rounded-r"
                                            title="드래그: 기간 늘리기"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* 날짜·기간·의존성 편집 팝오버 */}
        {editingTask && (() => {
            const item = items.find(i => i.task.id === editingTask.id);
            if (!item) return null;
            const initDate = item.date;
            const initDur = item.task.duration_days ?? 1;
            const currentDeps = Array.isArray(item.task.depends_on) ? item.task.depends_on : [];
            // 의존 후보 = 자기 자신 제외한 다른 모든 task
            const depCandidates = items.filter(i => i.task.id !== editingTask.id);
            return (
                <div className="fixed inset-0 z-[9300] flex items-center justify-center bg-black/40 px-4" onClick={() => setEditingTask(null)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-4 space-y-3 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-sm font-semibold text-neutral-900 truncate">{item.task.text}</h3>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">시작일</label>
                            <input
                                type="date"
                                defaultValue={initDate}
                                onChange={(e) => {
                                    const newDate = e.target.value;
                                    if (!newDate) return;
                                    setItems(prev => prev.map(i => i.task.id === editingTask.id ? { ...i, date: newDate } : i));
                                    patch(editingTask.id, initDate, { date: newDate });
                                }}
                                className="w-full text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">기간 (일)</label>
                            <input
                                type="number"
                                min={1}
                                defaultValue={initDur}
                                onChange={(e) => {
                                    const n = Math.max(1, parseInt(e.target.value || "1", 10));
                                    setItems(prev => prev.map(i => i.task.id === editingTask.id ? { ...i, task: { ...i.task, duration_days: n } } : i));
                                    patch(editingTask.id, item.date, { duration_days: n });
                                }}
                                className="w-full text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-1">
                                <Link2 className="h-2.5 w-2.5" /> 의존 업무 (먼저 끝나야 함)
                            </label>
                            {currentDeps.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                    {currentDeps.map(depId => {
                                        const dep = items.find(i => i.task.id === depId);
                                        if (!dep) return null;
                                        return (
                                            <span key={depId} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#6366F1]/10 text-[#6366F1] rounded text-[11px]">
                                                <span className="truncate max-w-[140px]">{dep.task.text}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDependency(editingTask.id, depId)}
                                                    className="hover:text-rose-500"
                                                    title="의존성 제거"
                                                >
                                                    <Unlink className="h-2.5 w-2.5" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                            {depCandidates.length === 0 ? (
                                <p className="text-[11px] text-neutral-400 italic">다른 업무가 없어 의존성을 만들 수 없습니다.</p>
                            ) : (
                                <select
                                    value=""
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v) toggleDependency(editingTask.id, v);
                                    }}
                                    className="w-full text-xs border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                                >
                                    <option value="">+ 의존성 추가…</option>
                                    {depCandidates
                                        .filter(c => !currentDeps.includes(c.task.id))
                                        .map(c => (
                                            <option key={c.task.id} value={c.task.id}>
                                                {c.task.text} ({c.date})
                                            </option>
                                        ))}
                                </select>
                            )}
                        </div>
                        <div className="flex justify-end pt-1">
                            <button
                                onClick={() => setEditingTask(null)}
                                className="text-xs px-3 py-1.5 bg-[#6366F1] text-white rounded-md hover:bg-[#4F46E5]"
                            >
                                완료
                            </button>
                        </div>
                    </div>
                </div>
            );
        })()}
        </>
    );
}

// 유틸
function dayDiff(a: string, b: string): number {
    return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function addDate(base: string, days: number): Date {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
}
function addDays(base: string, days: number): string {
    return addDate(base, days).toISOString().slice(0, 10);
}
