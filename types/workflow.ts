// === Task / Kanban ===
export type TaskStatus = 'Backlog' | 'Todo' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface WorkflowTask {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: string;
    brandId: string;
    dueDate?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

// === Content Pipeline ===
export type PipelineStage = 'Idea' | 'Scripting' | 'Production' | 'Review' | 'Scheduled' | 'Published';

export interface PipelineItem {
    id: string;
    title: string;
    type: 'Video' | 'Post' | 'Blog' | 'Shorts' | 'Music';
    stage: PipelineStage;
    brandId: string;
    assignee: string;
    dueDate?: string;
    aiGenerated: boolean;
    description: string;
    createdAt: string;
}

// === Brand Project ===
export type ProjectPhase = 'Planning' | 'Development' | 'Review' | 'Launch' | 'Complete';
export type ProjectStatus = 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export interface BrandProject {
    id: string;
    name: string;
    brandId: string;
    description: string;
    status: ProjectStatus;
    phase: ProjectPhase;
    taskIds: string[];
    startDate: string;
    endDate?: string;
    progress: number;
}

// === Automation ===
export type TriggerType = 'task_status_change' | 'new_content' | 'schedule' | 'manual';
export type ActionType = 'move_task' | 'notify' | 'create_task' | 'update_status';

export interface AutomationCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: string;
}

export interface AutomationAction {
    type: ActionType;
    label: string;
    config: Record<string, string>;
}

export interface AutomationTrigger {
    type: TriggerType;
    label: string;
    config: Record<string, string>;
}

export interface AutomationRule {
    id: string;
    name: string;
    description: string;
    trigger: AutomationTrigger;
    conditions: AutomationCondition[];
    actions: AutomationAction[];
    enabled: boolean;
    brandId: string;
    lastTriggered?: string;
    createdAt: string;
}
