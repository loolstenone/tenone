'use client';

import { useState, useEffect } from 'react';
import { FolderKanban, Users, Clock, CheckCircle2, Bell, ListTodo, Target, Plus } from 'lucide-react';
import Link from 'next/link';
import { useWIO } from './layout';
import { fetchProjects, fetchTodos, createTodo, toggleTodo, fetchNotifications, markNotificationRead, fetchGPRs } from '@/lib/supabase/wio';
import type { WIOProject } from '@/types/wio';

export default function WIOHomePage() {
  const { tenant, member } = useWIO();
  const [projects, setProjects] = useState<WIOProject[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [gprs, setGprs] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    if (!tenant || !member) return;
    fetchProjects(tenant.id).then(setProjects);
    fetchTodos(member.id).then(setTodos);
    fetchNotifications(member.id, 5).then(setNotifications);
    fetchGPRs(tenant.id, { ownerId: member.id }).then(setGprs);
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">안녕하세요, {member?.displayName || '사용자'}님</h1>
        <p className="text-sm text-slate-500 mt-1">{tenant?.name} · {tenant?.serviceName}</p>
      </div>

      {/* 스탯 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { icon: FolderKanban, label: '프로젝트', value: projects.length, color: 'text-indigo-400' },
          { icon: Clock, label: '진행 중', value: inProgress, color: 'text-amber-400' },
          { icon: CheckCircle2, label: '완료', value: completed, color: 'text-emerald-400' },
          { icon: Target, label: '내 GPR', value: gprs.length, color: 'text-violet-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-slate-500">{s.label}</span></div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 할일 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2"><ListTodo size={15} className="text-indigo-400" /><span className="text-sm font-semibold">할일</span></div>
            <span className="text-xs text-slate-500">{todos.filter((t: any) => !t.isDone).length}개 남음</span>
          </div>
          <div className="p-3">
            <div className="flex gap-2 mb-3">
              <input value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
                placeholder="할일 추가..." className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              <button onClick={handleAddTodo} disabled={!newTodo.trim()} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm disabled:opacity-40"><Plus size={14} /></button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {todos.slice(0, 8).map((t: any) => (
                <button key={t.id} onClick={() => handleToggle(t.id, t.isDone)}
                  className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5 ${t.isDone ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                  <div className={`h-4 w-4 rounded border ${t.isDone ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600'} flex items-center justify-center`}>
                    {t.isDone && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  {t.title}
                </button>
              ))}
              {todos.length === 0 && <p className="text-center text-xs text-slate-600 py-4">할일이 없습니다</p>}
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
              <p className="text-center text-xs text-slate-600 py-4">새 알림이 없습니다</p>
            ) : notifications.map((n: any) => (
              <div key={n.id} onClick={() => !n.isRead && handleReadNotif(n.id)}
                className={`rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-white/5 ${n.isRead ? 'text-slate-600' : 'text-slate-300 bg-white/[0.02]'}`}>
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
          <Link href="/wio/app/project" className="text-xs text-indigo-400 hover:underline">전체</Link>
        </div>
        {projects.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            <Link href="/wio/app/project/new" className="text-indigo-400 hover:underline">첫 프로젝트 만들기</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {projects.slice(0, 5).map(p => (
              <Link key={p.id} href={`/wio/app/project/${p.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.code}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' : p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>{p.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
