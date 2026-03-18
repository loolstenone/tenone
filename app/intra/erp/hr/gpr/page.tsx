"use client";

import { useGpr } from "@/lib/gpr-context";
import { useStaff } from "@/lib/staff-context";
import { ratingLabels } from "@/lib/gpr-data";
import Link from "next/link";
import { Target, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const statusColor: Record<string, string> = {
    Draft: 'bg-zinc-800 text-zinc-400',
    'Pending Approval': 'bg-amber-500/10 text-amber-400',
    Agreed: 'bg-blue-500/10 text-blue-400',
    'In Progress': 'bg-blue-500/10 text-blue-400',
    'Self Evaluated': 'bg-purple-500/10 text-purple-400',
    Evaluated: 'bg-emerald-500/10 text-emerald-400',
    Completed: 'bg-emerald-500/10 text-emerald-400',
};

export default function GprDashboardPage() {
    const { goals } = useGpr();
    const { staff } = useStaff();

    const totalGoals = goals.length;
    const inProgress = goals.filter(g => g.status === 'In Progress' || g.status === 'Agreed').length;
    const pendingApproval = goals.filter(g => g.status === 'Pending Approval').length;
    const evaluated = goals.filter(g => g.status === 'Evaluated' || g.status === 'Completed').length;
    const avgProgress = Math.round(goals.reduce((s, g) => s + g.progress, 0) / (totalGoals || 1));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">GPR</h2>
                    <p className="mt-2 text-zinc-400">Goal — Plan — Result: 목표-계획-결과 관리</p>
                </div>
                <Link href="/intra/erp/hr/gpr/goals" className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                    목표 관리
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <Target className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalGoals}</p>
                    <p className="text-xs text-zinc-500">전체 목표</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{inProgress}</p>
                    <p className="text-xs text-zinc-500">진행 중</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <AlertCircle className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{pendingApproval}</p>
                    <p className="text-xs text-zinc-500">승인 대기</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{evaluated}</p>
                    <p className="text-xs text-zinc-500">평가 완료</p>
                </div>
            </div>

            {/* Goals by Staff */}
            {staff.map(member => {
                const memberGoals = goals.filter(g => g.staffId === member.id);
                if (memberGoals.length === 0) return null;
                const memberAvg = Math.round(memberGoals.reduce((s, g) => s + g.progress, 0) / memberGoals.length);
                return (
                    <div key={member.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">{member.avatarInitials}</div>
                                <div>
                                    <p className="text-sm font-medium text-white">{member.name}</p>
                                    <p className="text-xs text-zinc-500">{member.department} · {member.position}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-2 rounded-full bg-zinc-800 overflow-hidden">
                                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${memberAvg}%` }} />
                                </div>
                                <span className="text-xs text-zinc-400">{memberAvg}%</span>
                            </div>
                        </div>
                        <ul className="divide-y divide-zinc-800/50">
                            {memberGoals.map(goal => (
                                <li key={goal.id} className="px-6 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-zinc-600 w-14">{goal.level}</span>
                                        <p className="text-sm text-white">{goal.title}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[goal.status]}`}>{goal.status}</span>
                                        {goal.supervisorRating && (
                                            <span className="text-xs text-emerald-400">{goal.supervisorRating}/5</span>
                                        )}
                                        <span className="text-xs text-zinc-500 w-10 text-right">{goal.progress}%</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}
