"use client";

import { useState, useEffect } from "react";
import { fetchWorkflowTasks, createWorkflowTask, updateWorkflowTask, deleteWorkflowTask } from "@/lib/supabase/workflow";
import { initialTasks } from "@/lib/workflow-data";
import { KanbanBoard } from "@/components/workflow/KanbanBoard";
import { TaskModal } from "@/components/workflow/TaskModal";
import { WorkflowTask, TaskStatus } from "@/types/workflow";
import { brands } from "@/lib/data";
import { Plus, Filter, Loader2 } from "lucide-react";

export default function KanbanPage() {
    const [tasks, setTasks] = useState<WorkflowTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTask, setEditingTask] = useState<WorkflowTask | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('Todo');
    const [brandFilter, setBrandFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    useEffect(() => {
        let cancelled = false;
        fetchWorkflowTasks()
            .then(t => { if (!cancelled) setTasks(t.length > 0 ? t : initialTasks); })
            .catch(() => { if (!cancelled) setTasks(initialTasks); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const moveTask = (id: string, status: TaskStatus) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString().split('T')[0] } : t));
        updateWorkflowTask(id, { status }).catch(() => {});
    };

    const addTask = (task: WorkflowTask) => {
        setTasks(prev => [task, ...prev]);
        createWorkflowTask(task).catch(() => {});
    };

    const handleUpdateTask = (id: string, updates: Partial<WorkflowTask>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : t));
        updateWorkflowTask(id, updates).catch(() => {});
    };

    const handleDeleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        deleteWorkflowTask(id).catch(() => {});
    };

    const filteredTasks = tasks.filter(t => {
        if (brandFilter !== 'all' && t.brandId !== brandFilter) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        return true;
    });

    const handleNewTask = (status: TaskStatus) => {
        setEditingTask(null);
        setNewTaskStatus(status);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: WorkflowTask) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = (task: WorkflowTask) => {
        if (editingTask) {
            handleUpdateTask(task.id, task);
        } else {
            addTask({ ...task, status: newTaskStatus });
        }
    };

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-neutral-900">Kanban Board</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">드래그앤드롭으로 태스크를 관리합니다.</p>
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
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                    >
                        <option value="all">All Priority</option>
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <button
                        onClick={() => handleNewTask('Todo')}
                        className="flex items-center gap-2 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        New Task
                    </button>
                </div>
            </div>

            <KanbanBoard
                tasks={filteredTasks}
                onMoveTask={moveTask}
                onEditTask={handleEditTask}
                onNewTask={handleNewTask}
            />

            <TaskModal
                task={editingTask}
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
}
