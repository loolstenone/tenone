"use client";

import { BrandProject, ProjectPhase } from "@/types/workflow";
import { workflowChannels } from "@/lib/smarcomm/workflow-data";
import { Calendar, CheckCircle2 } from "lucide-react";

const phaseOrder: ProjectPhase[] = ['Planning', 'Development', 'Review', 'Launch', 'Complete'];
const phaseColors: Record<ProjectPhase, string> = { Planning: 'bg-blue-500', Development: 'bg-amber-500', Review: 'bg-purple-500', Launch: 'bg-emerald-500', Complete: 'bg-text-muted' };
const statusColors: Record<string, string> = { Active: 'text-emerald-600 bg-emerald-50', 'On Hold': 'text-amber-600 bg-amber-50', Completed: 'text-blue-600 bg-blue-50', Cancelled: 'text-red-600 bg-red-50' };

export function ProjectCard({ project }: { project: BrandProject }) {
  const channelName = workflowChannels.find(c => c.id === project.brandId)?.name ?? project.brandId;
  const currentPhaseIndex = phaseOrder.indexOf(project.phase);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 hover:border-text-muted/40 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-text">{project.name}</h3>
          <p className="text-xs text-point mt-0.5">{channelName}</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[project.status]}`}>{project.status}</span>
      </div>
      <p className="text-xs text-text-muted mt-2 line-clamp-2">{project.description}</p>
      <div className="mt-3">
        <div className="flex items-center gap-1">
          {phaseOrder.map((phase, idx) => (
            <div key={phase} className="flex-1 flex flex-col items-center">
              <div className={`h-1.5 w-full rounded-full ${idx <= currentPhaseIndex ? phaseColors[project.phase] : 'bg-surface'}`} />
              <span className={`text-[8px] mt-1 ${idx === currentPhaseIndex ? 'text-text font-semibold' : 'text-text-muted/50'}`}>{phase}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-text-muted"><CheckCircle2 className="h-3 w-3" />{project.taskIds.length} tasks</span>
          <span className="flex items-center gap-1 text-[10px] text-text-muted"><Calendar className="h-3 w-3" />{project.startDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden">
            <div className="h-full rounded-full bg-text transition-all" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="text-[10px] text-text-muted">{project.progress}%</span>
        </div>
      </div>
    </div>
  );
}
