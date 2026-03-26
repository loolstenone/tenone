'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign, Users, FolderKanban, Clock, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchProject, fetchProjectMembers, fetchJobs } from '@/lib/supabase/wio';
import type { WIOProject, WIOJob, WIOProjectMember } from '@/types/wio';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    draft: { label: '초안', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    pending: { label: '승인대기', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    approved: { label: '승인', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    in_progress: { label: '진행중', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    completed: { label: '완료', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelled: { label: '취소', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const TYPE_LABELS: Record<string, string> = {
    client: '클라이언트', internal: '내부', community: '커뮤니티', personal: '개인',
};

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params?.id as string;
    const [project, setProject] = useState<WIOProject | null>(null);
    const [members, setMembers] = useState<WIOProjectMember[]>([]);
    const [jobs, setJobs] = useState<WIOJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'jobs' | 'members'>('overview');

    useEffect(() => {
        if (!projectId) return;
        Promise.all([
            fetchProject(projectId),
            fetchProjectMembers(projectId).catch(() => []),
            fetchJobs(projectId).catch(() => []),
        ]).then(([p, m, j]) => {
            setProject(p);
            setMembers(m);
            setJobs(j);
            setLoading(false);
        });
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <FolderKanban className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-slate-500">프로젝트 로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">프로젝트를 찾을 수 없습니다.</p>
                    <Link href="/wio/app/project" className="text-xs text-indigo-400 mt-2 inline-block hover:underline">목록으로</Link>
                </div>
            </div>
        );
    }

    const status = STATUS_LABELS[project.status] || STATUS_LABELS.draft;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const progress = jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link href="/wio/app/project" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mb-3 transition">
                    <ArrowLeft className="w-3.5 h-3.5" /> 프로젝트 목록
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500 font-mono">{project.code}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${status.color}`}>{status.label}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-slate-400">{TYPE_LABELS[project.type] || project.type}</span>
                        </div>
                        <h1 className="text-xl font-bold">{project.title}</h1>
                        {project.description && <p className="text-sm text-slate-400 mt-1">{project.description}</p>}
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/20 transition">
                        <Edit2 className="w-3 h-3" /> 수정
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <Calendar className="w-4 h-4 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-500">기간</p>
                    <p className="text-sm font-medium mt-0.5">{project.startDate || '미정'} ~ {project.deadline || '미정'}</p>
                </div>
                <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <DollarSign className="w-4 h-4 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-500">예산</p>
                    <p className="text-sm font-medium mt-0.5">{project.budget ? `${(project.budget / 10000).toLocaleString()}만원` : '미정'}</p>
                </div>
                <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <Users className="w-4 h-4 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-500">투입 인원</p>
                    <p className="text-sm font-medium mt-0.5">{members.length}명</p>
                </div>
                <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <FolderKanban className="w-4 h-4 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-500">진행률</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-sm font-medium">{progress}%</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/5 mb-6">
                {(['overview', 'jobs', 'members'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`pb-2.5 text-sm transition-colors border-b-2 ${tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        {t === 'overview' ? '개요' : t === 'jobs' ? `업무 (${jobs.length})` : `인원 (${members.length})`}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === 'overview' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                        <h3 className="text-sm font-medium mb-2">프로젝트 정보</h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div><span className="text-slate-500">PM:</span> <span>{project.pmId || '미지정'}</span></div>
                            <div><span className="text-slate-500">유형:</span> <span>{TYPE_LABELS[project.type] || project.type}</span></div>
                            <div><span className="text-slate-500">생성일:</span> <span>{project.createdAt?.split('T')[0]}</span></div>
                            <div><span className="text-slate-500">수익:</span> <span>{project.revenue ? `${(project.revenue / 10000).toLocaleString()}만원` : '-'}</span></div>
                        </div>
                    </div>
                    {jobs.length === 0 && members.length === 0 && (
                        <div className="text-center py-10 text-slate-500 text-sm">
                            아직 업무와 인원이 등록되지 않았습니다.
                        </div>
                    )}
                </div>
            )}

            {tab === 'jobs' && (
                <div className="space-y-2">
                    {jobs.length === 0 ? (
                        <p className="text-center py-10 text-slate-500 text-sm">등록된 업무가 없습니다.</p>
                    ) : jobs.map(job => (
                        <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                {job.status === 'completed' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Clock className="w-4 h-4 text-slate-500" />
                                )}
                                <div>
                                    <p className="text-sm">{job.title}</p>
                                    <p className="text-[10px] text-slate-500">{job.assigneeId || '미배정'}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${STATUS_LABELS[job.status]?.color || 'text-slate-400'}`}>
                                {STATUS_LABELS[job.status]?.label || job.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'members' && (
                <div className="space-y-2">
                    {members.length === 0 ? (
                        <p className="text-center py-10 text-slate-500 text-sm">투입된 인원이 없습니다.</p>
                    ) : members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-300">
                                    {(m.memberId || '?').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm">{m.memberId}</p>
                                    <p className="text-[10px] text-slate-500">{m.role || '멤버'}</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-500">{m.joinedAt?.split('T')[0]}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
