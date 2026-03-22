"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { FolderKanban, Plus, ChevronDown, ChevronRight, Clock, Calendar, Users, Briefcase, CheckCircle2, X } from "lucide-react";
import clsx from "clsx";
import type { JobType, JobDetail } from "@/types/project";
import { jobTypeLabels, jobDetailLabels } from "@/types/project";

interface Job {
    code: string;
    name: string;
    type: JobType;
    detail: JobDetail;
    assignee: string;
    startDate: string;
    dueDate: string;
    estimatedHours: number;
    actualHours: number;
    status: '대기' | '진행중' | '완료' | '보류';
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
            { code: 'PRJ-2026-0001-PR-PL0001', name: '컨셉 기획', type: 'PR', detail: 'PL', assignee: 'Cheonil Jeon', startDate: '2026-02-01', dueDate: '2026-03-15', estimatedHours: 15, actualHours: 11, status: '진행중' },
            { code: 'PRJ-2026-0001-PR-DO0001', name: 'MV 제작', type: 'PR', detail: 'DO', assignee: '이영상', startDate: '2026-03-01', dueDate: '2026-04-30', estimatedHours: 40, actualHours: 12, status: '진행중' },
            { code: 'PRJ-2026-0001-ME-PL0001', name: '미디어 플래닝', type: 'ME', detail: 'PL', assignee: '유광고', startDate: '2026-03-15', dueDate: '2026-05-15', estimatedHours: 20, actualHours: 8, status: '대기' },
            { code: 'PRJ-2026-0001-PR-DO0002', name: '비주얼 디자인', type: 'PR', detail: 'DO', assignee: '박디자', startDate: '2026-02-15', dueDate: '2026-04-15', estimatedHours: 30, actualHours: 15, status: '진행중' },
            { code: 'PRJ-2026-0001-PR-RE0001', name: '성과 리포트', type: 'PR', detail: 'RE', assignee: '한마케', startDate: '2026-05-15', dueDate: '2026-05-31', estimatedHours: 10, actualHours: 0, status: '대기' },
        ],
    },
    {
        code: 'PRJ-2026-0002', name: 'MADLeap 5기 운영', type: '커뮤니티', status: '진행',
        pm: '김준호', myRole: 'PM', startDate: '2026-03-01', endDate: '2026-06-30',
        jobs: [
            { code: 'PRJ-2026-0002-PT-PL0001', name: 'OT 기획', type: 'PT', detail: 'PL', assignee: '김준호', startDate: '2026-03-01', dueDate: '2026-03-20', estimatedHours: 8, actualHours: 6, status: '진행중' },
            { code: 'PRJ-2026-0002-PR-DO0001', name: '활동 콘텐츠 제작', type: 'PR', detail: 'DO', assignee: '김콘텐', startDate: '2026-03-15', dueDate: '2026-06-15', estimatedHours: 30, actualHours: 5, status: '대기' },
            { code: 'PRJ-2026-0002-PR-RE0001', name: '시즌 리포트', type: 'PR', detail: 'RE', assignee: '마리그', startDate: '2026-06-15', dueDate: '2026-06-30', estimatedHours: 10, actualHours: 0, status: '대기' },
        ],
    },
    {
        code: 'PRJ-2026-0003', name: '리제로스 시즌2', type: '커뮤니티', status: '기획',
        pm: '마리그', myRole: '멘토', startDate: '2026-04-01', endDate: '2026-09-30',
        jobs: [
            { code: 'PRJ-2026-0003-PR-PL0001', name: '스폰서 제안서', type: 'PR', detail: 'PL', assignee: 'Sarah Kim', startDate: '2026-03-01', dueDate: '2026-03-31', estimatedHours: 10, actualHours: 9.5, status: '진행중' },
            { code: 'PRJ-2026-0003-PT-PL0001', name: '경쟁PT 기획', type: 'PT', detail: 'PL', assignee: '마리그', startDate: '2026-04-01', dueDate: '2026-05-31', estimatedHours: 20, actualHours: 0, status: '대기' },
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
    const [expandedProject, setExpandedProject] = useState<string | null>('PRJ-2026-0001');
    const [showJobModal, setShowJobModal] = useState<string | null>(null);
    const [newJob, setNewJob] = useState({ name: '', type: 'PR' as JobType, detail: 'PL' as JobDetail, assignee: '', startDate: '', dueDate: '', estimatedHours: '' });

    if (!user) return null;

    const addJob = (projectCode: string) => {
        if (!newJob.name.trim()) return;
        const project = projects.find(p => p.code === projectCode);
        if (!project) return;

        const typeCount = project.jobs.filter(j => j.type === newJob.type && j.detail === newJob.detail).length;
        const jobCode = `${projectCode}-${newJob.type}-${newJob.detail}${String(typeCount + 1).padStart(4, '0')}`;

        const job: Job = {
            code: jobCode,
            name: newJob.name.trim(),
            type: newJob.type,
            detail: newJob.detail,
            assignee: newJob.assignee || user.name,
            startDate: newJob.startDate,
            dueDate: newJob.dueDate,
            estimatedHours: Number(newJob.estimatedHours) || 0,
            actualHours: 0,
            status: '대기',
        };

        setProjects(prev => prev.map(p => p.code === projectCode ? { ...p, jobs: [...p.jobs, job] } : p));
        setShowJobModal(null);
        setNewJob({ name: '', type: 'PR', detail: 'PL', assignee: '', startDate: '', dueDate: '', estimatedHours: '' });
    };

    return (
        <div className="max-w-4xl">
            <div className="mb-5">
                <h1 className="text-xl font-bold">프로젝트 관리</h1>
                <p className="text-xs text-neutral-400 mt-0.5">참여 중인 프로젝트와 Job을 관리합니다</p>
            </div>

            {/* 프로젝트 리스트 */}
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
                                    <h3 className="text-sm font-medium">{project.name}</h3>
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
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-800">
                                            <Plus className="h-3 w-3" /> Job 등록
                                        </button>
                                    </div>

                                    {/* Job 테이블 */}
                                    <div className="px-4 pb-3">
                                        <div className="grid grid-cols-12 gap-1 py-2 text-xs text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                                            <span className="col-span-2">Job 코드</span>
                                            <span className="col-span-3">Job명</span>
                                            <span className="col-span-1">유형</span>
                                            <span className="col-span-1">담당</span>
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
                                                <span className="col-span-1 text-neutral-600 truncate">{job.assignee}</span>
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

            {/* Job 등록 모달 */}
            {showJobModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowJobModal(null)}>
                    <div className="bg-white rounded-lg w-[450px] shadow-xl" onClick={e => e.stopPropagation()}>
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

                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">담당자</label>
                                <input value={newJob.assignee} onChange={e => setNewJob({ ...newJob, assignee: e.target.value })}
                                    placeholder={user?.name || '본인'}
                                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
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
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">예상 시수 *</label>
                                    <input type="number" value={newJob.estimatedHours} onChange={e => setNewJob({ ...newJob, estimatedHours: e.target.value })}
                                        placeholder="20" min={0}
                                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded placeholder:text-neutral-300" />
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setShowJobModal(null)} className="px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                            <button onClick={() => addJob(showJobModal)} disabled={!newJob.name.trim()}
                                className="px-4 py-1.5 text-xs bg-neutral-900 text-white rounded disabled:opacity-30">Job 등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
