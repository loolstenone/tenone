"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import type { PlannerProject } from "@/lib/planners/types";
import { ProjectNotesTab } from "./ProjectNotesTab";
import { CoverPicker } from "./CoverPicker";
import { CoverRender } from "./CoverRender";

type Tab = "cover" | "notes";

export function ProjectDetailView({ projectId }: { projectId: string }) {
    const [tab, setTab] = useState<Tab>("cover");
    const [project, setProject] = useState<PlannerProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/projects/${projectId}`);
            if (res.ok) {
                const d = await res.json();
                setProject(d.project);
            }
            setLoading(false);
        })();
    }, [projectId]);

    async function saveProject(patch: Partial<PlannerProject>) {
        setSaving(true);
        try {
            await fetch(`/api/planners/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project: patch }),
            });
        } finally { setSaving(false); }
    }


    if (loading) {
        return <div className="max-w-6xl mx-auto px-6 py-12 text-center text-neutral-400 text-sm">로딩 중…</div>;
    }
    if (!project) {
        return <div className="max-w-6xl mx-auto px-6 py-12 text-center text-neutral-400 text-sm">프로젝트를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            <Link href="/planners/app/projects" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
                <ChevronLeft className="h-4 w-4" /> Projects
            </Link>

            <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: project.color || "#0F766E" }} />
                <h1 className="font-serif text-3xl text-neutral-900">{project.title}</h1>
                {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            </div>
            <p className="text-sm text-neutral-500 mb-8">
                {project.status === "active" ? "진행중" : project.status === "completed" ? "완료" : project.status === "archived" ? "보관" : "일시정지"}
            </p>

            {/* Tabs */}
            <div className="border-b border-neutral-200 mb-8">
                <div className="flex gap-1">
                    {(["cover", "notes"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                                tab === t
                                    ? "border-[#0F766E] text-[#0F766E] font-semibold"
                                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {t === "cover" ? "표지" : "노트"}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "cover" && <CoverTab project={project} save={saveProject} />}
            {tab === "notes" && <NotesTab projectId={projectId} />}
        </div>
    );
}

function CoverTab({ project, save }: { project: PlannerProject; save: (p: Partial<PlannerProject>) => void }) {
    const [title, setTitle] = useState(project.title);
    const [status, setStatus] = useState(project.status);
    const [startDate, setStartDate] = useState(project.start_date || "");
    const [endDate, setEndDate] = useState(project.end_date || "");
    const [coverId, setCoverId] = useState(project.cover_id || "teal_solid");
    const [coverData, setCoverData] = useState<{ key: string; label: string; pattern: "solid" | "gradient" | "grid" | "dot" | "paper" | "line" | "stripe" | "circle"; primary_color: string; accent_color: string | null; emoji: string | null } | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        fetch(`/api/planners/covers`).then(async (r) => {
            if (!r.ok) return;
            const d = await r.json();
            const found = (d.covers || []).find((c: { key: string }) => c.key === (project.cover_id || "teal_solid"));
            if (found) setCoverData(found);
        });
    }, [project.cover_id]);

    return (
        <div className="space-y-4">
            {/* Cover 미리보기 + 선택 버튼 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-5">
                {coverData ? (
                    <CoverRender cover={coverData} size="lg" showLabel />
                ) : (
                    <div className="w-40 h-56 bg-neutral-100 rounded-md flex items-center justify-center">
                        <span className="text-xs text-neutral-400">커버</span>
                    </div>
                )}
                <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">커버 디자인</p>
                    <p className="text-lg font-serif text-neutral-900 mb-3">{coverData?.label || "Teal Solid"}</p>
                    <button
                        onClick={() => setPickerOpen(true)}
                        className="px-4 py-2 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                    >
                        커버 변경
                    </button>
                </div>
            </section>

            <CoverPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                currentCoverId={coverId}
                onSelect={(c) => {
                    setCoverId(c.key);
                    setCoverData(c);
                    save({ cover_id: c.key, color: c.primary_color });
                }}
            />

            <Block label="제목">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => save({ title })}
                    className="w-full text-lg text-neutral-900 bg-transparent focus:outline-none"
                />
            </Block>
            <div className="grid grid-cols-3 gap-3">
                <Block label="상태">
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value as typeof status); save({ status: e.target.value as typeof status }); }}
                        className="w-full text-sm bg-transparent focus:outline-none"
                    >
                        <option value="active">진행중</option>
                        <option value="paused">일시정지</option>
                        <option value="completed">완료</option>
                        <option value="archived">보관</option>
                    </select>
                </Block>
                <Block label="시작일">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onBlur={() => save({ start_date: startDate || null })} className="w-full text-sm bg-transparent focus:outline-none" />
                </Block>
                <Block label="종료일">
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onBlur={() => save({ end_date: endDate || null })} className="w-full text-sm bg-transparent focus:outline-none" />
                </Block>
            </div>
        </div>
    );
}

function NotesTab({ projectId }: { projectId: string }) {
    return <ProjectNotesTab projectId={projectId} />;
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">{label}</p>
            {children}
        </section>
    );
}

function Textarea({ label, value, onSave, noLabel }: { label?: string; value?: string | null; onSave: (v: string) => void; noLabel?: boolean }) {
    const [v, setV] = useState(value || "");
    useEffect(() => { setV(value || ""); }, [value]);
    return (
        <div>
            {!noLabel && label && <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</label>}
            <textarea
                value={v}
                onChange={(e) => setV(e.target.value)}
                onBlur={() => onSave(v)}
                rows={3}
                className="w-full text-sm text-neutral-900 focus:outline-none bg-neutral-50 rounded-lg px-3 py-2 resize-none"
            />
        </div>
    );
}
