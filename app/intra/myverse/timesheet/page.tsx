"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import clsx from "clsx";
import { PageHeader } from "@/components/intra/IntraUI";
import { jobTypeLabels } from "@/types/project";
import type { JobType, JobDetail } from "@/types/project";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fetchMemberActiveJobs, fetchAllTimesheetsForMember, upsertTimesheet, recalcActualHours } from "@/lib/supabase/projects";

interface MyJob {
    projectCode: string;
    projectName: string;
    projectStatus: "진행" | "완료";
    jobId: string;       // UUID — empty string for mock fallback
    jobName: string;
    jobType: JobType;
    jobDetail: JobDetail;
    estimatedHours: number;
}

interface ProjectPeriod { start: string; end: string; }

// Mock fallback
const mockActiveJobs: MyJob[] = [
    { projectCode: "PRJ-2026-0001", projectName: "LUKI 2nd Single", projectStatus: "진행", jobId: "", jobName: "컨셉 기획", jobType: "PR", jobDetail: "PL", estimatedHours: 15 },
    { projectCode: "PRJ-2026-0001", projectName: "LUKI 2nd Single", projectStatus: "진행", jobId: "", jobName: "MV 제작", jobType: "PR", jobDetail: "DO", estimatedHours: 40 },
    { projectCode: "PRJ-2026-0002", projectName: "MADLeap 5기", projectStatus: "진행", jobId: "", jobName: "OT 기획", jobType: "PT", jobDetail: "PL", estimatedHours: 8 },
    { projectCode: "PRJ-2026-0003", projectName: "리제로스 시즌2", projectStatus: "진행", jobId: "", jobName: "스폰서 제안서", jobType: "PR", jobDetail: "PL", estimatedHours: 10 },
    { projectCode: "PRJ-2026-0004", projectName: "Brand Gravity", projectStatus: "진행", jobId: "", jobName: "브랜드 전략", jobType: "PR", jobDetail: "PL", estimatedHours: 20 },
];
const mockCompletedProjects = [
    { code: "PRJ-2025-0001", name: "LUKI 1st Single", estimatedHours: 45, actualHours: 42 },
    { code: "PRJ-2025-0002", name: "리제로스 시즌1", estimatedHours: 25, actualHours: 28 },
    { code: "PRJ-2025-0003", name: "Badak 밋업 런칭", estimatedHours: 15, actualHours: 14 },
];
const mockPeriods: Record<string, ProjectPeriod> = {
    "PRJ-2026-0001": { start: "2026-02-01", end: "2026-05-31" },
    "PRJ-2026-0002": { start: "2026-03-01", end: "2026-06-30" },
    "PRJ-2026-0003": { start: "2026-04-01", end: "2026-09-30" },
    "PRJ-2026-0004": { start: "2026-03-15", end: "2026-06-15" },
};
const mockDailyHours: DailyHours = {
    "2026-03-17": { "mock-job-1": 4, "mock-job-2": 2, "mock-job-4": 3 },
    "2026-03-18": { "mock-job-1": 2, "mock-job-3": 1.5, "mock-job-5": 3 },
    "2026-03-19": { "mock-job-1": 3, "mock-job-2": 4 },
    "2026-03-20": { "mock-job-4": 5, "mock-job-3": 2 },
    "2026-03-21": { "mock-job-2": 3, "mock-job-5": 2.5 },
};

type DailyHours = Record<string, Record<string, number>>;

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
function fmt(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function getWeek(base: Date): Date[] {
    const dates: Date[] = [];
    const d = new Date(base);
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setDate(d.getDate() + mondayOffset);
    for (let i = 0; i < 7; i++) { dates.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return dates;
}

const holidays: Record<string, string> = {
    "2026-01-01": "신정", "2026-01-28": "설날", "2026-01-29": "설날", "2026-01-30": "설날",
    "2026-03-01": "삼일절", "2026-05-05": "어린이날", "2026-05-24": "부처님오신날",
    "2026-06-06": "현충일", "2026-08-15": "광복절", "2026-09-24": "추석", "2026-09-25": "추석",
    "2026-09-26": "추석", "2026-10-03": "개천절", "2026-10-09": "한글날", "2026-12-25": "크리스마스",
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
    const today = new Date();
    const todayStr = fmt(today);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [memberId, setMemberId] = useState<string | null>(null);
    const [activeJobs, setActiveJobs] = useState<MyJob[]>([]);
    const [completedProjects, setCompletedProjects] = useState<{ code: string; name: string; estimatedHours: number; actualHours: number }[]>([]);
    const [projectPeriods, setProjectPeriods] = useState<Record<string, ProjectPeriod>>({});
    const [weekOffset, setWeekOffset] = useState(0);
    const [hours, setHours] = useState<DailyHours>({});
    const [weekStatus, setWeekStatus] = useState<Record<string, "draft" | "submitted" | "approved">>({});
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // Load member + jobs + all timesheets on mount
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                const email = session?.user?.email;

                let mid: string | null = null;
                if (email) {
                    const { data: m } = await supabase.from("members").select("id").eq("email", email).single();
                    mid = m?.id || null;
                }

                if (mid) {
                    const [jobData, tsData] = await Promise.all([
                        fetchMemberActiveJobs(mid),
                        fetchAllTimesheetsForMember(mid),
                    ]);

                    if (!cancelled) {
                        if (jobData.jobs.length > 0) {
                            // Map DB rows to MyJob
                            const projMap: Record<string, Record<string, unknown>> = {};
                            jobData.projects.forEach(p => { projMap[p.id as string] = p; });

                            const activeJobList: MyJob[] = [];
                            const completedList: { code: string; name: string; estimatedHours: number; actualHours: number }[] = [];
                            const periods: Record<string, ProjectPeriod> = {};

                            jobData.jobs.forEach(j => {
                                const proj = projMap[j.project_id as string];
                                if (!proj) return;
                                const status = proj.status as string;
                                const isCompleted = status === "completed";
                                if (proj.start_date && proj.end_date) {
                                    periods[proj.code as string] = { start: proj.start_date as string, end: proj.end_date as string };
                                }
                                if (!isCompleted) {
                                    activeJobList.push({
                                        projectCode: proj.code as string,
                                        projectName: proj.name as string,
                                        projectStatus: "진행",
                                        jobId: j.id as string,
                                        jobName: j.name as string,
                                        jobType: (j.type as JobType) || "PR",
                                        jobDetail: (j.detail as JobDetail) || "PL",
                                        estimatedHours: (j.estimated_hours as number) || 0,
                                    });
                                }
                            });

                            // Completed projects from DB
                            jobData.projects.filter(p => p.status === "completed").forEach(p => {
                                const projJobs = jobData.jobs.filter(j => j.project_id === p.id);
                                const estimated = projJobs.reduce((s, j) => s + ((j.estimated_hours as number) || 0), 0);
                                const actual = tsData
                                    .filter(ts => projJobs.some(j => j.id === ts.job_id))
                                    .reduce((s, ts) => s + ts.hours, 0);
                                completedList.push({ code: p.code as string, name: p.name as string, estimatedHours: estimated, actualHours: actual });
                            });

                            // Build hours state from all timesheets
                            const hoursMap: DailyHours = {};
                            tsData.forEach(ts => {
                                if (!hoursMap[ts.work_date]) hoursMap[ts.work_date] = {};
                                hoursMap[ts.work_date][ts.job_id] = ts.hours;
                            });

                            setMemberId(mid);
                            setActiveJobs(activeJobList.length > 0 ? activeJobList : mockActiveJobs);
                            setCompletedProjects(completedList.length > 0 ? completedList : mockCompletedProjects);
                            setProjectPeriods(Object.keys(periods).length > 0 ? periods : mockPeriods);
                            setHours(Object.keys(hoursMap).length > 0 ? hoursMap : mockDailyHours);
                        } else {
                            // No jobs in DB → use mock
                            setActiveJobs(mockActiveJobs);
                            setCompletedProjects(mockCompletedProjects);
                            setProjectPeriods(mockPeriods);
                            setHours(mockDailyHours);
                        }
                    }
                } else {
                    if (!cancelled) {
                        setActiveJobs(mockActiveJobs);
                        setCompletedProjects(mockCompletedProjects);
                        setProjectPeriods(mockPeriods);
                        setHours(mockDailyHours);
                    }
                }
            } catch {
                if (!cancelled) {
                    setActiveJobs(mockActiveJobs);
                    setCompletedProjects(mockCompletedProjects);
                    setProjectPeriods(mockPeriods);
                    setHours(mockDailyHours);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const base = new Date(today);
    base.setDate(base.getDate() + weekOffset * 7);
    const week = getWeek(base);
    const currentWeekKey = fmt(week[0]);
    const currentStatus = weekStatus[currentWeekKey] || "draft";
    const isLocked = currentStatus === "approved";
    const isSubmitted = currentStatus === "submitted";

    const updateHour = (dateStr: string, jobId: string, value: number) => {
        setHours(prev => ({
            ...prev,
            [dateStr]: { ...(prev[dateStr] || {}), [jobId]: value },
        }));
    };

    const getHour = (dateStr: string, jobId: string) => hours[dateStr]?.[jobId] || 0;
    const jobWeekTotal = (jobId: string) => week.reduce((s, d) => s + getHour(fmt(d), jobId), 0);
    const dayTotal = (d: Date) => {
        const ds = fmt(d);
        return activeJobs.reduce((s, j) => s + getHour(ds, j.jobId), 0);
    };
    const weekTotal = week.reduce((s, d) => s + dayTotal(d), 0);

    const projectTotals = activeJobs.reduce((acc, job) => {
        if (!acc[job.projectCode]) acc[job.projectCode] = { name: job.projectName, estimated: 0, actual: 0 };
        acc[job.projectCode].estimated += job.estimatedHours;
        acc[job.projectCode].actual += Object.entries(hours).reduce((s, [, dayData]) => s + (dayData[job.jobId] || 0), 0);
        return acc;
    }, {} as Record<string, { name: string; estimated: number; actual: number }>);

    const handleSave = async () => {
        if (!memberId) { setSaveMsg("임시 저장되었습니다."); setTimeout(() => setSaveMsg(null), 2000); return; }
        setSaving(true);
        try {
            const saves: Promise<unknown>[] = [];
            week.forEach(d => {
                const ds = fmt(d);
                activeJobs.forEach(j => {
                    if (!j.jobId) return; // mock job, skip
                    const h = getHour(ds, j.jobId);
                    if (h > 0) {
                        saves.push(upsertTimesheet({ member_id: memberId, job_id: j.jobId, work_date: ds, hours: h }));
                    }
                });
            });
            await Promise.all(saves);

            // 저장된 Job들의 actual_hours 재계산 (project/timesheet 뷰와 동기화)
            const savedJobIds = [...new Set(
                activeJobs
                    .filter(j => j.jobId && week.some(d => getHour(fmt(d), j.jobId) > 0))
                    .map(j => j.jobId)
            )];
            await Promise.allSettled(savedJobIds.map(recalcActualHours));

            setSaveMsg("저장되었습니다.");
        } catch {
            setSaveMsg("저장 실패. 다시 시도해주세요.");
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(null), 2500);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;
    }

    // Group active jobs by project
    const jobGroups = activeJobs.reduce((acc, job) => {
        if (!acc[job.projectCode]) acc[job.projectCode] = { name: job.projectName, jobs: [] };
        acc[job.projectCode].jobs.push(job);
        return acc;
    }, {} as Record<string, { name: string; jobs: MyJob[] }>);

    return (
        <div>
            <PageHeader title="타임시트 입력" description="일별 투입 시수 기록 · 매일 입력 권장">
                <div className="text-right">
                    <p className="text-xs text-neutral-400">이번 주 합계</p>
                    <p className="text-lg font-bold text-neutral-900">{weekTotal}h</p>
                </div>
            </PageHeader>

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
                                const isToday = ds === todayStr;
                                const isSat = i === 5;
                                const isSun = i === 6;
                                const holiday = holidays[ds];
                                const isOff = !!holiday;
                                return (
                                    <th key={i} className={clsx("text-center px-1 py-2 w-16 font-medium",
                                        isToday ? "bg-neutral-900 text-white" :
                                        isOff ? "bg-red-50 text-red-400" :
                                        isSun ? "text-red-400" : isSat ? "text-blue-400" : "text-neutral-400")}>
                                        <div>{DAYS[i]}</div>
                                        <div className="text-sm">{d.getDate()}</div>
                                        {holiday && <div className={clsx("text-[9px] leading-tight", isToday ? "text-red-300" : "text-red-400")}>{holiday}</div>}
                                    </th>
                                );
                            })}
                            <th className="text-center px-2 py-2 w-16 text-neutral-400 font-medium">주간</th>
                            <th className="text-center px-2 py-2 w-16 text-neutral-400 font-medium">예상</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(jobGroups).map(([code, group]) => (
                            <React.Fragment key={code}>
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    <td className="px-3 py-2" colSpan={10}>
                                        <Link href={`/intra/project/management/${code}`} className="text-xs font-medium hover:underline">{code} {group.name}</Link>
                                    </td>
                                </tr>
                                {group.jobs.map(job => {
                                    const wt = jobWeekTotal(job.jobId);
                                    return (
                                        <tr key={job.jobId} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                                            <td className="px-3 py-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs px-1 py-0.5 bg-neutral-100 text-neutral-500 rounded">{jobTypeLabels[job.jobType]}</span>
                                                    <span className="text-xs truncate">{job.jobName}</span>
                                                </div>
                                            </td>
                                            {week.map((d, i) => {
                                                const ds = fmt(d);
                                                const val = getHour(ds, job.jobId);
                                                return (
                                                    <td key={i} className="text-center px-0.5 py-1">
                                                        {isLocked ? (
                                                            <span className={clsx("inline-block w-14 py-1.5 text-xs text-center", val > 0 ? "font-medium" : "text-neutral-300")}>
                                                                {val || "-"}
                                                            </span>
                                                        ) : (
                                                            <input type="number" min={0} max={24} step={0.5}
                                                                value={val || ""}
                                                                onChange={e => updateHour(ds, job.jobId, Number(e.target.value) || 0)}
                                                                disabled={isSubmitted}
                                                                className={clsx("w-14 px-1 py-1.5 text-xs text-center border rounded focus:outline-none placeholder:text-neutral-200",
                                                                    isSubmitted ? "border-neutral-100 bg-neutral-50 text-neutral-400" : "border-neutral-200 focus:border-neutral-400")}
                                                                placeholder="0" />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="text-center text-xs font-bold">{wt || "-"}</td>
                                            <td className="text-center text-xs text-neutral-400">{job.estimatedHours}h</td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                        <tr className="border-t-2 border-neutral-200 bg-neutral-50 font-bold">
                            <td className="px-3 py-2 text-xs">일 합계</td>
                            {week.map((d, i) => {
                                const dt = dayTotal(d);
                                return <td key={i} className="text-center text-xs">{dt || "-"}</td>;
                            })}
                            <td className="text-center text-sm">{weekTotal}h</td>
                            <td className="text-center text-xs text-neutral-400">
                                {activeJobs.reduce((s, j) => s + j.estimatedHours, 0)}h
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-3">
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
                    {saveMsg && <span className="text-xs text-green-600">{saveMsg}</span>}
                </div>

                <div className="flex gap-2">
                    {!isLocked && !isSubmitted && (
                        <>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm border border-neutral-200 text-neutral-600 rounded hover:bg-neutral-50 disabled:opacity-50">
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                저장
                            </button>
                            <button onClick={() => {
                                if (confirm("마감 신청 후 PM 승인 전까지 수정이 불가능합니다. 신청하시겠습니까?")) {
                                    setWeekStatus(prev => ({ ...prev, [currentWeekKey]: "submitted" }));
                                }
                            }}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">
                                마감 신청
                            </button>
                        </>
                    )}
                    {isSubmitted && (
                        <button onClick={() => {
                            if (confirm("마감 신청을 취소하시겠습니까?")) {
                                setWeekStatus(prev => ({ ...prev, [currentWeekKey]: "draft" }));
                            }
                        }}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-neutral-200 text-neutral-600 rounded hover:bg-neutral-50">
                            신청 취소
                        </button>
                    )}
                </div>
            </div>

            {/* 진행중 프로젝트 합계 */}
            <div className="border border-neutral-200 bg-white mt-6 p-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">진행중 프로젝트 합계</h3>
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
                                    <div className="w-20 shrink-0">
                                        <div className="h-2 bg-neutral-100 rounded-full">
                                            <div className="h-2 bg-blue-400 rounded-full" style={{ width: `${schedProg}%` }} />
                                        </div>
                                        <p className="text-xs text-blue-500 text-center mt-0.5">{schedProg}%</p>
                                    </div>
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
            {completedProjects.length > 0 && (
                <div className="border border-neutral-200 bg-white mt-4 p-4">
                    <h3 className="text-sm font-medium text-neutral-700 mb-3">종료된 프로젝트</h3>
                    <div className="space-y-2">
                        {completedProjects.map(p => {
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
            )}
        </div>
    );
}
