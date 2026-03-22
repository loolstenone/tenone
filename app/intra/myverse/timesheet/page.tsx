"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { jobTypeLabels, jobDetailLabels } from "@/types/project";
import type { JobType, JobDetail } from "@/types/project";
import Link from "next/link";

interface MyJob {
    projectCode: string;
    projectName: string;
    projectStatus: '진행' | '완료';
    jobCode: string;
    jobName: string;
    jobType: JobType;
    jobDetail: JobDetail;
    estimatedHours: number;
}

// 투입된 Job 리스트 (자동 생성 — DB에서 가져오는 것)
const myActiveJobs: MyJob[] = [
    { projectCode: 'PRJ-2026-0001', projectName: 'LUKI 2nd Single', projectStatus: '진행', jobCode: 'PRJ-2026-0001-PR-PL0001', jobName: '컨셉 기획', jobType: 'PR', jobDetail: 'PL', estimatedHours: 15 },
    { projectCode: 'PRJ-2026-0001', projectName: 'LUKI 2nd Single', projectStatus: '진행', jobCode: 'PRJ-2026-0001-PR-DO0001', jobName: 'MV 제작', jobType: 'PR', jobDetail: 'DO', estimatedHours: 40 },
    { projectCode: 'PRJ-2026-0002', projectName: 'MADLeap 5기', projectStatus: '진행', jobCode: 'PRJ-2026-0002-PT-PL0001', jobName: 'OT 기획', jobType: 'PT', jobDetail: 'PL', estimatedHours: 8 },
    { projectCode: 'PRJ-2026-0003', projectName: '리제로스 시즌2', projectStatus: '진행', jobCode: 'PRJ-2026-0003-PR-PL0001', jobName: '스폰서 제안서', jobType: 'PR', jobDetail: 'PL', estimatedHours: 10 },
    { projectCode: 'PRJ-2026-0004', projectName: 'Brand Gravity', projectStatus: '진행', jobCode: 'PRJ-2026-0004-PR-PL0001', jobName: '브랜드 전략', jobType: 'PR', jobDetail: 'PL', estimatedHours: 20 },
];

interface CompletedProject {
    code: string;
    name: string;
    estimatedHours: number;
    actualHours: number;
}

const myCompletedProjects: CompletedProject[] = [
    { code: 'PRJ-2025-0001', name: 'LUKI 1st Single', estimatedHours: 45, actualHours: 42 },
    { code: 'PRJ-2025-0002', name: '리제로스 시즌1', estimatedHours: 25, actualHours: 28 },
    { code: 'PRJ-2025-0003', name: 'Badak 밋업 런칭', estimatedHours: 15, actualHours: 14 },
    { code: 'PRJ-2025-0004', name: 'MADLeap 4기', estimatedHours: 20, actualHours: 18 },
];

// 날짜별 시수 데이터 { "2026-03-17": { "jobCode": hours } }
type DailyHours = Record<string, Record<string, number>>;

const mockDailyHours: DailyHours = {
    '2026-03-17': { 'PRJ-2026-0001-PR-PL0001': 4, 'PRJ-2026-0001-PR-DO0001': 2, 'PRJ-2026-0003-PR-PL0001': 3 },
    '2026-03-18': { 'PRJ-2026-0001-PR-PL0001': 2, 'PRJ-2026-0002-PT-PL0001': 1.5, 'PRJ-2026-0004-PR-PL0001': 3 },
    '2026-03-19': { 'PRJ-2026-0001-PR-PL0001': 3, 'PRJ-2026-0001-PR-DO0001': 4 },
    '2026-03-20': { 'PRJ-2026-0003-PR-PL0001': 5, 'PRJ-2026-0002-PT-PL0001': 2 },
    '2026-03-21': { 'PRJ-2026-0001-PR-DO0001': 3, 'PRJ-2026-0004-PR-PL0001': 2.5 },
};

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
function fmt(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function getWeek(base: Date): Date[] {
    const dates: Date[] = [];
    const d = new Date(base);
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일 시작
    d.setDate(d.getDate() + mondayOffset);
    for (let i = 0; i < 7; i++) { dates.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return dates;
}

// 2026년 대한민국 공휴일
const holidays: Record<string, string> = {
    '2026-01-01': '신정', '2026-01-28': '설날', '2026-01-29': '설날', '2026-01-30': '설날',
    '2026-03-01': '삼일절', '2026-05-05': '어린이날', '2026-05-24': '부처님오신날',
    '2026-06-06': '현충일', '2026-08-15': '광복절', '2026-09-24': '추석', '2026-09-25': '추석',
    '2026-09-26': '추석', '2026-10-03': '개천절', '2026-10-09': '한글날', '2026-12-25': '크리스마스',
};

// 내 휴가 데이터 (Mock)
const myVacations: Record<string, string> = {
    '2026-03-22': '연차', '2026-03-23': '연차',
};

// 프로젝트별 기간 정보 (진행 프로젝트)
const projectPeriods: Record<string, { start: string; end: string }> = {
    'PRJ-2026-0001': { start: '2026-02-01', end: '2026-05-31' },
    'PRJ-2026-0002': { start: '2026-03-01', end: '2026-06-30' },
    'PRJ-2026-0003': { start: '2026-04-01', end: '2026-09-30' },
    'PRJ-2026-0004': { start: '2026-03-15', end: '2026-06-15' },
};

function calcScheduleProgress(start: string, end: string, today: string): number {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const t = new Date(today).getTime();
    if (t <= s) return 0;
    if (t >= e) return 100;
    return Math.round(((t - s) / (e - s)) * 100);
}

export default function TimesheetInputPage() {
    const today = new Date(2026, 2, 21);
    const [weekOffset, setWeekOffset] = useState(0);
    const [hours, setHours] = useState<DailyHours>(mockDailyHours);
    // 주간 마감 상태: 'draft' | 'submitted' | 'approved'
    const [weekStatus, setWeekStatus] = useState<Record<string, 'draft' | 'submitted' | 'approved'>>({
        '2026-03-10': 'approved', // 이전 주 — PM 승인 완료
    });

    const currentWeekKey = fmt(getWeek((() => { const b = new Date(today); b.setDate(b.getDate() + weekOffset * 7); return b; })())[0]);
    const currentStatus = weekStatus[currentWeekKey] || 'draft';
    const isLocked = currentStatus === 'approved';
    const isSubmitted = currentStatus === 'submitted';

    const base = new Date(today);
    base.setDate(base.getDate() + weekOffset * 7);
    const week = getWeek(base);

    const updateHour = (dateStr: string, jobCode: string, value: number) => {
        setHours(prev => ({
            ...prev,
            [dateStr]: { ...(prev[dateStr] || {}), [jobCode]: value },
        }));
    };

    const getHour = (dateStr: string, jobCode: string) => hours[dateStr]?.[jobCode] || 0;

    // Job별 주간 합계
    const jobWeekTotal = (jobCode: string) => week.reduce((s, d) => s + getHour(fmt(d), jobCode), 0);

    // 날짜별 합계
    const dayTotal = (d: Date) => {
        const ds = fmt(d);
        return myActiveJobs.reduce((s, j) => s + getHour(ds, j.jobCode), 0);
    };

    // 주간 총합
    const weekTotal = week.reduce((s, d) => s + dayTotal(d), 0);

    // 프로젝트별 합계 (진행중) — 전체 누적 시수 (주간이 아닌 프로젝트 전체)
    const todayStr = fmt(today);
    const projectTotals = myActiveJobs.reduce((acc, job) => {
        if (!acc[job.projectCode]) acc[job.projectCode] = { name: job.projectName, estimated: 0, actual: 0 };
        acc[job.projectCode].estimated += job.estimatedHours;
        // 실제 시수: 전체 기간 누적 (모든 날짜의 합)
        acc[job.projectCode].actual += Object.entries(hours).reduce((s, [, dayData]) => s + (dayData[job.jobCode] || 0), 0);
        return acc;
    }, {} as Record<string, { name: string; estimated: number; actual: number }>);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">타임시트 입력</h1>
                    <p className="text-sm text-neutral-500 mt-1">일별 투입 시수 기록 · 매일 입력 권장</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-neutral-400">이번 주 합계</p>
                        <p className="text-lg font-bold">{weekTotal}h</p>
                    </div>
                </div>
            </div>

            {/* 안내 */}
            <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">타임시트는 해당일에 매일 입력하는 것을 권장합니다. 정확한 시수 기록이 프로젝트 손익 관리의 기반입니다.</p>
            </div>

            {/* 주간 날짜 헤더 */}
            <div className="border border-neutral-200 bg-white mb-4">
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100">
                    <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 hover:bg-neutral-100 rounded"><ChevronLeft className="h-4 w-4" /></button>
                    <span className="text-sm font-medium">{fmt(week[0])} ~ {fmt(week[6])}</span>
                    <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 hover:bg-neutral-100 rounded"><ChevronRight className="h-4 w-4" /></button>
                </div>
            </div>

            {/* 메인 타임시트 그리드 */}
            <div className="border border-neutral-200 bg-white overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-neutral-100">
                            <th className="text-left px-3 py-2 w-64 text-neutral-400 font-medium">프로젝트 / Job</th>
                            {week.map((d, i) => {
                                const ds = fmt(d);
                                const isToday = ds === fmt(today);
                                const isSat = i === 5;
                                const isSun = i === 6;
                                const holiday = holidays[ds];
                                const vacation = myVacations[ds];
                                const isOff = !!holiday || !!vacation;
                                return (
                                    <th key={i} className={clsx("text-center px-1 py-2 w-16 font-medium relative",
                                        isToday ? "bg-neutral-900 text-white" :
                                        isOff ? "bg-red-50 text-red-400" :
                                        isSun ? "text-red-400" : isSat ? "text-blue-400" : "text-neutral-400")}>
                                        <div>{DAYS[i]}</div>
                                        <div className="text-sm">{d.getDate()}</div>
                                        {holiday && <div className={clsx("text-[9px] leading-tight", isToday ? "text-red-300" : "text-red-400")}>{holiday}</div>}
                                        {vacation && !holiday && <div className={clsx("text-[9px] leading-tight", isToday ? "text-green-300" : "text-green-500")}>{vacation}</div>}
                                    </th>
                                );
                            })}
                            <th className="text-center px-2 py-2 w-16 text-neutral-400 font-medium">주간</th>
                            <th className="text-center px-2 py-2 w-16 text-neutral-400 font-medium">예상</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 프로젝트별 그룹 */}
                        {Object.entries(
                            myActiveJobs.reduce((acc, job) => {
                                if (!acc[job.projectCode]) acc[job.projectCode] = { name: job.projectName, jobs: [] };
                                acc[job.projectCode].jobs.push(job);
                                return acc;
                            }, {} as Record<string, { name: string; jobs: MyJob[] }>)
                        ).map(([code, group]) => (
                            <React.Fragment key={code}>
                                {/* 프로젝트 헤더 */}
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    <td className="px-3 py-2" colSpan={10}>
                                        <Link href={`/intra/project/management/${code}`} className="text-xs font-medium hover:underline">{code} {group.name}</Link>
                                    </td>
                                </tr>
                                {/* Job 행 */}
                                {group.jobs.map(job => {
                                    const wt = jobWeekTotal(job.jobCode);
                                    return (
                                        <tr key={job.jobCode} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                                            <td className="px-3 py-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs px-1 py-0.5 bg-neutral-100 text-neutral-500 rounded">{jobTypeLabels[job.jobType]}</span>
                                                    <span className="text-xs truncate">{job.jobName}</span>
                                                </div>
                                            </td>
                                            {week.map((d, i) => {
                                                const ds = fmt(d);
                                                const val = getHour(ds, job.jobCode);
                                                return (
                                                    <td key={i} className="text-center px-0.5 py-1">
                                                        {isLocked ? (
                                                            <span className={clsx("inline-block w-14 py-1.5 text-xs text-center", val > 0 ? "font-medium" : "text-neutral-300")}>
                                                                {val || '-'}
                                                            </span>
                                                        ) : (
                                                            <input type="number" min={0} max={24} step={0.5}
                                                                value={val || ''}
                                                                onChange={e => updateHour(ds, job.jobCode, Number(e.target.value) || 0)}
                                                                disabled={isSubmitted}
                                                                className={clsx("w-14 px-1 py-1.5 text-xs text-center border rounded focus:outline-none placeholder:text-neutral-200",
                                                                    isSubmitted ? "border-neutral-100 bg-neutral-50 text-neutral-400" : "border-neutral-200 focus:border-neutral-400")}
                                                                placeholder="0" />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="text-center text-xs font-bold">{wt || '-'}</td>
                                            <td className="text-center text-xs text-neutral-400">{job.estimatedHours}h</td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                        {/* 일별 합계 */}
                        <tr className="border-t-2 border-neutral-200 bg-neutral-50 font-bold">
                            <td className="px-3 py-2 text-xs">일 합계</td>
                            {week.map((d, i) => {
                                const dt = dayTotal(d);
                                return <td key={i} className="text-center text-xs">{dt || '-'}</td>;
                            })}
                            <td className="text-center text-sm">{weekTotal}h</td>
                            <td className="text-center text-xs text-neutral-400">
                                {myActiveJobs.reduce((s, j) => s + j.estimatedHours, 0)}h
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-3">
                {/* 상태 표시 */}
                <div className="flex items-center gap-2">
                    {isLocked && (
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded border border-green-200">
                            <CheckCircle className="h-3.5 w-3.5" /> PM 승인 완료 — 수정 불가
                        </span>
                    )}
                    {isSubmitted && (
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 text-amber-600 rounded border border-amber-200">
                            <Clock className="h-3.5 w-3.5" /> 마감 신청 중 — PM 승인 대기
                        </span>
                    )}
                    {!isLocked && !isSubmitted && (
                        <span className="text-xs text-neutral-400">작성 중</span>
                    )}
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                    {!isLocked && !isSubmitted && (
                        <>
                            <button onClick={() => alert('임시 저장되었습니다.')}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm border border-neutral-200 text-neutral-600 rounded hover:bg-neutral-50">
                                저장
                            </button>
                            <button onClick={() => {
                                if (confirm('마감 신청 후 PM 승인 전까지 수정이 불가능합니다. 신청하시겠습니까?')) {
                                    setWeekStatus(prev => ({ ...prev, [currentWeekKey]: 'submitted' }));
                                }
                            }}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">
                                마감 신청
                            </button>
                        </>
                    )}
                    {isSubmitted && (
                        <button onClick={() => {
                            if (confirm('마감 신청을 취소하시겠습니까?')) {
                                setWeekStatus(prev => ({ ...prev, [currentWeekKey]: 'draft' }));
                            }
                        }}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-neutral-200 text-neutral-600 rounded hover:bg-neutral-50">
                            신청 취소
                        </button>
                    )}
                </div>
            </div>

            {/* 프로젝트 전체 합계 (진행중) */}
            <div className="border border-neutral-200 bg-white mt-6 p-4">
                <h3 className="text-sm font-bold mb-3">진행중 프로젝트 합계</h3>
                {/* 헤더 */}
                <div className="flex items-center gap-3 mb-2 text-xs text-neutral-400">
                    <span className="w-28 shrink-0">코드</span>
                    <span className="flex-1">프로젝트</span>
                    <span className="w-20 text-center shrink-0">일정 진척</span>
                    <span className="w-20 text-center shrink-0">투입률</span>
                    <span className="w-16 text-right shrink-0">실제</span>
                    <span className="w-16 text-right shrink-0">예상</span>
                </div>
                <div className="space-y-2.5">
                    {Object.entries(projectTotals)
                        .sort((a, b) => b[1].actual - a[1].actual)
                        .map(([code, data]) => {
                            const period = projectPeriods[code];
                            const schedProg = period ? calcScheduleProgress(period.start, period.end, todayStr) : 0;
                            const utilRate = data.estimated > 0 ? Math.round((data.actual / data.estimated) * 100) : 0;
                            return (
                                <div key={code} className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-neutral-400 w-28 shrink-0">{code}</span>
                                    <Link href={`/intra/project/management/${code}`} className="text-sm flex-1 truncate hover:underline min-w-0">{data.name}</Link>
                                    {/* 일정 진척 */}
                                    <div className="w-20 shrink-0">
                                        <div className="h-2 bg-neutral-100 rounded-full">
                                            <div className="h-2 bg-blue-400 rounded-full" style={{ width: `${schedProg}%` }} />
                                        </div>
                                        <p className="text-xs text-blue-500 text-center mt-0.5">{schedProg}%</p>
                                    </div>
                                    {/* 투입률 */}
                                    <div className="w-20 shrink-0">
                                        <div className="h-2 bg-neutral-100 rounded-full">
                                            <div className={clsx("h-2 rounded-full", utilRate > 100 ? "bg-red-400" : "bg-green-400")} style={{ width: `${Math.min(utilRate, 100)}%` }} />
                                        </div>
                                        <p className={clsx("text-xs text-center mt-0.5", utilRate > 100 ? "text-red-500" : "text-green-600")}>{utilRate}%</p>
                                    </div>
                                    <span className="text-sm font-bold w-16 text-right shrink-0">{data.actual}h</span>
                                    <span className="text-xs text-neutral-400 w-16 text-right shrink-0">/ {data.estimated}h</span>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* 종료된 프로젝트 */}
            <div className="border border-neutral-200 bg-white mt-4 p-4">
                <h3 className="text-sm font-bold mb-3 text-neutral-400">종료된 프로젝트</h3>
                <div className="space-y-2">
                    {myCompletedProjects.map(p => {
                        const rate = p.estimatedHours > 0 ? Math.round((p.actualHours / p.estimatedHours) * 100) : 0;
                        return (
                            <div key={p.code} className="flex items-center gap-3">
                                <span className="text-xs font-mono text-neutral-400 w-28 shrink-0">{p.code}</span>
                                <span className="text-sm flex-1 truncate text-neutral-500">{p.name}</span>
                                <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded shrink-0">완료</span>
                                <div className="w-20 shrink-0">
                                    <div className="h-2 bg-neutral-100 rounded-full">
                                        <div className={clsx("h-2 rounded-full", rate > 100 ? "bg-red-400" : "bg-green-400")} style={{ width: `${Math.min(rate, 100)}%` }} />
                                    </div>
                                </div>
                                <span className="text-xs font-bold w-12 text-right shrink-0">{p.actualHours}h</span>
                                <span className="text-xs text-neutral-400 shrink-0">/ {p.estimatedHours}h</span>
                                <span className={clsx("text-xs font-medium w-12 text-right shrink-0", rate > 100 ? "text-red-500" : "text-green-600")}>{rate}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// React import for Fragment
import React from "react";
