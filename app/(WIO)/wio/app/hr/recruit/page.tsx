'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase, Plus, Users, CalendarCheck, UserCheck, ChevronDown, ChevronUp,
  Clock, CheckCircle2, XCircle, FileText, Filter
} from 'lucide-react';
import { useWIO } from '../../layout';

type JobStatus = 'open' | 'screening' | 'interviewing' | 'closed';
type ApplicantStage = 'document' | 'interview' | 'final' | 'accepted' | 'rejected';

const STATUS_MAP: Record<JobStatus, { label: string; color: string }> = {
  open: { label: '모집중', color: 'text-emerald-400 bg-emerald-500/10' },
  screening: { label: '서류심사', color: 'text-amber-400 bg-amber-500/10' },
  interviewing: { label: '면접진행', color: 'text-blue-400 bg-blue-500/10' },
  closed: { label: '마감', color: 'text-slate-400 bg-slate-500/10' },
};

const STAGE_MAP: Record<ApplicantStage, { label: string; color: string }> = {
  document: { label: '서류', color: 'bg-slate-500' },
  interview: { label: '면접', color: 'bg-blue-500' },
  final: { label: '최종', color: 'bg-amber-500' },
  accepted: { label: '합격', color: 'bg-emerald-500' },
  rejected: { label: '불합격', color: 'bg-red-500' },
};

const STAGES: ApplicantStage[] = ['document', 'interview', 'final', 'accepted'];

const MOCK_JOBS = [
  {
    id: '1', title: '프론트엔드 개발자', department: '개발팀', grade: '시니어',
    description: 'React/Next.js 기반 프론트엔드 개발', deadline: '2026-04-15', status: 'open' as JobStatus,
    applicants: [
      { id: 'a1', name: '김민수', stage: 'interview' as ApplicantStage, appliedAt: '2026-03-20' },
      { id: 'a2', name: '이지은', stage: 'document' as ApplicantStage, appliedAt: '2026-03-22' },
      { id: 'a3', name: '박서준', stage: 'final' as ApplicantStage, appliedAt: '2026-03-18' },
    ],
  },
  {
    id: '2', title: '백엔드 개발자', department: '개발팀', grade: '주니어',
    description: 'Node.js/Supabase 기반 API 개발', deadline: '2026-04-20', status: 'open' as JobStatus,
    applicants: [
      { id: 'a4', name: '최유나', stage: 'document' as ApplicantStage, appliedAt: '2026-03-25' },
      { id: 'a5', name: '정해인', stage: 'interview' as ApplicantStage, appliedAt: '2026-03-21' },
    ],
  },
  {
    id: '3', title: 'UX 디자이너', department: '디자인팀', grade: '미들',
    description: 'B2B SaaS 제품 UX/UI 설계', deadline: '2026-04-10', status: 'interviewing' as JobStatus,
    applicants: [
      { id: 'a6', name: '한소희', stage: 'final' as ApplicantStage, appliedAt: '2026-03-10' },
      { id: 'a7', name: '오지호', stage: 'interview' as ApplicantStage, appliedAt: '2026-03-12' },
      { id: 'a8', name: '윤세아', stage: 'accepted' as ApplicantStage, appliedAt: '2026-03-08' },
    ],
  },
  {
    id: '4', title: '마케팅 매니저', department: '마케팅팀', grade: '시니어',
    description: 'B2B 마케팅 전략 수립 및 실행', deadline: '2026-03-31', status: 'closed' as JobStatus,
    applicants: [
      { id: 'a9', name: '강다니엘', stage: 'accepted' as ApplicantStage, appliedAt: '2026-03-01' },
      { id: 'a10', name: '송혜교', stage: 'rejected' as ApplicantStage, appliedAt: '2026-03-02' },
    ],
  },
  {
    id: '5', title: 'HR 담당자', department: '경영지원팀', grade: '주니어',
    description: '채용 및 인사관리 업무', deadline: '2026-04-30', status: 'open' as JobStatus,
    applicants: [
      { id: 'a11', name: '임수정', stage: 'document' as ApplicantStage, appliedAt: '2026-03-27' },
    ],
  },
];

export default function RecruitPage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [jobs, setJobs] = useState<typeof MOCK_JOBS>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  // Form state
  const [form, setForm] = useState({ title: '', department: '', grade: '', description: '', deadline: '' });

  useEffect(() => {
    if (!tenant) return;
    // Demo: mock data, Real: Supabase (tables don't exist yet)
    if (isDemo) {
      setJobs(MOCK_JOBS);
    }
    setLoading(false);
  }, [tenant, isDemo]);

  const handleCreate = () => {
    if (!form.title.trim() || !form.department.trim()) return;
    const newJob = {
      id: `new-${Date.now()}`, ...form, status: 'open' as JobStatus, applicants: [],
    };
    setJobs(prev => [newJob, ...prev]);
    setForm({ title: '', department: '', grade: '', description: '', deadline: '' });
    setShowForm(false);
  };

  const filtered = statusFilter === 'all' ? jobs : jobs.filter(j => j.status === statusFilter);
  const totalApplicants = jobs.reduce((s, j) => s + j.applicants.length, 0);
  const interviewCount = jobs.reduce((s, j) => s + j.applicants.filter(a => a.stage === 'interview' || a.stage === 'final').length, 0);
  const hiredThisMonth = jobs.reduce((s, j) => s + j.applicants.filter(a => a.stage === 'accepted').length, 0);
  const openCount = jobs.filter(j => j.status !== 'closed').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">채용관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-REC</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 공고 등록
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: '진행중 공고', value: openCount, icon: Briefcase, color: 'text-indigo-400' },
          { label: '총 지원자', value: totalApplicants, icon: Users, color: 'text-emerald-400' },
          { label: '면접 예정', value: interviewCount, icon: CalendarCheck, color: 'text-amber-400' },
          { label: '이번달 합격', value: hiredThisMonth, icon: UserCheck, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={15} className={s.color} />
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-4">
        {[{ id: 'all' as const, label: '전체' }, ...Object.entries(STATUS_MAP).map(([id, v]) => ({ id: id as JobStatus | 'all', label: v.label }))].map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${statusFilter === f.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="공고 제목" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
              placeholder="부서" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            <input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}
              placeholder="직급" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="직무 설명" rows={2}
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex items-center gap-2">
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            <div className="flex-1" />
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button onClick={handleCreate} disabled={!form.title.trim() || !form.department.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-indigo-500 transition-colors">등록</button>
          </div>
        </div>
      )}

      {/* Job List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase size={36} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm text-slate-400 mb-1">채용 공고가 없습니다</p>
          <p className="text-xs text-slate-600 mb-4">새 공고를 등록해보세요</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
            <Plus size={14} /> 공고 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(job => {
            const st = STATUS_MAP[job.status];
            const expanded = expandedId === job.id;
            return (
              <div key={job.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <button onClick={() => setExpandedId(expanded ? null : job.id)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/[0.02] transition-colors">
                  <Briefcase size={16} className="text-indigo-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{job.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-600">{job.department}</span>
                      <span className="text-[10px] text-slate-600">{job.grade}</span>
                      <span className="text-[10px] text-slate-600">마감: {job.deadline}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  <span className="text-xs text-slate-500">{job.applicants.length}명</span>
                  {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                </button>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3">
                    {job.description && <p className="text-xs text-slate-400 mb-3">{job.description}</p>}

                    {/* Pipeline */}
                    <div className="mb-3">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">파이프라인</span>
                      <div className="flex gap-2 mt-2">
                        {STAGES.map(stage => {
                          const count = job.applicants.filter(a => a.stage === stage).length;
                          const sm = STAGE_MAP[stage];
                          return (
                            <div key={stage} className="flex-1 text-center">
                              <div className={`h-1.5 rounded-full ${sm.color} mb-1`} style={{ opacity: count > 0 ? 1 : 0.2 }} />
                              <div className="text-xs font-bold">{count}</div>
                              <div className="text-[10px] text-slate-500">{sm.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Applicants */}
                    {job.applicants.length > 0 && (
                      <div className="space-y-1.5">
                        {job.applicants.map(a => {
                          const as_ = STAGE_MAP[a.stage];
                          return (
                            <div key={a.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-400">
                                {a.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm">{a.name}</span>
                                <span className="text-[10px] text-slate-600 ml-2">{a.appliedAt}</span>
                              </div>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${as_.color}`}>{as_.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
