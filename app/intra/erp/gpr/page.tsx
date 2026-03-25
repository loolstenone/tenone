"use client";

import { useState, useEffect } from "react";
import { Target, Users, TrendingUp, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as erpDb from "@/lib/supabase/erp";
import { getMemberStats } from "@/lib/supabase/members";
import { PageHeader, Card, Spinner } from "@/components/intra/IntraUI";
import { useAuth } from "@/lib/auth-context";

interface GprGoal {
    id: string;
    division: string;
    head: string;
    title: string;
    progress: number;
    status: string;
    quarter: string;
    members: number;
}

function gradeFromRate(rate: number): string {
    if (rate >= 90) return "S";
    if (rate >= 80) return "A";
    if (rate >= 70) return "B+";
    if (rate >= 60) return "B";
    if (rate >= 50) return "C+";
    if (rate >= 40) return "C";
    if (rate >= 30) return "D+";
    return "D";
}

function gradeColor(grade: string) {
    if (grade.startsWith("A") || grade.startsWith("S")) return "text-green-600 bg-green-50";
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-50";
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
}

interface DivisionSummary {
    name: string;
    head: string;
    totalGoals: number;
    completed: number;
    inProgress: number;
    rate: number;
    grade: string;
    members: number;
}

export default function GPRDashboardPage() {
    const { user } = useAuth();
    const [goals, setGoals] = useState<GprGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalMembers, setTotalMembers] = useState<number | null>(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            erpDb.fetchGprGoals(),
            getMemberStats().catch(() => null),
        ])
            .then(([data, stats]) => {
                setGoals(data.map((g: Record<string, unknown>) => ({
                    id: (g.id as string) || '',
                    division: (g.division as string) || '',
                    head: (g.head as string) || '',
                    title: (g.title as string) || '',
                    progress: (g.progress as number) || 0,
                    status: (g.status as string) || 'in_progress',
                    quarter: (g.quarter as string) || '',
                    members: (g.members as number) || 1,
                })));
                if (stats) setTotalMembers(stats.total);
            })
            .catch(() => {
                setGoals([]);
            })
            .finally(() => setLoading(false));
    }, [user?.id]);

    // Aggregate by division
    const divisionMap = new Map<string, DivisionSummary>();
    goals.forEach(g => {
        const existing = divisionMap.get(g.division);
        if (existing) {
            existing.totalGoals += 1;
            if (g.status === 'completed') existing.completed += 1;
            else existing.inProgress += 1;
            existing.rate = existing.totalGoals > 0 ? Math.round((existing.completed / existing.totalGoals) * 100) : 0;
            existing.grade = gradeFromRate(existing.rate);
        } else {
            const completed = g.status === 'completed' ? 1 : 0;
            const rate = completed > 0 ? 100 : Math.round(g.progress);
            divisionMap.set(g.division, {
                name: g.division,
                head: g.head,
                totalGoals: 1,
                completed,
                inProgress: g.status === 'completed' ? 0 : 1,
                rate,
                grade: gradeFromRate(rate),
                members: g.members,
            });
        }
    });
    const divisions = Array.from(divisionMap.values());

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const inProgressGoals = goals.filter(g => g.status !== 'completed' && g.status !== 'pending_approval' && g.status !== 'pending_evaluation').length;
    const pendingApproval = goals.filter(g => g.status === 'pending_approval').length;
    const pendingEvaluation = goals.filter(g => g.status === 'pending_evaluation').length;
    const overallRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    const quarter = goals.length > 0 ? goals[0].quarter : "2026 Q1";

    if (loading) return <div className="max-w-5xl"><Spinner /></div>;

    return (
        <div className="max-w-5xl">
            <PageHeader title="GPR" description="Goal — Plan — Result: 전사 목표-계획-결과 관리">
                <span className="text-xs text-neutral-400 border border-neutral-200 px-3 py-1.5 rounded">{quarter}</span>
            </PageHeader>

            {goals.length === 0 ? (
                <Card>
                    <div className="py-12 text-center text-sm text-neutral-400">데이터가 없습니다</div>
                </Card>
            ) : (
                <>
                    {/* Company-level stats */}
                    <div className="grid grid-cols-6 gap-3 mb-6">
                        {[
                            { label: "전사 달성률", value: `${overallRate}%`, icon: TrendingUp },
                            { label: "전체 인원", value: totalMembers !== null ? `${totalMembers}명` : `${divisions.reduce((s, d) => s + d.members, 0)}명`, icon: Users },
                            { label: "전체 목표", value: `${totalGoals}건`, icon: Target },
                            { label: "완료", value: `${completedGoals}건`, icon: CheckCircle2 },
                            { label: "승인 대기", value: `${pendingApproval}건`, icon: Clock, highlight: pendingApproval > 0 },
                            { label: "평가 대기", value: `${pendingEvaluation}건`, icon: AlertCircle, highlight: pendingEvaluation > 0 },
                        ].map(s => (
                            <div key={s.label} className={`border bg-white p-4 ${s.highlight ? 'border-yellow-300' : 'border-neutral-200'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <s.icon className={`h-3.5 w-3.5 ${s.highlight ? 'text-yellow-500' : 'text-neutral-400'}`} />
                                    <span className="text-xs text-neutral-400">{s.label}</span>
                                </div>
                                <p className="text-lg font-bold">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Company GPR progress */}
                    <Card className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold">전사 GPR 달성률</h2>
                            <span className="text-xs text-neutral-400">{overallRate}%</span>
                        </div>
                        <div className="h-3 bg-neutral-100 rounded-full mb-4">
                            <div className="h-3 bg-neutral-900 rounded-full transition-all" style={{ width: `${overallRate}%` }} />
                        </div>
                        <div className="flex gap-6 text-xs text-neutral-500">
                            <span>완료 {completedGoals}건</span>
                            <span>진행중 {inProgressGoals}건</span>
                            <span>승인 대기 {pendingApproval}건</span>
                        </div>
                    </Card>

                    {/* Division table */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold">부서별 GPR 현황</h2>
                        <Link href="/intra/erp/gpr/cascade" className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
                            목표 캐스케이드 보기 <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <Card padding={false}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                    <th className="text-left p-3 font-medium">부서</th>
                                    <th className="text-left p-3 font-medium">부서장</th>
                                    <th className="text-center p-3 font-medium">인원</th>
                                    <th className="text-center p-3 font-medium">목표</th>
                                    <th className="text-center p-3 font-medium">완료</th>
                                    <th className="p-3 font-medium">달성률</th>
                                    <th className="text-center p-3 font-medium">등급</th>
                                </tr>
                            </thead>
                            <tbody>
                                {divisions.map(d => (
                                    <tr key={d.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                                        <td className="p-3 font-medium">{d.name}</td>
                                        <td className="p-3 text-neutral-500">{d.head}</td>
                                        <td className="p-3 text-center">{d.members}</td>
                                        <td className="p-3 text-center">{d.totalGoals}</td>
                                        <td className="p-3 text-center">{d.completed}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 flex-1 bg-neutral-100 rounded-full">
                                                    <div className="h-1.5 bg-neutral-900 rounded-full" style={{ width: `${d.rate}%` }} />
                                                </div>
                                                <span className="text-xs text-neutral-500 w-8 text-right">{d.rate}%</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${gradeColor(d.grade)}`}>{d.grade}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </>
            )}

            {/* Quick links */}
            <div className="flex gap-3 mt-6">
                <Link href="/intra/erp/gpr/cascade"
                    className="flex-1 border border-neutral-200 bg-white p-4 hover:border-neutral-400 transition-colors">
                    <h3 className="text-sm font-bold mb-1">목표 캐스케이드</h3>
                    <p className="text-xs text-neutral-400">회사 → 사업부 → 팀 → 개인 목표 설정 및 승인 관리</p>
                </Link>
                <Link href="/intra/erp/gpr/evaluation"
                    className="flex-1 border border-neutral-200 bg-white p-4 hover:border-neutral-400 transition-colors">
                    <h3 className="text-sm font-bold mb-1">평가</h3>
                    <p className="text-xs text-neutral-400">분기별 성과 평가 및 역량 평가</p>
                </Link>
                <Link href="/intra/erp/gpr/incentive"
                    className="flex-1 border border-neutral-200 bg-white p-4 hover:border-neutral-400 transition-colors">
                    <h3 className="text-sm font-bold mb-1">인센티브</h3>
                    <p className="text-xs text-neutral-400">GPR 결과 기반 인센티브 산정 및 지급</p>
                </Link>
            </div>
        </div>
    );
}
