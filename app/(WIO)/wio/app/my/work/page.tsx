'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutGrid, Plus, Clock, AlertTriangle, CheckCircle2, Filter,
  Calendar, Tag, ChevronDown, X, BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

/* ── MY 탭 네비게이션 ── */
const MY_TABS = [
  { label: '대시보드', href: '/wio/app/my' },
  { label: '인사기록', href: '/wio/app/my/hr' },
  { label: '내 평가', href: '/wio/app/my/evaluation' },
  { label: '내 업무', href: '/wio/app/my/work' },
  { label: '기안/결재', href: '/wio/app/my/approval' },
];

type KanbanColumn = 'todo' | 'in_progress' | 'review' | 'done';
type Priority = 'high' | 'medium' | 'low';

interface Task {
  id: string;
  title: string;
  project: string;
  projectColor: string;
  deadline: string;
  priority: Priority;
  column: KanbanColumn;
  completedAt?: string;
  hours?: number;
}

const COLUMNS: { id: KanbanColumn; label: string; color: string }[] = [
  { id: 'todo', label: '할 일', color: 'border-slate-500/30' },
  { id: 'in_progress', label: '진행 중', color: 'border-amber-500/30' },
  { id: 'review', label: '검토', color: 'border-blue-500/30' },
  { id: 'done', label: '완료', color: 'border-emerald-500/30' },
];

const PRIORITY_STYLES: Record<Priority, string> = {
  high: 'bg-red-500/10 text-red-400',
  medium: 'bg-amber-500/10 text-amber-400',
  low: 'bg-slate-500/10 text-slate-400',
};
const PRIORITY_LABELS: Record<Priority, string> = { high: '높음', medium: '보통', low: '낮음' };

const PROJECTS = ['전체', '브랜드 리뉴얼', 'SNS 마케팅', '앱 MVP'];
const PROJECT_COLORS: Record<string, string> = {
  '브랜드 리뉴얼': 'bg-indigo-500',
  'SNS 마케팅': 'bg-emerald-500',
  '앱 MVP': 'bg-amber-500',
};

/* ── Mock tasks ── */
const DEMO_TASKS: Task[] = [
  { id: 'w1', title: '캠페인 기획서 초안', project: '브랜드 리뉴얼', projectColor: 'bg-indigo-500', deadline: '2026-04-02', priority: 'high', column: 'todo' },
  { id: 'w2', title: 'SNS 콘텐츠 캘린더 작성', project: 'SNS 마케팅', projectColor: 'bg-emerald-500', deadline: '2026-04-05', priority: 'medium', column: 'todo' },
  { id: 'w3', title: '타겟 오디언스 분석', project: '브랜드 리뉴얼', projectColor: 'bg-indigo-500', deadline: '2026-04-01', priority: 'high', column: 'todo' },
  { id: 'w4', title: '디자인 에셋 검수', project: '브랜드 리뉴얼', projectColor: 'bg-indigo-500', deadline: '2026-04-03', priority: 'medium', column: 'in_progress' },
  { id: 'w5', title: '인스타그램 광고 세팅', project: 'SNS 마케팅', projectColor: 'bg-emerald-500', deadline: '2026-03-31', priority: 'high', column: 'in_progress' },
  { id: 'w6', title: 'A/B 테스트 설계', project: 'SNS 마케팅', projectColor: 'bg-emerald-500', deadline: '2026-04-07', priority: 'medium', column: 'in_progress' },
  { id: 'w7', title: '앱 사용자 플로우 정의', project: '앱 MVP', projectColor: 'bg-amber-500', deadline: '2026-04-04', priority: 'medium', column: 'in_progress' },
  { id: 'w8', title: '경쟁사 벤치마킹 리포트', project: '앱 MVP', projectColor: 'bg-amber-500', deadline: '2026-04-10', priority: 'low', column: 'in_progress' },
  { id: 'w9', title: '주간 캠페인 리포트', project: 'SNS 마케팅', projectColor: 'bg-emerald-500', deadline: '2026-03-30', priority: 'high', column: 'review' },
  { id: 'w10', title: '브랜드 가이드라인 v2', project: '브랜드 리뉴얼', projectColor: 'bg-indigo-500', deadline: '2026-03-29', priority: 'medium', column: 'review' },
  { id: 'w11', title: '고객 설문 분석', project: '브랜드 리뉴얼', projectColor: 'bg-indigo-500', deadline: '2026-03-25', priority: 'low', column: 'done', completedAt: '2026-03-25', hours: 6 },
  { id: 'w12', title: '킥오프 미팅 준비', project: '앱 MVP', projectColor: 'bg-amber-500', deadline: '2026-03-22', priority: 'medium', column: 'done', completedAt: '2026-03-22', hours: 3 },
];

const RECENT_COMPLETED: { title: string; completedAt: string; hours: number }[] = [
  { title: '고객 설문 분석', completedAt: '2026-03-25', hours: 6 },
  { title: '킥오프 미팅 준비', completedAt: '2026-03-22', hours: 3 },
  { title: '월간 마케팅 리포트', completedAt: '2026-03-20', hours: 4 },
  { title: '랜딩페이지 카피 작성', completedAt: '2026-03-18', hours: 5 },
  { title: '이메일 캠페인 발송', completedAt: '2026-03-15', hours: 2 },
];

export default function MyWorkPage() {
  const { member, isDemo } = useWIO();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectFilter, setProjectFilter] = useState('전체');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newProject, setNewProject] = useState('브랜드 리뉴얼');

  // Supabase에서 내 업무(wio_jobs) 로드
  const loadTasks = useCallback(async () => {
    if (isDemo) {
      setTasks(DEMO_TASKS);
      setLoading(false);
      return;
    }
    try {
      const sb = createClient();
      const memberId = member?.id;
      if (!memberId) { setLoading(false); return; }

      const { data, error } = await sb
        .from('wio_jobs')
        .select('*, wio_projects(title)')
        .eq('assignee_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const projectColors: Record<string, string> = {};
        const colorPool = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-blue-500'];
        let ci = 0;

        setTasks(data.map((r: any) => {
          const projName = r.wio_projects?.title || '기타';
          if (!projectColors[projName]) { projectColors[projName] = colorPool[ci % colorPool.length]; ci++; }
          // DB status → 칸반 column 매핑
          const colMap: Record<string, KanbanColumn> = { todo: 'todo', in_progress: 'in_progress', review: 'review', done: 'done', cancelled: 'done' };
          return {
            id: r.id,
            title: r.title || '',
            project: projName,
            projectColor: projectColors[projName],
            deadline: r.due_date || '',
            priority: (r.priority === 'urgent' ? 'high' : r.priority || 'medium') as Priority,
            column: colMap[r.status] || 'todo',
            completedAt: r.completed_at?.split('T')[0],
            hours: r.actual_hours || undefined,
          };
        }));
      } else {
        setTasks(DEMO_TASKS);
      }
    } catch {
      setTasks(DEMO_TASKS);
    } finally {
      setLoading(false);
    }
  }, [isDemo, member]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filteredTasks = projectFilter === '전체'
    ? tasks
    : tasks.filter(t => t.project === projectFilter);

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: `w-${Date.now()}`,
      title: newTitle.trim(),
      project: newProject,
      projectColor: PROJECT_COLORS[newProject] || 'bg-slate-500',
      deadline: newDeadline || '2026-04-30',
      priority: 'medium',
      column: 'todo',
    };
    setTasks(prev => [task, ...prev]);
    setNewTitle('');
    setNewDeadline('');
    setShowAddForm(false);
  };

  const statsThisWeek = {
    done: filteredTasks.filter(t => t.column === 'done').length,
    inProgress: filteredTasks.filter(t => t.column === 'in_progress').length,
    overdue: filteredTasks.filter(t => t.column !== 'done' && new Date(t.deadline) < new Date()).length,
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">내 업무</h1>
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
      {/* MY 탭 */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {MY_TABS.map(tab => (
          <Link key={tab.href} href={tab.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors ${
              tab.href === '/wio/app/my/work'
                ? 'bg-indigo-600/10 text-indigo-400 font-semibold'
                : 'text-slate-400 hover:bg-white/5'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">내 업무</h1>
          <p className="text-xs text-slate-500 mt-0.5">MY-WRK | 칸반 보드</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
          <Plus size={14} /> 업무 추가
        </button>
      </div>

      {/* 업무 추가 폼 */}
      {showAddForm && (
        <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">새 업무</span>
            <button onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder="업무 제목"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <div className="flex gap-2">
              <select value={newProject} onChange={e => setNewProject(e.target.value)}
                className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                {PROJECTS.filter(p => p !== '전체').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={handleAddTask} disabled={!newTitle.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm disabled:opacity-40 hover:bg-indigo-500 transition-colors">추가</button>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 필터 + 통계 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {PROJECTS.map(p => (
            <button key={p} onClick={() => setProjectFilter(p)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                projectFilter === p ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5'
              }`}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-400" /> 완료 {statsThisWeek.done}</span>
          <span className="flex items-center gap-1"><Clock size={12} className="text-amber-400" /> 진행 {statsThisWeek.inProgress}</span>
          {statsThisWeek.overdue > 0 && (
            <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-red-400" /> 지연 {statsThisWeek.overdue}</span>
          )}
        </div>
      </div>

      {/* 칸반 보드 */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.column === col.id);
          return (
            <div key={col.id} className={`rounded-xl border-t-2 ${col.color} border border-white/5 bg-white/[0.02]`}>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
                <span className="text-xs font-semibold">{col.label}</span>
                <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[120px] max-h-[400px] overflow-y-auto">
                {colTasks.map(task => {
                  const isOverdue = task.column !== 'done' && new Date(task.deadline) < new Date();
                  return (
                    <div key={task.id}
                      className={`rounded-lg border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.05] transition-colors ${isOverdue ? 'border-red-500/20' : ''}`}>
                      <div className="text-sm font-medium mb-2">{task.title}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`w-2 h-2 rounded-full ${task.projectColor} shrink-0`} />
                        <span className="text-[10px] text-slate-500">{task.project}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${PRIORITY_STYLES[task.priority]}`}>
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 mt-2 text-[10px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                        <Calendar size={10} />
                        <span>{task.deadline}</span>
                        {isOverdue && <AlertTriangle size={10} className="ml-1" />}
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="py-6 text-center text-[10px] text-slate-600">항목 없음</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 최근 완료 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="text-emerald-400" />
            <span className="text-sm font-semibold">최근 완료한 업무</span>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {RECENT_COMPLETED.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span className="text-sm truncate">{r.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                <span>{r.completedAt}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {r.hours}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
