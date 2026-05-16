"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { WorkflowTask, PipelineItem, BrandProject, AutomationRule, TaskStatus, PipelineStage } from '@/types/workflow';
import { initialTasks, initialPipelineItems, initialProjects, initialAutomations } from '@/lib/workflow-data';
import { isMockAllowed } from '@/lib/env';

interface WorkflowContextType {
    // Tasks
    tasks: WorkflowTask[];
    addTask: (task: WorkflowTask) => void;
    updateTask: (id: string, updates: Partial<WorkflowTask>) => void;
    moveTask: (id: string, status: TaskStatus) => void;
    deleteTask: (id: string) => void;

    // Pipeline
    pipelineItems: PipelineItem[];
    addPipelineItem: (item: PipelineItem) => void;
    updatePipelineItem: (id: string, updates: Partial<PipelineItem>) => void;
    movePipelineItem: (id: string, stage: PipelineStage) => void;

    // Projects
    projects: BrandProject[];
    addProject: (project: BrandProject) => void;
    updateProject: (id: string, updates: Partial<BrandProject>) => void;

    // Automations
    automations: AutomationRule[];
    addAutomation: (rule: AutomationRule) => void;
    updateAutomation: (id: string, updates: Partial<AutomationRule>) => void;
    toggleAutomation: (id: string) => void;
    deleteAutomation: (id: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
    const mockOk = isMockAllowed();
    const [tasks, setTasks] = useState<WorkflowTask[]>([]);
    const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>(mockOk ? initialPipelineItems : []);
    const [projects, setProjects] = useState<BrandProject[]>(mockOk ? initialProjects : []);
    const [automations, setAutomations] = useState<AutomationRule[]>(mockOk ? initialAutomations : []);

    // Tasks: DB 동기화 (workflow_tasks 테이블)
    useEffect(() => {
        let cancelled = false;
        fetch('/api/smarcomm/workflow/tasks')
            .then(r => r.json())
            .then(res => {
                if (cancelled) return;
                if (Array.isArray(res?.tasks)) setTasks(res.tasks);
                else if (mockOk) setTasks(initialTasks);
            })
            .catch(() => { if (!cancelled && mockOk) setTasks(initialTasks); });
        return () => { cancelled = true; };
    }, [mockOk]);

    const addTask = useCallback(async (task: WorkflowTask) => {
        setTasks(prev => [task, ...prev]);
        try {
            const res = await fetch('/api/smarcomm/workflow/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            const json = await res.json();
            if (json?.task) setTasks(prev => prev.map(t => t.id === task.id ? json.task : t));
        } catch { /* keep local */ }
    }, []);
    const updateTask = useCallback((id: string, updates: Partial<WorkflowTask>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : t));
        fetch('/api/smarcomm/workflow/tasks', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        }).catch(() => { });
    }, []);
    const moveTask = useCallback((id: string, status: TaskStatus) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString().split('T')[0] } : t));
        fetch('/api/smarcomm/workflow/tasks', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
        }).catch(() => { });
    }, []);
    const deleteTask = useCallback((id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        fetch(`/api/smarcomm/workflow/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => { });
    }, []);

    // Pipeline
    const addPipelineItem = useCallback((item: PipelineItem) => setPipelineItems(prev => [item, ...prev]), []);
    const updatePipelineItem = useCallback((id: string, updates: Partial<PipelineItem>) => {
        setPipelineItems(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);
    const movePipelineItem = useCallback((id: string, stage: PipelineStage) => {
        setPipelineItems(prev => prev.map(p => p.id === id ? { ...p, stage } : p));
    }, []);

    // Projects
    const addProject = useCallback((project: BrandProject) => setProjects(prev => [project, ...prev]), []);
    const updateProject = useCallback((id: string, updates: Partial<BrandProject>) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    // Automations: DB 동기화 (workflow_automations 테이블)
    useEffect(() => {
        let cancelled = false;
        fetch('/api/smarcomm/workflow/automations')
            .then(r => r.json())
            .then(res => {
                if (cancelled) return;
                if (Array.isArray(res?.automations)) setAutomations(res.automations);
                else if (mockOk) setAutomations(initialAutomations);
            })
            .catch(() => { if (!cancelled && mockOk) setAutomations(initialAutomations); });
        return () => { cancelled = true; };
    }, [mockOk]);

    const addAutomation = useCallback(async (rule: AutomationRule) => {
        setAutomations(prev => [rule, ...prev]);
        try {
            const res = await fetch('/api/smarcomm/workflow/automations', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule),
            });
            const json = await res.json();
            if (json?.automation) setAutomations(prev => prev.map(a => a.id === rule.id ? json.automation : a));
        } catch { /* keep local */ }
    }, []);
    const updateAutomation = useCallback((id: string, updates: Partial<AutomationRule>) => {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
        fetch('/api/smarcomm/workflow/automations', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        }).catch(() => { });
    }, []);
    const toggleAutomation = useCallback((id: string) => {
        setAutomations(prev => {
            const target = prev.find(a => a.id === id);
            if (!target) return prev;
            const next = !target.enabled;
            fetch('/api/smarcomm/workflow/automations', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, enabled: next }),
            }).catch(() => { });
            return prev.map(a => a.id === id ? { ...a, enabled: next } : a);
        });
    }, []);
    const deleteAutomation = useCallback((id: string) => {
        setAutomations(prev => prev.filter(a => a.id !== id));
        fetch(`/api/smarcomm/workflow/automations?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => { });
    }, []);

    return (
        <WorkflowContext.Provider value={{
            tasks, addTask, updateTask, moveTask, deleteTask,
            pipelineItems, addPipelineItem, updatePipelineItem, movePipelineItem,
            projects, addProject, updateProject,
            automations, addAutomation, updateAutomation, toggleAutomation, deleteAutomation,
        }}>
            {children}
        </WorkflowContext.Provider>
    );
}

export function useWorkflow() {
    const context = useContext(WorkflowContext);
    if (!context) throw new Error('useWorkflow must be used within WorkflowProvider');
    return context;
}
