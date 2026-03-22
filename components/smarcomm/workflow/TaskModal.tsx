"use client";

import { useState, useEffect } from "react";
import { WorkflowTask, TaskStatus, TaskPriority } from "@/types/workflow";
import { workflowChannels } from "@/lib/smarcomm/workflow-data";
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
    title: '', description: '', status: 'Todo' as TaskStatus, priority: 'Medium' as TaskPriority,
    assignee: '', brandId: '', dueDate: '', tags: '',
  });

  useEffect(() => {
    if (task) {
      setForm({ title: task.title, description: task.description, status: task.status, priority: task.priority, assignee: task.assignee, brandId: task.brandId, dueDate: task.dueDate ?? '', tags: task.tags.join(', ') });
    } else {
      setForm({ title: '', description: '', status: 'Todo', priority: 'Medium', assignee: '', brandId: '', dueDate: '', tags: '' });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!task;
  const inputClass = "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-text focus:outline-none";
  const labelClass = "block text-xs text-text-muted mb-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().split('T')[0];
    onSave({
      id: task?.id ?? `t${Date.now()}`, title: form.title, description: form.description,
      status: form.status, priority: form.priority, assignee: form.assignee, brandId: form.brandId,
      dueDate: form.dueDate || undefined, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: task?.createdAt ?? now, updatedAt: now,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-text">{isEditing ? '태스크 수정' : '새 태스크'}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className={labelClass}>제목</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={inputClass} /></div>
          <div><label className={labelClass}>설명</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputClass} resize-none`} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>상태</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })} className={inputClass}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className={labelClass}>우선순위</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })} className={inputClass}>{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>채널</label><select value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })} className={inputClass}><option value="">선택</option>{workflowChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className={labelClass}>담당자</label><input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>마감일</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>태그 (쉼표 구분)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="카피, SA" className={inputClass} /></div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            {isEditing && onDelete ? (
              <button type="button" onClick={() => { onDelete(task!.id); onClose(); }} className="text-xs text-danger hover:text-red-600">삭제</button>
            ) : <div />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text">취소</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-text text-sm font-semibold text-white hover:bg-accent-sub">{isEditing ? '저장' : '생성'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
