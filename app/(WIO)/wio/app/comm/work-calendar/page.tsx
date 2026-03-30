'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalendarRange, ChevronLeft, ChevronRight, Star, AlertTriangle,
  CheckSquare, Square, Clock, Users, ArrowUpRight, Building2,
  Layers, User, TrendingUp, Filter, ChevronDown,
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

/* ───── Types ───── */
type ViewTab = 'week' | 'month' | 'quarter' | 'year';
type Scope = 'my' | 'team' | 'dept' | 'company';
type TaskStatus = 'todo' | 'progress' | 'done' | 'overdue';
type StarLevel = 0 | 1 | 2; // 0=normal, 1=★ team→dept, 2=★★ dept→company

interface WorkTask {
  id: string;
  title: string;
  project: string;
  projectColor: string;
  date: string;       // YYYY-MM-DD
  dueDate?: string;
  status: TaskStatus;
  star: StarLevel;
  assignee: string;
  team: string;
  dept: string;
  progress?: number;  // 0~100
  autoEscalate?: 'budget' | 'sla' | 'deadline';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  team: string;
  dept: string;
}

interface Milestone {
  id: string;
  title: string;
  date: string;
  type: 'release' | 'review' | 'deadline' | 'event';
  color: string;
}

/* ───── Constants ───── */
const DAYS_KR = ['월', '화', '수', '목', '금'];
const TODAY = '2026-03-30';
const WEEK_START = '2026-03-30'; // Monday

const PROJECT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'WIO v2.3':    { bg: 'bg-indigo-500/15', text: 'text-indigo-400', dot: 'bg-indigo-500' },
  'SmarComm':    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  'MAD League':  { bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-500' },
  'LUKI 브랜딩': { bg: 'bg-pink-500/15', text: 'text-pink-400', dot: 'bg-pink-500' },
  'Badak CRM':   { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-500' },
  '인프라':      { bg: 'bg-sky-500/15', text: 'text-sky-400', dot: 'bg-sky-500' },
  'HR':          { bg: 'bg-teal-500/15', text: 'text-teal-400', dot: 'bg-teal-500' },
};

const getProjectStyle = (project: string) =>
  PROJECT_COLORS[project] || { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-500' };

/* ───── Mock Data ───── */
const MOCK_MEMBERS: TeamMember[] = [
  { id: 'm1', name: '윤채린', role: '프론트엔드', team: '개발팀', dept: '기술부문' },
  { id: 'm2', name: '이승우', role: '백엔드', team: '개발팀', dept: '기술부문' },
  { id: 'm3', name: '정하은', role: '디자인', team: '디자인팀', dept: '기술부문' },
];

const MOCK_TASKS: WorkTask[] = [
  // Monday 3/30
  { id: 't1', title: 'EUS v2.0 모듈 카탈로그 정리', project: 'WIO v2.3', projectColor: 'indigo', date: '2026-03-30', status: 'progress', star: 1, assignee: '나', team: '개발팀', dept: '기술부문', progress: 60 },
  { id: 't2', title: '업무 캘린더 UI 개발', project: 'WIO v2.3', projectColor: 'indigo', date: '2026-03-30', status: 'progress', star: 0, assignee: '나', team: '개발팀', dept: '기술부문', progress: 30 },
  { id: 't3', title: '캠페인 대시보드 API 연동', project: 'SmarComm', projectColor: 'emerald', date: '2026-03-30', status: 'todo', star: 0, assignee: '나', team: '개발팀', dept: '기술부문' },
  // Tuesday 3/31
  { id: 't4', title: '전자결재 워크플로우 설계', project: 'WIO v2.3', projectColor: 'indigo', date: '2026-03-31', status: 'todo', star: 1, assignee: '나', team: '개발팀', dept: '기술부문' },
  { id: 't5', title: 'MAD League 시즌 3 기획서', project: 'MAD League', projectColor: 'violet', date: '2026-03-31', dueDate: '2026-03-28', status: 'overdue', star: 0, assignee: '나', team: '개발팀', dept: '기술부문', autoEscalate: 'deadline' },
  { id: 't6', title: '디자인 시스템 v2 리뷰', project: 'LUKI 브랜딩', projectColor: 'pink', date: '2026-03-31', status: 'done', star: 0, assignee: '나', team: '개발팀', dept: '기술부문', progress: 100 },
  // Wednesday 4/1
  { id: 't7', title: 'Badak CRM 파이프라인 구현', project: 'Badak CRM', projectColor: 'amber', date: '2026-04-01', status: 'todo', star: 1, assignee: '나', team: '개발팀', dept: '기술부문' },
  { id: 't8', title: 'SmarComm 리드 스코어링 로직', project: 'SmarComm', projectColor: 'emerald', date: '2026-04-01', status: 'progress', star: 0, assignee: '나', team: '개발팀', dept: '기술부문', progress: 45 },
  { id: 't9', title: '서버 인프라 점검', project: '인프라', projectColor: 'sky', date: '2026-04-01', dueDate: '2026-03-29', status: 'overdue', star: 0, assignee: '나', team: '개발팀', dept: '기술부문', autoEscalate: 'sla' },
  // Thursday 4/2
  { id: 't10', title: '신규 입사자 온보딩 문서', project: 'HR', projectColor: 'teal', date: '2026-04-02', status: 'todo', star: 0, assignee: '나', team: '개발팀', dept: '기술부문' },
  { id: 't11', title: '프로젝트 협업 모듈 테스트', project: 'WIO v2.3', projectColor: 'indigo', date: '2026-04-02', status: 'todo', star: 0, assignee: '나', team: '개발팀', dept: '기술부문' },
  // Friday 4/3
  { id: 't12', title: '주간 스프린트 리뷰', project: 'WIO v2.3', projectColor: 'indigo', date: '2026-04-03', status: 'todo', star: 0, assignee: '나', team: '개발팀', dept: '기술부문' },
  { id: 't13', title: '월간 타운홀 발표 준비', project: 'HR', projectColor: 'teal', date: '2026-04-03', status: 'todo', star: 0, assignee: '나', team: '개발팀', dept: '기술부문' },
  { id: 't14', title: 'LUKI 브랜드 가이드 최종안', project: 'LUKI 브랜딩', projectColor: 'pink', date: '2026-04-03', status: 'progress', star: 0, assignee: '나', team: '개발팀', dept: '기술부문', progress: 80 },
  { id: 't15', title: '다음 주 스프린트 백로그 정리', project: 'WIO v2.3', projectColor: 'indigo', date: '2026-04-03', status: 'todo', star: 0, assignee: '나', team: '개발팀', dept: '기술부문' },

  // Team member tasks (for team view)
  { id: 't16', title: '채팅 WebSocket 구현', project: 'WIO v2.3', projectColor: 'indigo', date: '2026-03-30', status: 'progress', star: 0, assignee: '윤채린', team: '개발팀', dept: '기술부문', progress: 70 },
  { id: 't17', title: '메신저 UI 반응형 처리', project: 'WIO v2.3', projectColor: 'indigo', date: '2026-03-31', status: 'todo', star: 0, assignee: '윤채린', team: '개발팀', dept: '기술부문' },
  { id: 't18', title: 'API Gateway 설정', project: '인프라', projectColor: 'sky', date: '2026-03-30', status: 'done', star: 0, assignee: '이승우', team: '개발팀', dept: '기술부문', progress: 100 },
  { id: 't19', title: 'Supabase RLS 정책 검증', project: 'WIO v2.3', projectColor: 'indigo', date: '2026-04-01', status: 'progress', star: 0, assignee: '이승우', team: '개발팀', dept: '기술부문', progress: 50 },
  { id: 't20', title: 'LUKI 로고 리디자인', project: 'LUKI 브랜딩', projectColor: 'pink', date: '2026-04-02', status: 'progress', star: 0, assignee: '정하은', team: '디자인팀', dept: '기술부문', progress: 40 },
  { id: 't21', title: '브랜드 컬러 시스템 정리', project: 'LUKI 브랜딩', projectColor: 'pink', date: '2026-04-03', status: 'todo', star: 0, assignee: '정하은', team: '디자인팀', dept: '기술부문' },
];

const MOCK_MILESTONES: Milestone[] = [
  { id: 'ms1', title: 'WIO v2.3 Release', date: '2026-04-15', type: 'release', color: 'bg-indigo-500' },
  { id: 'ms2', title: 'Q1 마감 리뷰', date: '2026-03-31', type: 'review', color: 'bg-amber-500' },
  { id: 'ms3', title: 'MAD League 시즌 3 런칭', date: '2026-05-01', type: 'event', color: 'bg-violet-500' },
  { id: 'ms4', title: 'SmarComm MVP', date: '2026-04-30', type: 'release', color: 'bg-emerald-500' },
  { id: 'ms5', title: '상반기 KPI 중간점검', date: '2026-06-15', type: 'review', color: 'bg-amber-500' },
  { id: 'ms6', title: 'Badak CRM 베타', date: '2026-07-01', type: 'release', color: 'bg-amber-500' },
];

/* ───── Helpers ───── */
const getWeekDates = (startDate: string): string[] => {
  const d = new Date(startDate);
  return Array.from({ length: 5 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`;
  });
};

const formatShortDate = (dateStr: string) => {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}/${d}`;
};

const statusLabel = (s: TaskStatus) =>
  s === 'todo' ? '예정' : s === 'progress' ? '진행' : s === 'done' ? '완료' : '지연';

const statusColor = (s: TaskStatus) =>
  s === 'todo' ? 'text-slate-500' : s === 'progress' ? 'text-sky-400' : s === 'done' ? 'text-emerald-400' : 'text-rose-400';

/* ───── Component ───── */
export default function WorkCalendarPage() {
  const { tenant } = useWIO();
  const [viewTab, setViewTab] = useState<ViewTab>('week');
  const [scope, setScope] = useState<Scope>('my');
  const [tasks, setTasks] = useState<WorkTask[]>(MOCK_TASKS);
  const [weekStart, setWeekStart] = useState(WEEK_START);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [showScopeMenu, setShowScopeMenu] = useState(false);

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  // Supabase에서 실데이터 로드 (비데모 모드)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isDemo) return;
    (async () => {
      try {
        const sb = createClient();
        const { data } = await sb
          .from('wio_jobs')
          .select('*, project:wio_projects(title, code)')
          .eq('tenant_id', tenant.id)
          .order('due_date', { ascending: true });
        if (data && data.length > 0) {
          const mapped: WorkTask[] = data.map((j: any) => ({
            id: j.id,
            title: j.title,
            project: j.project?.title || j.project?.code || '-',
            projectColor: 'indigo',
            date: j.due_date || j.created_at?.split('T')[0] || TODAY,
            dueDate: j.due_date || undefined,
            status: j.status === 'done' ? 'done' : j.status === 'in_progress' ? 'progress' : j.due_date && j.due_date < TODAY ? 'overdue' : 'todo',
            star: 0 as StarLevel,
            assignee: '나',
            team: '-',
            dept: '-',
            progress: j.status === 'done' ? 100 : j.status === 'in_progress' ? 50 : 0,
          }));
          setTasks(mapped);
        }
      } catch { /* Mock 폴백 */ }
    })();
  }, [isDemo, tenant.id]);

  /* ── Filter tasks by scope ── */
  const filteredTasks = useMemo(() => {
    if (scope === 'my') return tasks.filter(t => t.assignee === '나');
    if (scope === 'team') return tasks.filter(t => t.team === '개발팀');
    if (scope === 'dept') return tasks.filter(t => t.dept === '기술부문' && t.star >= 1);
    // company: only ★★ or auto-escalated
    return tasks.filter(t => t.star >= 2 || t.autoEscalate);
  }, [tasks, scope]);

  /* ── Week stats ── */
  const weekDates = getWeekDates(weekStart);
  const weekTasks = filteredTasks.filter(t => weekDates.includes(t.date));
  const stats = useMemo(() => {
    const total = weekTasks.length;
    const done = weekTasks.filter(t => t.status === 'done').length;
    const progress = weekTasks.filter(t => t.status === 'progress').length;
    const overdue = weekTasks.filter(t => t.status === 'overdue').length;
    const starred = weekTasks.filter(t => t.star >= 1).length;
    return { total, done, progress, overdue, starred };
  }, [weekTasks]);

  /* ── Toggle task done ── */
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: t.status === 'done' ? 'progress' : 'done', progress: t.status === 'done' ? (t.progress ?? 0) : 100 }
        : t
    ));
  };

  /* ── Toggle star ── */
  const toggleStar = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, star: ((t.star + 1) % 3) as StarLevel }
        : t
    ));
  };

  /* ── Week navigation ── */
  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const viewTabs: { key: ViewTab; label: string }[] = [
    { key: 'week', label: '주간' },
    { key: 'month', label: '월간' },
    { key: 'quarter', label: '분기' },
    { key: 'year', label: '연간' },
  ];

  const scopeOptions: { key: Scope; label: string; icon: React.ReactNode }[] = [
    { key: 'my', label: '내 업무', icon: <User size={13} /> },
    { key: 'team', label: '팀', icon: <Users size={13} /> },
    { key: 'dept', label: '부문', icon: <Building2 size={13} /> },
    { key: 'company', label: '전사', icon: <Layers size={13} /> },
  ];

  /* ─────────────── Weekly View ─────────────── */
  const WeeklyView = () => (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-5 gap-px bg-white/[0.03] min-h-[500px]">
        {weekDates.map((dateStr, idx) => {
          const dayTasks = filteredTasks.filter(t => t.date === dateStr);
          const isToday = dateStr === TODAY;
          return (
            <div key={dateStr} className="bg-[#0c0c1d] flex flex-col">
              {/* Day header */}
              <div className={`px-3 py-2.5 border-b border-white/5 flex items-center justify-between ${isToday ? 'bg-indigo-600/5' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>{DAYS_KR[idx]}</span>
                  <span className={`text-sm font-bold ${isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white' : 'text-slate-300'}`}>
                    {formatShortDate(dateStr)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-600">{dayTasks.length}건</span>
              </div>
              {/* Task cards */}
              <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
                {dayTasks.map(task => {
                  const pStyle = getProjectStyle(task.project);
                  return (
                    <div key={task.id}
                      className={`group rounded-lg border p-2.5 transition-colors cursor-pointer ${
                        task.status === 'overdue'
                          ? 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10'
                          : task.status === 'done'
                          ? 'border-white/[0.03] bg-white/[0.01] opacity-60'
                          : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}>
                      {/* Top row: checkbox + star */}
                      <div className="flex items-start gap-2">
                        <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                          {task.status === 'done'
                            ? <CheckSquare size={14} className="text-emerald-400" />
                            : <Square size={14} className="text-slate-600 hover:text-slate-400" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-medium leading-tight ${task.status === 'done' ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                            {task.title}
                          </span>
                        </div>
                        <button onClick={() => toggleStar(task.id)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {task.star === 0 && <Star size={12} className="text-slate-600 hover:text-amber-400" />}
                          {task.star === 1 && <Star size={12} className="text-amber-400 fill-amber-400" />}
                          {task.star === 2 && <Star size={12} className="text-orange-400 fill-orange-400" />}
                        </button>
                      </div>
                      {/* Project badge */}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${pStyle.bg} ${pStyle.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${pStyle.dot}`} />
                          {task.project}
                        </span>
                        {task.star > 0 && (
                          <span className="text-[10px] text-amber-400/70">
                            {'★'.repeat(task.star)}
                          </span>
                        )}
                      </div>
                      {/* Status / overdue indicators */}
                      {task.status === 'overdue' && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-rose-400">
                          <AlertTriangle size={10} />
                          <span>기한 초과{task.autoEscalate ? ' · 자동 상향' : ''}</span>
                        </div>
                      )}
                      {task.status === 'progress' && task.progress !== undefined && (
                        <div className="mt-1.5">
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-sky-500/60 transition-all" style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>
                      )}
                      {/* Assignee (for team view) */}
                      {scope !== 'my' && task.assignee !== '나' && (
                        <div className="mt-1.5 text-[10px] text-slate-500 flex items-center gap-1">
                          <User size={9} /> {task.assignee}
                        </div>
                      )}
                    </div>
                  );
                })}
                {dayTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-slate-700 text-[11px]">업무 없음</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ─────────────── Monthly View ─────────────── */
  const MonthlyView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-based
    const pad = (n: number) => String(n).padStart(2, '0');

    const cells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
    // Previous month padding
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      cells.push({ day: d, dateStr: `${y}-${pad(m + 1)}-${pad(d)}`, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, dateStr: `${year}-${pad(month + 1)}-${pad(i)}`, isCurrentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      cells.push({ day: i, dateStr: `${y}-${pad(m + 1)}-${pad(i)}`, isCurrentMonth: false });
    }

    // Monthly goal mock
    const monthTasks = filteredTasks.filter(t => t.date.startsWith(`${year}-${pad(month + 1)}`));
    const monthDone = monthTasks.filter(t => t.status === 'done').length;
    const monthTotal = monthTasks.length;
    const goalPct = monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0;

    return (
      <div className="flex-1 overflow-auto p-4">
        {/* Month goal */}
        <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-1">월간 목표 달성률</div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${goalPct}%` }} />
            </div>
          </div>
          <span className="text-sm font-bold text-indigo-400">{goalPct}%</span>
          <span className="text-xs text-slate-600">{monthDone}/{monthTotal}건</span>
        </div>

        {/* Calendar navigation */}
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1 text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
          <span className="text-sm font-bold min-w-[80px] text-center">{year}년 {month + 1}월</span>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1 text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px">
          {DAYS_KR.concat(['토', '일']).map(d => (
            <div key={d} className="text-center text-[10px] text-slate-600 py-1.5 font-medium">{d}</div>
          ))}
          {cells.map((cell, idx) => {
            const dayTasks = filteredTasks.filter(t => t.date === cell.dateStr);
            const isToday = cell.dateStr === TODAY;
            const hasOverdue = dayTasks.some(t => t.status === 'overdue');
            const hasMilestone = MOCK_MILESTONES.some(ms => ms.date === cell.dateStr);
            return (
              <div key={idx} className={`min-h-[60px] p-1.5 rounded-lg border transition-colors ${
                !cell.isCurrentMonth ? 'opacity-30 border-transparent' :
                isToday ? 'border-indigo-500/30 bg-indigo-500/5' :
                'border-white/[0.03] hover:bg-white/[0.02]'
              }`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[11px] ${isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>{cell.day}</span>
                  {hasMilestone && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                </div>
                {dayTasks.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-medium ${hasOverdue ? 'text-rose-400' : 'text-slate-500'}`}>
                      {dayTasks.length}건
                    </span>
                    {hasOverdue && <AlertTriangle size={9} className="text-rose-400" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─────────────── Quarterly View ─────────────── */
  const QuarterlyView = () => {
    const quarterMonths = [
      { month: '1월', progress: 95, tasks: 48, done: 46 },
      { month: '2월', progress: 88, tasks: 52, done: 46 },
      { month: '3월', progress: 42, tasks: 55, done: 23 },
    ];
    const initiatives = [
      { name: 'WIO v2.3 출시', progress: 45, dept: '기술부문', color: 'bg-indigo-500' },
      { name: 'SmarComm MVP', progress: 30, dept: '사업부문', color: 'bg-emerald-500' },
      { name: 'MAD League 시즌 3', progress: 20, dept: '기획부문', color: 'bg-violet-500' },
      { name: 'HR 시스템 고도화', progress: 60, dept: '운영부문', color: 'bg-teal-500' },
    ];
    const kpis = [
      { name: '제품 출시 일정 준수율', target: '90%', current: '78%', status: 'warning' as const },
      { name: '버그 해결 SLA', target: '95%', current: '92%', status: 'ok' as const },
      { name: '고객 만족도', target: '4.5', current: '4.3', status: 'ok' as const },
    ];

    return (
      <div className="flex-1 overflow-auto p-4 space-y-5">
        <h3 className="text-sm font-bold text-slate-300">2026년 Q1 (1~3월)</h3>

        {/* 3-month overview */}
        <div className="grid grid-cols-3 gap-3">
          {quarterMonths.map(qm => (
            <div key={qm.month} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">{qm.month}</span>
                <span className="text-xs text-slate-500">{qm.done}/{qm.tasks}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-1">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${qm.progress}%` }} />
              </div>
              <span className="text-[11px] text-slate-500">{qm.progress}% 달성</span>
            </div>
          ))}
        </div>

        {/* Major initiatives */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-3">주요 이니셔티브</h4>
          <div className="space-y-2.5">
            {initiatives.map(init => (
              <div key={init.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${init.color}`} />
                    <span className="text-sm font-medium text-slate-200">{init.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{init.dept}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full ${init.color} transition-all`} style={{ width: `${init.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">{init.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department KPI */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-3">부문 KPI 정렬</h4>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-4 text-[10px] text-slate-500 font-medium px-4 py-2 bg-white/[0.02]">
              <span>지표</span><span>목표</span><span>현재</span><span>상태</span>
            </div>
            {kpis.map(k => (
              <div key={k.name} className="grid grid-cols-4 text-xs px-4 py-2.5 border-t border-white/[0.03]">
                <span className="text-slate-300">{k.name}</span>
                <span className="text-slate-500">{k.target}</span>
                <span className="text-slate-300">{k.current}</span>
                <span className={k.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}>
                  {k.status === 'ok' ? '정상' : '주의'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────── Annual View ─────────────── */
  const AnnualView = () => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const strategicBars = [
      { name: 'WIO v2.3 개발', startMonth: 0, endMonth: 3, color: 'bg-indigo-500' },
      { name: 'SmarComm 런칭', startMonth: 2, endMonth: 5, color: 'bg-emerald-500' },
      { name: 'MAD League 시즌 3', startMonth: 3, endMonth: 7, color: 'bg-violet-500' },
      { name: 'Badak CRM 구축', startMonth: 4, endMonth: 8, color: 'bg-amber-500' },
      { name: 'WIO v3.0 기획', startMonth: 6, endMonth: 11, color: 'bg-sky-500' },
      { name: 'HR 시스템 고도화', startMonth: 1, endMonth: 5, color: 'bg-teal-500' },
    ];

    return (
      <div className="flex-1 overflow-auto p-4 space-y-5">
        <h3 className="text-sm font-bold text-slate-300">2026년 연간 로드맵</h3>

        {/* Month headers */}
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-12 gap-px mb-4">
              {months.map((m, i) => (
                <div key={m} className={`text-center text-[10px] py-1.5 rounded font-medium ${
                  i === 2 ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-600'
                }`}>{m}</div>
              ))}
            </div>

            {/* Strategic initiative bars */}
            <div className="space-y-2.5">
              {strategicBars.map(bar => (
                <div key={bar.name} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 w-[140px] shrink-0 truncate">{bar.name}</span>
                  <div className="flex-1 relative h-6">
                    <div className="absolute inset-0 grid grid-cols-12 gap-px">
                      {months.map((_, i) => (
                        <div key={i} className="border-l border-white/[0.03] h-full" />
                      ))}
                    </div>
                    <div
                      className={`absolute top-0.5 h-5 rounded-md ${bar.color}/30 flex items-center px-2`}
                      style={{
                        left: `${(bar.startMonth / 12) * 100}%`,
                        width: `${((bar.endMonth - bar.startMonth + 1) / 12) * 100}%`,
                      }}>
                      <div className={`h-2 rounded-full ${bar.color}`}
                        style={{ width: `${Math.min(100, ((2 - bar.startMonth) / (bar.endMonth - bar.startMonth + 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestones */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <h4 className="text-xs font-semibold text-slate-400 mb-3">주요 마일스톤</h4>
              <div className="relative h-8">
                <div className="absolute inset-0 grid grid-cols-12 gap-px">
                  {months.map((_, i) => (
                    <div key={i} className="border-l border-white/[0.03] h-full" />
                  ))}
                </div>
                {MOCK_MILESTONES.map(ms => {
                  const msDate = new Date(ms.date);
                  const monthIdx = msDate.getMonth();
                  const dayOfMonth = msDate.getDate();
                  const daysInMs = new Date(msDate.getFullYear(), monthIdx + 1, 0).getDate();
                  const pct = (monthIdx / 12 + (dayOfMonth / daysInMs) / 12) * 100;
                  return (
                    <div key={ms.id} className="absolute top-0 group" style={{ left: `${pct}%` }}>
                      <div className={`h-3 w-3 rounded-full ${ms.color} border-2 border-[#0c0c1d] cursor-pointer`} />
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1.5 py-0.5 rounded">
                        {ms.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────── Main Render ─────────────── */
  return (
    <div className="h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.24))] flex flex-col">
      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 mb-3 text-xs text-amber-300">
          데모 모드 &mdash; 업무 일정은 로컬에서만 유지됩니다.
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        {/* Left: navigation */}
        <div className="flex items-center gap-2">
          {viewTab === 'week' && (
            <>
              <button onClick={prevWeek} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"><ChevronLeft size={18} /></button>
              <h1 className="text-sm md:text-base font-bold min-w-[180px] text-center">
                {formatShortDate(weekDates[0])} — {formatShortDate(weekDates[4])}
              </h1>
              <button onClick={nextWeek} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"><ChevronRight size={18} /></button>
            </>
          )}
          {viewTab !== 'week' && (
            <h1 className="text-sm md:text-base font-bold flex items-center gap-2">
              <CalendarRange size={16} className="text-indigo-400" />
              업무 캘린더
            </h1>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* Scope selector */}
          <div className="relative">
            <button onClick={() => setShowScopeMenu(!showScopeMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/5 rounded-lg text-slate-300 hover:bg-white/[0.05] transition-colors">
              {scopeOptions.find(s => s.key === scope)?.icon}
              {scopeOptions.find(s => s.key === scope)?.label}
              <ChevronDown size={12} className="text-slate-500" />
            </button>
            {showScopeMenu && (
              <div className="absolute top-full right-0 mt-1 w-36 rounded-xl border border-white/10 bg-[#15152e] py-1 shadow-2xl z-20">
                {scopeOptions.map(opt => (
                  <button key={opt.key} onClick={() => { setScope(opt.key); setShowScopeMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${scope === opt.key ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-white/[0.03]'}`}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View tabs */}
          <div className="flex bg-white/[0.03] rounded-lg border border-white/5 overflow-hidden">
            {viewTabs.map(v => (
              <button key={v.key} onClick={() => setViewTab(v.key)}
                className={`px-3 py-1.5 text-xs transition-colors ${viewTab === v.key ? 'bg-indigo-600/15 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden flex flex-col">
        {viewTab === 'week' && <WeeklyView />}
        {viewTab === 'month' && <MonthlyView />}
        {viewTab === 'quarter' && <QuarterlyView />}
        {viewTab === 'year' && <AnnualView />}
      </div>

      {/* ── Bottom Stats (weekly view) ── */}
      {viewTab === 'week' && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-4">
            <span>이번 주: <strong className="text-slate-300">{stats.total}건</strong></span>
            <span className="text-emerald-400/70">완료 {stats.done}</span>
            <span className="text-sky-400/70">진행 {stats.progress}</span>
            {stats.overdue > 0 && <span className="text-rose-400">지연 {stats.overdue}</span>}
          </div>
          <div className="flex items-center gap-2">
            {stats.starred > 0 && (
              <span className="flex items-center gap-1 text-amber-400/70">
                <Star size={10} className="fill-amber-400/70" /> 상향: {stats.starred}건
              </span>
            )}
            {scope !== 'my' && (
              <span className="flex items-center gap-1 text-slate-600">
                <ArrowUpRight size={10} /> {scope === 'team' ? '★ 항목은 부문에 노출' : scope === 'dept' ? '★★ 항목은 전사에 노출' : '자동 상향 항목만 표시'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
