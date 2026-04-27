"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, ImageIcon, NotebookPen } from "lucide-react";
import type { PlannerProject } from "@/lib/planners/types";
import { ProjectNotesTab } from "./ProjectNotesTab";
import { CoverPicker } from "./CoverPicker";
import { CoverRender } from "./CoverRender";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { PROJECT_CATEGORIES, getCategoryMeta, type ProjectCategory } from "@/lib/planners/project-categories";

type Tab = "cover" | "notes";

const STATUS_LABEL: Record<string, string> = {
    active: "진행중",
    paused: "일시정지",
    completed: "완료",
    archived: "보관",
};
const STATUS_TONE: Record<string, string> = {
    active: "bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20",
    paused: "bg-amber-50 text-amber-700 border border-amber-200",
    completed: "bg-slate-100 text-slate-700 border border-slate-200",
    archived: "bg-neutral-100 text-neutral-500 border border-neutral-200",
};

export function ProjectDetailView({ projectId }: { projectId: string }) {
    const [tab, setTab] = useState<Tab>("notes");
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

    const dateRange = project.start_date || project.end_date
        ? `${project.start_date || "?"} → ${project.end_date || "진행중"}`
        : null;

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-6 md:py-10">
            {/* Breadcrumb + utility */}
            <div className="flex items-center justify-between mb-5">
                <Link href="/planners/app/projects" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Projects
                </Link>
                <PlannersUtilityLinks />
            </div>

            {/* Project header card */}
            <header className="mb-6 pb-5 border-b border-neutral-200">
                <div className="flex items-start gap-4">
                    <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: project.color || "#0F766E" }} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="font-serif text-3xl text-neutral-900 leading-tight">{project.title || "(제목 없음)"}</h1>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_TONE[project.status] || STATUS_TONE.active}`}>
                                {STATUS_LABEL[project.status] || project.status}
                            </span>
                            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
                        </div>
                        {dateRange && (
                            <p className="text-xs text-neutral-500 mt-1.5 font-mono">{dateRange}</p>
                        )}
                    </div>
                </div>
            </header>

            {/* Tabs — 노트(작업) 가 기본, 표지(설정) 는 보조 */}
            <div className="border-b border-neutral-200 mb-6">
                <div className="flex gap-1">
                    {([
                        { key: "notes" as Tab, label: "노트", icon: NotebookPen, hint: "프로젝트 작업 영역" },
                        { key: "cover" as Tab, label: "표지·설정", icon: ImageIcon, hint: "커버·제목·상태·일정" },
                    ]).map(({ key, label, icon: Icon, hint }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            title={hint}
                            className={`flex items-center gap-1.5 px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                                tab === key
                                    ? "border-[#0F766E] text-[#0F766E] font-semibold"
                                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "cover" && <CoverTab project={project} save={saveProject} />}
            {tab === "notes" && <NotesTab projectId={projectId} projectCategory={project.category ?? null} />}
        </div>
    );
}

function CoverTab({ project, save }: { project: PlannerProject; save: (p: Partial<PlannerProject>) => void }) {
    const [title, setTitle] = useState(project.title);
    const [status, setStatus] = useState(project.status);
    const [startDate, setStartDate] = useState(project.start_date || "");
    const [endDate, setEndDate] = useState(project.end_date || "");
    const [category, setCategory] = useState<ProjectCategory>((project.category as ProjectCategory) ?? "custom");
    const [trackingMetrics, setTrackingMetrics] = useState<string[]>(project.tracking_metrics ?? []);
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
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
            {/* Left: Cover 미리보기 + 변경 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col items-center">
                <p className="self-start text-[10px] uppercase tracking-widest text-neutral-400 mb-3">커버</p>
                {coverData ? (
                    <CoverRender cover={coverData} size="lg" showLabel />
                ) : (
                    <div className="w-40 h-56 bg-neutral-100 rounded-md flex items-center justify-center">
                        <span className="text-xs text-neutral-400">커버 없음</span>
                    </div>
                )}
                <button
                    onClick={() => setPickerOpen(true)}
                    className="mt-4 w-full px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
                >
                    커버 디자인 변경
                </button>
                <p className="text-[11px] text-neutral-400 mt-2">{coverData?.label || "Teal Solid"}</p>
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

            {/* Right: Form fields — flat one-card with rows */}
            <section className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
                <Field label="제목">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => save({ title })}
                        placeholder="프로젝트 제목"
                        className="w-full text-base font-serif text-neutral-900 bg-transparent focus:outline-none placeholder:text-neutral-300 placeholder:font-sans placeholder:italic"
                    />
                </Field>
                <Field label="상태">
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value as typeof status); save({ status: e.target.value as typeof status }); }}
                        className="w-full text-sm text-neutral-900 bg-transparent focus:outline-none"
                    >
                        <option value="active">진행중</option>
                        <option value="paused">일시정지</option>
                        <option value="completed">완료</option>
                        <option value="archived">보관</option>
                    </select>
                </Field>
                <div className="grid grid-cols-2 divide-x divide-neutral-100">
                    <Field label="시작일">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            onBlur={() => save({ start_date: startDate || null })}
                            className="w-full text-sm text-neutral-900 bg-transparent focus:outline-none"
                        />
                    </Field>
                    <Field label="종료일">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            onBlur={() => save({ end_date: endDate || null })}
                            className="w-full text-sm text-neutral-900 bg-transparent focus:outline-none"
                        />
                    </Field>
                </div>
                <Field label="카테고리">
                    <div className="flex flex-wrap gap-1.5">
                        {PROJECT_CATEGORIES.map((c) => {
                            const active = category === c.key;
                            return (
                                <button
                                    key={c.key}
                                    onClick={() => {
                                        setCategory(c.key);
                                        // 메트릭이 비어있을 때만 카테고리의 추천 메트릭으로 자동 채움
                                        const nextMetrics = trackingMetrics.length === 0 ? c.suggested_metrics : trackingMetrics;
                                        setTrackingMetrics(nextMetrics);
                                        save({ category: c.key, tracking_metrics: nextMetrics });
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                                        active ? "border-current text-white" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                                    }`}
                                    style={active ? { backgroundColor: c.color, borderColor: c.color } : undefined}
                                >
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>
                </Field>
                <Field label="연결 트래킹 메트릭">
                    <div className="flex flex-wrap gap-1.5">
                        {(["energy","satisfaction","mood","study","faith","exercise","health"] as const).map((m) => {
                            const labels: Record<string, string> = {
                                energy: "에너지", satisfaction: "만족도", mood: "기분",
                                study: "공부", faith: "신앙", exercise: "운동", health: "건강",
                            };
                            const active = trackingMetrics.includes(m);
                            return (
                                <button
                                    key={m}
                                    onClick={() => {
                                        const next = active
                                            ? trackingMetrics.filter(x => x !== m)
                                            : [...trackingMetrics, m];
                                        setTrackingMetrics(next);
                                        save({ tracking_metrics: next });
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                                        active
                                            ? "bg-[#0F766E] text-white border-[#0F766E]"
                                            : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                                    }`}
                                >
                                    {labels[m]}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1.5">{getCategoryMeta(category).description} · Daily에서 입력하면 이 프로젝트 통계로 적재됩니다 (Phase 3).</p>
                </Field>
            </section>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="px-5 py-3.5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">{label}</p>
            {children}
        </div>
    );
}

function NotesTab({ projectId, projectCategory }: { projectId: string; projectCategory: string | null }) {
    return <ProjectNotesTab projectId={projectId} projectCategory={projectCategory} />;
}

