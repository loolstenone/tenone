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

const columns: { key: TaskStatus; label: string; dotColor: string }[] = [
  { key: 'Backlog', label: 'Backlog', dotColor: 'bg-text-muted/40' },
  { key: 'Todo', label: 'To Do', dotColor: 'bg-text-muted' },
  { key: 'In Progress', label: 'In Progress', dotColor: 'bg-amber-500' },
  { key: 'Review', label: 'Review', dotColor: 'bg-text-sub' },
  { key: 'Done', label: 'Done', dotColor: 'bg-emerald-500' },
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

  return (
    <div className="grid grid-cols-5 gap-3 min-h-[500px]">
      {columns.map((col) => {
        const columnTasks = tasks.filter(t => t.status === col.key);
        const isOver = dragOverColumn === col.key;
        return (
          <div
            key={col.key}
            className={`rounded-2xl border p-3 transition-all ${isOver ? 'border-text-muted bg-surface/80' : 'border-border bg-surface/40'}`}
            onDrop={(e) => handleDrop(e, col.key)}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={() => setDragOverColumn(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                <h3 className="text-xs font-semibold text-text-sub">{col.label}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted">{columnTasks.length}</span>
                <button onClick={() => onNewTask(col.key)} className="p-0.5 rounded text-text-muted hover:text-text hover:bg-surface transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={onEditTask} onDragStart={handleDragStart} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
