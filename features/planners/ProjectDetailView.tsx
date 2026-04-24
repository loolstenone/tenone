"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import type { PlannerProject, PlannerProjectVrief, PlannerProjectGpr } from "@/lib/planners/types";
import { ProjectNotesTab } from "./ProjectNotesTab";
import { CopyToAiButton } from "./CopyToAiButton";
import { CoverPicker } from "./CoverPicker";
import { CoverRender } from "./CoverRender";

type Tab = "cover" | "vrief" | "gpr" | "notes";

export function ProjectDetailView({ projectId }: { projectId: string }) {
    const [tab, setTab] = useState<Tab>("cover");
    const [project, setProject] = useState<PlannerProject | null>(null);
    const [vrief, setVrief] = useState<Partial<PlannerProjectVrief>>({});
    const [gpr, setGpr] = useState<Partial<PlannerProjectGpr>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/projects/${projectId}`);
            if (res.ok) {
                const d = await res.json();
                setProject(d.project);
                setVrief(d.vrief || {});
                setGpr(d.gpr || {});
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

    async function saveVrief(patch: Partial<PlannerProjectVrief>) {
        const next = { ...vrief, ...patch };
        setVrief(next);
        setSaving(true);
        try {
            await fetch(`/api/planners/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vrief: patch }),
            });
        } finally { setSaving(false); }
    }

    async function saveGpr(patch: Partial<PlannerProjectGpr>) {
        const next = { ...gpr, ...patch };
        setGpr(next);
        setSaving(true);
        try {
            await fetch(`/api/planners/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gpr: patch }),
            });
        } finally { setSaving(false); }
    }

    if (loading) {
        return <div className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400 text-sm">로딩 중…</div>;
    }
    if (!project) {
        return <div className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400 text-sm">프로젝트를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-8 md:py-12">
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
                    {(["cover", "vrief", "gpr", "notes"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                                tab === t
                                    ? "border-[#0F766E] text-[#0F766E] font-semibold"
                                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {t === "cover" ? "Cover" : t === "vrief" ? "Vrief (목표 설계)" : t === "gpr" ? "GPR (성과)" : "Notes"}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "cover" && <CoverTab project={project} save={saveProject} />}
            {tab === "vrief" && <VriefTab vrief={vrief} save={saveVrief} />}
            {tab === "gpr" && <GprTab gpr={gpr} save={saveGpr} />}
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
                        <span className="text-xs text-neutral-400">Cover</span>
                    </div>
                )}
                <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Cover</p>
                    <p className="text-lg font-serif text-neutral-900 mb-3">{coverData?.label || "Teal Solid"}</p>
                    <button
                        onClick={() => setPickerOpen(true)}
                        className="px-4 py-2 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                    >
                        Cover 변경
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

function VriefTab({ vrief, save }: { vrief: Partial<PlannerProjectVrief>; save: (p: Partial<PlannerProjectVrief>) => void }) {
    const vriefPayload = [
        vrief.research_situation && `## 1. 조사·분석\n상황: ${vrief.research_situation}\n인사이트: ${vrief.research_insight ?? ''}`,
        vrief.hypothesis_statement && `## 2. 가설 수립\n가설: ${vrief.hypothesis_statement}\n리스크: ${vrief.hypothesis_risks ?? ''}`,
        vrief.validation_method && `## 3. 가설 검증\n방법: ${vrief.validation_method}\n발견: ${vrief.validation_findings ?? ''}\n결론: ${vrief.validation_conclusion ?? ''}`,
        vrief.strategy_objective && `## 4. 전략 수립\n목표: ${vrief.strategy_objective}\n접근: ${vrief.strategy_approach ?? ''}\n성공 기준: ${vrief.strategy_success_criteria ?? ''}`,
    ].filter(Boolean).join("\n\n");

    return (
        <div className="space-y-6">
            {vriefPayload && (
                <div className="flex justify-end">
                    <CopyToAiButton
                        title="Vrief 심층 검증"
                        payload={vriefPayload}
                        hint="다음은 한 프로젝트의 Vrief(Objective Brief) 4단계입니다."
                    />
                </div>
            )}
            <Stage n={1} title="조사·분석">
                <Textarea label="상황" value={vrief.research_situation} onSave={(v) => save({ research_situation: v })} />
                <Textarea label="인사이트" value={vrief.research_insight} onSave={(v) => save({ research_insight: v })} />
            </Stage>
            <Stage n={2} title="가설 수립">
                <Textarea label="가설 문장" value={vrief.hypothesis_statement} onSave={(v) => save({ hypothesis_statement: v })} />
                <Textarea label="리스크" value={vrief.hypothesis_risks} onSave={(v) => save({ hypothesis_risks: v })} />
            </Stage>
            <Stage n={3} title="가설 검증">
                <Textarea label="검증 방법" value={vrief.validation_method} onSave={(v) => save({ validation_method: v })} />
                <Textarea label="발견 사항" value={vrief.validation_findings} onSave={(v) => save({ validation_findings: v })} />
                <Textarea label="결론" value={vrief.validation_conclusion} onSave={(v) => save({ validation_conclusion: v })} />
            </Stage>
            <Stage n={4} title="전략 수립">
                <Textarea label="핵심 목표" value={vrief.strategy_objective} onSave={(v) => save({ strategy_objective: v })} />
                <Textarea label="접근 방식" value={vrief.strategy_approach} onSave={(v) => save({ strategy_approach: v })} />
                <Textarea label="성공 기준" value={vrief.strategy_success_criteria} onSave={(v) => save({ strategy_success_criteria: v })} />
            </Stage>
        </div>
    );
}

function GprTab({ gpr, save }: { gpr: Partial<PlannerProjectGpr>; save: (p: Partial<PlannerProjectGpr>) => void }) {
    return (
        <div className="space-y-4">
            <Block label="Goal"><Textarea value={gpr.goal} onSave={(v) => save({ goal: v })} noLabel /></Block>
            <Block label="Plan"><Textarea value={gpr.plan} onSave={(v) => save({ plan: v })} noLabel /></Block>
            <Block label={`Progress ${gpr.progress ?? 0}%`}>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={gpr.progress ?? 0}
                    onChange={(e) => save({ progress: parseInt(e.target.value, 10) })}
                    className="w-full"
                />
            </Block>
            <Block label="Obstacles"><Textarea value={gpr.obstacles} onSave={(v) => save({ obstacles: v })} noLabel /></Block>
            <Block label="Learnings"><Textarea value={gpr.learnings} onSave={(v) => save({ learnings: v })} noLabel /></Block>
            <Block label="Result"><Textarea value={gpr.result} onSave={(v) => save({ result: v })} noLabel /></Block>
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

function Stage({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center">{n}</div>
                <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
            </div>
            <div className="space-y-3 pl-10">{children}</div>
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
