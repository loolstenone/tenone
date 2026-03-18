"use client";

import Link from "next/link";
import { GitBranch, KanbanSquare, FolderKanban, Zap, ArrowRight } from "lucide-react";
import { useWorkflow } from "@/lib/workflow-context";

const modules = [
    {
        name: "Content Pipeline",
        description: "콘텐츠 제작 파이프라인을 단계별로 추적합니다.",
        href: "/intra/studio/workflow/pipeline",
        icon: GitBranch,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
    {
        name: "Kanban Board",
        description: "드래그앤드롭으로 태스크를 관리합니다.",
        href: "/intra/studio/workflow/kanban",
        icon: KanbanSquare,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        name: "Brand Projects",
        description: "브랜드별 프로젝트 진행 현황을 관리합니다.",
        href: "/intra/studio/workflow/projects",
        icon: FolderKanban,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
    },
    {
        name: "Automation",
        description: "자동화 규칙을 설정하고 관리합니다.",
        href: "/intra/studio/workflow/automation",
        icon: Zap,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
    },
];

export default function WorkflowDashboard() {
    const { tasks, pipelineItems, projects, automations } = useWorkflow();

    const summaryStats = [
        { label: "Active Tasks", value: tasks.filter(t => t.status !== 'Done').length },
        { label: "Pipeline Items", value: pipelineItems.length },
        { label: "Active Projects", value: projects.filter(p => p.status === 'Active').length },
        { label: "Automations", value: automations.filter(a => a.enabled).length },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Workflow</h2>
                <p className="mt-2 text-zinc-400">프로젝트와 콘텐츠의 전체 작업 흐름을 관리합니다.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryStats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Module Cards */}
            <div className="grid gap-6 sm:grid-cols-2">
                {modules.map((mod) => (
                    <Link
                        key={mod.name}
                        href={mod.href}
                        className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 hover:border-indigo-500/50 transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`rounded-lg ${mod.bgColor} p-3`}>
                                <mod.icon className={`h-6 w-6 ${mod.color}`} />
                            </div>
                            <ArrowRight className="h-5 w-5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-white">{mod.name}</h3>
                        <p className="mt-2 text-sm text-zinc-400">{mod.description}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Tasks */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Recent Tasks</h3>
                    <Link href="/intra/studio/workflow/kanban" className="text-sm text-indigo-400 hover:text-indigo-300">
                        View All
                    </Link>
                </div>
                <ul className="divide-y divide-zinc-800/50">
                    {tasks.slice(0, 5).map((task) => (
                        <li key={task.id} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-white">{task.title}</p>
                                <p className="text-xs text-zinc-500 mt-1">{task.assignee || 'Unassigned'} · {task.brandId}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    task.priority === 'Urgent' ? 'bg-red-500/10 text-red-400' :
                                    task.priority === 'High' ? 'bg-amber-500/10 text-amber-400' :
                                    task.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400' :
                                    'bg-zinc-800 text-zinc-400'
                                }`}>
                                    {task.priority}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400' :
                                    task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                                    task.status === 'Review' ? 'bg-purple-500/10 text-purple-400' :
                                    'bg-zinc-800 text-zinc-400'
                                }`}>
                                    {task.status}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
