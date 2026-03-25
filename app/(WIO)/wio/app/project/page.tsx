'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Search } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchProjects } from '@/lib/supabase/wio';
import type { WIOProject, ProjectStatus } from '@/types/wio';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: '초안', color: 'bg-slate-500/10 text-slate-400' },
  pending: { label: '승인대기', color: 'bg-amber-500/10 text-amber-400' },
  approved: { label: '승인', color: 'bg-blue-500/10 text-blue-400' },
  in_progress: { label: '진행중', color: 'bg-indigo-500/10 text-indigo-400' },
  completed: { label: '완료', color: 'bg-emerald-500/10 text-emerald-400' },
  cancelled: { label: '취소', color: 'bg-red-500/10 text-red-400' },
};

export default function ProjectListPage() {
  const { tenant } = useWIO();
  const [projects, setProjects] = useState<WIOProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProjectStatus | ''>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!tenant) return;
    fetchProjects(tenant.id, filter || undefined).then(p => { setProjects(p); setLoading(false); });
  }, [tenant, filter]);

  const filtered = search ? projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())) : projects;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">프로젝트</h1>
          <p className="text-sm text-slate-500 mt-1">{projects.length}개 프로젝트</p>
        </div>
        <Link href="/wio/app/project/new" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
          <Plus size={15} /> 새 프로젝트
        </Link>
      </div>

      {/* 필터 + 검색 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="프로젝트명 또는 코드 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value as ProjectStatus | '')}
          className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none">
          <option value="">전체 상태</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* 프로젝트 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <FolderKanban size={40} className="mx-auto mb-3 text-slate-600" />
          <p>프로젝트가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const st = STATUS_LABELS[p.status] || STATUS_LABELS.draft;
            return (
              <Link key={p.id} href={`/wio/app/project/${p.id}`}
                className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-indigo-500/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{p.code} · {p.type === 'client' ? p.clientName || '클라이언트' : p.type}</div>
                </div>
                {p.budget > 0 && <span className="text-xs text-slate-500">{(p.budget / 10000).toFixed(0)}만원</span>}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
