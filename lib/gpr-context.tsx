"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { GprGoal, GoalStatus, EvaluationRating } from '@/types/gpr';
import { initialGprGoals } from '@/lib/gpr-data';
import { isMockAllowed } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';

interface GprContextType {
    goals: GprGoal[];
    loading: boolean;
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

/** gpr_goals row → GprGoal 변환 */
function rowToGoal(r: Record<string, unknown>): GprGoal {
    return {
        id: r.id as string,
        staffId: (r.member_id as string) || (r.staff_id as string) || '',
        title: (r.title as string) || '',
        description: (r.description as string) || '',
        category: (r.category as string) || 'Performance',
        weight: (r.weight as number) || 0,
        target: (r.target as string) || '',
        metric: (r.metric as string) || '',
        period: (r.quarter as string) || (r.period as string) || '',
        status: (r.status as GoalStatus) || 'Draft',
        progress: (r.progress as number) || 0,
        selfRating: r.self_rating as EvaluationRating | undefined,
        selfComment: r.self_comment as string | undefined,
        selfEvaluatedAt: r.self_evaluated_at as string | undefined,
        supervisorRating: r.supervisor_rating as EvaluationRating | undefined,
        supervisorComment: r.supervisor_comment as string | undefined,
        supervisorId: r.supervisor_id as string | undefined,
        evaluatedAt: r.evaluated_at as string | undefined,
        agreedBy: r.agreed_by as string | undefined,
        agreedAt: r.agreed_at as string | undefined,
        createdAt: ((r.created_at as string) || '').split('T')[0],
        updatedAt: ((r.updated_at as string) || '').split('T')[0],
    };
}

export function GprProvider({ children }: { children: ReactNode }) {
    const [goals, setGoals] = useState<GprGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const now = () => new Date().toISOString().split('T')[0];

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('gpr_goals')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (!cancelled) {
                    setGoals((data || []).map(rowToGoal));
                }
            } catch {
                if (!cancelled && isMockAllowed()) {
                    setGoals(initialGprGoals);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

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
        <GprContext.Provider value={{ goals, loading, addGoal, updateGoal, deleteGoal, submitForApproval, agreeGoal, selfEvaluate, supervisorEvaluate, getGoalsByStaff }}>
            {children}
        </GprContext.Provider>
    );
}

export function useGpr() {
    const context = useContext(GprContext);
    if (!context) throw new Error('useGpr must be used within GprProvider');
    return context;
}
