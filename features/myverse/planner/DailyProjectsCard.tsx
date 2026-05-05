"use client";

// Daily 우측 — 활성 프로젝트 진행률·D-N·오늘 task 수 (Phase 2)

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Loader2, ArrowUpRight } from "lucide-react";
import { getCategoryMeta } from "@/lib/myverse/project-categories";

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
            const url = `/api/myverse/projects/dashboard${date ? `?date=${date}` : ""}`;
            const res = await fetch(url);
            if (res.ok) {
                const d = await res.json();
                setProjects((d.projects ?? []).slice(0, 4));
            }
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, [date]);

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs tracking-widest text-neutral-400 flex items-center gap-2">
                    <FolderKanban className="h-3.5 w-3.5" />
                    프로젝트
                </h2>
                <Link
                    href="/myverse/app/projects"
                    className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-[#6366F1]"
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
                    href="/myverse/app/projects"
                    className="block w-full py-3 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-400 text-center hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
                >
                    + 첫 프로젝트 만들기
                </Link>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {projects.map((p) => {
                        const meta = getCategoryMeta(p.category);
                        const progressColor = p.color || meta.color;
                        return (
                            <Link
                                key={p.id}
                                href={`/myverse/app/projects/${p.id}`}
                                className="group relative block bg-white border border-neutral-200 rounded-xl p-3 hover:border-neutral-300 hover:shadow-sm transition-all"
                            >
                                {/* 카테고리 뱃지 + 화살표 */}
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] uppercase tracking-wider font-medium" style={{ color: meta.color }}>{meta.label}</span>
                                    <ArrowUpRight className="h-3 w-3 text-neutral-300 group-hover:text-[#6366F1] transition-colors shrink-0" />
                                </div>
                                {/* 제목 */}
                                <p className="text-xs font-medium text-neutral-800 truncate mb-1.5">{p.title}</p>
                                {/* 진행률 바 */}
                                {p.progress > 0 && (
                                    <div className="h-1 bg-neutral-100 rounded-full overflow-hidden mb-1.5">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{ width: `${Math.min(100, p.progress)}%`, backgroundColor: progressColor }}
                                        />
                                    </div>
                                )}
                                {/* 메타: D-N + 오늘 task */}
                                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 flex-wrap">
                                    {p.days_left !== null && (
                                        <span className={p.days_left < 0 ? "text-rose-500" : p.days_left <= 7 ? "text-amber-600" : ""}>
                                            {p.days_left < 0 ? `D+${-p.days_left}` : p.days_left === 0 ? "D-Day" : `D-${p.days_left}`}
                                        </span>
                                    )}
                                    {p.today_task_count > 0 && (
                                        <span className="text-[#6366F1]">{p.today_task_done}/{p.today_task_count}</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
