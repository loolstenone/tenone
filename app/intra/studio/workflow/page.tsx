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
    },
    {
        name: "Kanban Board",
        description: "드래그앤드롭으로 태스크를 관리합니다.",
        href: "/intra/studio/workflow/kanban",
        icon: KanbanSquare,
    },
    {
        name: "Brand Projects",
        description: "브랜드별 프로젝트 진행 현황을 관리합니다.",
        href: "/intra/studio/workflow/projects",
        icon: FolderKanban,
    },
    {
        name: "Automation",
        description: "자동화 규칙을 설정하고 관리합니다.",
        href: "/intra/studio/workflow/automation",
        icon: Zap,
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
                <h2 className="text-xl font-bold">Workflow</h2>
                <p className="mt-2 text-neutral-500">프로젝트와 콘텐츠의 전체 작업 흐름을 관리합니다.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryStats.map((stat) => (
                    <div key={stat.label} className="border border-neutral-200 bg-white p-4 text-center">
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm text-neutral-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Module Cards */}
            <div className="grid gap-6 sm:grid-cols-2">
                {modules.map((mod) => (
                    <Link
                        key={mod.name}
                        href={mod.href}
                        className="group border border-neutral-200 bg-white p-6 hover:border-neutral-900 transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="bg-neutral-100 p-3">
                                <mod.icon className="h-6 w-6 text-neutral-500" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">{mod.name}</h3>
                        <p className="mt-2 text-sm text-neutral-500">{mod.description}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Tasks */}
            <div className="border border-neutral-200 bg-white">
                <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
                    <h3 className="text-lg font-medium">Recent Tasks</h3>
                    <Link href="/intra/studio/workflow/kanban" className="text-sm text-neutral-500 hover:text-neutral-900">
                        View All
                    </Link>
                </div>
                <ul className="divide-y divide-neutral-100">
                    {tasks.slice(0, 5).map((task) => (
                        <li key={task.id} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{task.title}</p>
                                <p className="text-xs text-neutral-400 mt-1">{task.assignee || 'Unassigned'} · {task.brandId}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">
                                    {task.priority}
                                </span>
                                <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">
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
