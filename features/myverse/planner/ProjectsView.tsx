"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FolderKanban, Plus, Loader2,
    GraduationCap, Briefcase, Palette, HeartPulse, MapPin, Users, Wallet, BarChart3, Sparkles,
    LayoutGrid, Trash2,
} from "lucide-react";
import type { PlannerProject } from "@/lib/myverse/types";
import { CoverRender } from "./CoverRender";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { Track } from "@/lib/analytics";
import { PROJECT_CATEGORIES, getCategoryMeta, type ProjectCategory } from "@/lib/myverse/project-categories";
import { useAuth } from "@/lib/auth-context";
import { ConfirmSheet } from "./ConfirmSheet";

const CATEGORY_ICONS: Record<string, typeof FolderKanban> = {
    GraduationCap, Briefcase, Palette, HeartPulse, MapPin, Users, Wallet, BarChart3, Sparkles,
};

interface Cover {
    key: string;
    label: string;
    pattern: "solid" | "gradient" | "grid" | "dot" | "paper" | "line" | "stripe" | "circle";
    primary_color: string;
    accent_color: string | null;
    emoji: string | null;
}

export function ProjectsView() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<PlannerProject[]>([]);
    const [covers, setCovers] = useState<Map<string, Cover>>(new Map());
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState<ProjectCategory>("custom");
    const [newStartDate, setNewStartDate] = useState("");
    const [newEndDate, setNewEndDate] = useState("");
    const [newGoal, setNewGoal] = useState("");
    const [newMilestones, setNewMilestones] = useState<Array<{ title: string; due_date: string }>>([]);
    const [filter, setFilter] = useState<"all" | "active" | "completed" | "archived">("active");
    const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | null>(null);
    const [confirmDeleteProject, setConfirmDeleteProject] = useState<{ id: string; title: string } | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([
                fetch(`/api/myverse/projects`),
                fetch(`/api/myverse/covers`),
            ]);
            if (pRes.ok) {
                const d = await pRes.json();
                setProjects(d.projects || []);
            }
            if (cRes.ok) {
                const d = await cRes.json();
                const m = new Map<string, Cover>();
                (d.covers || []).forEach((c: Cover) => m.set(c.key, c));
                setCovers(m);
            }
            setLoading(false);
        })();
    }, []);

    async function deleteProject(id: string) {
        const res = await fetch(`/api/myverse/projects/${id}`, { method: "DELETE" });
        if (res.ok) {
            setProjects(prev => prev.filter(p => p.id !== id));
        } else {
            const d = await res.json().catch(() => ({}));
            alert(`삭제 실패: ${d.message || d.error || res.status}`);
        }
    }

    async function createProject() {
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            const meta = getCategoryMeta(newCategory);
            const res = await fetch(`/api/myverse/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    category: newCategory,
                    tracking_metrics: meta.suggested_metrics,
                    start_date: newStartDate || null,
                    end_date: newEndDate || null,
                    custom_fields: newGoal.trim() ? { goal: newGoal.trim() } : undefined,
                }),
            });
            if (res.ok) {
                const d = await res.json();
                const created = d.project;
                setProjects([...projects, created]);
                Track.projectCreate({ has_title: !!newTitle.trim() });

                // 마일스톤 → 프로젝트 마일스톤 테이블에 등록 (일정 자동 동기화는 milestone-sync가 처리)
                const validMs = newMilestones.filter(m => m.title.trim() && m.due_date);
                for (let i = 0; i < validMs.length; i++) {
                    const m = validMs[i];
                    await fetch(`/api/myverse/projects/${created.id}/milestones`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: m.title.trim(),
                            due_date: m.due_date,
                            order_index: i,
                        }),
                    }).catch(() => {});
                }

                // 종료일 → 마감 일정 entry로 추가 (선택)
                if (newEndDate) {
                    await fetch(`/api/myverse/calendar`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            kind: "anniversary",
                            title: `${newTitle.trim()} 마감`,
                            start_date: newEndDate,
                            color: created.color || meta.color,
                        }),
                    }).catch(() => {});
                }

                setNewTitle("");
                setNewCategory("custom");
                setNewStartDate("");
                setNewEndDate("");
                setNewGoal("");
                setNewMilestones([]);
                setShowForm(false);
            }
        } finally {
            setCreating(false);
        }
    }

    const filtered = projects
        .filter(p => filter === "all" || p.status === filter)
        .filter(p => !categoryFilter || p.category === categoryFilter);
    const hasPublicProjects = projects.some(p => p.visibility === "public_link");

    return (
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-8" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header — Stitch 정렬 (세션 122) */}
            <div className="flex items-start justify-between mb-8 gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-2" style={{ color: "#6366F1" }}>
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                            folder_managed
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-widest">PROJECTS</span>
                    </div>
                    <h1
                        className="text-[28px] sm:text-[32px] font-medium tracking-tight text-neutral-900 leading-tight"
                        style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                    >
                        프로젝트
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {hasPublicProjects && user?.id && (
                        <Link
                            href={`/myverse/portfolio/${user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6366F1] border border-[#6366F1] rounded-lg hover:bg-[#6366F1] hover:text-white transition-colors"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            내 포트폴리오
                        </Link>
                    )}
                    <PlannersUtilityLinks />
                </div>
            </div>

            {/* 새 프로젝트 — 우상단 (좁은 폭에서도 nav와 안 겹침) */}
            <div className="flex justify-end mb-2">
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors shrink-0"
                >
                    <Plus className="h-3.5 w-3.5" /> 새 프로젝트
                </button>
            </div>
            {/* 상태 탭 — IdentitySubNav 일관 패턴 */}
            <nav className="flex items-center gap-1 border-b border-neutral-200 mb-4 flex-wrap">
                {(["active", "completed", "archived", "all"] as const).map((f) => {
                    const isActive = filter === f;
                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors shrink-0 ${
                                isActive
                                    ? "text-[#6366F1] font-semibold"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {f === "active" ? "진행중" : f === "completed" ? "완료" : f === "archived" ? "보관" : "전체"}
                            {isActive && (
                                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#6366F1]" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* 카테고리 필터 */}
            <div className="flex items-center gap-1.5 mb-5 flex-wrap">
                <button
                    onClick={() => setCategoryFilter(null)}
                    className={`px-2.5 py-0.5 text-xs rounded-full transition-colors ${
                        !categoryFilter ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                >
                    전체
                </button>
                {PROJECT_CATEGORIES.map((c) => {
                    const Icon = CATEGORY_ICONS[c.icon] ?? Sparkles;
                    const active = categoryFilter === c.key;
                    return (
                        <button
                            key={c.key}
                            onClick={() => setCategoryFilter(active ? null : c.key)}
                            className={`flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full transition-colors ${
                                active ? "text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                            }`}
                            style={active ? { backgroundColor: c.color } : undefined}
                        >
                            <Icon className="h-3 w-3" />
                            {c.label}
                        </button>
                    );
                })}
            </div>

            {/* New project — 모달 */}
            {showForm && (
                <div
                    className="fixed inset-0 z-[9200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                    onClick={() => { setShowForm(false); }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                                <FolderKanban className="h-4 w-4 text-[#6366F1]" />
                                새 프로젝트
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-neutral-400 hover:text-neutral-700 text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                    <div className="flex items-center gap-3">
                        <Plus className="h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') createProject();
                                if (e.key === 'Escape') { setShowForm(false); setNewTitle(""); }
                            }}
                            placeholder="새 프로젝트 제목"
                            autoFocus
                            className="flex-1 text-sm font-medium text-neutral-500 bg-transparent focus:outline-none focus:text-neutral-900 placeholder:text-neutral-300 transition-colors"
                        />
                        <button
                            onClick={() => { setShowForm(false); setNewTitle(""); setNewCategory("custom"); }}
                            className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={createProject}
                            disabled={creating || !newTitle.trim()}
                            className="px-4 py-1.5 text-sm bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors disabled:opacity-50"
                        >
                            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "추가"}
                        </button>
                    </div>
                    {/* 카테고리 선택 — 추천 템플릿·트래킹 자동 적용 */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">카테고리</p>
                        <div className="flex flex-wrap gap-1.5">
                            {PROJECT_CATEGORIES.map((c) => {
                                const Icon = CATEGORY_ICONS[c.icon] ?? Sparkles;
                                const active = newCategory === c.key;
                                return (
                                    <button
                                        key={c.key}
                                        onClick={() => setNewCategory(c.key)}
                                        title={c.description}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                                            active
                                                ? "border-current text-white"
                                                : "border-neutral-200 text-neutral-500 bg-white hover:bg-neutral-50"
                                        }`}
                                        style={active ? { backgroundColor: c.color, borderColor: c.color } : undefined}
                                    >
                                        <Icon className="h-3 w-3" />
                                        {c.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 일정 · 목표 — 입력 시 일정&업무에 자동 반영 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">시작일</p>
                            <input
                                type="date"
                                value={newStartDate}
                                onChange={(e) => setNewStartDate(e.target.value)}
                                className="w-full text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                            />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">종료일 (마감)</p>
                            <input
                                type="date"
                                value={newEndDate}
                                onChange={(e) => setNewEndDate(e.target.value)}
                                className="w-full text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                            />
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">목표 한 줄</p>
                        <input
                            type="text"
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            placeholder="이 프로젝트를 끝내면 무엇이 달라지는가"
                            className="w-full text-sm border border-neutral-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-[#6366F1]"
                        />
                    </div>

                    {/* 마일스톤 (선택) — 추가 시 일정&업무에 자동 등록 */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400">마일스톤 (선택)</p>
                            <button
                                type="button"
                                onClick={() => setNewMilestones(prev => [...prev, { title: "", due_date: newEndDate || newStartDate || "" }])}
                                className="text-[10px] text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-0.5"
                            >
                                <Plus className="h-3 w-3" /> 마일스톤 추가
                            </button>
                        </div>
                        {newMilestones.length === 0 ? (
                            <p className="text-[11px] text-neutral-300">마일스톤을 추가하면 해당 날짜 일정&업무에 자동 등록됩니다.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {newMilestones.map((m, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={m.title}
                                            onChange={(e) => setNewMilestones(prev => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                                            placeholder="마일스톤 이름"
                                            className="flex-1 text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                                        />
                                        <input
                                            type="date"
                                            value={m.due_date}
                                            onChange={(e) => setNewMilestones(prev => prev.map((x, j) => j === i ? { ...x, due_date: e.target.value } : x))}
                                            className="text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewMilestones(prev => prev.filter((_, j) => j !== i))}
                                            className="text-neutral-300 hover:text-rose-500"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-neutral-400 text-sm">프로젝트가 없습니다. 위에서 추가해 보세요.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {filtered.map((p) => (
                        <Link
                            key={p.id}
                            href={`/myverse/app/projects/${p.id}`}
                            className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-[#6366F1] hover:shadow-sm transition-all group relative"
                        >
                            {/* 호버 시 삭제 버튼 — 우상단 */}
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteProject({ id: p.id, title: p.title }); }}
                                title="프로젝트 삭제"
                                className="absolute top-2 right-2 p-1.5 rounded text-neutral-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <div className="flex items-start gap-4">
                                {covers.get(p.cover_id || "teal_solid") ? (
                                    <CoverRender cover={covers.get(p.cover_id || "teal_solid")!} size="sm" />
                                ) : (
                                    <div
                                        className="w-10 h-14 rounded-md shrink-0"
                                        style={{ backgroundColor: p.color || "#6366F1" }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-neutral-900 group-hover:text-[#6366F1] transition-colors">
                                        {p.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 flex-wrap">
                                        <span className="px-2 py-0.5 bg-neutral-100 rounded">
                                            {p.status === "active" ? "진행중" : p.status === "completed" ? "완료" : p.status === "archived" ? "보관" : "일시정지"}
                                        </span>
                                        {p.category && (() => {
                                            const meta = getCategoryMeta(p.category);
                                            const Icon = CATEGORY_ICONS[meta.icon] ?? Sparkles;
                                            return (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-white"
                                                    style={{ backgroundColor: meta.color }}
                                                >
                                                    <Icon className="h-3 w-3" /> {meta.label}
                                                </span>
                                            );
                                        })()}
                                        {p.start_date && <span>{p.start_date}</span>}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <ConfirmSheet
                open={!!confirmDeleteProject}
                message={`"${confirmDeleteProject?.title}" 프로젝트를 영구 삭제할까요?`}
                description="노트·태스크·마일스톤 모두 함께 삭제됩니다."
                onConfirm={() => { const p = confirmDeleteProject!; setConfirmDeleteProject(null); deleteProject(p.id); }}
                onCancel={() => setConfirmDeleteProject(null)}
            />
        </div>
    );
}
