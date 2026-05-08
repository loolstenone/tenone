"use client";

// 프로젝트 마일스톤 — 체크리스트 + 간트차트
// 진행률 자동 계산: 완료 마일스톤 / 전체

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import type { MyverseProjectMilestone } from "@/lib/myverse/types";
import { localDateStr } from "@/lib/myverse/types";
import { ConfirmSheet } from "./ConfirmSheet";

export function ProjectMilestonesTab({ projectId, projectColor, projectStartDate, projectEndDate }: {
    projectId: string;
    projectColor: string;
    projectStartDate: string | null;
    projectEndDate: string | null;
}) {
    const [milestones, setMilestones] = useState<MyverseProjectMilestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDue, setNewDue] = useState("");
    const [confirmDeleteMilestone, setConfirmDeleteMilestone] = useState<MyverseProjectMilestone | null>(null);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch(`/api/myverse/projects/${projectId}/milestones`);
            if (res.ok) {
                const d = await res.json();
                setMilestones(d.milestones ?? []);
            }
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, [projectId]);

    async function add() {
        if (!newTitle.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/myverse/projects/${projectId}/milestones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    due_date: newDue || null,
                    order_index: milestones.length,
                }),
            });
            if (res.ok) {
                const d = await res.json();
                setMilestones([...milestones, d.milestone]);
                setNewTitle("");
                setNewDue("");
            }
        } finally { setSaving(false); }
    }

    async function toggleDone(m: MyverseProjectMilestone) {
        const next = m.done_at ? null : new Date().toISOString();
        const updated = milestones.map(x => x.id === m.id ? { ...x, done_at: next } : x);
        setMilestones(updated);
        await fetch(`/api/myverse/projects/${projectId}/milestones`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: m.id, done_at: next }),
        });
    }

    async function update(m: MyverseProjectMilestone, patch: Partial<MyverseProjectMilestone>) {
        const updated = milestones.map(x => x.id === m.id ? { ...x, ...patch } : x);
        setMilestones(updated);
        await fetch(`/api/myverse/projects/${projectId}/milestones`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: m.id, ...patch }),
        });
    }

    async function remove(m: MyverseProjectMilestone) {
        setMilestones(milestones.filter(x => x.id !== m.id));
        await fetch(`/api/myverse/projects/${projectId}/milestones?id=${m.id}`, { method: "DELETE" });
    }

    if (loading) {
        return (
            <div className="py-16 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
            </div>
        );
    }

    const total = milestones.length;
    const done = milestones.filter(m => m.done_at).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <div className="space-y-4">
            {/* 진행률 — 마일스톤 1개 이상일 때만 (빈 상태에서는 의미 없음) */}
            {total > 0 && (
                <section className="bg-white border border-neutral-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs tracking-widest text-neutral-500">전체 진행률</h2>
                        <span className="text-2xl font-serif text-neutral-900">
                            {completionRate}<span className="text-sm text-neutral-400">%</span>
                        </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${completionRate}%`, backgroundColor: projectColor }}
                        />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-2">
                        {done} / {total} 마일스톤 완료
                    </p>
                </section>
            )}

            {/* 간트 차트 (시작일·종료일이 있을 때만) */}
            {projectStartDate && projectEndDate && milestones.some(m => m.due_date) && (
                <Gantt
                    milestones={milestones}
                    startDate={projectStartDate}
                    endDate={projectEndDate}
                    color={projectColor}
                />
            )}

            {/* 체크리스트 — 외부 SectionCard 가 이미 "마일스톤" 헤더를 그리므로 자체 제목 생략 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-5">
                <ul className="space-y-2">
                    {milestones.map((m) => {
                        const isDone = !!m.done_at;
                        const isOverdue = !isDone && m.due_date && m.due_date < localDateStr(new Date());
                        return (
                            <li key={m.id} className="group flex items-center gap-3">
                                <button
                                    onClick={() => toggleDone(m)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                        isDone
                                            ? "border-[#6366F1] bg-[#6366F1] text-white"
                                            : "border-neutral-300 hover:border-[#6366F1]"
                                    }`}
                                >
                                    {isDone && <Check className="h-3 w-3" />}
                                </button>
                                <input
                                    type="text"
                                    value={m.title}
                                    onChange={(e) => {
                                        const next = milestones.map(x => x.id === m.id ? { ...x, title: e.target.value } : x);
                                        setMilestones(next);
                                    }}
                                    onBlur={(e) => update(m, { title: e.target.value })}
                                    className={`flex-1 text-sm bg-transparent focus:outline-none ${isDone ? "text-neutral-400 line-through" : "text-neutral-900"}`}
                                />
                                <input
                                    type="date"
                                    value={m.due_date ?? ""}
                                    onChange={(e) => update(m, { due_date: e.target.value || null })}
                                    className={`text-xs bg-transparent focus:outline-none border border-transparent hover:border-neutral-200 rounded px-1.5 py-0.5 ${
                                        isOverdue ? "text-rose-500" : "text-neutral-500"
                                    }`}
                                />
                                <button
                                    onClick={() => setConfirmDeleteMilestone(m)}
                                    className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-rose-500 transition-opacity"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* 추가 */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                    <Plus className="h-4 w-4 text-neutral-400 shrink-0" />
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") add(); }}
                        placeholder="새 마일스톤"
                        className="flex-1 text-sm focus:outline-none bg-transparent placeholder:text-neutral-300"
                    />
                    <input
                        type="date"
                        value={newDue}
                        onChange={(e) => setNewDue(e.target.value)}
                        className="text-xs text-neutral-500 bg-white border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:border-[#6366F1]"
                    />
                    <button
                        onClick={add}
                        disabled={saving || !newTitle.trim()}
                        className="px-3 py-1 text-xs bg-[#6366F1] text-white rounded hover:bg-[#4F46E5] disabled:opacity-50"
                    >
                        추가
                    </button>
                </div>
            </section>
            <ConfirmSheet
                open={!!confirmDeleteMilestone}
                message={`"${confirmDeleteMilestone?.title}" 마일스톤을 삭제할까요?`}
                onConfirm={() => { const m = confirmDeleteMilestone!; setConfirmDeleteMilestone(null); remove(m); }}
                onCancel={() => setConfirmDeleteMilestone(null)}
            />
        </div>
    );
}

function Gantt({ milestones, startDate, endDate, color }: {
    milestones: MyverseProjectMilestone[];
    startDate: string;
    endDate: string;
    color: string;
}) {
    const start = new Date(startDate + "T00:00:00Z").getTime();
    const end = new Date(endDate + "T00:00:00Z").getTime();
    const span = Math.max(end - start, 86400000);

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">간트</h2>
            <div className="space-y-2">
                {/* 타임라인 */}
                <div className="relative h-1 bg-neutral-100 rounded-full">
                    <div className="absolute -top-4 left-0 text-[10px] text-neutral-400 font-mono">{startDate}</div>
                    <div className="absolute -top-4 right-0 text-[10px] text-neutral-400 font-mono">{endDate}</div>
                </div>
                {/* 마일스톤 점 */}
                {milestones.filter(m => m.due_date).map((m) => {
                    const due = new Date(m.due_date! + "T00:00:00Z").getTime();
                    const pct = Math.max(0, Math.min(100, ((due - start) / span) * 100));
                    const isDone = !!m.done_at;
                    return (
                        <div key={m.id} className="relative h-6 flex items-center">
                            <div className="absolute inset-x-0 h-px bg-neutral-100 top-1/2" />
                            <div
                                className="absolute -translate-x-1/2 flex flex-col items-center"
                                style={{ left: `${pct}%` }}
                                title={`${m.title} · ${m.due_date}`}
                            >
                                <span
                                    className={`w-2.5 h-2.5 rounded-full border-2 ${isDone ? "" : "bg-white"}`}
                                    style={{
                                        borderColor: color,
                                        backgroundColor: isDone ? color : "white",
                                    }}
                                />
                                <span className={`text-[9px] mt-1 whitespace-nowrap ${isDone ? "text-neutral-400 line-through" : "text-neutral-700"}`}>
                                    {m.title}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
