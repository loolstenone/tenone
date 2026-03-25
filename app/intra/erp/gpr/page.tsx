"use client";

import { useState, useEffect } from "react";
import { Target, Users, TrendingUp, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getMemberStats } from "@/lib/supabase/members";

interface DivisionGPR {
    name: string;
    head: string;
    totalGoals: number;
    completed: number;
    inProgress: number;
    rate: number;
    grade: string;
    members: number;
}

const companyGPR = {
    quarter: "2026 Q1",
    overallRate: 42,
    totalGoals: 28,
    completed: 8,
    inProgress: 16,
    pendingApproval: 4,
    pendingEvaluation: 2,
};

const divisions: DivisionGPR[] = [
    { name: "경영기획", head: "Cheonil Jeon", totalGoals: 9, completed: 3, inProgress: 5, rate: 59, grade: "B+", members: 1 },
    { name: "브랜드관리", head: "Sarah Kim", totalGoals: 5, completed: 1, inProgress: 3, rate: 15, grade: "C+", members: 1 },
    { name: "커뮤니티운영", head: "김준호", totalGoals: 4, completed: 1, inProgress: 2, rate: 28, grade: "C", members: 1 },
    { name: "콘텐츠제작", head: "박영상", totalGoals: 5, completed: 2, inProgress: 3, rate: 55, grade: "B", members: 2 },
    { name: "디자인", head: "이수진", totalGoals: 3, completed: 1, inProgress: 2, rate: 40, grade: "C+", members: 1 },
    { name: "AI크리에이티브", head: "최민호", totalGoals: 2, completed: 0, inProgress: 1, rate: 20, grade: "D+", members: 1 },
];

function gradeColor(grade: string) {
    if (grade.startsWith("A") || grade.startsWith("S")) return "text-green-600 bg-green-50";
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-50";
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
}

export default function GPRDashboardPage() {
    const [totalMembers, setTotalMembers] = useState<number | null>(null);

    // DB에서 전체 멤버 수 로드 (실패 시 Mock 유지)
    useEffect(() => {
        getMemberStats()
            .then((stats) => setTotalMembers(stats.total))
            .catch(() => { /* Mock 유지 */ });
    }, []);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-xl font-bold">GPR</h1>
                    <p className="text-sm text-neutral-500">Goal — Plan — Result: 전사 목표-계획-결과 관리</p>
                </div>
                <span className="text-xs text-neutral-400 border border-neutral-200 px-3 py-1.5 rounded">{companyGPR.quarter}</span>
            </div>

            {/* Company-level stats */}
            <div className="grid grid-cols-6 gap-3 mt-6 mb-6">
                {[
                    { label: "전사 달성률", value: `${companyGPR.overallRate}%`, icon: TrendingUp },
                    { label: "전체 인원", value: totalMembers !== null ? `${totalMembers}명` : `${divisions.reduce((s, d) => s + d.members, 0)}명`, icon: Users },
                    { label: "전체 목표", value: `${companyGPR.totalGoals}건`, icon: Target },
                    { label: "완료", value: `${companyGPR.completed}건`, icon: CheckCircle2 },
                    { label: "승인 대기", value: `${companyGPR.pendingApproval}건`, icon: Clock, highlight: companyGPR.pendingApproval > 0 },
                    { label: "평가 대기", value: `${companyGPR.pendingEvaluation}건`, icon: AlertCircle, highlight: companyGPR.pendingEvaluation > 0 },
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
            <div className="border border-neutral-200 bg-white p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold">전사 GPR 달성률</h2>
                    <span className="text-xs text-neutral-400">{companyGPR.overallRate}%</span>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full mb-4">
                    <div className="h-3 bg-neutral-900 rounded-full transition-all" style={{ width: `${companyGPR.overallRate}%` }} />
                </div>
                <div className="flex gap-6 text-xs text-neutral-500">
                    <span>완료 {companyGPR.completed}건</span>
                    <span>진행중 {companyGPR.inProgress}건</span>
                    <span>승인 대기 {companyGPR.pendingApproval}건</span>
                </div>
            </div>

            {/* Cascade: Company → Division flow */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold">부서별 GPR 현황</h2>
                <Link href="/intra/erp/gpr/cascade" className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
                    목표 캐스케이드 보기 <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="border border-neutral-200 bg-white">
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
            </div>

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
