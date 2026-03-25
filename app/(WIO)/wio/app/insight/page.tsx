'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, FolderKanban, TrendingUp, Award, Target, DollarSign, BookOpen } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchProjects, fetchTenantMembers, fetchOpportunities, fetchGPRs, fetchApprovals, fetchContents, fetchDocuments } from '@/lib/supabase/wio';

interface Stats {
  totalMembers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalOpportunities: number;
  wonOpportunities: number;
  totalRevenue: number;
  pendingApprovals: number;
  totalContents: number;
  totalDocs: number;
  gprCount: number;
}

export default function InsightPage() {
  const { tenant } = useWIO();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;
    Promise.all([
      fetchTenantMembers(tenant.id),
      fetchProjects(tenant.id),
      fetchOpportunities(tenant.id),
      fetchApprovals(tenant.id),
      fetchContents(tenant.id),
      fetchDocuments(tenant.id),
      fetchGPRs(tenant.id),
    ]).then(([members, projects, opps, approvals, contents, docs, gprs]) => {
      setStats({
        totalMembers: members.length,
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'in_progress').length,
        completedProjects: projects.filter((p: any) => p.status === 'completed').length,
        totalOpportunities: opps.length,
        wonOpportunities: opps.filter((o: any) => o.status === 'won' || o.status === 'converted').length,
        totalRevenue: projects.reduce((s: number, p: any) => s + (p.revenue || 0), 0),
        pendingApprovals: approvals.filter((a: any) => a.status === 'pending').length,
        totalContents: contents.length,
        totalDocs: docs.length,
        gprCount: gprs.length,
      });
      setLoading(false);
    });
  }, [tenant]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;
  }

  if (!stats) return null;

  const cards = [
    { icon: Users, label: '멤버', value: stats.totalMembers, suffix: '명', color: 'text-blue-400' },
    { icon: FolderKanban, label: '전체 프로젝트', value: stats.totalProjects, suffix: '건', color: 'text-indigo-400' },
    { icon: Target, label: '진행중', value: stats.activeProjects, suffix: '건', color: 'text-amber-400' },
    { icon: BarChart3, label: '완료', value: stats.completedProjects, suffix: '건', color: 'text-emerald-400' },
    { icon: TrendingUp, label: '영업 기회', value: stats.totalOpportunities, suffix: '건', color: 'text-violet-400' },
    { icon: DollarSign, label: '수주', value: stats.wonOpportunities, suffix: '건', color: 'text-cyan-400' },
    { icon: DollarSign, label: '총 매출', value: stats.totalRevenue > 0 ? `${(stats.totalRevenue / 10000).toFixed(0)}만원` : '0원', suffix: '', color: 'text-emerald-400' },
    { icon: Award, label: '결재 대기', value: stats.pendingApprovals, suffix: '건', color: 'text-orange-400' },
    { icon: BookOpen, label: '콘텐츠', value: stats.totalContents, suffix: '건', color: 'text-pink-400' },
    { icon: BookOpen, label: '위키 문서', value: stats.totalDocs, suffix: '건', color: 'text-slate-400' },
    { icon: Target, label: 'GPR 목표', value: stats.gprCount, suffix: '개', color: 'text-indigo-400' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">인사이트</h1>
      <p className="text-sm text-slate-500 mb-6">{tenant?.name} 전체 현황</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className={card.color} />
              <span className="text-xs text-slate-500">{card.label}</span>
            </div>
            <div className="text-2xl font-bold">
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              <span className="text-sm text-slate-500 font-normal ml-1">{card.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 프로젝트 상태 분포 */}
      <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-semibold mb-4">프로젝트 상태 분포</h2>
        <div className="flex gap-2">
          {[
            { label: '초안', value: stats.totalProjects - stats.activeProjects - stats.completedProjects, color: 'bg-slate-500' },
            { label: '진행중', value: stats.activeProjects, color: 'bg-amber-500' },
            { label: '완료', value: stats.completedProjects, color: 'bg-emerald-500' },
          ].map((bar, i) => {
            const pct = stats.totalProjects > 0 ? (bar.value / stats.totalProjects * 100) : 0;
            return (
              <div key={i} className="flex-1 text-center">
                <div className="h-24 flex items-end justify-center mb-2">
                  <div className={`w-full max-w-[40px] rounded-t ${bar.color}`} style={{ height: `${Math.max(pct, 5)}%` }} />
                </div>
                <div className="text-lg font-bold">{bar.value}</div>
                <div className="text-[10px] text-slate-500">{bar.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
