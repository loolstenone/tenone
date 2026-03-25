"use client";

import { useState } from "react";
import { useWorkflow } from "@/lib/workflow-context";
import { KanbanBoard } from "@/components/smarcomm/workflow/KanbanBoard";
import { TaskModal } from "@/components/smarcomm/workflow/TaskModal";
import { WorkflowTask, TaskStatus } from "@/types/workflow";
import { workflowChannels } from "@/lib/smarcomm/workflow-data";
import { Plus, Filter } from "lucide-react";
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

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

  const handleNewTask = (status: TaskStatus) => { setEditingTask(null); setNewTaskStatus(status); setIsModalOpen(true); };
  const handleEditTask = (task: WorkflowTask) => { setEditingTask(task); setIsModalOpen(true); };
  const handleSaveTask = (task: WorkflowTask) => { editingTask ? updateTask(task.id, task) : addTask({ ...task, status: newTaskStatus }); };

  const selectClass = "rounded-xl border border-border bg-white px-3 py-2 text-xs text-text focus:border-text focus:outline-none";

  return (
    <div className="max-w-6xl space-y-5">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">칸반 보드</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">드래그앤드롭으로 태스크를 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className={selectClass}>
            <option value="all">전체 채널</option>
            {workflowChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className={selectClass}>
            <option value="all">전체 우선순위</option>
            <option value="Urgent">Urgent</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
          </select>
          <button onClick={() => handleNewTask('Todo')} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub">
            <Plus className="h-3.5 w-3.5" /> 새 태스크
          </button>
        </div>
      </div>
      <KanbanBoard tasks={filteredTasks} onMoveTask={moveTask} onEditTask={handleEditTask} onNewTask={handleNewTask} />
      <TaskModal task={editingTask} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} onSave={handleSaveTask} onDelete={deleteTask} />
    </div>
  );
}
