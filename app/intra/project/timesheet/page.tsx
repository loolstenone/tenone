"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  FolderOpen,
  Users,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import type { JobType, JobDetail } from "@/types/project";
import * as projectsDb from "@/lib/supabase/projects";

// ── 타입 ──
interface TimesheetJob {
  id: string;
  jobCode: string;
  jobName: string;
  jobType: JobType;
  jobDetail: JobDetail;
  assignee: string;
  estimatedHours: number;
  actualHours: number;
  hourlyRate: number; // 직원 전용
  status: "진행중" | "완료" | "대기";
}

interface TimesheetProject {
  code: string;
  name: string;
  jobs: TimesheetJob[];
}

// ── Mock 데이터 ──
const mockProjects: TimesheetProject[] = [
  {
    code: "PRJ-2026-0001",
    name: "LUKI 2nd Single",
    jobs: [
      {
        id: "j1",
        jobCode: "PR-PL0001",
        jobName: "컨셉 기획",
        jobType: "PR",
        jobDetail: "PL",
        assignee: "Cheonil",
        estimatedHours: 15,
        actualHours: 11,
        hourlyRate: 50000,
        status: "진행중",
      },
      {
        id: "j2",
        jobCode: "PR-DO0001",
        jobName: "MV 제작",
        jobType: "PR",
        jobDetail: "DO",
        assignee: "이영상",
        estimatedHours: 40,
        actualHours: 12,
        hourlyRate: 50000,
        status: "진행중",
      },
      {
        id: "j3",
        jobCode: "ME-PL0001",
        jobName: "미디어 플래닝",
        jobType: "ME",
        jobDetail: "PL",
        assignee: "유광고",
        estimatedHours: 20,
        actualHours: 8,
        hourlyRate: 45000,
        status: "진행중",
      },
      {
        id: "j4",
        jobCode: "PR-DO0002",
        jobName: "비주얼 디자인",
        jobType: "PR",
        jobDetail: "DO",
        assignee: "박디자",
        estimatedHours: 30,
        actualHours: 15,
        hourlyRate: 50000,
        status: "진행중",
      },
      {
        id: "j5",
        jobCode: "PR-RE0001",
        jobName: "성과 리포트",
        jobType: "PR",
        jobDetail: "RE",
        assignee: "한마케",
        estimatedHours: 10,
        actualHours: 0,
        hourlyRate: 50000,
        status: "대기",
      },
    ],
  },
  {
    code: "PRJ-2026-0002",
    name: "MADLeap 5기",
    jobs: [
      {
        id: "j6",
        jobCode: "PT-PL0001",
        jobName: "OT 기획",
        jobType: "PT",
        jobDetail: "PL",
        assignee: "김준호",
        estimatedHours: 8,
        actualHours: 6,
        hourlyRate: 40000,
        status: "진행중",
      },
      {
        id: "j7",
        jobCode: "PR-DO0001",
        jobName: "콘텐츠 제작",
        jobType: "PR",
        jobDetail: "DO",
        assignee: "김콘텐",
        estimatedHours: 30,
        actualHours: 5,
        hourlyRate: 40000,
        status: "진행중",
      },
      {
        id: "j8",
        jobCode: "PR-RE0001",
        jobName: "시즌 리포트",
        jobType: "PR",
        jobDetail: "RE",
        assignee: "마리그",
        estimatedHours: 10,
        actualHours: 0,
        hourlyRate: 40000,
        status: "대기",
      },
      {
        id: "j9",
        jobCode: "PT-DO0001",
        jobName: "세션 운영",
        jobType: "PT",
        jobDetail: "DO",
        assignee: "김준호",
        estimatedHours: 12,
        actualHours: 2.5,
        hourlyRate: 40000,
        status: "진행중",
      },
    ],
  },
  {
    code: "PRJ-2026-0003",
    name: "리제로스 시즌2",
    jobs: [
      {
        id: "j10",
        jobCode: "PR-PL0001",
        jobName: "스폰서 제안서",
        jobType: "PR",
        jobDetail: "PL",
        assignee: "한마케",
        estimatedHours: 10,
        actualHours: 7,
        hourlyRate: 50000,
        status: "진행중",
      },
      {
        id: "j11",
        jobCode: "PR-DO0001",
        jobName: "영상 제작",
        jobType: "PR",
        jobDetail: "DO",
        assignee: "이영상",
        estimatedHours: 25,
        actualHours: 3,
        hourlyRate: 50000,
        status: "진행중",
      },
      {
        id: "j12",
        jobCode: "ME-DO0001",
        jobName: "SNS 배포",
        jobType: "ME",
        jobDetail: "DO",
        assignee: "유광고",
        estimatedHours: 8,
        actualHours: 0,
        hourlyRate: 45000,
        status: "대기",
      },
    ],
  },
  {
    code: "PRJ-2026-0004",
    name: "RooK 브랜딩",
    jobs: [
      {
        id: "j13",
        jobCode: "PR-PL0001",
        jobName: "BI 기획",
        jobType: "PR",
        jobDetail: "PL",
        assignee: "박디자",
        estimatedHours: 12,
        actualHours: 8,
        hourlyRate: 50000,
        status: "진행중",
      },
      {
        id: "j14",
        jobCode: "PR-DO0001",
        jobName: "디자인 시안",
        jobType: "PR",
        jobDetail: "DO",
        assignee: "박디자",
        estimatedHours: 20,
        actualHours: 5,
        hourlyRate: 50000,
        status: "진행중",
      },
    ],
  },
  {
    code: "PRJ-2026-0005",
    name: "Badak 네트워크 런칭",
    jobs: [
      {
        id: "j15",
        jobCode: "PR-PL0001",
        jobName: "런칭 전략",
        jobType: "PR",
        jobDetail: "PL",
        assignee: "Cheonil",
        estimatedHours: 10,
        actualHours: 4,
        hourlyRate: 50000,
        status: "진행중",
      },
      {
        id: "j16",
        jobCode: "ME-PL0001",
        jobName: "미디어 플랜",
        jobType: "ME",
        jobDetail: "PL",
        assignee: "유광고",
        estimatedHours: 8,
        actualHours: 2,
        hourlyRate: 45000,
        status: "진행중",
      },
    ],
  },
];

// ── 배지 스타일 ──
const jobTypeBadge: Record<JobType, { label: string; cls: string }> = {
  PR: { label: "제작", cls: "bg-neutral-100 text-neutral-600" },
  ME: { label: "Media", cls: "bg-neutral-100 text-neutral-500" },
  PT: { label: "PT", cls: "bg-neutral-100 text-neutral-500" },
};

const jobDetailBadge: Record<JobDetail, { label: string; cls: string }> = {
  PL: { label: "기획", cls: "bg-neutral-50 text-neutral-500 border border-neutral-200" },
  DO: { label: "실행", cls: "bg-neutral-50 text-neutral-500 border border-neutral-200" },
  RE: { label: "Report", cls: "bg-neutral-50 text-neutral-500 border border-neutral-200" },
};

const statusStyle: Record<string, string> = {
  진행중: "text-neutral-700 bg-neutral-100",
  완료: "text-neutral-500 bg-neutral-50",
  대기: "text-neutral-400 bg-neutral-50",
};

function fmt(n: number) {
  return new Intl.NumberFormat("ko-KR").format(n);
}

function fmtKRW(n: number) {
  if (n >= 10000) {
    return `${fmt(Math.round(n / 10000))}만원`;
  }
  return `${fmt(n)}원`;
}

// ── 메인 페이지 ──
export default function TimesheetPage() {
  const { isStaff } = useAuth();
  const [tsProjects, setTsProjects] = useState<TimesheetProject[]>(mockProjects);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedProject, setSelectedProject] = useState("all");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(mockProjects.map((p) => p.code))
  );

  // DB 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { projects: dbProjects } = await projectsDb.fetchProjects();
        if (!cancelled && dbProjects.length > 0) {
          const mapped: TimesheetProject[] = await Promise.all(
            dbProjects.map(async (p: any) => {
              let jobs: TimesheetJob[] = [];
              try {
                const dbJobs = await projectsDb.fetchJobs(p.id);
                jobs = dbJobs.map((j: any) => ({
                  id: j.id,
                  jobCode: j.code ?? j.id,
                  jobName: j.name,
                  jobType: (j.type ?? "PR") as JobType,
                  jobDetail: (j.detail ?? "PL") as JobDetail,
                  assignee: j.assignee ?? "-",
                  estimatedHours: j.estimated_hours ?? j.estimatedHours ?? 0,
                  actualHours: j.actual_hours ?? j.actualHours ?? 0,
                  hourlyRate: j.hourly_rate ?? j.hourlyRate ?? 0,
                  status: j.status ?? "대기",
                }));
              } catch { /* jobs 로드 실패 무시 */ }
              return {
                code: p.code,
                name: p.name,
                jobs,
              } as TimesheetProject;
            })
          );
          const hasAnyJobs = mapped.some((p) => p.jobs.length > 0);
          if (hasAnyJobs) {
            setTsProjects(mapped);
            setExpandedProjects(new Set(mapped.map((p) => p.code)));
          }
        }
      } catch (e) {
        console.warn("[Timesheet] DB 로드 실패, Mock 사용:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 현재 월 표시
  const currentDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthLabel = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        <span className="ml-2 text-sm text-neutral-400">타임시트 로딩중...</span>
      </div>
    );
  }

  // 필터링된 프로젝트
  const filteredProjects = useMemo(() => {
    if (selectedProject === "all") return tsProjects;
    return tsProjects.filter((p) => p.code === selectedProject);
  }, [selectedProject, tsProjects]);

  // 전체 집계
  const totalStats = useMemo(() => {
    let totalActual = 0;
    let totalEstimated = 0;
    let totalCost = 0;
    const assigneeSet = new Set<string>();

    filteredProjects.forEach((p) => {
      p.jobs.forEach((j) => {
        totalActual += j.actualHours;
        totalEstimated += j.estimatedHours;
        totalCost += j.actualHours * j.hourlyRate;
        assigneeSet.add(j.assignee);
      });
    });

    const avgDaily =
      filteredProjects.length > 0
        ? Math.round((totalActual / (filteredProjects.length * 20)) * 10) / 10
        : 0;

    return {
      totalActual,
      totalEstimated,
      projectCount: filteredProjects.length,
      staffCount: assigneeSet.size,
      avgDaily: totalActual > 0 ? 7.8 : 0, // mock: 고정값
      totalCost,
    };
  }, [filteredProjects]);

  // 프로젝트별 소계
  function getProjectSubtotal(project: TimesheetProject) {
    let estimated = 0;
    let actual = 0;
    let cost = 0;
    project.jobs.forEach((j) => {
      estimated += j.estimatedHours;
      actual += j.actualHours;
      cost += j.actualHours * j.hourlyRate;
    });
    const pct = estimated > 0 ? Math.round((actual / estimated) * 100) : 0;
    return { estimated, actual, pct, cost };
  }

  function toggleProject(code: string) {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  // Grand total
  const grandTotal = useMemo(() => {
    let estimated = 0;
    let actual = 0;
    let cost = 0;
    filteredProjects.forEach((p) => {
      p.jobs.forEach((j) => {
        estimated += j.estimatedHours;
        actual += j.actualHours;
        cost += j.actualHours * j.hourlyRate;
      });
    });
    const pct = estimated > 0 ? Math.round((actual / estimated) * 100) : 0;
    return { estimated, actual, pct, cost };
  }, [filteredProjects]);

  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-neutral-900">타임시트</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          프로젝트 · Job별 투입 시수 집계
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <SummaryCard
          label="이번 달 총 시수"
          value={`${totalStats.totalActual}h`}
          icon={<Clock className="h-3.5 w-3.5" />}
        />
        <SummaryCard
          label="프로젝트 수"
          value={String(totalStats.projectCount)}
          icon={<FolderOpen className="h-3.5 w-3.5" />}
        />
        <SummaryCard
          label="투입 인원"
          value={`${totalStats.staffCount}명`}
          icon={<Users className="h-3.5 w-3.5" />}
        />
        <SummaryCard
          label="평균 일 투입"
          value={`${totalStats.avgDaily}h`}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        {/* 월 선택 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">기간</span>
          <div className="flex items-center gap-1 border border-neutral-200 rounded px-1 py-0.5">
            <button
              onClick={() => setMonthOffset((v) => v - 1)}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-neutral-500" />
            </button>
            <button
              onClick={() => setMonthOffset(0)}
              className={clsx(
                "px-3 py-1 rounded text-xs font-medium transition-colors min-w-[100px] text-center",
                monthOffset === 0
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              {monthLabel}
            </button>
            <button
              onClick={() => setMonthOffset((v) => v + 1)}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* 프로젝트 필터 + 내보내기 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">프로젝트</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="text-xs border border-neutral-200 rounded px-2 py-1.5 bg-white text-neutral-700 focus:outline-none focus:border-neutral-400"
            >
              <option value="all">전체</option>
              {tsProjects.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 px-2 py-1.5 border border-neutral-200 rounded hover:bg-neutral-50 transition-colors">
            <Download className="h-3 w-3" />
            내보내기
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-neutral-200 overflow-hidden mb-8">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="text-left py-2.5 px-3 font-medium text-neutral-500 w-[200px]">
                프로젝트 / Job
              </th>
              <th className="text-left py-2.5 px-3 font-medium text-neutral-500 w-[70px]">
                유형
              </th>
              <th className="text-left py-2.5 px-3 font-medium text-neutral-500 w-[70px]">
                담당자
              </th>
              <th className="text-center py-2.5 px-3 font-medium text-neutral-500 w-[70px]">
                예상 시수
              </th>
              <th className="text-center py-2.5 px-3 font-medium text-neutral-500 w-[70px]">
                실제 시수
              </th>
              <th className="text-center py-2.5 px-3 font-medium text-neutral-500 w-[120px]">
                진행률
              </th>
              <th className="text-center py-2.5 px-3 font-medium text-neutral-500 w-[60px]">
                상태
              </th>
              {isStaff && (
                <>
                  <th className="text-center py-2.5 px-3 font-medium text-neutral-500 w-[70px]">
                    단가
                  </th>
                  <th className="text-center py-2.5 px-3 font-medium text-neutral-500 w-[90px]">
                    비용
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => {
              const sub = getProjectSubtotal(project);
              const isExpanded = expandedProjects.has(project.code);
              return (
                <ProjectGroup
                  key={project.code}
                  project={project}
                  subtotal={sub}
                  isExpanded={isExpanded}
                  isStaff={isStaff}
                  onToggle={() => toggleProject(project.code)}
                />
              );
            })}
          </tbody>
          {/* Grand Total */}
          <tfoot>
            <tr className="bg-neutral-100 border-t border-neutral-300">
              <td className="py-2.5 px-3 font-bold text-neutral-800" colSpan={3}>
                총 합계
              </td>
              <td className="text-center py-2.5 px-3 font-bold text-neutral-600">
                {grandTotal.estimated}h
              </td>
              <td className="text-center py-2.5 px-3 font-bold text-neutral-900">
                {grandTotal.actual}h
              </td>
              <td className="py-2.5 px-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-700 transition-all"
                      style={{
                        width: `${Math.min(grandTotal.pct, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-neutral-700">
                    {grandTotal.pct}%
                  </span>
                </div>
              </td>
              <td />
              {isStaff && (
                <>
                  <td />
                  <td className="text-center py-2.5 px-3 font-bold text-neutral-800">
                    {fmtKRW(grandTotal.cost)}
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Summary Card ──
function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-200 px-4 py-3">
      <div className="flex items-center gap-1.5 text-neutral-400 mb-1.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-bold text-neutral-900">{value}</div>
    </div>
  );
}

// ── Project Group (header + job rows + subtotal) ──
function ProjectGroup({
  project,
  subtotal,
  isExpanded,
  isStaff,
  onToggle,
}: {
  project: TimesheetProject;
  subtotal: { estimated: number; actual: number; pct: number; cost: number };
  isExpanded: boolean;
  isStaff: boolean;
  onToggle: () => void;
}) {
  const colSpan = isStaff ? 9 : 7;

  return (
    <>
      {/* Project header */}
      <tr
        className="bg-neutral-50/80 border-b border-neutral-200 cursor-pointer hover:bg-neutral-100/60 transition-colors"
        onClick={onToggle}
      >
        <td className="py-2.5 px-3" colSpan={3}>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            ) : (
              <ChevronRightIcon className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            )}
            <span className="text-xs text-neutral-400 font-mono">
              {project.code}
            </span>
            <span className="text-sm font-semibold text-neutral-800">
              {project.name}
            </span>
            <span className="text-xs text-neutral-400 ml-1">
              ({project.jobs.length}건)
            </span>
          </div>
        </td>
        <td className="text-center py-2.5 px-3 text-xs text-neutral-500 font-medium">
          {subtotal.estimated}h
        </td>
        <td className="text-center py-2.5 px-3 text-xs font-bold text-neutral-800">
          {subtotal.actual}h
        </td>
        <td className="py-2.5 px-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full transition-all",
                  subtotal.pct >= 100
                    ? "bg-red-400"
                    : subtotal.pct >= 75
                      ? "bg-amber-400"
                      : "bg-neutral-500"
                )}
                style={{ width: `${Math.min(subtotal.pct, 100)}%` }}
              />
            </div>
            <span
              className={clsx(
                "text-xs font-medium",
                subtotal.pct >= 100
                  ? "text-red-500"
                  : "text-neutral-600"
              )}
            >
              {subtotal.pct}%
            </span>
          </div>
        </td>
        <td />
        {isStaff && (
          <>
            <td />
            <td className="text-center py-2.5 px-3 text-xs font-semibold text-neutral-700">
              {fmtKRW(subtotal.cost)}
            </td>
          </>
        )}
      </tr>

      {/* Job rows */}
      {isExpanded &&
        project.jobs.map((job) => {
          const pct =
            job.estimatedHours > 0
              ? Math.round((job.actualHours / job.estimatedHours) * 100)
              : 0;
          return (
            <tr
              key={job.id}
              className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors"
            >
              <td className="py-2 px-3 pl-9">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-300 font-mono">
                    {job.jobCode}
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    {job.jobName}
                  </span>
                </div>
              </td>
              <td className="py-2 px-3">
                <div className="flex items-center gap-1">
                  <span
                    className={clsx(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      jobTypeBadge[job.jobType].cls
                    )}
                  >
                    {jobTypeBadge[job.jobType].label}
                  </span>
                  <span
                    className={clsx(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      jobDetailBadge[job.jobDetail].cls
                    )}
                  >
                    {jobDetailBadge[job.jobDetail].label}
                  </span>
                </div>
              </td>
              <td className="py-2 px-3 text-xs text-neutral-600">
                {job.assignee}
              </td>
              <td className="text-center py-2 px-3 text-xs text-neutral-400">
                {job.estimatedHours}h
              </td>
              <td className="text-center py-2 px-3 text-xs font-medium text-neutral-800">
                {job.actualHours}h
              </td>
              <td className="py-2 px-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-14 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all",
                        pct >= 100
                          ? "bg-red-400"
                          : pct >= 75
                            ? "bg-amber-400"
                            : "bg-neutral-400"
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span
                    className={clsx(
                      "text-xs",
                      pct >= 100 ? "text-red-500" : "text-neutral-400"
                    )}
                  >
                    {pct}%
                  </span>
                </div>
              </td>
              <td className="text-center py-2 px-3">
                <span
                  className={clsx(
                    "px-1.5 py-0.5 rounded text-[10px] font-medium",
                    statusStyle[job.status]
                  )}
                >
                  {job.status}
                </span>
              </td>
              {isStaff && (
                <>
                  <td className="text-center py-2 px-3 text-xs text-neutral-400">
                    {fmt(job.hourlyRate)}
                  </td>
                  <td className="text-center py-2 px-3 text-xs text-neutral-600">
                    {fmt(job.actualHours * job.hourlyRate)}원
                  </td>
                </>
              )}
            </tr>
          );
        })}

      {/* Subtotal row (when expanded) */}
      {isExpanded && (
        <tr className="bg-neutral-50/50 border-b border-neutral-200">
          <td className="py-2 px-3 pl-9 text-xs text-neutral-500 font-medium" colSpan={3}>
            소계 — {project.name}
          </td>
          <td className="text-center py-2 px-3 text-xs text-neutral-500 font-medium">
            {subtotal.estimated}h
          </td>
          <td className="text-center py-2 px-3 text-xs font-bold text-neutral-700">
            {subtotal.actual}h
          </td>
          <td className="text-center py-2 px-3 text-xs font-medium text-neutral-500">
            {subtotal.pct}%
          </td>
          <td />
          {isStaff && (
            <>
              <td />
              <td className="text-center py-2 px-3 text-xs font-semibold text-neutral-600">
                {fmt(subtotal.cost)}원
              </td>
            </>
          )}
        </tr>
      )}
    </>
  );
}
