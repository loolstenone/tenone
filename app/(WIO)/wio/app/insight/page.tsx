'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, FolderKanban, TrendingUp, Award, Target, DollarSign, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
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
    return (
      <div>
        <div className="mb-6 animate-pulse"><div className="h-6 w-32 bg-white/5 rounded mb-2" /><div className="h-4 w-48 bg-white/5 rounded" /></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-3 w-16 bg-white/5 rounded mb-3" />
              <div className="h-7 w-12 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { icon: Users, label: '멤버', value: stats.totalMembers, suffix: '명', color: 'text-blue-400', href: '/wio/app/people' },
    { icon: FolderKanban, label: '전체 프로젝트', value: stats.totalProjects, suffix: '건', color: 'text-indigo-400', href: '/wio/app/project' },
    { icon: Target, label: '진행중', value: stats.activeProjects, suffix: '건', color: 'text-amber-400', href: '/wio/app/project' },
    { icon: BarChart3, label: '완료', value: stats.completedProjects, suffix: '건', color: 'text-emerald-400', href: '/wio/app/project' },
    { icon: TrendingUp, label: '영업 기회', value: stats.totalOpportunities, suffix: '건', color: 'text-violet-400', href: '/wio/app/sales' },
    { icon: DollarSign, label: '수주', value: stats.wonOpportunities, suffix: '건', color: 'text-cyan-400', href: '/wio/app/sales' },
    { icon: DollarSign, label: '총 매출', value: stats.totalRevenue > 0 ? `${(stats.totalRevenue / 10000).toFixed(0)}만` : '0', suffix: '원', color: 'text-emerald-400', href: '/wio/app/finance' },
    { icon: Award, label: '결재 대기', value: stats.pendingApprovals, suffix: '건', color: stats.pendingApprovals > 0 ? 'text-orange-400' : 'text-slate-500', href: '/wio/app/finance' },
    { icon: BookOpen, label: '콘텐츠', value: stats.totalContents, suffix: '건', color: 'text-pink-400', href: '/wio/app/content' },
    { icon: BookOpen, label: '위키', value: stats.totalDocs, suffix: '건', color: 'text-slate-400', href: '/wio/app/wiki' },
    { icon: Target, label: 'GPR', value: stats.gprCount, suffix: '개', color: 'text-indigo-400', href: '/wio/app/gpr' },
  ];

  const projectTotal = stats.totalProjects || 1;
  const bars = [
    { label: '초안/대기', value: stats.totalProjects - stats.activeProjects - stats.completedProjects, color: 'bg-slate-500' },
    { label: '진행중', value: stats.activeProjects, color: 'bg-amber-500' },
    { label: '완료', value: stats.completedProjects, color: 'bg-emerald-500' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">인사이트</h1>
      <p className="text-sm text-slate-500 mb-6">{tenant?.name} 전체 현황</p>

      {/* KPI 카드 — 클릭 시 해당 모듈로 */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, i) => (
          <Link key={i} href={card.href}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className={card.color} />
              <span className="text-xs text-slate-500">{card.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                <span className="text-sm text-slate-500 font-normal ml-1">{card.suffix}</span>
              </div>
              <ArrowRight size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {/* 프로젝트 상태 분포 */}
      {stats.totalProjects > 0 && (
        <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4">프로젝트 상태 분포</h2>
          {/* 스택 바 */}
          <div className="h-3 rounded-full overflow-hidden flex mb-4">
            {bars.map((bar, i) => (
              <div key={i} className={`${bar.color} transition-all`} style={{ width: `${(bar.value / projectTotal) * 100}%` }} />
            ))}
          </div>
          <div className="flex gap-6">
            {bars.map((bar, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${bar.color}`} />
                <span className="text-xs text-slate-400">{bar.label}</span>
                <span className="text-xs font-bold">{bar.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {stats.totalProjects === 0 && stats.totalMembers <= 1 && (
        <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <BarChart3 size={36} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm text-slate-400 mb-1">데이터가 쌓이면 인사이트가 보입니다</p>
          <p className="text-xs text-slate-600">프로젝트를 만들고, 멤버를 초대하고, 활동을 시작하세요</p>
        </div>
      )}
    </div>
  );
}
