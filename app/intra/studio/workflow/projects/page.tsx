"use client";

import { useState } from "react";
import { useWorkflow } from "@/lib/workflow-context";
import { ProjectCard } from "@/components/workflow/ProjectCard";
import { brands } from "@/lib/data";
import { Filter, FolderKanban } from "lucide-react";

export default function ProjectsPage() {
    const { projects } = useWorkflow();
    const [brandFilter, setBrandFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredProjects = projects.filter(p => {
        if (brandFilter !== 'all' && p.brandId !== brandFilter) return false;
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        return true;
    });

    const activeCount = projects.filter(p => p.status === 'Active').length;
    const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Brand Projects</h2>
                    <p className="mt-2 text-zinc-400">브랜드별 프로젝트 진행 현황을 관리합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    >
                        <option value="all">All Brands</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center gap-4">
                    <div className="rounded-lg bg-emerald-500/10 p-3">
                        <FolderKanban className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{activeCount}</p>
                        <p className="text-xs text-zinc-500">Active Projects</p>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center gap-4">
                    <div className="rounded-lg bg-indigo-500/10 p-3">
                        <FolderKanban className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{projects.length}</p>
                        <p className="text-xs text-zinc-500">Total Projects</p>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center gap-4">
                    <div className="rounded-lg bg-amber-500/10 p-3">
                        <FolderKanban className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{avgProgress}%</p>
                        <p className="text-xs text-zinc-500">Avg Progress</p>
                    </div>
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
                {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
                {filteredProjects.length === 0 && (
                    <div className="col-span-2 text-center py-16 text-zinc-500">
                        No projects match the current filters.
                    </div>
                )}
            </div>
        </div>
    );
}
