"use client";

import { useState, useEffect } from "react";
import { fetchBrandProjects } from "@/lib/supabase/workflow";
import { initialProjects } from "@/lib/workflow-data";
import { ProjectCard } from "@/components/workflow/ProjectCard";
import type { BrandProject } from "@/types/workflow";
import { brands } from "@/lib/data";
import { Filter, FolderKanban, Loader2 } from "lucide-react";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<BrandProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [brandFilter, setBrandFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        let cancelled = false;
        fetchBrandProjects()
            .then(p => { if (!cancelled) setProjects(p.length > 0 ? p : initialProjects); })
            .catch(() => { if (!cancelled) setProjects(initialProjects); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const filteredProjects = projects.filter(p => {
        if (brandFilter !== 'all' && p.brandId !== brandFilter) return false;
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        return true;
    });

    const activeCount = projects.filter(p => p.status === 'Active').length;
    const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Brand Projects</h2>
                    <p className="mt-0.5 text-sm text-neutral-400">브랜드별 프로젝트 진행 현황을 관리합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-neutral-400" />
                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                    >
                        <option value="all">All Brands</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
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
                <div className="border border-neutral-200 bg-white p-4 flex items-center gap-4">
                    <div className="bg-neutral-100 p-3">
                        <FolderKanban className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{activeCount}</p>
                        <p className="text-xs text-neutral-400">Active Projects</p>
                    </div>
                </div>
                <div className="border border-neutral-200 bg-white p-4 flex items-center gap-4">
                    <div className="bg-neutral-100 p-3">
                        <FolderKanban className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{projects.length}</p>
                        <p className="text-xs text-neutral-400">Total Projects</p>
                    </div>
                </div>
                <div className="border border-neutral-200 bg-white p-4 flex items-center gap-4">
                    <div className="bg-neutral-100 p-3">
                        <FolderKanban className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{avgProgress}%</p>
                        <p className="text-xs text-neutral-400">Avg Progress</p>
                    </div>
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
                {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
                {filteredProjects.length === 0 && (
                    <div className="col-span-2 text-center py-16 text-neutral-400">
                        No projects match the current filters.
                    </div>
                )}
            </div>
        </div>
    );
}
