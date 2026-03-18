"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WorkflowTask, PipelineItem, BrandProject, AutomationRule, TaskStatus, PipelineStage } from '@/types/workflow';
import { initialTasks, initialPipelineItems, initialProjects, initialAutomations } from '@/lib/workflow-data';

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
    const [tasks, setTasks] = useState<WorkflowTask[]>(initialTasks);
    const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>(initialPipelineItems);
    const [projects, setProjects] = useState<BrandProject[]>(initialProjects);
    const [automations, setAutomations] = useState<AutomationRule[]>(initialAutomations);

    // Tasks
    const addTask = useCallback((task: WorkflowTask) => setTasks(prev => [task, ...prev]), []);
    const updateTask = useCallback((id: string, updates: Partial<WorkflowTask>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : t));
    }, []);
    const moveTask = useCallback((id: string, status: TaskStatus) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString().split('T')[0] } : t));
    }, []);
    const deleteTask = useCallback((id: string) => setTasks(prev => prev.filter(t => t.id !== id)), []);

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

    // Automations
    const addAutomation = useCallback((rule: AutomationRule) => setAutomations(prev => [rule, ...prev]), []);
    const updateAutomation = useCallback((id: string, updates: Partial<AutomationRule>) => {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }, []);
    const toggleAutomation = useCallback((id: string) => {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    }, []);
    const deleteAutomation = useCallback((id: string) => setAutomations(prev => prev.filter(a => a.id !== id)), []);

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
