"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { PointLog, MemberPointSummary, PointCategory } from '@/types/point';
import { getGradeByPoints, defaultPointValues } from '@/types/point';
import { isMockAllowed } from '@/lib/env';
import { initialPointLogs, initialMemberPoints } from '@/lib/point-data';
import { createClient } from '@/lib/supabase/client';

// PointCategory → UC action_key 매핑
const CATEGORY_TO_ACTION: Record<PointCategory, string> = {
    project_complete:    'project_complete',
    job_complete:        'job_complete',
    education_complete:  'education_complete',
    gpr_evaluation:      'gpr_evaluation',
    community_activity:  'community_activity',
    attendance_bonus:    'attendance_bonus',
    mentor_bonus:        'mentor_bonus',
    event_participation: 'event_participation',
    admin_adjust:        'admin_grant',
    penalty:             'admin_deduct',
};

interface PointContextType {
    logs: PointLog[];
    memberPoints: MemberPointSummary[];
    awardPoints: (params: {
        memberId: string;
        memberName: string;
        category: PointCategory;
        points?: number;
        description: string;
        referenceId?: string;
        referenceType?: PointLog['referenceType'];
        createdBy?: string;
    }) => Promise<void>;
    adjustPoints: (memberId: string, memberName: string, points: number, description: string, createdBy: string) => Promise<void>;
    onProjectComplete: (projectName: string, projectId: string, members: { id: string; name: string }[]) => void;
    onJobComplete: (jobName: string, jobId: string, assigneeId: string, assigneeName: string) => void;
    onEducationComplete: (courseName: string, courseId: string, memberId: string, memberName: string) => void;
    getLogsByMember: (memberId: string) => PointLog[];
    getMemberSummary: (memberId: string) => MemberPointSummary | undefined;
    getLeaderboard: () => MemberPointSummary[];
    reload: () => void;
}

const PointContext = createContext<PointContextType | undefined>(undefined);

export function PointProvider({ children }: { children: ReactNode }) {
    const mockOk = isMockAllowed();
    const [logs, setLogs] = useState<PointLog[]>(mockOk ? initialPointLogs : []);
    const [memberPoints, setMemberPoints] = useState<MemberPointSummary[]>(mockOk ? initialMemberPoints : []);

    const loadFromUC = useCallback(async () => {
        try {
            const supabase = createClient();

            // uc_balances + members 조인 — grade는 lifetime_earned 기준
            const { data: balances } = await supabase
                .from('uc_balances')
                .select('member_id, balance, lifetime_earned, members!inner(name, department, position)')
                .order('lifetime_earned', { ascending: false });

            if (balances && balances.length > 0) {
                const now = new Date();
                const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

                const { data: monthTx } = await supabase
                    .from('uc_transactions')
                    .select('member_id, amount, type')
                    .eq('type', 'earn')
                    .gte('created_at', monthStart);

                const monthMap: Record<string, number> = {};
                (monthTx || []).forEach((t: Record<string, unknown>) => {
                    monthMap[t.member_id as string] = (monthMap[t.member_id as string] || 0) + (t.amount as number);
                });

                setMemberPoints(balances.map((b: Record<string, unknown>) => {
                    const m = b.members as { name: string; department?: string; position?: string } | null;
                    const lifetime = (b.lifetime_earned as number) || 0;
                    return {
                        memberId: b.member_id as string,
                        memberName: m?.name ?? '—',
                        department: m?.department ?? '-',
                        position: m?.position ?? '-',
                        totalPoints: lifetime,
                        grade: getGradeByPoints(lifetime),
                        thisMonthPoints: monthMap[b.member_id as string] || 0,
                        thisQuarterPoints: 0,
                        lastActivity: '-',
                    };
                }));
            }

            // 최근 UC 트랜잭션 100건 → PointLog 형태로 매핑
            const { data: txs } = await supabase
                .from('uc_transactions')
                .select('id, member_id, type, amount, action_key, note, reference_id, created_at, members!inner(name)')
                .order('created_at', { ascending: false })
                .limit(100);

            if (txs && txs.length > 0) {
                setLogs(txs.map((t: Record<string, unknown>) => {
                    const m = t.members as { name: string } | null;
                    const isEarn = t.type === 'earn';
                    return {
                        id: t.id as string,
                        memberId: t.member_id as string,
                        memberName: m?.name ?? '—',
                        category: ((t.action_key as string) || 'admin_adjust') as PointCategory,
                        points: isEarn ? (t.amount as number) : -(t.amount as number),
                        balance: 0,
                        description: (t.note as string) || (t.action_key as string),
                        referenceId: t.reference_id as string | undefined,
                        createdAt: ((t.created_at as string) || '').split('T')[0],
                        createdBy: '시스템',
                    };
                }));
            }
        } catch (err) {
            console.warn('[Points] UC 로드 실패, Mock 유지:', err);
        }
    }, []);

    useEffect(() => { loadFromUC(); }, [loadFromUC]);

    const awardPoints = useCallback(async ({ memberId, category, points, description }: Parameters<PointContextType['awardPoints']>[0]) => {
        const amount = Math.abs(points ?? defaultPointValues[category]);
        const actionKey = CATEGORY_TO_ACTION[category];
        const isDeduct = category === 'penalty' || (points !== undefined && points < 0);

        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            await fetch('/api/uc/admin/grant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    member_id: memberId,
                    action_key: isDeduct ? 'admin_deduct' : actionKey,
                    amount,
                    note: description,
                }),
            });
            await loadFromUC();
        } catch (err) {
            console.error('[Points] UC 지급 실패:', err);
        }
    }, [loadFromUC]);

    const adjustPoints = useCallback(async (memberId: string, memberName: string, points: number, description: string) => {
        await awardPoints({
            memberId, memberName,
            category: points >= 0 ? 'admin_adjust' : 'penalty',
            points,
            description,
        });
    }, [awardPoints]);

    const onProjectComplete = useCallback((projectName: string, projectId: string, members: { id: string; name: string }[]) => {
        members.forEach(m => {
            awardPoints({ memberId: m.id, memberName: m.name, category: 'project_complete', description: `${projectName} 프로젝트 완료`, referenceId: projectId });
        });
    }, [awardPoints]);

    const onJobComplete = useCallback((jobName: string, jobId: string, assigneeId: string, assigneeName: string) => {
        awardPoints({ memberId: assigneeId, memberName: assigneeName, category: 'job_complete', description: `${jobName} Job 완료`, referenceId: jobId });
    }, [awardPoints]);

    const onEducationComplete = useCallback((courseName: string, courseId: string, memberId: string, memberName: string) => {
        awardPoints({ memberId, memberName, category: 'education_complete', description: `${courseName} 수료`, referenceId: courseId });
    }, [awardPoints]);

    const getLogsByMember = useCallback((memberId: string) => logs.filter(l => l.memberId === memberId), [logs]);
    const getMemberSummary = useCallback((memberId: string) => memberPoints.find(m => m.memberId === memberId), [memberPoints]);
    const getLeaderboard = useCallback(() => [...memberPoints].sort((a, b) => b.totalPoints - a.totalPoints), [memberPoints]);

    return (
        <PointContext.Provider value={{ logs, memberPoints, awardPoints, adjustPoints, onProjectComplete, onJobComplete, onEducationComplete, getLogsByMember, getMemberSummary, getLeaderboard, reload: loadFromUC }}>
            {children}
        </PointContext.Provider>
    );
}

export function usePoints() {
    const context = useContext(PointContext);
    if (!context) throw new Error('usePoints must be used within PointProvider');
    return context;
}
