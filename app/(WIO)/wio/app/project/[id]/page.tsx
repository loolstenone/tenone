'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign, Users, FolderKanban, Clock, Edit2, CheckCircle2, AlertCircle, Plus, Send, MessageSquare, Heart, Activity } from 'lucide-react';
import { fetchProject, fetchProjectMembers, fetchJobs, createJob, updateJob } from '@/lib/supabase/wio';
import type { WIOProject, WIOJob, WIOProjectMember } from '@/types/wio';
import { useWIO } from '../../layout';

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
    const { tenant } = useWIO();
    const [project, setProject] = useState<WIOProject | null>(null);
    const [members, setMembers] = useState<WIOProjectMember[]>([]);
    const [jobs, setJobs] = useState<WIOJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'jobs' | 'members' | 'feed'>('overview');
    const [newJobTitle, setNewJobTitle] = useState('');
    const [showJobForm, setShowJobForm] = useState(false);
    const [feedInput, setFeedInput] = useState('');

    // 타임라인 피드
    type FeedItem = { id: string; type: 'post' | 'status' | 'comment' | 'file' | 'member'; author: string; text: string; time: string; likes: number; liked: boolean; comments: { author: string; text: string; time: string }[] };
    const [feedItems, setFeedItems] = useState<FeedItem[]>([
      { id: 'f1', type: 'post', author: 'PM', text: '킥오프 미팅 완료! 프로젝트 목표와 마일스톤을 확정했습니다. 첨부된 회의록을 확인해주세요.', time: '2시간 전', likes: 3, liked: false, comments: [{ author: '김민지', text: '회의록 확인했습니다. 2차 마일스톤 일정 조정 가능할까요?', time: '1시간 전' }] },
      { id: 'f2', type: 'status', author: '시스템', text: '프로젝트 상태가 "승인대기" → "진행중"으로 변경되었습니다.', time: '3시간 전', likes: 0, liked: false, comments: [] },
      { id: 'f3', type: 'member', author: '시스템', text: '이하은님이 프로젝트에 합류했습니다. (역할: 개발)', time: '어제', likes: 1, liked: false, comments: [] },
      { id: 'f4', type: 'post', author: '이하은', text: 'API 설계 초안 올립니다. 리뷰 부탁드려요! 특히 인증 플로우 쪽 의견 주시면 감사하겠습니다.', time: '어제', likes: 5, liked: true, comments: [{ author: 'PM', text: 'OAuth2 방식으로 가면 좋겠어요', time: '어제' }, { author: '정우석', text: '동의합니다. Refresh token 전략도 같이 논의하죠', time: '어제' }] },
      { id: 'f5', type: 'comment', author: '정우석', text: 'DB 스키마 v2 반영 완료했습니다. 마이그레이션 스크립트도 준비됨.', time: '2일 전', likes: 2, liked: false, comments: [] },
    ]);

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

    const reload = () => {
        Promise.all([
            fetchProject(projectId),
            fetchProjectMembers(projectId).catch(() => []),
            fetchJobs(projectId).catch(() => []),
        ]).then(([p, m, j]) => { setProject(p); setMembers(m); setJobs(j); });
    };

    const handleAddJob = async () => {
        if (!tenant || !newJobTitle.trim()) return;
        await createJob({ projectId, tenantId: tenant.id, title: newJobTitle.trim(), status: 'draft' as any });
        setNewJobTitle('');
        setShowJobForm(false);
        reload();
    };

    const handleToggleJob = async (job: WIOJob) => {
        const next = job.status === 'done' ? 'in_progress' : 'done';
        await updateJob(job.id, { status: next as any });
        reload();
    };

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
    const completedJobs = jobs.filter(j => j.status === 'done').length;
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
                    <p className="text-sm font-medium mt-0.5">{project.startedAt || '미정'} ~ {project.deadline || '미정'}</p>
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
                {(['overview', 'feed', 'jobs', 'members'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`pb-2.5 text-sm transition-colors border-b-2 ${tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        {t === 'overview' ? '개요' : t === 'feed' ? '타임라인' : t === 'jobs' ? `업무 (${jobs.length})` : `인원 (${members.length})`}
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
                <div>
                    {/* 업무 추가 */}
                    {showJobForm ? (
                        <div className="flex gap-2 mb-4">
                            <input value={newJobTitle} onChange={e => setNewJobTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddJob()}
                                placeholder="업무 제목..." autoFocus
                                className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                            <button onClick={handleAddJob} disabled={!newJobTitle.trim()}
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm disabled:opacity-40 hover:bg-indigo-500 transition-colors"><Send size={14} /></button>
                        </div>
                    ) : (
                        <button onClick={() => setShowJobForm(true)}
                            className="flex items-center gap-1.5 mb-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                            <Plus size={13} /> 업무 추가
                        </button>
                    )}
                    <div className="space-y-2">
                        {jobs.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-slate-400 mb-1">등록된 업무가 없어요</p>
                                <p className="text-xs text-slate-600">업무를 추가해서 진행률을 관리하세요</p>
                            </div>
                        ) : jobs.map(job => (
                            <button key={job.id} onClick={() => handleToggleJob(job)}
                                className="flex items-center justify-between w-full p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left">
                                <div className="flex items-center gap-3">
                                    {job.status === 'done' ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                        <div className="w-4 h-4 rounded border border-slate-600 shrink-0" />
                                    )}
                                    <div>
                                        <p className={`text-sm ${job.status === 'done' ? 'line-through text-slate-600' : ''}`}>{job.title}</p>
                                        <p className="text-[10px] text-slate-500">{job.assigneeId || '미배정'}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${STATUS_LABELS[job.status]?.color || 'text-slate-400'}`}>
                                    {STATUS_LABELS[job.status]?.label || job.status}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 타임라인 피드 */}
            {tab === 'feed' && (
                <div className="space-y-4">
                    {/* 글쓰기 입력 */}
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">나</div>
                            <div className="flex-1">
                                <textarea value={feedInput} onChange={e => setFeedInput(e.target.value)}
                                    placeholder="프로젝트 소식을 공유하세요..."
                                    rows={2}
                                    className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
                                <div className="flex justify-end mt-2">
                                    <button onClick={() => {
                                        if (!feedInput.trim()) return;
                                        setFeedItems(prev => [{
                                            id: `f-${Date.now()}`, type: 'post', author: '나', text: feedInput.trim(),
                                            time: '방금', likes: 0, liked: false, comments: [],
                                        }, ...prev]);
                                        setFeedInput('');
                                    }} disabled={!feedInput.trim()}
                                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">
                                        <Send size={13} /> 게시
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 피드 아이템 */}
                    {feedItems.map(item => {
                        const isSystem = item.type === 'status' || item.type === 'member';
                        if (isSystem) {
                            return (
                                <div key={item.id} className="flex items-center gap-3 py-2 px-4">
                                    <Activity size={14} className="text-slate-600 shrink-0" />
                                    <p className="text-xs text-slate-500">{item.text}</p>
                                    <span className="text-[10px] text-slate-600 shrink-0 ml-auto">{item.time}</span>
                                </div>
                            );
                        }
                        return (
                            <div key={item.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                                {/* 작성자 + 시간 */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-300">{item.author.charAt(0)}</div>
                                    <div>
                                        <p className="text-sm font-medium">{item.author}</p>
                                        <p className="text-[10px] text-slate-500">{item.time}</p>
                                    </div>
                                </div>
                                {/* 본문 */}
                                <p className="text-sm text-slate-300 whitespace-pre-wrap mb-3">{item.text}</p>
                                {/* 액션 */}
                                <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                                    <button onClick={() => setFeedItems(prev => prev.map(f => f.id === item.id ? { ...f, liked: !f.liked, likes: f.liked ? f.likes - 1 : f.likes + 1 } : f))}
                                        className={`flex items-center gap-1 text-xs transition-colors ${item.liked ? 'text-pink-400' : 'text-slate-500 hover:text-pink-400'}`}>
                                        <Heart size={13} fill={item.liked ? 'currentColor' : 'none'} /> {item.likes > 0 && item.likes}
                                    </button>
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <MessageSquare size={13} /> {item.comments.length > 0 && item.comments.length}
                                    </span>
                                </div>
                                {/* 댓글 */}
                                {item.comments.length > 0 && (
                                    <div className="mt-3 space-y-2 pl-4 border-l border-white/5">
                                        {item.comments.map((c, ci) => (
                                            <div key={ci}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-slate-300">{c.author}</span>
                                                    <span className="text-[10px] text-slate-600">{c.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">{c.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
