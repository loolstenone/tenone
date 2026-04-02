/**
 * Workflow Supabase CRUD 함수
 * workflow_tasks, content_pipeline, brand_projects (projects 테이블 활용), workflow_automations
 */
import { createClient } from './client';
import type { WorkflowTask, TaskStatus, TaskPriority, PipelineItem, PipelineStage, BrandProject, ProjectStatus, ProjectPhase, AutomationRule } from '@/types/workflow';

const supabase = createClient();

// ── WorkflowTask ──

const STATUS_MAP: Record<string, TaskStatus> = {
    'backlog': 'Backlog', 'todo': 'Todo', 'in_progress': 'In Progress',
    'review': 'Review', 'done': 'Done',
    'Backlog': 'Backlog', 'Todo': 'Todo', 'In Progress': 'In Progress',
    'Review': 'Review', 'Done': 'Done',
};
const PRIORITY_MAP: Record<string, TaskPriority> = {
    'low': 'Low', 'medium': 'Medium', 'high': 'High', 'urgent': 'Urgent',
    'Low': 'Low', 'Medium': 'Medium', 'High': 'High', 'Urgent': 'Urgent',
};

function rowToTask(r: Record<string, unknown>): WorkflowTask {
    const rawStatus = r.status as string;
    const rawPriority = r.priority as string;
    return {
        id: r.id as string,
        title: (r.title as string) || '',
        description: (r.description as string) || '',
        status: (STATUS_MAP[rawStatus] || 'Backlog') as TaskStatus,
        priority: (PRIORITY_MAP[rawPriority] || 'Medium') as TaskPriority,
        assignee: (r.assignee as string) || '',
        brandId: (r.brand_id as string) || '',
        dueDate: (r.due_date as string)?.split('T')[0] || undefined,
        tags: (r.tags as string[]) || [],
        createdAt: ((r.created_at as string) || '').split('T')[0],
        updatedAt: ((r.updated_at as string) || '').split('T')[0],
    };
}

export async function fetchWorkflowTasks(): Promise<WorkflowTask[]> {
    const { data, error } = await supabase
        .from('workflow_tasks')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r: Record<string, unknown>) => rowToTask(r));
}

export async function createWorkflowTask(task: Partial<WorkflowTask>) {
    const { data, error } = await supabase
        .from('workflow_tasks')
        .insert({
            title: task.title,
            description: task.description,
            status: task.status || 'Todo',
            priority: task.priority || 'Medium',
            assignee: task.assignee,
            brand_id: task.brandId,
            due_date: task.dueDate || null,
            tags: task.tags || [],
        })
        .select()
        .single();
    if (error) throw error;
    return rowToTask(data as Record<string, unknown>);
}

export async function updateWorkflowTask(id: string, updates: Partial<WorkflowTask>) {
    const mapped: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) mapped.title = updates.title;
    if (updates.description !== undefined) mapped.description = updates.description;
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.priority !== undefined) mapped.priority = updates.priority;
    if (updates.assignee !== undefined) mapped.assignee = updates.assignee;
    if (updates.brandId !== undefined) mapped.brand_id = updates.brandId;
    if (updates.dueDate !== undefined) mapped.due_date = updates.dueDate;
    if (updates.tags !== undefined) mapped.tags = updates.tags;

    const { error } = await supabase.from('workflow_tasks').update(mapped).eq('id', id);
    if (error) throw error;
}

export async function deleteWorkflowTask(id: string) {
    const { error } = await supabase.from('workflow_tasks').delete().eq('id', id);
    if (error) throw error;
}

// ── PipelineItem ──

function rowToPipelineItem(r: Record<string, unknown>): PipelineItem {
    return {
        id: r.id as string,
        title: (r.title as string) || '',
        type: ((r.type as string) || 'Post') as PipelineItem['type'],
        stage: ((r.stage as string) || 'Idea') as PipelineStage,
        brandId: (r.brand_id as string) || '',
        assignee: (r.assignee as string) || '',
        dueDate: (r.due_date as string)?.split('T')[0] || undefined,
        aiGenerated: (r.ai_generated as boolean) || false,
        description: (r.description as string) || '',
        createdAt: ((r.created_at as string) || '').split('T')[0],
    };
}

export async function fetchPipelineItems(): Promise<PipelineItem[]> {
    const { data, error } = await supabase
        .from('content_pipeline')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r: Record<string, unknown>) => rowToPipelineItem(r));
}

export async function updatePipelineStage(id: string, stage: PipelineStage) {
    const { error } = await supabase.from('content_pipeline').update({ stage }).eq('id', id);
    if (error) throw error;
}

// ── BrandProject (projects 테이블 활용) ──

function rowToBrandProject(r: Record<string, unknown>): BrandProject {
    return {
        id: r.id as string,
        name: (r.name as string) || '',
        brandId: (r.brand_id as string) || '',
        description: (r.description as string) || '',
        status: ((r.status as string) || 'Active') as ProjectStatus,
        phase: ((r.phase as string) || 'Planning') as ProjectPhase,
        taskIds: (r.task_ids as string[]) || [],
        startDate: ((r.start_date as string) || '').split('T')[0],
        endDate: (r.end_date as string)?.split('T')[0] || undefined,
        progress: (r.progress as number) || 0,
    };
}

export async function fetchBrandProjects(): Promise<BrandProject[]> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r: Record<string, unknown>) => rowToBrandProject(r));
}

// ── AutomationRule ──

function rowToAutomation(r: Record<string, unknown>): AutomationRule {
    return {
        id: r.id as string,
        name: (r.name as string) || '',
        description: (r.description as string) || '',
        trigger: (r.trigger as AutomationRule['trigger']) || { type: 'manual', label: '', config: {} },
        conditions: (r.conditions as AutomationRule['conditions']) || [],
        actions: (r.actions as AutomationRule['actions']) || [],
        enabled: (r.enabled as boolean) ?? true,
        brandId: (r.brand_id as string) || '',
        lastTriggered: (r.last_triggered as string)?.split('T')[0] || undefined,
        createdAt: ((r.created_at as string) || '').split('T')[0],
    };
}

export async function fetchAutomations(): Promise<AutomationRule[]> {
    const { data, error } = await supabase
        .from('workflow_automations')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r: Record<string, unknown>) => rowToAutomation(r));
}

export async function toggleAutomationEnabled(id: string, enabled: boolean) {
    const { error } = await supabase.from('workflow_automations').update({ enabled }).eq('id', id);
    if (error) throw error;
}
