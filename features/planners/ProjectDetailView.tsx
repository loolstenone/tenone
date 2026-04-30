"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, NotebookPen, ListTodo, Flag, Settings as SettingsIcon, ChevronDown, ChevronUp } from "lucide-react";
import type { PlannerProject, ProjectCollaborator } from "@/lib/planners/types";
import { ProjectNotesTab } from "./ProjectNotesTab";
import { ProjectTasksTab } from "./ProjectTasksTab";
import { ProjectMilestonesTab } from "./ProjectMilestonesTab";
import { ProjectRetroModal } from "./ProjectRetroModal";
import { CoverPicker } from "./CoverPicker";
import { CoverRender } from "./CoverRender";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { ConfirmSheet } from "./ConfirmSheet";
import { PROJECT_CATEGORIES, getCategoryMeta, type ProjectCategory } from "@/lib/planners/project-categories";

// 통합 페이지의 각 섹션 — Tab 컴포넌트가 자체 카드를 갖고 있으므로 헤더만 plain 렌더
function SectionCard({ icon: Icon, title, hint, children }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2 px-1">
                <Icon className="h-3.5 w-3.5 text-[#0F766E]" />
                <h2 className="text-xs tracking-widest text-neutral-500 font-semibold">{title}</h2>
                {hint && <span className="text-[10px] text-neutral-300 ml-1">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

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

type ProjectTab = "milestones" | "tasks" | "notes";

export function ProjectDetailView({ projectId }: { projectId: string }) {
    const [project, setProject] = useState<PlannerProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [retroOpen, setRetroOpen] = useState(false);
    const [userRole, setUserRole] = useState<"owner" | "editor" | "viewer">("owner");
    const [activeTab, setActiveTab] = useState<ProjectTab>("milestones");
    const [coverOpen, setCoverOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    async function reload() {
        const res = await fetch(`/api/planners/projects/${projectId}`);
        if (res.ok) {
            const d = await res.json();
            setProject(d.project);
            setUserRole(d.userRole ?? "owner");
        }
    }

    useEffect(() => {
        (async () => {
            setLoading(true);
            await reload();
            setLoading(false);
        })();
    }, [projectId]);

    async function saveProject(patch: Partial<PlannerProject>) {
        if (userRole === "viewer") return;
        setSaving(true);
        try {
            await fetch(`/api/planners/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project: patch }),
            });
            // status를 completed로 바꾸고 회고가 없으면 모달 자동 오픈
            if (patch.status === "completed" && !project?.retrospective) {
                setProject(p => p ? { ...p, ...patch } : p);
                setRetroOpen(true);
            } else if (patch) {
                setProject(p => p ? { ...p, ...patch } : p);
            }
        } finally { setSaving(false); }
    }


    if (loading) {
        return <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12 text-center text-neutral-400 text-sm">로딩 중…</div>;
    }
    if (!project) {
        return <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12 text-center text-neutral-400 text-sm">프로젝트를 찾을 수 없습니다.</div>;
    }

    const dateRange = project.start_date || project.end_date
        ? `${project.start_date || "?"} → ${project.end_date || "진행중"}`
        : null;

    // D-day 계산 — 종료일 기준
    let dDay: { label: string; tone: string } | null = null;
    if (project.end_date) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const end = new Date(project.end_date + "T00:00:00");
        const diffDays = Math.round((end.getTime() - today.getTime()) / 86400000);
        if (diffDays > 0) dDay = { label: `D-${diffDays}`, tone: diffDays <= 7 ? "text-rose-600 bg-rose-50 border-rose-200" : "text-neutral-600 bg-neutral-50 border-neutral-200" };
        else if (diffDays === 0) dDay = { label: "D-Day", tone: "text-rose-600 bg-rose-50 border-rose-200 font-bold" };
        else dDay = { label: `D+${-diffDays}`, tone: "text-neutral-400 bg-neutral-50 border-neutral-200" };
    }

    // 카테고리 메타
    const categoryMeta = project.category ? getCategoryMeta(project.category as ProjectCategory) : null;

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            {/* Breadcrumb + utility */}
            <div className="flex items-center justify-between mb-5">
                <Link href="/planners/app/projects" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> 프로젝트
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
                            {project.retrospective && (
                                <button
                                    onClick={() => setRetroOpen(true)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-full text-[11px] font-medium hover:bg-violet-100"
                                    title="저장된 회고 보기"
                                >
                                    회고 보기
                                </button>
                            )}
                            {project.status !== "completed" && !project.retrospective && (
                                <button
                                    onClick={() => setRetroOpen(true)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[11px] font-medium hover:bg-amber-100"
                                    title="5F 회고 작성하고 완료 처리"
                                >
                                    회고하고 완료
                                </button>
                            )}
                            {userRole === "viewer" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
                                    읽기 전용
                                </span>
                            )}
                            {userRole === "editor" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                                    편집자
                                </span>
                            )}
                            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
                        </div>
                        {/* 메타 라인 — 카테고리 · D-day · 일정 한눈에 */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {categoryMeta && (
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-white font-medium"
                                    style={{ backgroundColor: categoryMeta.color }}
                                >
                                    {categoryMeta.label}
                                </span>
                            )}
                            {dDay && (
                                <span className={`inline-flex items-center px-2 py-0.5 border rounded text-[11px] font-mono ${dDay.tone}`}>
                                    {dDay.label}
                                </span>
                            )}
                            {dateRange && (
                                <span className="text-xs text-neutral-500 font-mono">{dateRange}</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── 서브 탭 네비게이션 ── */}
            <div className="flex items-center gap-0 border-b border-neutral-200 mb-6">
                {([
                    { key: "milestones" as ProjectTab, label: "마일스톤", icon: Flag },
                    { key: "tasks"      as ProjectTab, label: "업무",     icon: ListTodo },
                    { key: "notes"      as ProjectTab, label: "노트",     icon: NotebookPen },
                ] as { key: ProjectTab; label: string; icon: React.ComponentType<{ className?: string }> }[]).map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                            activeTab === key
                                ? "border-[#0F766E] text-[#0F766E]"
                                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-200"
                        }`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── 탭 컨텐츠 ── */}
            <div className="space-y-5">

                {/* 마일스톤 탭 */}
                {activeTab === "milestones" && (
                    <>
                        <ProjectMilestonesTab
                            projectId={projectId}
                            projectColor={project.color || "#0F766E"}
                            projectStartDate={project.start_date}
                            projectEndDate={project.end_date}
                        />

                        {/* 표지 · 설정 — 마일스톤 탭 하단 */}
                        <section className="bg-white border border-neutral-200 rounded-xl">
                            <button
                                onClick={() => setCoverOpen(o => !o)}
                                className="w-full flex items-center gap-2 px-5 py-3 text-left"
                            >
                                <SettingsIcon className="h-3.5 w-3.5 text-neutral-400" />
                                <h2 className="text-xs tracking-widest text-neutral-400 flex-1">표지 · 프로젝트 설정</h2>
                                {coverOpen ? <ChevronUp className="h-3.5 w-3.5 text-neutral-400" /> : <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />}
                            </button>
                            {coverOpen && (
                                <div className="px-5 pb-5 border-t border-neutral-100 pt-5">
                                    <CoverTab project={project} save={saveProject} userRole={userRole} />
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* 업무 탭 */}
                {activeTab === "tasks" && (
                    <ProjectTasksTab projectId={projectId} projectColor={project.color || "#0F766E"} />
                )}

                {/* 노트 탭 */}
                {activeTab === "notes" && (
                    <ProjectNotesTab projectId={projectId} projectCategory={project.category ?? null} />
                )}

                {/* 프로젝트 삭제 — 오너만, 모든 탭 하단 공통 표시 */}
                {userRole === "owner" && (
                    <section className="bg-rose-50/40 border border-rose-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-rose-700 mb-1">프로젝트 삭제</h3>
                                <p className="text-[11px] text-rose-600/80 leading-relaxed">
                                    노트·업무·마일스톤·Vrief·GPR 모두 영구 삭제됩니다. 되돌릴 수 없습니다.
                                </p>
                            </div>
                            <button
                                onClick={() => setConfirmDeleteOpen(true)}
                                className="shrink-0 px-3 py-1.5 text-xs bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                            >
                                영구 삭제
                            </button>
                        </div>
                    </section>
                )}
            </div>

            <ConfirmSheet
                open={confirmDeleteOpen}
                message={`"${project?.title ?? "(제목 없음)"}" 프로젝트를 영구 삭제할까요?`}
                description="노트·업무·마일스톤·Vrief·GPR 모두 영구 삭제됩니다. 되돌릴 수 없습니다."
                onConfirm={async () => {
                    setConfirmDeleteOpen(false);
                    const res = await fetch(`/api/planners/projects/${projectId}`, { method: "DELETE" });
                    if (res.ok) {
                        window.location.href = "/planners/app/projects";
                    } else {
                        const d = await res.json().catch(() => ({}));
                        alert(`삭제 실패: ${d.message || d.error || res.status}`);
                    }
                }}
                onCancel={() => setConfirmDeleteOpen(false)}
            />

            {/* 5F 회고 모달 */}
            <ProjectRetroModal
                open={retroOpen}
                project={project}
                onClose={() => setRetroOpen(false)}
                onSaved={() => { reload(); }}
            />
        </div>
    );
}

function CoverTab({ project, save, userRole }: { project: PlannerProject; save: (p: Partial<PlannerProject>) => void; userRole: "owner" | "editor" | "viewer" }) {
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
                        className="w-full text-base font-medium text-neutral-500 bg-transparent focus:outline-none focus:text-neutral-900 placeholder:text-neutral-300 transition-colors"
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
                {userRole === "owner" && <ShareField project={project} />}
                {userRole === "owner" && <CollaboratorField project={project} save={save} />}
            </section>

        </div>
    );
}

function ShareField({ project }: { project: PlannerProject }) {
    const [token, setToken] = useState(project.public_token ?? "");
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState(false);
    const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
    const isPublic = project.visibility === "public_link" && !!token;

    async function makePublic() {
        setBusy(true);
        try {
            const res = await fetch(`/api/planners/projects/${project.id}/share`, { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                setToken(d.token);
            }
        } finally { setBusy(false); }
    }

    async function revoke() {
        setBusy(true);
        try {
            await fetch(`/api/planners/projects/${project.id}/share`, { method: "DELETE" });
            setToken("");
        } finally { setBusy(false); }
    }

    const url = typeof window !== "undefined" && token ? `${window.location.origin}/planners/p/${token}` : "";

    async function copyUrl() {
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {}
    }

    return (
        <Field label="공개 링크">
            {!isPublic ? (
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-neutral-500">공개 링크를 만들면 누구나 URL로 이 프로젝트를 읽을 수 있습니다 (수정 불가).</p>
                    <button
                        onClick={makePublic}
                        disabled={busy}
                        className="px-3 py-1.5 text-xs bg-[#0F766E] text-white rounded-lg hover:bg-[#0d5e56] disabled:opacity-50 shrink-0"
                    >
                        공개로 전환
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <input
                            value={url}
                            readOnly
                            onFocus={(e) => e.currentTarget.select()}
                            className="flex-1 text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E] font-mono"
                        />
                        <button
                            onClick={copyUrl}
                            className="px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded hover:bg-neutral-50 shrink-0"
                        >
                            {copied ? "복사됨" : "복사"}
                        </button>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded hover:bg-neutral-50 shrink-0"
                        >
                            열기
                        </a>
                    </div>
                    <button
                        onClick={() => setConfirmRevokeOpen(true)}
                        disabled={busy}
                        className="text-[11px] text-rose-500 hover:underline disabled:opacity-50"
                    >
                        공개 링크 철회
                    </button>
                </div>
            )}
            <ConfirmSheet
                open={confirmRevokeOpen}
                message="공개 링크를 철회할까요?"
                description="기존 URL은 더 이상 작동하지 않게 됩니다."
                confirmLabel="철회"
                onConfirm={() => { setConfirmRevokeOpen(false); revoke(); }}
                onCancel={() => setConfirmRevokeOpen(false)}
            />
        </Field>
    );
}

function CollaboratorField({ project, save }: { project: PlannerProject; save: (p: Partial<PlannerProject>) => void }) {
    const initial: ProjectCollaborator[] = Array.isArray(project.collaborators) ? project.collaborators : [];
    const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>(initial);
    const [newEmail, setNewEmail] = useState("");

    async function persist(next: ProjectCollaborator[]) {
        setCollaborators(next);
        await save({ collaborators: next });
    }

    function add() {
        const e = newEmail.trim().toLowerCase();
        if (!e || !/^.+@.+\..+$/.test(e)) { alert("이메일 형식이 올바르지 않습니다."); return; }
        if (collaborators.some((c) => c.email === e)) { alert("이미 추가된 이메일입니다."); return; }
        const next: ProjectCollaborator[] = [...collaborators, { email: e, role: "viewer", invited_at: new Date().toISOString() }];
        persist(next);
        setNewEmail("");
    }

    function remove(email: string) {
        persist(collaborators.filter((c) => c.email !== email));
    }

    function setRole(email: string, role: "viewer" | "editor") {
        persist(collaborators.map((c) => c.email === email ? { ...c, role } : c));
    }

    return (
        <Field label="협업자">
            <div className="space-y-2">
                {collaborators.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">아직 초대된 협업자가 없습니다.</p>
                ) : (
                    <ul className="space-y-1">
                        {collaborators.map(c => (
                            <li key={c.email} className="flex items-center gap-2 text-xs">
                                <span className="flex-1 text-neutral-700 truncate">{c.email}</span>
                                <select
                                    value={c.role}
                                    onChange={(e) => setRole(c.email, e.target.value as "viewer" | "editor")}
                                    className="text-[11px] border border-neutral-200 rounded px-1.5 py-0.5 bg-white"
                                >
                                    <option value="viewer">뷰어</option>
                                    <option value="editor">에디터</option>
                                </select>
                                <button
                                    onClick={() => remove(c.email)}
                                    className="text-neutral-300 hover:text-rose-500 text-[11px]"
                                >
                                    삭제
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="flex items-center gap-2">
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") add(); }}
                        placeholder="email@example.com"
                        className="flex-1 text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:border-[#0F766E]"
                    />
                    <button
                        onClick={add}
                        className="px-3 py-1 text-xs bg-[#0F766E] text-white rounded hover:bg-[#0d5e56]"
                    >
                        초대
                    </button>
                </div>
            </div>
        </Field>
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


