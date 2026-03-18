"use client";

import { useState } from "react";
import { WorkflowTask, TaskStatus } from "@/types/workflow";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";

interface KanbanBoardProps {
    tasks: WorkflowTask[];
    onMoveTask: (taskId: string, status: TaskStatus) => void;
    onEditTask: (task: WorkflowTask) => void;
    onNewTask: (status: TaskStatus) => void;
}

const columns: { key: TaskStatus; label: string; color: string; dotColor: string }[] = [
    { key: 'Backlog', label: 'Backlog', color: 'text-zinc-400', dotColor: 'bg-zinc-500' },
    { key: 'Todo', label: 'To Do', color: 'text-blue-400', dotColor: 'bg-blue-500' },
    { key: 'In Progress', label: 'In Progress', color: 'text-amber-400', dotColor: 'bg-amber-500' },
    { key: 'Review', label: 'Review', color: 'text-purple-400', dotColor: 'bg-purple-500' },
    { key: 'Done', label: 'Done', color: 'text-emerald-400', dotColor: 'bg-emerald-500' },
];

export function KanbanBoard({ tasks, onMoveTask, onEditTask, onNewTask }: KanbanBoardProps) {
    const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        setDragOverColumn(null);
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) onMoveTask(taskId, status);
    };

    const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(status);
    };

    const handleDragLeave = () => setDragOverColumn(null);

    return (
        <div className="grid grid-cols-5 gap-4 min-h-[500px]">
            {columns.map((col) => {
                const columnTasks = tasks.filter(t => t.status === col.key);
                const isOver = dragOverColumn === col.key;
                return (
                    <div
                        key={col.key}
                        className={`rounded-xl border bg-zinc-900/30 p-3 transition-all ${
                            isOver ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800'
                        }`}
                        onDrop={(e) => handleDrop(e, col.key)}
                        onDragOver={(e) => handleDragOver(e, col.key)}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                                <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-600">{columnTasks.length}</span>
                                <button
                                    onClick={() => onNewTask(col.key)}
                                    className="p-0.5 rounded text-zinc-600 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {columnTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={onEditTask}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
