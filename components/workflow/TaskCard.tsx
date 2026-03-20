"use client";

import { WorkflowTask } from "@/types/workflow";
import { brands } from "@/lib/data";
import { Calendar, User, GripVertical } from "lucide-react";

interface TaskCardProps {
    task: WorkflowTask;
    onEdit?: (task: WorkflowTask) => void;
    onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

const priorityStyles: Record<string, string> = {
    Urgent: 'border-l-red-500',
    High: 'border-l-amber-500',
    Medium: 'border-l-neutral-400',
    Low: 'border-l-neutral-300',
};

export function TaskCard({ task, onEdit, onDragStart }: TaskCardProps) {
    const brandName = brands.find(b => b.id === task.brandId)?.name ?? task.brandId;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart?.(e, task.id)}
            onClick={() => onEdit?.(task)}
            className={`group rounded-lg border border-neutral-200 border-l-2 ${priorityStyles[task.priority]} bg-white p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-neutral-300 transition-all`}
        >
            <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-neutral-900 leading-tight pr-2">{task.title}</p>
                <GripVertical className="h-4 w-4 text-neutral-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between mt-2.5">
                <span className="text-xs text-neutral-600 font-medium">{brandName}</span>
                <div className="flex items-center gap-2">
                    {task.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <Calendar className="h-3 w-3" />
                            {task.dueDate}
                        </span>
                    )}
                    {task.assignee && (
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <User className="h-3 w-3" />
                            {task.assignee.split(' ')[0]}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
