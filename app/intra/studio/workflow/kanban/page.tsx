"use client";

import { useState } from "react";
import { useWorkflow } from "@/lib/workflow-context";
import { KanbanBoard } from "@/components/workflow/KanbanBoard";
import { TaskModal } from "@/components/workflow/TaskModal";
import { WorkflowTask, TaskStatus } from "@/types/workflow";
import { brands } from "@/lib/data";
import { Plus, Filter } from "lucide-react";

export default function KanbanPage() {
    const { tasks, moveTask, addTask, updateTask, deleteTask } = useWorkflow();
    const [editingTask, setEditingTask] = useState<WorkflowTask | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('Todo');
    const [brandFilter, setBrandFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

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
            updateTask(task.id, task);
        } else {
            addTask({ ...task, status: newTaskStatus });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Kanban Board</h2>
                    <p className="mt-2 text-neutral-500">드래그앤드롭으로 태스크를 관리합니다.</p>
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
                onDelete={deleteTask}
            />
        </div>
    );
}
