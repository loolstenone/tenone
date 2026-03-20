"use client";

import { useAuth } from "@/lib/auth-context";
import {
    Mail, Building2, Calendar, Target, Edit2, Shield, BookOpen, Clock,
    FileCheck, User, FolderKanban, ChevronRight, CalendarCheck, CreditCard,
    GraduationCap, Wallet, DollarSign, TrendingUp, AlertCircle, CheckCircle2,
    FileText, Palmtree
} from "lucide-react";
import Link from "next/link";
import { SystemAccessInfo } from "@/types/auth";
import type { SystemAccess } from "@/types/auth";

// --- 개인 Mock 데이터 ---
const myHR = {
    employeeId: "2019-0001",
    department: "기업 총괄",
    position: "대표이사",
    hireDate: "2019-10-01",
    employmentType: "정규직",
};

const myLeave = { total: 15, used: 3, remaining: 12, sick: 3, usedSick: 0 };

const myGPR = {
    quarter: "2026 Q1",
    rate: 38,
    grade: "B+",
    goals: 5,
    completed: 2,
    nextReview: "2026-03-31",
    items: [
        { name: "10,000명의 기획자 발굴 네트워크 구축", progress: 25, status: "진행중" },
        { name: "MADLeague 인사이트 투어링 성공적 운영", progress: 60, status: "진행중" },
        { name: "LUKI 데뷔 캠페인 완료", progress: 100, status: "완료" },
    ],
};

const mySalary = {
    thisMonth: { base: 5000000, bonus: 0, deductions: 820000, net: 4180000, status: "지급예정" },
    pension: { type: "확정급여(DB)", total: 18500000 },
};

const myExpenses = {
    pending: 2,
    thisMonth: 350000,
    recentItems: [
        { date: "2026-03-18", desc: "파트너사 미팅 식비", amount: 85000, status: "승인대기" },
        { date: "2026-03-15", desc: "출장 교통비", amount: 120000, status: "승인" },
        { date: "2026-03-10", desc: "사무용품 구매", amount: 45000, status: "지급완료" },
    ],
};

const myProjects = [
    { name: "LUKI 2nd Single", code: "PRJ-2026-001", role: "기획 총괄", progress: 45, status: "진행중" as const },
    { name: "MADLeap 5기 운영", code: "PRJ-2026-002", role: "PM", progress: 25, status: "진행중" as const },
    { name: "Badak 네트워크 확장", code: "PRJ-2026-004", role: "파트너십", progress: 0, status: "계획" as const },
];

const myEducation = {
    mandatory: { total: 6, completed: 2 },
    recent: [
        { name: "VRIEF Orientation", status: "수료" as const },
        { name: "GPR 프레임워크 이해", status: "수료" as const },
        { name: "Mind Set: 본질·속도·이행", status: "진행중" as const },
    ],
};

const myAttendance = {
    thisMonth: { workDays: 14, avgHours: "9h 12m", overtime: "4h 30m" },
    today: { checkIn: "08:55", checkOut: "-", status: "정상" },
};

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function MyversePage() {
    const { user } = useAuth();
    if (!user) return null;

    const hireDate = new Date(myHR.hireDate);
    const now = new Date();
    const months = (now.getFullYear() - hireDate.getFullYear()) * 12 + (now.getMonth() - hireDate.getMonth());
    const tenureYears = Math.floor(months / 12);
    const tenureMonths = months % 12;

    return (
        <div className="max-w-5xl">
            {/* Profile Header */}
            <div className="border border-neutral-200 bg-white p-5 mb-6 flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-bold shrink-0">
                    {user.avatarInitials}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold">{user.name}</h1>
                        <span className="text-[10px] tracking-widest text-neutral-400 uppercase">Myverse</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-neutral-500">{myHR.position} · {myHR.department}</span>
                        <span className="text-xs text-neutral-400">{myHR.employeeId}</span>
                        <span className="text-xs text-neutral-400">{tenureYears}년 {tenureMonths}개월</span>
                    </div>
                </div>
                <Link href="/profile" className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                    <Edit2 className="h-3 w-3" /> 정보 수정
                </Link>
            </div>

            {/* Row 1: 핵심 지표 */}
            <div className="grid grid-cols-5 gap-3 mb-6">
                {[
                    { label: "오늘 출근", value: myAttendance.today.checkIn, sub: myAttendance.today.status, icon: Clock },
                    { label: "잔여 연차", value: `${myLeave.remaining}일`, sub: `${myLeave.used}/${myLeave.total}`, icon: Palmtree },
                    { label: "GPR 달성률", value: `${myGPR.rate}%`, sub: `${myGPR.quarter} · ${myGPR.grade}`, icon: Target },
                    { label: "이번 달 실수령", value: formatKRW(mySalary.thisMonth.net), sub: mySalary.thisMonth.status, icon: Wallet },
                    { label: "경비 미처리", value: `${myExpenses.pending}건`, sub: formatKRW(myExpenses.thisMonth), icon: CreditCard },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-3.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-[10px] text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-base font-bold">{s.value}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Row 2: GPR + 근태 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* GPR */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Target className="h-4 w-4 text-neutral-400" /> GPR
                        </h3>
                        <Link href="/intra/erp/hr/gpr" className="text-[10px] text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-neutral-400">달성률</span>
                                <span className="text-xs font-bold">{myGPR.rate}%</span>
                            </div>
                            <div className="h-2 bg-neutral-100 rounded-full">
                                <div className="h-2 bg-neutral-900 rounded-full" style={{ width: `${myGPR.rate}%` }} />
                            </div>
                        </div>
                        <div className="text-center px-3">
                            <p className="text-lg font-bold">{myGPR.grade}</p>
                            <p className="text-[10px] text-neutral-400">등급</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {myGPR.items.map(g => (
                            <div key={g.name} className="flex items-center gap-3">
                                {g.status === "완료"
                                    ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    : <div className="h-3.5 w-3.5 rounded-full border border-neutral-300 shrink-0" />
                                }
                                <span className={`text-xs flex-1 ${g.status === "완료" ? "text-neutral-400 line-through" : ""}`}>{g.name}</span>
                                <span className="text-[10px] text-neutral-400">{g.progress}%</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-neutral-300 mt-3">다음 리뷰: {myGPR.nextReview}</p>
                </div>

                {/* 근태 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4 text-neutral-400" /> 근태
                        </h3>
                        <Link href="/intra/erp/hr/attendance" className="text-[10px] text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-neutral-50 rounded p-3 text-center">
                            <p className="text-lg font-bold">{myAttendance.thisMonth.workDays}</p>
                            <p className="text-[10px] text-neutral-400">이번 달 근무일</p>
                        </div>
                        <div className="bg-neutral-50 rounded p-3 text-center">
                            <p className="text-lg font-bold">{myAttendance.thisMonth.avgHours}</p>
                            <p className="text-[10px] text-neutral-400">평균 근무시간</p>
                        </div>
                        <div className="bg-neutral-50 rounded p-3 text-center">
                            <p className="text-lg font-bold">{myAttendance.thisMonth.overtime}</p>
                            <p className="text-[10px] text-neutral-400">초과근무</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-400">연차</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-neutral-100 rounded-full">
                                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${(myLeave.used / myLeave.total) * 100}%` }} />
                                </div>
                                <span className="text-xs font-medium">{myLeave.remaining}/{myLeave.total}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-400">병가</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-neutral-100 rounded-full">
                                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${(myLeave.usedSick / myLeave.sick) * 100}%` }} />
                                </div>
                                <span className="text-xs font-medium">{myLeave.sick - myLeave.usedSick}/{myLeave.sick}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: 급여 + 경비 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* 급여 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-neutral-400" /> 급여
                        </h3>
                        <Link href="/intra/erp/hr/payroll" className="text-[10px] text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    <div className="space-y-2 mb-4">
                        {[
                            { label: "기본급", value: formatKRW(mySalary.thisMonth.base) },
                            { label: "상여", value: mySalary.thisMonth.bonus > 0 ? formatKRW(mySalary.thisMonth.bonus) : "-" },
                            { label: "공제", value: formatKRW(mySalary.thisMonth.deductions), color: "text-red-500" },
                        ].map(r => (
                            <div key={r.label} className="flex items-center justify-between">
                                <span className="text-xs text-neutral-400">{r.label}</span>
                                <span className={`text-sm ${r.color || ''}`}>{r.value}</span>
                            </div>
                        ))}
                        <div className="border-t border-neutral-100 pt-2 flex items-center justify-between">
                            <span className="text-xs font-medium">실수령액</span>
                            <span className="text-sm font-bold">{formatKRW(mySalary.thisMonth.net)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-neutral-50 rounded p-3">
                        <div>
                            <p className="text-[10px] text-neutral-400">퇴직연금 ({mySalary.pension.type})</p>
                            <p className="text-sm font-bold mt-0.5">{formatKRW(mySalary.pension.total)}</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-neutral-300" />
                    </div>
                </div>

                {/* 경비 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-neutral-400" /> 경비
                        </h3>
                        <Link href="/intra/erp/finance/expenses" className="text-[10px] text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    {myExpenses.pending > 0 && (
                        <div className="flex items-center gap-2 p-2 mb-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                            <AlertCircle className="h-3.5 w-3.5" />
                            승인 대기 {myExpenses.pending}건
                        </div>
                    )}
                    <div className="space-y-2">
                        {myExpenses.recentItems.map((e, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                                <div>
                                    <p className="text-xs font-medium">{e.desc}</p>
                                    <p className="text-[10px] text-neutral-400">{e.date}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">{formatKRW(e.amount)}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                        e.status === "승인대기" ? "bg-yellow-50 text-yellow-600" :
                                        e.status === "승인" ? "bg-blue-50 text-blue-600" :
                                        "bg-green-50 text-green-600"
                                    }`}>{e.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 4: 프로젝트 + 교육 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* 투입 프로젝트 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-neutral-400" /> 투입 프로젝트
                        </h3>
                        <Link href="/intra/project/management" className="text-[10px] text-neutral-400 hover:text-neutral-900 transition-colors">전체 →</Link>
                    </div>
                    <div className="space-y-3">
                        {myProjects.map(p => (
                            <Link key={p.code} href={`/intra/project/management/${p.code}`}
                                className="block hover:bg-neutral-50 -mx-2 px-2 py-1.5 rounded transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium">{p.name}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                        p.status === '진행중' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-500'
                                    }`}>{p.status}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-neutral-400">{p.code}</span>
                                    <span className="text-[10px] text-neutral-400">{p.role}</span>
                                    {p.progress > 0 && (
                                        <div className="flex items-center gap-1 flex-1">
                                            <div className="h-1 flex-1 bg-neutral-100 rounded-full">
                                                <div className="h-1 bg-neutral-900 rounded-full" style={{ width: `${p.progress}%` }} />
                                            </div>
                                            <span className="text-[10px] text-neutral-400">{p.progress}%</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 교육 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-neutral-400" /> 교육
                        </h3>
                        <Link href="/intra/erp/hr/education" className="text-[10px] text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    {myEducation.mandatory.completed < myEducation.mandatory.total && (
                        <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            필수과정 {myEducation.mandatory.completed}/{myEducation.mandatory.total} 이수
                        </div>
                    )}
                    <div className="space-y-2">
                        {myEducation.recent.map(e => (
                            <div key={e.name} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                                <span className="text-xs">{e.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                    e.status === "수료" ? "bg-green-50 text-green-600" :
                                    e.status === "진행중" ? "bg-blue-50 text-blue-600" :
                                    "bg-neutral-100 text-neutral-500"
                                }`}>{e.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 5: 시스템 접근 권한 */}
            <div className="border border-neutral-200 bg-white p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-neutral-400" /> 시스템 접근 권한
                </h3>
                <div className="flex flex-wrap gap-3">
                    {(user.systemAccess || []).map(access => {
                        const info = SystemAccessInfo[access as SystemAccess];
                        return (
                            <div key={access} className="flex items-center gap-2 bg-neutral-50 rounded px-3 py-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium">{info?.label || access}</p>
                                    <p className="text-[10px] text-neutral-400">{info?.description || ''}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
