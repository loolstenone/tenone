"use client";

import { useGpr } from "@/lib/gpr-context";
import { useStaff } from "@/lib/staff-context";
import { ratingLabels } from "@/lib/gpr-data";
import Link from "next/link";
import { Target, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

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
                    <h2 className="text-2xl font-bold">GPR</h2>
                    <p className="mt-2 text-neutral-500">Goal — Plan — Result: 목표-계획-결과 관리</p>
                </div>
                <Link href="/intra/erp/hr/gpr/goals" className="px-4 py-2 bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                    목표 관리
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <Target className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalGoals}</p>
                    <p className="text-xs text-neutral-400">전체 목표</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-neutral-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{inProgress}</p>
                    <p className="text-xs text-neutral-400">진행 중</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <AlertCircle className="h-6 w-6 text-neutral-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{pendingApproval}</p>
                    <p className="text-xs text-neutral-400">승인 대기</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <CheckCircle2 className="h-6 w-6 text-neutral-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{evaluated}</p>
                    <p className="text-xs text-neutral-400">평가 완료</p>
                </div>
            </div>

            {/* Goals by Staff */}
            {staff.map(member => {
                const memberGoals = goals.filter(g => g.staffId === member.id);
                if (memberGoals.length === 0) return null;
                const memberAvg = Math.round(memberGoals.reduce((s, g) => s + g.progress, 0) / memberGoals.length);
                return (
                    <div key={member.id} className="border border-neutral-200 bg-white">
                        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">{member.avatarInitials}</div>
                                <div>
                                    <p className="text-sm font-medium">{member.name}</p>
                                    <p className="text-xs text-neutral-400">{member.department} · {member.position}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-2 bg-neutral-200 overflow-hidden">
                                    <div className="h-full bg-neutral-900" style={{ width: `${memberAvg}%` }} />
                                </div>
                                <span className="text-xs text-neutral-500">{memberAvg}%</span>
                            </div>
                        </div>
                        <ul className="divide-y divide-neutral-100">
                            {memberGoals.map(goal => (
                                <li key={goal.id} className="px-6 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-neutral-300 w-14">{goal.level}</span>
                                        <p className="text-sm">{goal.title}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{goal.status}</span>
                                        {goal.supervisorRating && (
                                            <span className="text-xs text-neutral-900">{goal.supervisorRating}/5</span>
                                        )}
                                        <span className="text-xs text-neutral-400 w-10 text-right">{goal.progress}%</span>
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
