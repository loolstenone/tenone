"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { FolderKanban, Plus, ChevronDown, ChevronRight, Clock, Calendar, Users, Briefcase, CheckCircle2, X, Trash2, Loader2 } from "lucide-react";
import clsx from "clsx";
import type { JobType, JobDetail } from "@/types/project";
import { jobTypeLabels, jobDetailLabels } from "@/types/project";
import * as projectsDb from "@/lib/supabase/projects";

interface Job {
    code: string;
    name: string;
    type: JobType;
    detail: JobDetail;
    members: { name: string; hours: number }[]; // 투입 인력
    startDate: string;
    dueDate: string;
    estimatedHours: number;
    actualHours: number;
    status: '대기' | '진행중' | '완료' | '보류';
    // 예상 손익 (만원)
    estBilling?: number;     // 예상 취급액
    estExCost?: number;      // 예상 외부비
    estRevenue?: number;     // 예상 매총
    estInCost?: number;      // 예상 내부비
}

interface MyProject {
    code: string;
    name: string;
    type: '커뮤니티' | '클라이언트' | '내부';
    status: '기획' | '진행' | '완료';
    pm: string;
    myRole: string;
    startDate: string;
    endDate: string;
    jobs: Job[];
}

const myProjects: MyProject[] = [
    {
        code: 'PRJ-2026-0001', name: 'LUKI 2nd Single', type: '클라이언트', status: '진행',
        pm: 'Sarah Kim', myRole: '기획 총괄', startDate: '2026-02-01', endDate: '2026-05-31',
        jobs: [
            { code: 'PRJ-2026-0001-PR-PL0001', name: '컨셉 기획', type: 'PR', detail: 'PL', members: [{ name: 'Cheonil Jeon', hours: 15 }], startDate: '2026-02-01', dueDate: '2026-03-15', estimatedHours: 15, actualHours: 11, status: '진행중' },
            { code: 'PRJ-2026-0001-PR-DO0001', name: 'MV 제작', type: 'PR', detail: 'DO', members: [{ name: '이영상', hours: 40 }, { name: '박디자', hours: 10 }], startDate: '2026-03-01', dueDate: '2026-04-30', estimatedHours: 40, actualHours: 12, status: '진행중' },
            { code: 'PRJ-2026-0001-ME-PL0001', name: '미디어 플래닝', type: 'ME', detail: 'PL', members: [{ name: '유광고', hours: 20 }], startDate: '2026-03-15', dueDate: '2026-05-15', estimatedHours: 20, actualHours: 8, status: '대기' },
            { code: 'PRJ-2026-0001-PR-DO0002', name: '비주얼 디자인', type: 'PR', detail: 'DO', members: [{ name: '박디자', hours: 25 }, { name: '양그래', hours: 5 }], startDate: '2026-02-15', dueDate: '2026-04-15', estimatedHours: 30, actualHours: 15, status: '진행중' },
            { code: 'PRJ-2026-0001-PR-RE0001', name: '성과 리포트', type: 'PR', detail: 'RE', members: [{ name: '한마케', hours: 10 }], startDate: '2026-05-15', dueDate: '2026-05-31', estimatedHours: 10, actualHours: 0, status: '대기' },
        ],
    },
    {
        code: 'PRJ-2026-0002', name: 'MADLeap 5기 운영', type: '커뮤니티', status: '진행',
        pm: '김준호', myRole: 'PM', startDate: '2026-03-01', endDate: '2026-06-30',
        jobs: [
            { code: 'PRJ-2026-0002-PT-PL0001', name: 'OT 기획', type: 'PT', detail: 'PL', members: [{ name: '김준호', hours: 8 }], startDate: '2026-03-01', dueDate: '2026-03-20', estimatedHours: 8, actualHours: 6, status: '진행중' },
            { code: 'PRJ-2026-0002-PR-DO0001', name: '활동 콘텐츠 제작', type: 'PR', detail: 'DO', members: [{ name: '김콘텐', hours: 20 }, { name: '진작가', hours: 10 }], startDate: '2026-03-15', dueDate: '2026-06-15', estimatedHours: 30, actualHours: 5, status: '대기' },
            { code: 'PRJ-2026-0002-PR-RE0001', name: '시즌 리포트', type: 'PR', detail: 'RE', members: [{ name: '마리그', hours: 10 }], startDate: '2026-06-15', dueDate: '2026-06-30', estimatedHours: 10, actualHours: 0, status: '대기' },
        ],
    },
    {
        code: 'PRJ-2026-0003', name: '리제로스 시즌2', type: '커뮤니티', status: '기획',
        pm: '마리그', myRole: '멘토', startDate: '2026-04-01', endDate: '2026-09-30',
        jobs: [
            { code: 'PRJ-2026-0003-PR-PL0001', name: '스폰서 제안서', type: 'PR', detail: 'PL', members: [{ name: 'Sarah Kim', hours: 10 }], startDate: '2026-03-01', dueDate: '2026-03-31', estimatedHours: 10, actualHours: 9.5, status: '진행중' },
            { code: 'PRJ-2026-0003-PT-PL0001', name: '경쟁PT 기획', type: 'PT', detail: 'PL', members: [{ name: '마리그', hours: 10 }], startDate: '2026-04-01', dueDate: '2026-05-31', estimatedHours: 20, actualHours: 0, status: '대기' },
        ],
    },
];

const typeBadge = { '커뮤니티': 'bg-violet-50 text-violet-600', '클라이언트': 'bg-blue-50 text-blue-600', '내부': 'bg-neutral-100 text-neutral-500' };
const statusBadge = { '기획': 'bg-neutral-100 text-neutral-500', '진행': 'bg-blue-50 text-blue-600', '완료': 'bg-green-50 text-green-600' };
const jobStatusBadge = { '대기': 'bg-neutral-100 text-neutral-500', '진행중': 'bg-blue-50 text-blue-600', '완료': 'bg-green-50 text-green-600', '보류': 'bg-amber-50 text-amber-600' };

let jobCounter = 100;

export default function MyProjectsPage() {
    const { user, isStaff } = useAuth();
    const [projects, setProjects] = useState(myProjects);
    const [loading, setLoading] = useState(true);
    const [expandedProject, setExpandedProject] = useState<string | null>('PRJ-2026-0001');
    const [showJobModal, setShowJobModal] = useState<string | null>(null);
    const [newJob, setNewJob] = useState({ name: '', type: 'PR' as JobType, detail: 'PL' as JobDetail, startDate: '', dueDate: '', estimatedHours: '' });
    const [jobMembers, setJobMembers] = useState<{ name: string; hours: string; startDate: string; endDate: string }[]>([]);

    // DB 로드 (프로젝트 + Job)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { projects: dbProjects } = await projectsDb.fetchProjects();
                if (!cancelled && dbProjects.length > 0) {
                    const mapped: MyProject[] = await Promise.all(
                        dbProjects.map(async (p: any) => {
                            let jobs: Job[] = [];
                            try {
                                const dbJobs = await projectsDb.fetchJobs(p.id);
                                jobs = dbJobs.map((j: any) => ({
                                    code: j.code ?? j.id,
                                    name: j.name,
                                    type: j.type ?? 'PR',
                                    detail: j.detail ?? 'PL',
                                    members: j.members ?? [{ name: '-', hours: 0 }],
                                    startDate: j.start_date ?? j.startDate ?? '',
                                    dueDate: j.due_date ?? j.dueDate ?? '',
                                    estimatedHours: j.estimated_hours ?? j.estimatedHours ?? 0,
                                    actualHours: j.actual_hours ?? j.actualHours ?? 0,
                                    status: j.status ?? '대기',
                                }));
                            } catch { /* jobs 로드 실패 무시 */ }
                            return {
                                code: p.code,
                                name: p.name,
                                type: p.type ?? '내부',
                                status: p.status ?? '기획',
                                pm: p.pm?.name ?? '-',
                                myRole: p.my_role ?? '멤버',
                                startDate: p.start_date ?? p.startDate ?? '',
                                endDate: p.end_date ?? p.endDate ?? '',
                                jobs,
                            } as MyProject;
                        })
                    );
                    // DB에서 job이 하나라도 있는 프로젝트가 있으면 DB 데이터 사용
                    const hasAnyJobs = mapped.some(p => p.jobs.length > 0);
                    if (hasAnyJobs) {
                        setProjects(mapped);
                        if (mapped.length > 0) setExpandedProject(mapped[0].code);
                    }
                }
            } catch (e) {
                console.warn("[Jobs] DB 로드 실패, Mock 사용:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                <span className="ml-2 text-sm text-neutral-400">Job 로딩중...</span>
            </div>
        );
    }

    const addJob = (projectCode: string) => {
        if (!newJob.name.trim()) return;
        const project = projects.find(p => p.code === projectCode);
        if (!project) return;

        const typeCount = project.jobs.filter(j => j.type === newJob.type && j.detail === newJob.detail).length;
        const jobCode = `${projectCode}-${newJob.type}-${newJob.detail}${String(typeCount + 1).padStart(4, '0')}`;

        const mainAssignee = jobMembers.length > 0 ? jobMembers[0].name : user.name;
        const totalEstHours = jobMembers.length > 0
            ? jobMembers.reduce((s, m) => s + (Number(m.hours) || 0), 0)
            : (Number(newJob.estimatedHours) || 0);

        const job: Job = {
            code: jobCode,
            name: newJob.name.trim(),
            type: newJob.type,
            detail: newJob.detail,
            members: jobMembers.length > 0 ? jobMembers.map(m => ({ name: m.name, hours: Number(m.hours) || 0 })) : [{ name: user.name, hours: totalEstHours }],
            startDate: newJob.startDate,
            dueDate: newJob.dueDate,
            estimatedHours: totalEstHours,
            actualHours: 0,
            status: '대기',
        };

        setProjects(prev => prev.map(p => p.code === projectCode ? { ...p, jobs: [...p.jobs, job] } : p));

        // DB 저장 (비동기)
        projectsDb.createJob({
            code: jobCode,
            name: job.name,
            type: job.type,
            detail: job.detail,
            start_date: job.startDate,
            due_date: job.dueDate,
            estimated_hours: job.estimatedHours,
            actual_hours: 0,
            status: job.status,
        }).catch(e => console.warn("[Jobs] DB 저장 실패:", e));

        setShowJobModal(null);
        setNewJob({ name: '', type: 'PR', detail: 'PL', startDate: '', dueDate: '', estimatedHours: '' });
        setJobMembers([]);
    };

    const allJobs = projects.flatMap(p => p.jobs.map(j => ({ ...j, projectCode: p.code, projectName: p.name })));
    const [viewMode, setViewMode] = useState<'project' | 'all'>('project');
    const [showLegend, setShowLegend] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'전체' | '대기' | '진행중' | '완료' | '보류'>('전체');
    const [typeFilter, setTypeFilter] = useState<'전체' | 'PR' | 'ME' | 'PT'>('전체');

    const totalJobs = allJobs.length;
    const activeJobs = allJobs.filter(j => j.status === '진행중').length;
    const completedJobs = allJobs.filter(j => j.status === '완료').length;
    const totalEstimated = allJobs.reduce((s, j) => s + j.estimatedHours, 0);
    const totalActualAll = allJobs.reduce((s, j) => s + j.actualHours, 0);

    const filteredAllJobs = allJobs.filter(j => {
        if (statusFilter !== '전체' && j.status !== statusFilter) return false;
        if (typeFilter !== '전체' && j.type !== typeFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!j.name.toLowerCase().includes(q) && !j.projectName.toLowerCase().includes(q) && !j.code.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    return (
        <div className="max-w-5xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">Job 관리</h1>
                    <p className="text-sm text-neutral-500 mt-1">프로젝트별 Job 등록 · 관리</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex gap-1 border border-neutral-200 rounded overflow-hidden">
                        <button onClick={() => setViewMode('project')}
                            className={clsx("px-3 py-1.5 text-xs transition-colors", viewMode === 'project' ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50")}>
                            프로젝트별
                        </button>
                        <button onClick={() => setViewMode('all')}
                            className={clsx("px-3 py-1.5 text-xs transition-colors", viewMode === 'all' ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50")}>
                            전체 Job
                        </button>
                    </div>
                </div>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-5 gap-3 mb-5">
                {[
                    { label: "전체 Job", value: `${totalJobs}건` },
                    { label: "진행중", value: `${activeJobs}건` },
                    { label: "완료", value: `${completedJobs}건` },
                    { label: "예상 시수", value: `${totalEstimated}h` },
                    { label: "실제 시수", value: `${totalActualAll}h` },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-3.5">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* 필터 (전체 Job 뷰에서만) */}
            {viewMode === 'all' && (
                <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full border border-neutral-200 pl-3 pr-4 py-2 text-xs rounded focus:outline-none focus:border-neutral-400"
                            placeholder="Job명, 프로젝트명, 코드 검색..." />
                    </div>
                    <div className="flex gap-1">
                        {(['전체', 'PR', 'ME', 'PT'] as const).map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)}
                                className={clsx("px-2.5 py-2 text-xs rounded transition-all",
                                    typeFilter === t ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}>
                                {t === '전체' ? '전체' : t === 'PR' ? '제작' : t === 'ME' ? 'Media' : 'PT'}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1">
                        {(['전체', '대기', '진행중', '완료', '보류'] as const).map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={clsx("px-2.5 py-2 text-xs rounded transition-all",
                                    statusFilter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 범례 + 결과 수 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowLegend(!showLegend)} className="text-xs text-neutral-400 hover:text-neutral-700 underline">
                        {showLegend ? "범례 닫기" : "범례 보기"}
                    </button>
                    <span className="text-xs text-neutral-400">
                        {viewMode === 'all' ? `${filteredAllJobs.length}건 표시 / 전체 ${totalJobs}건` : `${projects.length}개 프로젝트 · ${totalJobs}건 Job`}
                    </span>
                </div>
            </div>
                {showLegend && (
                    <div className="border border-neutral-200 bg-white p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs font-bold mb-2">프로젝트 유형</p>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded">커뮤니티</span><span className="text-xs text-neutral-500">크루 참여 프로젝트</span></div>
                                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">클라이언트</span><span className="text-xs text-neutral-500">외부 수주 프로젝트</span></div>
                                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">내부</span><span className="text-xs text-neutral-500">사내 프로젝트</span></div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold mb-2">Job 유형</p>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">PR (제작)</span><span className="text-xs text-neutral-500">콘텐츠, 디자인, 영상</span></div>
                                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">ME (Media)</span><span className="text-xs text-neutral-500">매체 집행, 미디어 플래닝</span></div>
                                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">PT</span><span className="text-xs text-neutral-500">프레젠테이션, 경쟁 PT</span></div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold mb-2">Job 세부 유형</p>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-400 rounded">PL (기획)</span><span className="text-xs text-neutral-500">전략, 컨셉, 리서치</span></div>
                                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-400 rounded">DO (실행)</span><span className="text-xs text-neutral-500">제작, 촬영, 개발, 집행</span></div>
                                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-400 rounded">RE (Report)</span><span className="text-xs text-neutral-500">성과 분석, 리포트, 회고</span></div>
                                </div>
                            </div>
                        </div>
                        {/* 코드 체계 예시 */}
                        <div className="border-t border-neutral-100 pt-3">
                            <p className="text-xs font-bold mb-2">코드 체계</p>
                            <div className="bg-neutral-50 rounded p-3 font-mono text-sm">
                                <span className="text-blue-600">PRJ</span>
                                <span className="text-neutral-300">-</span>
                                <span className="text-neutral-600">2026</span>
                                <span className="text-neutral-300">-</span>
                                <span className="text-neutral-600">001</span>
                                <span className="text-neutral-300">-</span>
                                <span className="text-emerald-600">PR</span>
                                <span className="text-neutral-300">-</span>
                                <span className="text-amber-600">PL</span>
                                <span className="text-neutral-300">-</span>
                                <span className="text-neutral-500">001</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                                <span><span className="text-blue-600 font-medium">PRJ</span> 프로젝트</span>
                                <span><span className="text-neutral-600 font-medium">2026</span> 연도</span>
                                <span><span className="text-neutral-600 font-medium">001</span> 순번</span>
                                <span><span className="text-emerald-600 font-medium">PR</span> Job 유형</span>
                                <span><span className="text-amber-600 font-medium">PL</span> 세부 유형</span>
                                <span><span className="text-neutral-500 font-medium">001</span> Job 순번</span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-2">예시: <span className="font-mono"><span className="text-blue-600">PRJ</span>-<span className="text-neutral-600">2026</span>-<span className="text-neutral-600">001</span>-<span className="text-emerald-600">ME</span>-<span className="text-amber-600">DO</span>-<span className="text-neutral-500">002</span></span> = LUKI 2nd Single의 두 번째 미디어 실행 Job</p>
                        </div>
                    </div>
                )}

            {/* 전체 Job 리스트 뷰 */}
            {viewMode === 'all' && (
                <div className="border border-neutral-200 bg-white mb-4">
                    <div className="grid grid-cols-12 gap-1 px-4 py-2 border-b border-neutral-100 text-xs text-neutral-400 uppercase tracking-wider">
                        <span className="col-span-2">프로젝트</span>
                        <span className="col-span-2">Job 코드</span>
                        <span className="col-span-2">Job명</span>
                        <span className="col-span-1">유형</span>
                        <span className="col-span-1">투입인력</span>
                        <span className="col-span-2">기간</span>
                        <span className="col-span-1">시수</span>
                        <span className="col-span-1">상태</span>
                    </div>
                    {filteredAllJobs.map(job => (
                        <div key={job.code} className="grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-neutral-50 last:border-0 items-center hover:bg-neutral-50 text-xs">
                            <a href={`/intra/project/management/${job.projectCode}`} className="col-span-2 text-neutral-500 truncate hover:text-neutral-900 hover:underline">{job.projectName}</a>
                            <span className="col-span-2 font-mono text-neutral-400">{job.code.split('-').slice(-2).join('-')}</span>
                            <span className="col-span-2 font-medium truncate">{job.name}</span>
                            <div className="col-span-1 flex gap-0.5">
                                <span className="text-xs px-1 py-0.5 bg-neutral-100 text-neutral-500 rounded">{jobTypeLabels[job.type]}</span>
                            </div>
                            <span className="col-span-1 text-neutral-600 truncate">{job.members.map(m => m.name).join(', ')}</span>
                            <span className="col-span-2 text-neutral-400">{job.startDate.slice(5)} ~ {job.dueDate.slice(5)}</span>
                            <div className="col-span-1">
                                <span className="text-neutral-600">{job.actualHours}</span>
                                <span className="text-neutral-300">/{job.estimatedHours}h</span>
                            </div>
                            <span className={clsx("col-span-1 text-xs px-1.5 py-0.5 rounded w-fit", jobStatusBadge[job.status])}>{job.status}</span>
                        </div>
                    ))}
                    {filteredAllJobs.length === 0 && <div className="py-8 text-center text-xs text-neutral-400">조건에 맞는 Job이 없습니다</div>}
                    <div className="px-4 py-2 border-t border-neutral-100 text-xs text-neutral-400 text-right">
                        {filteredAllJobs.length}건 표시 / 전체 {totalJobs}건
                    </div>
                </div>
            )}

            {/* 프로젝트별 뷰 */}
            {viewMode === 'project' && (
            <div className="space-y-2">
                {projects.map(project => {
                    const isOpen = expandedProject === project.code;
                    const totalEstimated = project.jobs.reduce((s, j) => s + j.estimatedHours, 0);
                    const totalActual = project.jobs.reduce((s, j) => s + j.actualHours, 0);
                    return (
                        <div key={project.code} className="border border-neutral-200 bg-white">
                            {/* 프로젝트 헤더 */}
                            <button onClick={() => setExpandedProject(isOpen ? null : project.code)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-neutral-50 transition-colors">
                                {isOpen ? <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="font-mono text-xs text-neutral-400 bg-neutral-50 px-1 py-0.5">{project.code}</span>
                                        <span className={clsx("text-xs px-1.5 py-0.5 rounded", typeBadge[project.type])}>{project.type}</span>
                                        <span className={clsx("text-xs px-1.5 py-0.5 rounded", statusBadge[project.status])}>{project.status}</span>
                                    </div>
                                    <a href={`/intra/project/management/${project.code}`} className="text-sm font-medium hover:underline">{project.name}</a>
                                    <div className="flex items-center gap-4 mt-0.5 text-xs text-neutral-400">
                                        <span>PM: {project.pm}</span>
                                        <span>내 역할: {project.myRole}</span>
                                        <span>{project.startDate} ~ {project.endDate}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-medium">{project.jobs.length} Jobs</p>
                                    <p className="text-xs text-neutral-400">{totalActual}h / {totalEstimated}h</p>
                                </div>
                            </button>

                            {/* 프로젝트 상세: Job 리스트 */}
                            {isOpen && (
                                <div className="border-t border-neutral-100">
                                    {/* 프로젝트 개요 */}
                                    <div className="px-4 py-3 bg-neutral-50/50 flex items-center justify-between">
                                        <div className="flex gap-4 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> Job {project.jobs.length}건</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 총 {totalEstimated}h 예상 / {totalActual}h 실제</span>
                                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {project.jobs.filter(j => j.status === '완료').length}건 완료</span>
                                        </div>
                                        <button onClick={() => setShowJobModal(project.code)}
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-neutral-900 text-white hover:bg-neutral-800">
                                            <Plus className="h-3 w-3" /> Job 등록
                                        </button>
                                    </div>

                                    {/* Job 테이블 */}
                                    <div className="px-4 pb-3">
                                        <div className="grid grid-cols-12 gap-1 py-2 text-xs text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                                            <span className="col-span-2">Job 코드</span>
                                            <span className="col-span-3">Job명</span>
                                            <span className="col-span-1">유형</span>
                                            <span className="col-span-1">투입인력</span>
                                            <span className="col-span-2">기간</span>
                                            <span className="col-span-1">시수</span>
                                            <span className="col-span-1">상태</span>
                                            <span className="col-span-1"></span>
                                        </div>
                                        {project.jobs.map(job => (
                                            <div key={job.code} className="grid grid-cols-12 gap-1 py-2 border-b border-neutral-50 last:border-0 items-center hover:bg-neutral-50 text-xs">
                                                <span className="col-span-2 font-mono text-xs text-neutral-400">{job.code.replace(project.code + '-', '')}</span>
                                                <span className="col-span-3 font-medium truncate">{job.name}</span>
                                                <div className="col-span-1 flex gap-0.5">
                                                    <span className="text-xs px-1 py-0.5 bg-neutral-100 text-neutral-500 rounded">{jobTypeLabels[job.type]}</span>
                                                    <span className="text-xs px-1 py-0.5 bg-neutral-50 text-neutral-400 rounded">{jobDetailLabels[job.detail]}</span>
                                                </div>
                                                <span className="col-span-1 text-neutral-600 truncate">{job.members.map(m => m.name).join(', ')}</span>
                                                <span className="col-span-2 text-xs text-neutral-400">{job.startDate.slice(5)} ~ {job.dueDate.slice(5)}</span>
                                                <div className="col-span-1">
                                                    <span className="text-neutral-600">{job.actualHours}</span>
                                                    <span className="text-neutral-300">/{job.estimatedHours}h</span>
                                                </div>
                                                <span className={clsx("col-span-1 text-xs px-1.5 py-0.5 rounded w-fit", jobStatusBadge[job.status])}>{job.status}</span>
                                                <span className="col-span-1"></span>
                                            </div>
                                        ))}
                                        {project.jobs.length === 0 && (
                                            <div className="py-6 text-center text-xs text-neutral-400">등록된 Job이 없습니다. Job을 등록해주세요.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            )}

            {/* Job 등록 모달 */}
            {showJobModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowJobModal(null)}>
                    <div className="bg-white rounded-lg w-[560px] shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold">Job 등록</h3>
                                <p className="text-xs text-neutral-400">{showJobModal}</p>
                            </div>
                            <button onClick={() => setShowJobModal(null)}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                            {/* Job 코드 미리보기 */}
                            <div className="bg-neutral-50 border border-neutral-100 rounded p-2">
                                <p className="text-xs text-neutral-400">Job 코드 (자동생성)</p>
                                <p className="text-xs font-mono text-neutral-600">
                                    {showJobModal}-{newJob.type}-{newJob.detail}
                                    <span className="text-neutral-300">0001</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">Job명 *</label>
                                <input value={newJob.name} onChange={e => setNewJob({ ...newJob, name: e.target.value })}
                                    placeholder="예: 컨셉 기획, MV 촬영, 미디어 바잉"
                                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">유형 *</label>
                                    <select value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value as JobType })}
                                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded bg-white">
                                        <option value="PR">PR (제작)</option>
                                        <option value="ME">ME (Media)</option>
                                        <option value="PT">PT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">세부 *</label>
                                    <select value={newJob.detail} onChange={e => setNewJob({ ...newJob, detail: e.target.value as JobDetail })}
                                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded bg-white">
                                        <option value="PL">PL (기획)</option>
                                        <option value="DO">DO (실행)</option>
                                        <option value="RE">RE (Report)</option>
                                    </select>
                                </div>
                            </div>

                            {/* PM 정보 (자동) */}
                            <div className="bg-neutral-50 border border-neutral-100 rounded px-3 py-2 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-neutral-400">등록 PM</p>
                                    <p className="text-sm font-medium">{user?.name || '-'}</p>
                                </div>
                                <span className="text-xs text-neutral-300">자동 입력</span>
                            </div>

                            {/* Job 기간 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">시작일</label>
                                    <input type="date" value={newJob.startDate} onChange={e => setNewJob({ ...newJob, startDate: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded" />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">마감일</label>
                                    <input type="date" value={newJob.dueDate} onChange={e => setNewJob({ ...newJob, dueDate: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded" />
                                </div>
                            </div>

                            {/* 투입 인력 */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs text-neutral-500 font-medium">투입 인력</label>
                                    <button type="button" onClick={() => setJobMembers(prev => [...prev, { name: '', hours: '', startDate: newJob.startDate, endDate: newJob.dueDate }])}
                                        className="text-xs text-neutral-400 hover:text-neutral-700 underline">+ 인력 추가</button>
                                </div>
                                {jobMembers.length === 0 && (
                                    <div className="border border-dashed border-neutral-200 rounded p-3 text-center">
                                        <p className="text-xs text-neutral-400">투입 인력을 추가하세요</p>
                                        <p className="text-xs text-neutral-300 mt-0.5">인력별 투입 기간 · 예상 시수 설정</p>
                                    </div>
                                )}
                                {jobMembers.map((m, i) => (
                                    <div key={i} className="flex items-end gap-2 mb-2">
                                        <div className="flex-1">
                                            {i === 0 && <p className="text-xs text-neutral-400 mb-0.5">이름</p>}
                                            <input value={m.name} onChange={e => {
                                                const next = [...jobMembers]; next[i] = { ...next[i], name: e.target.value }; setJobMembers(next);
                                            }} placeholder="이름" className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded placeholder:text-neutral-300" />
                                        </div>
                                        <div className="w-20">
                                            {i === 0 && <p className="text-xs text-neutral-400 mb-0.5">시수</p>}
                                            <input type="number" value={m.hours} onChange={e => {
                                                const next = [...jobMembers]; next[i] = { ...next[i], hours: e.target.value }; setJobMembers(next);
                                            }} placeholder="20" min={0} className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded text-center placeholder:text-neutral-300" />
                                        </div>
                                        <div className="w-28">
                                            {i === 0 && <p className="text-xs text-neutral-400 mb-0.5">시작</p>}
                                            <input type="date" value={m.startDate} onChange={e => {
                                                const next = [...jobMembers]; next[i] = { ...next[i], startDate: e.target.value }; setJobMembers(next);
                                            }} className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded" />
                                        </div>
                                        <div className="w-28">
                                            {i === 0 && <p className="text-xs text-neutral-400 mb-0.5">종료</p>}
                                            <input type="date" value={m.endDate} onChange={e => {
                                                const next = [...jobMembers]; next[i] = { ...next[i], endDate: e.target.value }; setJobMembers(next);
                                            }} className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded" />
                                        </div>
                                        <button onClick={() => setJobMembers(prev => prev.filter((_, idx) => idx !== i))}
                                            className="p-1 hover:bg-red-50 rounded mb-0.5">
                                            <Trash2 className="h-3.5 w-3.5 text-neutral-300 hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                                {jobMembers.length > 0 && (
                                    <div className="flex items-center justify-between mt-1 text-xs text-neutral-400">
                                        <span>투입 인원 {jobMembers.length}명</span>
                                        <span>총 예상 시수 {jobMembers.reduce((s, m) => s + (Number(m.hours) || 0), 0)}h</span>
                                    </div>
                                )}
                            </div>

                            {/* 예상 시수 (인력 미지정 시) */}
                            {jobMembers.length === 0 && (
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">예상 시수 *</label>
                                    <input type="number" value={newJob.estimatedHours} onChange={e => setNewJob({ ...newJob, estimatedHours: e.target.value })}
                                        placeholder="20" min={0}
                                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded placeholder:text-neutral-300" />
                                </div>
                            )}
                        </div>
                        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setShowJobModal(null)} className="px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                            <button onClick={() => addJob(showJobModal)} disabled={!newJob.name.trim()}
                                className="px-4 py-1.5 text-xs bg-neutral-900 text-white disabled:opacity-30">Job 추가</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
