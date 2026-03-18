"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GprGoal, GoalStatus, EvaluationRating } from '@/types/gpr';
import { initialGprGoals } from '@/lib/gpr-data';

interface GprContextType {
    goals: GprGoal[];
    addGoal: (goal: GprGoal) => void;
    updateGoal: (id: string, updates: Partial<GprGoal>) => void;
    deleteGoal: (id: string) => void;
    submitForApproval: (id: string) => void;
    agreeGoal: (id: string, supervisorId: string) => void;
    selfEvaluate: (id: string, rating: EvaluationRating, comment: string) => void;
    supervisorEvaluate: (id: string, supervisorId: string, rating: EvaluationRating, comment: string) => void;
    getGoalsByStaff: (staffId: string) => GprGoal[];
}

const GprContext = createContext<GprContextType | undefined>(undefined);

export function GprProvider({ children }: { children: ReactNode }) {
    const [goals, setGoals] = useState<GprGoal[]>(initialGprGoals);
    const now = () => new Date().toISOString().split('T')[0];

    const addGoal = useCallback((goal: GprGoal) => setGoals(prev => [goal, ...prev]), []);
    const updateGoal = useCallback((id: string, updates: Partial<GprGoal>) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: now() } : g));
    }, []);
    const deleteGoal = useCallback((id: string) => setGoals(prev => prev.filter(g => g.id !== id)), []);

    const submitForApproval = useCallback((id: string) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, status: 'Pending Approval' as GoalStatus, updatedAt: now() } : g));
    }, []);

    const agreeGoal = useCallback((id: string, supervisorId: string) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, status: 'Agreed' as GoalStatus, agreedBy: supervisorId, agreedAt: now(), updatedAt: now() } : g));
    }, []);

    const selfEvaluate = useCallback((id: string, rating: EvaluationRating, comment: string) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, status: 'Self Evaluated' as GoalStatus, selfRating: rating, selfComment: comment, selfEvaluatedAt: now(), updatedAt: now() } : g));
    }, []);

    const supervisorEvaluate = useCallback((id: string, supervisorId: string, rating: EvaluationRating, comment: string) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, status: 'Evaluated' as GoalStatus, supervisorRating: rating, supervisorComment: comment, supervisorId, evaluatedAt: now(), updatedAt: now() } : g));
    }, []);

    const getGoalsByStaff = useCallback((staffId: string) => goals.filter(g => g.staffId === staffId), [goals]);

    return (
        <GprContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, submitForApproval, agreeGoal, selfEvaluate, supervisorEvaluate, getGoalsByStaff }}>
            {children}
        </GprContext.Provider>
    );
}

export function useGpr() {
    const context = useContext(GprContext);
    if (!context) throw new Error('useGpr must be used within GprProvider');
    return context;
}
