'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardList, UserCheck, BarChart3, ArrowRightLeft, History,
  AlertTriangle, Plus, Calendar, Flag, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';
import { useWIO } from '../../layout';

type Priority = 'urgent' | 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'text-red-400 bg-red-500/10 border-red-500/20',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  low: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};
const PRIORITY_LABEL: Record<Priority, string> = { urgent: '긴급', high: '높음', medium: '보통', low: '낮음' };
const STATUS_LABEL: Record<TaskStatus, string> = { todo: '대기', in_progress: '진행중', review: '검토', done: '완료' };
const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: 'text-slate-400', in_progress: 'text-blue-400', review: 'text-amber-400', done: 'text-emerald-400',
};

interface TeamMember {
  id: string; name: string; role: string;
  tasks: { id: string; title: string; status: TaskStatus; priority: Priority; deadline: string; rnr: string }[];
}

const MOCK_TEAM: TeamMember[] = [
  { id: 'm1', name: '김서연', role: '프론트엔드 개발', tasks: [
    { id: 't1', title: 'Orbi 대시보드 리팩토링', status: 'in_progress', priority: 'high', deadline: '2026-04-05', rnr: 'R' },
    { id: 't2', title: '모바일 반응형 개선', status: 'todo', priority: 'medium', deadline: '2026-04-10', rnr: 'R' },
    { id: 't3', title: 'UI 컴포넌트 문서화', status: 'review', priority: 'low', deadline: '2026-04-15', rnr: 'A' },
  ]},
  { id: 'm2', name: '이준호', role: '백엔드 개발', tasks: [
    { id: 't4', title: 'API 인증 모듈 구현', status: 'in_progress', priority: 'urgent', deadline: '2026-04-02', rnr: 'R' },
    { id: 't5', title: 'DB 마이그레이션 스크립트', status: 'done', priority: 'high', deadline: '2026-03-28', rnr: 'R' },
    { id: 't6', title: '로깅 시스템 개선', status: 'todo', priority: 'medium', deadline: '2026-04-12', rnr: 'C' },
    { id: 't7', title: '성능 테스트 자동화', status: 'todo', priority: 'low', deadline: '2026-04-20', rnr: 'R' },
  ]},
  { id: 'm3', name: '박지민', role: '디자인', tasks: [
    { id: 't8', title: '브랜드 가이드 v2', status: 'in_progress', priority: 'high', deadline: '2026-04-08', rnr: 'R' },
    { id: 't9', title: 'Orbi 아이콘 세트', status: 'review', priority: 'medium', deadline: '2026-04-06', rnr: 'R' },
    { id: 't10', title: '온보딩 플로우 디자인', status: 'todo', priority: 'high', deadline: '2026-04-14', rnr: 'A' },
  ]},
  { id: 'm4', name: '최수진', role: 'PM', tasks: [
    { id: 't11', title: 'Q2 로드맵 수립', status: 'in_progress', priority: 'urgent', deadline: '2026-04-01', rnr: 'R' },
    { id: 't12', title: '고객사 미팅 준비', status: 'done', priority: 'high', deadline: '2026-03-29', rnr: 'R' },
    { id: 't13', title: '팀 회고 진행', status: 'todo', priority: 'medium', deadline: '2026-04-07', rnr: 'R' },
    { id: 't14', title: '예산 검토 보고서', status: 'todo', priority: 'medium', deadline: '2026-04-11', rnr: 'A' },
    { id: 't15', title: '신규 인력 면접 조율', status: 'todo', priority: 'low', deadline: '2026-04-18', rnr: 'C' },
  ]},
  { id: 'm5', name: '정하늘', role: 'QA', tasks: [
    { id: 't16', title: '통합 테스트 시나리오 작성', status: 'in_progress', priority: 'high', deadline: '2026-04-04', rnr: 'R' },
    { id: 't17', title: '버그 리포트 정리', status: 'done', priority: 'medium', deadline: '2026-03-27', rnr: 'R' },
    { id: 't18', title: '자동화 테스트 커버리지 확대', status: 'todo', priority: 'medium', deadline: '2026-04-16', rnr: 'R' },
  ]},
  { id: 'm6', name: '한민수', role: '데이터 엔지니어', tasks: [
    { id: 't19', title: '데이터 파이프라인 구축', status: 'in_progress', priority: 'high', deadline: '2026-04-09', rnr: 'R' },
    { id: 't20', title: '대시보드 메트릭 정의', status: 'review', priority: 'medium', deadline: '2026-04-05', rnr: 'A' },
    { id: 't21', title: 'ETL 스케줄러 최적화', status: 'todo', priority: 'low', deadline: '2026-04-22', rnr: 'R' },
  ]},
];

const MOCK_HANDOVER = [
  { id: 'h1', from: '이준호', to: '한민수', items: ['DB 마이그레이션 가이드', 'API 키 목록', '서버 접속 정보'], status: 'in_progress' as const, date: '2026-04-01' },
  { id: 'h2', from: '정하늘', to: '박지민', items: ['QA 체크리스트', '버그 트래커 접근권한'], status: 'completed' as const, date: '2026-03-25' },
];

const MOCK_COMPLETED = [
  { title: 'DB 마이그레이션 스크립트', assignee: '이준호', completedAt: '2026-03-28', duration: '5일' },
  { title: '고객사 미팅 준비', assignee: '최수진', completedAt: '2026-03-29', duration: '3일' },
  { title: '버그 리포트 정리', assignee: '정하늘', completedAt: '2026-03-27', duration: '2일' },
  { title: '서버 모니터링 구성', assignee: '이준호', completedAt: '2026-03-25', duration: '4일' },
  { title: '디자인 시스템 정리', assignee: '박지민', completedAt: '2026-03-24', duration: '7일' },
  { title: '주간 보고 양식 개선', assignee: '최수진', completedAt: '2026-03-22', duration: '1일' },
  { title: 'CI/CD 파이프라인 점검', assignee: '이준호', completedAt: '2026-03-20', duration: '2일' },
  { title: '사용자 피드백 분석', assignee: '정하늘', completedAt: '2026-03-19', duration: '3일' },
  { title: '랜딩 페이지 A/B 테스트', assignee: '김서연', completedAt: '2026-03-18', duration: '5일' },
  { title: '데이터 백업 정책 수립', assignee: '한민수', completedAt: '2026-03-15', duration: '4일' },
];

export default function WorkPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [handovers, setHandovers] = useState<typeof MOCK_HANDOVER>([]);
  const [completed, setCompleted] = useState<typeof MOCK_COMPLETED>([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    if (isDemo) {
      setTeam(MOCK_TEAM);
      setHandovers(MOCK_HANDOVER);
      setCompleted(MOCK_COMPLETED);
    }
    setLoading(false);
  }, [tenant, isDemo]);

  const getWorkload = (m: TeamMember) => {
    const active = m.tasks.filter(t => t.status !== 'done').length;
    return { active, total: m.tasks.length, pct: Math.min(active * 25, 100) };
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">업무 관리</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">업무 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-WRK | 팀 업무 배정 & 워크로드</p>
        </div>
        <button onClick={() => setShowAssignForm(!showAssignForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-600/30 transition-colors">
          <Plus size={13} /> 업무 배정
        </button>
      </div>

      <div className="space-y-6">
        {/* Assign Form */}
        {showAssignForm && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <UserCheck size={15} className="text-indigo-400" /> 업무 배정
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">대상</label>
                <select className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300">
                  <option value="">선택</option>
                  {team.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">우선순위</label>
                <select className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300">
                  {Object.entries(PRIORITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block mb-1">제목</label>
                <input type="text" placeholder="업무 제목" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block mb-1">설명</label>
                <textarea rows={2} placeholder="업무 설명" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300 resize-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">마감일</label>
                <input type="date" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">R&R</label>
                <select className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300">
                  <option value="R">R (Responsible)</option>
                  <option value="A">A (Accountable)</option>
                  <option value="C">C (Consulted)</option>
                  <option value="I">I (Informed)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAssignForm(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-300">취소</button>
              <button className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">배정</button>
            </div>
          </div>
        )}

        {/* Team Task Overview */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <ClipboardList size={15} className="text-blue-400" /> 팀 업무 현황
          </h2>
          <div className="space-y-2">
            {team.map(m => {
              const wl = getWorkload(m);
              const isExpanded = expandedMember === m.id;
              return (
                <div key={m.id}>
                  <button onClick={() => setExpandedMember(isExpanded ? null : m.id)}
                    className="w-full rounded-lg bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{m.name}</span>
                        <span className="text-[10px] text-slate-500">{m.role}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{wl.active}건 진행</span>
                        <span className="text-xs text-slate-500">{m.tasks.filter(t=>t.status==='done').length}건 완료</span>
                        <span className="text-xs font-bold">{Math.round(m.tasks.filter(t=>t.status==='done').length / m.tasks.length * 100)}%</span>
                        {isExpanded ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500/60 transition-all" style={{ width: `${Math.round(m.tasks.filter(t=>t.status==='done').length / m.tasks.length * 100)}%` }} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {m.tasks.map(t => (
                        <div key={t.id} className="flex items-center gap-3 rounded-lg bg-white/[0.01] px-3 py-2">
                          <span className={`text-[10px] font-medium ${STATUS_COLOR[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                          <span className="text-xs flex-1">{t.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[t.priority]}`}>{PRIORITY_LABEL[t.priority]}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar size={10} />{t.deadline}</span>
                          <span className="text-[10px] text-slate-600 w-4 text-center">{t.rnr}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Workload Balancing */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={15} className="text-amber-400" /> 워크로드 밸런싱
          </h2>
          <div className="space-y-3">
            {team.map(m => {
              const wl = getWorkload(m);
              const isOverloaded = wl.pct >= 75;
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-20 shrink-0 text-xs font-medium truncate">{m.name}</div>
                  <div className="flex-1 h-5 rounded bg-white/5 overflow-hidden relative">
                    <div className={`h-full rounded transition-all ${isOverloaded ? 'bg-red-500/60' : wl.pct >= 50 ? 'bg-amber-500/60' : 'bg-emerald-500/60'}`}
                      style={{ width: `${wl.pct}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">{wl.active}건</span>
                  </div>
                  {isOverloaded && <AlertTriangle size={13} className="text-red-400 shrink-0" />}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-600 mt-3">* 활성 업무 3건 이상 시 과부하 경고</p>
        </div>

        {/* Handover */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <ArrowRightLeft size={15} className="text-violet-400" /> 인수인계
          </h2>
          <div className="space-y-3">
            {handovers.map(h => (
              <div key={h.id} className="rounded-lg bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{h.from}</span>
                    <ArrowRightLeft size={12} className="text-slate-500" />
                    <span className="font-medium">{h.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{h.date}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${h.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {h.status === 'completed' ? '완료' : '진행중'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {h.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 size={11} className={h.status === 'completed' ? 'text-emerald-500' : 'text-slate-600'} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed History */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <History size={15} className="text-emerald-400" /> 업무 이력 (최근 10건)
            </h2>
            {showHistory ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </button>
          {showHistory && (
            <div className="mt-4 space-y-2">
              {completed.map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span className="text-xs flex-1">{c.title}</span>
                  <span className="text-[10px] text-slate-500">{c.assignee}</span>
                  <span className="text-[10px] text-slate-600">{c.completedAt}</span>
                  <span className="text-[10px] text-slate-600">{c.duration}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
