"use client";

import { BrandProject, ProjectPhase } from "@/types/workflow";
import { brands } from "@/lib/data";
import { Calendar, CheckCircle2 } from "lucide-react";

interface ProjectCardProps {
    project: BrandProject;
}

const phaseOrder: ProjectPhase[] = ['Planning', 'Development', 'Review', 'Launch', 'Complete'];

const phaseColors: Record<ProjectPhase, string> = {
    Planning: 'bg-blue-500',
    Development: 'bg-amber-500',
    Review: 'bg-purple-500',
    Launch: 'bg-emerald-500',
    Complete: 'bg-zinc-500',
};

const statusColors: Record<string, string> = {
    Active: 'text-emerald-400 bg-emerald-500/10',
    'On Hold': 'text-amber-400 bg-amber-500/10',
    Completed: 'text-blue-400 bg-blue-500/10',
    Cancelled: 'text-red-400 bg-red-500/10',
};

export function ProjectCard({ project }: ProjectCardProps) {
    const brandName = brands.find(b => b.id === project.brandId)?.name ?? project.brandId;
    const currentPhaseIndex = phaseOrder.indexOf(project.phase);

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-600 transition-colors">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-base font-semibold text-white">{project.name}</h3>
                    <p className="text-sm text-indigo-400 mt-0.5">{brandName}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status]}`}>
                    {project.status}
                </span>
            </div>

            <p className="text-sm text-zinc-400 mt-3 line-clamp-2">{project.description}</p>

            {/* Phase Progress */}
            <div className="mt-4">
                <div className="flex items-center gap-1">
                    {phaseOrder.map((phase, idx) => (
                        <div key={phase} className="flex-1 flex flex-col items-center">
                            <div
                                className={`h-1.5 w-full rounded-full ${
                                    idx <= currentPhaseIndex ? phaseColors[project.phase] : 'bg-zinc-800'
                                }`}
                            />
                            <span className={`text-[9px] mt-1 ${
                                idx === currentPhaseIndex ? 'text-white font-medium' : 'text-zinc-600'
                            }`}>
                                {phase}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {project.taskIds.length} tasks
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {project.startDate}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>
                    <span className="text-xs text-zinc-400">{project.progress}%</span>
                </div>
            </div>
        </div>
    );
}
