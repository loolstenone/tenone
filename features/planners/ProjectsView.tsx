"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FolderKanban, Plus, Loader2,
    GraduationCap, Briefcase, Palette, HeartPulse, MapPin, Users, Wallet, BarChart3, Sparkles,
    LayoutGrid,
} from "lucide-react";
import type { PlannerProject } from "@/lib/planners/types";
import { CoverRender } from "./CoverRender";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { Track } from "@/lib/analytics";
import { PROJECT_CATEGORIES, getCategoryMeta, type ProjectCategory } from "@/lib/planners/project-categories";
import { useAuth } from "@/lib/auth-context";

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
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState<ProjectCategory>("custom");
    const [filter, setFilter] = useState<"all" | "active" | "completed" | "archived">("active");

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([
                fetch(`/api/planners/projects`),
                fetch(`/api/planners/covers`),
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

    async function createProject() {
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            const meta = getCategoryMeta(newCategory);
            const res = await fetch(`/api/planners/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    category: newCategory,
                    tracking_metrics: meta.suggested_metrics,
                }),
            });
            if (res.ok) {
                const d = await res.json();
                setProjects([...projects, d.project]);
                Track.projectCreate({ has_title: !!newTitle.trim() });
                setNewTitle("");
                setNewCategory("custom");
            }
        } finally {
            setCreating(false);
        }
    }

    const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);
    const hasPublicProjects = projects.some(p => p.visibility === "public_link");

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <FolderKanban className="h-6 w-6 text-[#0F766E]" />
                    <h1 className="font-serif text-3xl text-neutral-900">Projects</h1>
                </div>
                <div className="flex items-center gap-2">
                    {hasPublicProjects && user?.id && (
                        <Link
                            href={`/planners/portfolio/${user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#0F766E] border border-[#0F766E] rounded-lg hover:bg-[#0F766E] hover:text-white transition-colors"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            내 포트폴리오
                        </Link>
                    )}
                    <PlannersUtilityLinks />
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 mb-6">
                {(["active", "completed", "archived", "all"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                            filter === f
                                ? "bg-[#0F766E] text-white"
                                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                    >
                        {f === "active" ? "진행중" : f === "completed" ? "완료" : f === "archived" ? "보관" : "전체"}
                    </button>
                ))}
            </div>

            {/* New project */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex items-center gap-3">
                    <Plus className="h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') createProject(); }}
                        placeholder="새 프로젝트 제목"
                        className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                    />
                    <button
                        onClick={createProject}
                        disabled={creating || !newTitle.trim()}
                        className="px-4 py-1.5 text-sm bg-[#0F766E] text-white rounded-lg hover:bg-[#0d5e56] transition-colors disabled:opacity-50"
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
            </div>

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
                            href={`/planners/app/projects/${p.id}`}
                            className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-[#0F766E] hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                {covers.get(p.cover_id || "teal_solid") ? (
                                    <CoverRender cover={covers.get(p.cover_id || "teal_solid")!} size="sm" />
                                ) : (
                                    <div
                                        className="w-10 h-14 rounded-md shrink-0"
                                        style={{ backgroundColor: p.color || "#0F766E" }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-neutral-900 group-hover:text-[#0F766E] transition-colors">
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
        </div>
    );
}
