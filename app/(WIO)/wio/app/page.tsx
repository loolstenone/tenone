'use client';

import { useState, useEffect } from 'react';
import { FolderKanban, Users, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useWIO } from './layout';
import { fetchProjects } from '@/lib/supabase/wio';
import type { WIOProject } from '@/types/wio';

export default function WIOHomePage() {
  const { tenant, member } = useWIO();
  const [projects, setProjects] = useState<WIOProject[]>([]);

  useEffect(() => {
    if (tenant) fetchProjects(tenant.id).then(setProjects);
  }, [tenant]);

  const inProgress = projects.filter(p => p.status === 'in_progress').length;
  const completed = projects.filter(p => p.status === 'completed').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">안녕하세요, {member?.displayName || '사용자'}님</h1>
        <p className="text-sm text-slate-500 mt-1">{tenant?.name} 워크스페이스</p>
      </div>

      {/* 스탯 카드 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { icon: FolderKanban, label: '전체 프로젝트', value: projects.length, color: 'text-indigo-400' },
          { icon: Clock, label: '진행 중', value: inProgress, color: 'text-amber-400' },
          { icon: CheckCircle2, label: '완료', value: completed, color: 'text-emerald-400' },
          { icon: Users, label: '멤버', value: '-', color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs text-slate-500">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 최근 프로젝트 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h2 className="text-sm font-semibold">최근 프로젝트</h2>
          <Link href="/wio/app/project" className="text-xs text-indigo-400 hover:underline">전체 보기</Link>
        </div>
        {projects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FolderKanban size={32} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm">아직 프로젝트가 없습니다</p>
            <Link href="/wio/app/project/new" className="mt-3 inline-block text-xs text-indigo-400 hover:underline">첫 프로젝트 만들기</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {projects.slice(0, 5).map(p => (
              <Link key={p.id} href={`/wio/app/project/${p.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.code} · {p.clientName || p.type}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  p.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' :
                  p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-slate-500/10 text-slate-400'
                }`}>{p.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
