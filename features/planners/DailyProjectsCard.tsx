"use client";

// Daily 우측 — 활성 프로젝트 빠른 진입 + 한 줄 메모 추가 위젯

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Pencil, Loader2 } from "lucide-react";

interface Project {
    id: string;
    title: string;
    cover_id?: string | null;
    status?: string;
}

export function DailyProjectsCard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch("/api/planners/projects");
            if (res.ok) {
                const d = await res.json();
                const all: Project[] = d.projects ?? [];
                // 활성만, 최근 6개
                setProjects(all.filter((p) => p.status === "active").slice(0, 6));
            }
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

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
                <ul className="space-y-1">
                    {projects.map((p) => (
                        <li key={p.id} className="group flex items-center gap-2">
                            <Link
                                href={`/planners/app/projects/${p.id}`}
                                className="flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-50"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0" />
                                <span className="text-sm text-neutral-800 truncate">{p.title}</span>
                            </Link>
                            <Link
                                href={`/planners/app/projects/${p.id}?focus=notes`}
                                className="shrink-0 p-1.5 text-neutral-300 hover:text-[#0F766E] opacity-0 group-hover:opacity-100 transition-opacity"
                                title="이 프로젝트에 노트 작성"
                            >
                                <Pencil className="h-3 w-3" />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
