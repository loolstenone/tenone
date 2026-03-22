"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { PointLog, MemberPointSummary, PointCategory } from '@/types/point';
import { getGradeByPoints, defaultPointValues } from '@/types/point';
import { initialPointLogs, initialMemberPoints } from '@/lib/point-data';

interface PointContextType {
    logs: PointLog[];
    memberPoints: MemberPointSummary[];
    // 포인트 부여
    awardPoints: (params: {
        memberId: string;
        memberName: string;
        category: PointCategory;
        points?: number; // 미입력 시 기본값 사용
        description: string;
        referenceId?: string;
        referenceType?: PointLog['referenceType'];
        createdBy?: string;
    }) => void;
    // 관리자 조정
    adjustPoints: (memberId: string, memberName: string, points: number, description: string, createdBy: string) => void;
    // 자동 부여 (프로젝트/Job/교육 완료 시 호출)
    onProjectComplete: (projectName: string, projectId: string, members: { id: string; name: string }[]) => void;
    onJobComplete: (jobName: string, jobId: string, assigneeId: string, assigneeName: string) => void;
    onEducationComplete: (courseName: string, courseId: string, memberId: string, memberName: string) => void;
    // 조회
    getLogsByMember: (memberId: string) => PointLog[];
    getMemberSummary: (memberId: string) => MemberPointSummary | undefined;
    getLeaderboard: () => MemberPointSummary[];
}

const PointContext = createContext<PointContextType | undefined>(undefined);

export function PointProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<PointLog[]>(initialPointLogs);
    const [memberPoints, setMemberPoints] = useState<MemberPointSummary[]>(initialMemberPoints);

    const updateMemberSummary = useCallback((memberId: string, memberName: string, points: number, department?: string, position?: string) => {
        setMemberPoints(prev => {
            const existing = prev.find(m => m.memberId === memberId);
            if (existing) {
                const newTotal = existing.totalPoints + points;
                return prev.map(m => m.memberId === memberId ? {
                    ...m,
                    totalPoints: newTotal,
                    grade: getGradeByPoints(newTotal),
                    thisMonthPoints: m.thisMonthPoints + points,
                    thisQuarterPoints: m.thisQuarterPoints + points,
                    lastActivity: new Date().toISOString().split('T')[0],
                } : m);
            }
            // 새 멤버
            const newTotal = Math.max(0, points);
            return [...prev, {
                memberId, memberName,
                department: department || '-',
                position: position || '-',
                totalPoints: newTotal,
                grade: getGradeByPoints(newTotal),
                thisMonthPoints: points,
                thisQuarterPoints: points,
                lastActivity: new Date().toISOString().split('T')[0],
            }];
        });
    }, []);

    const awardPoints = useCallback(({ memberId, memberName, category, points, description, referenceId, referenceType, createdBy }: Parameters<PointContextType['awardPoints']>[0]) => {
        const awardAmount = points ?? defaultPointValues[category];
        const existing = memberPoints.find(m => m.memberId === memberId);
        const currentBalance = existing?.totalPoints ?? 0;
        const newBalance = currentBalance + awardAmount;

        const log: PointLog = {
            id: `PL-${Date.now()}`,
            memberId, memberName, category,
            points: awardAmount,
            balance: newBalance,
            description,
            referenceId, referenceType,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: createdBy || '시스템',
        };

        setLogs(prev => [log, ...prev]);
        updateMemberSummary(memberId, memberName, awardAmount);
    }, [memberPoints, updateMemberSummary]);

    const adjustPoints = useCallback((memberId: string, memberName: string, points: number, description: string, createdBy: string) => {
        awardPoints({
            memberId, memberName,
            category: points >= 0 ? 'admin_adjust' : 'penalty',
            points,
            description,
            createdBy,
        });
    }, [awardPoints]);

    // 프로젝트 완료 시 자동 포인트 부여 (투입 멤버 전원)
    const onProjectComplete = useCallback((projectName: string, projectId: string, members: { id: string; name: string }[]) => {
        members.forEach(m => {
            awardPoints({
                memberId: m.id, memberName: m.name,
                category: 'project_complete',
                description: `${projectName} 프로젝트 완료`,
                referenceId: projectId, referenceType: 'project',
            });
        });
    }, [awardPoints]);

    // Job 완료 시 자동 포인트 부여
    const onJobComplete = useCallback((jobName: string, jobId: string, assigneeId: string, assigneeName: string) => {
        awardPoints({
            memberId: assigneeId, memberName: assigneeName,
            category: 'job_complete',
            description: `${jobName} Job 완료`,
            referenceId: jobId, referenceType: 'job',
        });
    }, [awardPoints]);

    // 교육 이수 시 자동 포인트 부여
    const onEducationComplete = useCallback((courseName: string, courseId: string, memberId: string, memberName: string) => {
        awardPoints({
            memberId, memberName,
            category: 'education_complete',
            description: `${courseName} 수료`,
            referenceId: courseId, referenceType: 'course',
        });
    }, [awardPoints]);

    const getLogsByMember = useCallback((memberId: string) => logs.filter(l => l.memberId === memberId), [logs]);
    const getMemberSummary = useCallback((memberId: string) => memberPoints.find(m => m.memberId === memberId), [memberPoints]);
    const getLeaderboard = useCallback(() => [...memberPoints].sort((a, b) => b.totalPoints - a.totalPoints), [memberPoints]);

    return (
        <PointContext.Provider value={{ logs, memberPoints, awardPoints, adjustPoints, onProjectComplete, onJobComplete, onEducationComplete, getLogsByMember, getMemberSummary, getLeaderboard }}>
            {children}
        </PointContext.Provider>
    );
}

export function usePoints() {
    const context = useContext(PointContext);
    if (!context) throw new Error('usePoints must be used within PointProvider');
    return context;
}
