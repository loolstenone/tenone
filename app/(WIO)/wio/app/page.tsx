'use client';

import { useState, useEffect, useMemo } from 'react';
import { FolderKanban, Users, Clock, CheckCircle2, Bell, ListTodo, Target, Plus, ArrowRight, Sparkles, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import { useWIO } from './layout';
import { fetchProjects, fetchTodos, createTodo, toggleTodo, fetchNotifications, markNotificationRead, fetchGPRs } from '@/lib/supabase/wio';
import type { WIOProject } from '@/types/wio';

const PRINCIPLES = [
  '입력을 없앤다. AI가 80%를 채운다.',
  '사람은 연결하고 판단하고 성장한다.',
  '완벽은 기능이 많은 게 아니다. 불편이 없는 것이다.',
  '데이터는 한 곳에 있다. 같은 걸 두 번 입력하지 않는다.',
  '시스템이 알아서 일한다. 사람은 확인하고 판단만 한다.',
  '작은 피드백이 계속 쓰게 만든다.',
  '사람·돈·시간. 이 세 가지가 모든 일의 기준이다.',
];

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
      <div className="h-3 w-16 bg-white/5 rounded mb-3" />
      <div className="h-7 w-12 bg-white/5 rounded" />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 animate-pulse">
      <div className="h-4 w-24 bg-white/5 rounded mb-4" />
      {[1, 2, 3].map(i => (
        <div key={i} className="h-3 w-full bg-white/5 rounded mb-3" />
      ))}
    </div>
  );
}

export default function WIOHomePage() {
  const { tenant, member } = useWIO();
  const [projects, setProjects] = useState<WIOProject[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [gprs, setGprs] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);

  const principle = useMemo(() => PRINCIPLES[Math.floor(Math.random() * PRINCIPLES.length)], []);
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return '늦은 밤이에요';
    if (h < 12) return '좋은 아침이에요';
    if (h < 18) return '오늘도 힘내세요';
    return '수고 많았어요';
  }, []);

  useEffect(() => {
    if (!tenant || !member) return;
    Promise.all([
      fetchProjects(tenant.id).then(setProjects),
      fetchTodos(member.id).then(setTodos),
      fetchNotifications(member.id, 5).then(setNotifications),
      fetchGPRs(tenant.id, { ownerId: member.id }).then(setGprs),
    ]).finally(() => setLoading(false));
  }, [tenant, member]);

  const handleAddTodo = async () => {
    if (!tenant || !member || !newTodo.trim()) return;
    await createTodo({ tenantId: tenant.id, memberId: member.id, title: newTodo.trim() });
    setNewTodo('');
    fetchTodos(member.id).then(setTodos);
  };

  const handleToggle = async (id: string, isDone: boolean) => {
    await toggleTodo(id, !isDone);
    fetchTodos(member!.id).then(setTodos);
  };

  const handleReadNotif = async (id: string) => {
    await markNotificationRead(id);
    fetchNotifications(member!.id, 5).then(setNotifications);
  };

  const inProgress = projects.filter(p => p.status === 'in_progress').length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const unreadNotifs = notifications.filter((n: any) => !n.isRead).length;
  const pendingTodos = todos.filter((t: any) => !t.isDone).length;

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  if (loading) {
    return (
      <div>
        <div className="mb-6 animate-pulse">
          <div className="h-6 w-48 bg-white/5 rounded mb-2" />
          <div className="h-4 w-32 bg-white/5 rounded" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonList />
          <SkeletonList />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 + 인사 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">{greeting}, {member?.displayName || '사용자'}님</h1>
        <p className="text-sm text-slate-500 mt-1">{today}</p>
      </div>

      {/* Ten:One Principle */}
      <div className="mb-6 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.03] px-5 py-3 flex items-center gap-3">
        <Sparkles size={14} className="text-indigo-400 shrink-0" />
        <p className="text-xs text-indigo-300/80 italic">&ldquo;{principle}&rdquo;</p>
      </div>

      {/* 빠른 액션 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { label: '프로젝트 생성', href: '/wio/app/project/new', icon: FolderKanban },
          { label: '시수 입력', href: '/wio/app/timesheet', icon: Clock },
          { label: 'GPR 작성', href: '/wio/app/gpr', icon: Target },
          { label: '게시글 작성', href: '/wio/app/talk', icon: Zap },
        ].map(a => (
          <Link key={a.href} href={a.href}
            className="flex items-center gap-1.5 shrink-0 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-slate-400 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/[0.05] transition-all">
            <a.icon size={13} /> {a.label}
          </Link>
        ))}
      </div>

      {/* KPI 스탯 */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { icon: FolderKanban, label: '프로젝트', value: projects.length, color: 'text-indigo-400', href: '/wio/app/project' },
          { icon: Clock, label: '진행 중', value: inProgress, color: 'text-amber-400', href: '/wio/app/project' },
          { icon: CheckCircle2, label: '완료', value: completed, color: 'text-emerald-400', href: '/wio/app/project' },
          { icon: Target, label: '내 GPR', value: gprs.length, color: 'text-violet-400', href: '/wio/app/gpr' },
        ].map((s, i) => (
          <Link key={i} href={s.href} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-slate-500">{s.label}</span></div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{s.value}</span>
              <ArrowRight size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 할일 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2"><ListTodo size={15} className="text-indigo-400" /><span className="text-sm font-semibold">할일</span></div>
            {pendingTodos > 0 && <span className="text-xs text-slate-500">{pendingTodos}개 남음</span>}
          </div>
          <div className="p-3">
            <div className="flex gap-2 mb-3">
              <input value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
                placeholder="할일 추가..." className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              <button onClick={handleAddTodo} disabled={!newTodo.trim()} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm disabled:opacity-40 hover:bg-indigo-500 transition-colors"><Plus size={14} /></button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {todos.slice(0, 8).map((t: any) => (
                <button key={t.id} onClick={() => handleToggle(t.id, t.isDone)}
                  className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5 transition-colors ${t.isDone ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                  <div className={`h-4 w-4 rounded border shrink-0 ${t.isDone ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600'} flex items-center justify-center`}>
                    {t.isDone && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
              {todos.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-sm text-slate-500 mb-2">아직 할일이 없어요</p>
                  <p className="text-xs text-slate-600">위 입력창에서 오늘 할 일을 추가해보세요</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 알림 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2"><Bell size={15} className="text-amber-400" /><span className="text-sm font-semibold">알림</span></div>
            {unreadNotifs > 0 && <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>}
          </div>
          <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-500 mb-2">새 알림이 없어요</p>
                <p className="text-xs text-slate-600">프로젝트나 게시판에서 활동이 생기면 여기에 표시됩니다</p>
              </div>
            ) : notifications.map((n: any) => (
              <div key={n.id} onClick={() => !n.isRead && handleReadNotif(n.id)}
                className={`rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-white/5 transition-colors ${n.isRead ? 'text-slate-600' : 'text-slate-300 bg-white/[0.02]'}`}>
                <div className="font-medium text-xs">{n.title}</div>
                {n.body && <div className="text-[11px] text-slate-500 mt-0.5">{n.body}</div>}
                <div className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString('ko-KR')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 최근 프로젝트 */}
      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <span className="text-sm font-semibold">최근 프로젝트</span>
          <Link href="/wio/app/project" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">전체 보기</Link>
        </div>
        {projects.length === 0 ? (
          <div className="p-8 text-center">
            <FolderKanban size={32} className="mx-auto mb-3 text-slate-700" />
            <p className="text-sm text-slate-400 mb-1">아직 프로젝트가 없어요</p>
            <p className="text-xs text-slate-600 mb-4">첫 프로젝트를 만들어서 시작해보세요</p>
            <Link href="/wio/app/project/new" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
              <Plus size={14} /> 프로젝트 만들기
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {projects.slice(0, 5).map(p => (
              <Link key={p.id} href={`/wio/app/project/${p.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.code}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  p.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' :
                  p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-slate-500/10 text-slate-400'
                }`}>{p.status === 'in_progress' ? '진행 중' : p.status === 'completed' ? '완료' : p.status === 'draft' ? '초안' : p.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
