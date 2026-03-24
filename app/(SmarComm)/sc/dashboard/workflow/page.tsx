"use client";

import Link from "next/link";
import { GitBranch, KanbanSquare, FolderKanban, Zap, ArrowRight } from "lucide-react";
import { useWorkflow } from "@/lib/smarcomm/workflow-context";

const modules = [
  { name: "콘텐츠 파이프라인", description: "소재 제작 파이프라인을 단계별로 추적합니다.", href: "/sc/dashboard/workflow/pipeline", icon: GitBranch },
  { name: "칸반 보드", description: "드래그앤드롭으로 태스크를 관리합니다.", href: "/sc/dashboard/workflow/kanban", icon: KanbanSquare },
  { name: "프로젝트", description: "캠페인별 프로젝트 진행 현황을 관리합니다.", href: "/sc/dashboard/workflow/projects", icon: FolderKanban },
  { name: "자동화", description: "자동화 규칙을 설정하고 관리합니다.", href: "/sc/dashboard/workflow/automation", icon: Zap },
];

export default function WorkflowDashboard() {
  const { tasks, pipelineItems, projects, automations } = useWorkflow();

  const stats = [
    { label: "활성 태스크", value: tasks.filter(t => t.status !== 'Done').length },
    { label: "파이프라인", value: pipelineItems.length },
    { label: "활성 프로젝트", value: projects.filter(p => p.status === 'Active').length },
    { label: "자동화", value: automations.filter(a => a.enabled).length },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-text">워크플로우</h1>
      <p className="mt-1 text-xs text-text-muted">마케팅 작업 흐름을 체계적으로 관리합니다</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-5 text-center">
            <p className="text-2xl font-bold text-text">{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {modules.map(mod => (
          <Link key={mod.name} href={mod.href} className="group rounded-2xl border border-border bg-white p-5 hover:border-text-muted/40 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-surface p-3"><mod.icon className="h-5 w-5 text-text-sub" /></div>
              <ArrowRight className="h-4 w-4 text-text-muted/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-text">{mod.name}</h3>
            <p className="mt-1 text-xs text-text-muted">{mod.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-white">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">최근 태스크</h3>
          <Link href="/sc/dashboard/workflow/kanban" className="text-xs text-text-muted hover:text-text">전체 보기 →</Link>
        </div>
        <ul className="divide-y divide-border">
          {tasks.slice(0, 5).map(task => (
            <li key={task.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">{task.title}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{task.assignee || '미배정'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 bg-surface text-text-muted font-medium rounded">{task.priority}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-surface text-text-muted font-medium rounded">{task.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
