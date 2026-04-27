"use client";

// Daily 우측 — 활성 프로젝트 진행률·D-N·오늘 task 수 (Phase 2)

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Loader2, ArrowUpRight } from "lucide-react";
import { getCategoryMeta } from "@/lib/planners/project-categories";

interface DashboardProject {
    id: string;
    title: string;
    color: string | null;
    category: string | null;
    end_date: string | null;
    progress: number;
    days_left: number | null;
    today_task_count: number;
    today_task_done: number;
}

export function DailyProjectsCard({ date }: { date?: string }) {
    const [projects, setProjects] = useState<DashboardProject[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const url = `/api/planners/projects/dashboard${date ? `?date=${date}` : ""}`;
            const res = await fetch(url);
            if (res.ok) {
                const d = await res.json();
                setProjects((d.projects ?? []).slice(0, 6));
            }
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, [date]);

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <FolderKanban className="h-3.5 w-3.5" />
                    Project
                </h2>
                <Link
                    href="/planners/app/projects"
                    className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-[#0F766E]"
                    title="프로젝트 목록"
                >
                    <Plus className="h-3 w-3" /> 추가
                </Link>
            </div>

            {loading ? (
                <div className="text-sm text-neutral-300 italic py-2 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> 불러오는 중…
                </div>
            ) : projects.length === 0 ? (
                <Link
                    href="/planners/app/projects"
                    className="block w-full py-3 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-400 text-center hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
                >
                    + 첫 프로젝트 만들기
                </Link>
            ) : (
                <ul className="space-y-2">
                    {projects.map((p) => {
                        const meta = getCategoryMeta(p.category);
                        const progressColor = p.color || meta.color;
                        return (
                            <li key={p.id} className="group">
                                <Link
                                    href={`/planners/app/projects/${p.id}`}
                                    className="block rounded-lg p-2 hover:bg-neutral-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: progressColor }} />
                                        <span className="text-sm text-neutral-800 truncate flex-1">{p.title}</span>
                                        <ArrowUpRight className="h-3 w-3 text-neutral-300 group-hover:text-[#0F766E] shrink-0" />
                                    </div>
                                    {/* 메타 라인: 카테고리 + D-N + 오늘 task */}
                                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 ml-3.5 flex-wrap">
                                        <span style={{ color: meta.color }}>{meta.label}</span>
                                        {p.days_left !== null && (
                                            <>
                                                <span className="text-neutral-300">·</span>
                                                <span className={p.days_left < 0 ? "text-rose-500" : p.days_left <= 7 ? "text-amber-600" : ""}>
                                                    {p.days_left < 0 ? `D+${-p.days_left}` : p.days_left === 0 ? "D-Day" : `D-${p.days_left}`}
                                                </span>
                                            </>
                                        )}
                                        {p.today_task_count > 0 && (
                                            <>
                                                <span className="text-neutral-300">·</span>
                                                <span className="text-[#0F766E]">
                                                    오늘 {p.today_task_done}/{p.today_task_count}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {/* 진행률 바 */}
                                    {p.progress > 0 && (
                                        <div className="ml-3.5 mt-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${Math.min(100, p.progress)}%`, backgroundColor: progressColor }}
                                            />
                                        </div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
