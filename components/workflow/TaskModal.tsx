"use client";

import { useState, useEffect } from "react";
import { WorkflowTask, TaskStatus, TaskPriority } from "@/types/workflow";
import { brands } from "@/lib/data";
import { X } from "lucide-react";

interface TaskModalProps {
    task?: WorkflowTask | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: WorkflowTask) => void;
    onDelete?: (id: string) => void;
}

const statuses: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export function TaskModal({ task, isOpen, onClose, onSave, onDelete }: TaskModalProps) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'Todo' as TaskStatus,
        priority: 'Medium' as TaskPriority,
        assignee: '',
        brandId: '',
        dueDate: '',
        tags: '',
    });

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                assignee: task.assignee,
                brandId: task.brandId,
                dueDate: task.dueDate ?? '',
                tags: task.tags.join(', '),
            });
        } else {
            setForm({ title: '', description: '', status: 'Todo', priority: 'Medium', assignee: '', brandId: '', dueDate: '', tags: '' });
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const isEditing = !!task;
    const inputClass = "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";
    const labelClass = "block text-sm text-neutral-500 mb-1";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date().toISOString().split('T')[0];
        const savedTask: WorkflowTask = {
            id: task?.id ?? `t${Date.now()}`,
            title: form.title,
            description: form.description,
            status: form.status,
            priority: form.priority,
            assignee: form.assignee,
            brandId: form.brandId,
            dueDate: form.dueDate || undefined,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            createdAt: task?.createdAt ?? now,
            updatedAt: now,
        };
        onSave(savedTask);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900">
                        {isEditing ? 'Edit Task' : 'New Task'}
                    </h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })} className={inputClass}>
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Priority</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })} className={inputClass}>
                                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Brand</label>
                            <select value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })} className={inputClass}>
                                <option value="">Select Brand</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Assignee</label>
                            <input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} className={inputClass} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Due Date</label>
                            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Tags (comma separated)</label>
                            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="e.g. Creative, MV" className={inputClass} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                        {isEditing && onDelete ? (
                            <button type="button" onClick={() => { onDelete(task!.id); onClose(); }} className="text-sm text-red-500 hover:text-red-600 transition-colors">
                                Delete Task
                            </button>
                        ) : <div />}
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                                {isEditing ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
