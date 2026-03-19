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
    Complete: 'bg-neutral-400',
};

const statusColors: Record<string, string> = {
    Active: 'text-emerald-600 bg-emerald-50',
    'On Hold': 'text-amber-600 bg-amber-50',
    Completed: 'text-blue-600 bg-blue-50',
    Cancelled: 'text-red-600 bg-red-50',
};

export function ProjectCard({ project }: ProjectCardProps) {
    const brandName = brands.find(b => b.id === project.brandId)?.name ?? project.brandId;
    const currentPhaseIndex = phaseOrder.indexOf(project.phase);

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-neutral-300 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-base font-semibold text-neutral-900">{project.name}</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">{brandName}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status]}`}>
                    {project.status}
                </span>
            </div>

            <p className="text-sm text-neutral-500 mt-3 line-clamp-2">{project.description}</p>

            {/* Phase Progress */}
            <div className="mt-4">
                <div className="flex items-center gap-1">
                    {phaseOrder.map((phase, idx) => (
                        <div key={phase} className="flex-1 flex flex-col items-center">
                            <div
                                className={`h-1.5 w-full rounded-full ${
                                    idx <= currentPhaseIndex ? phaseColors[project.phase] : 'bg-neutral-200'
                                }`}
                            />
                            <span className={`text-[9px] mt-1 ${
                                idx === currentPhaseIndex ? 'text-neutral-900 font-medium' : 'text-neutral-400'
                            }`}>
                                {phase}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {project.taskIds.length} tasks
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {project.startDate}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-neutral-900 transition-all"
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>
                    <span className="text-xs text-neutral-500">{project.progress}%</span>
                </div>
            </div>
        </div>
    );
}
