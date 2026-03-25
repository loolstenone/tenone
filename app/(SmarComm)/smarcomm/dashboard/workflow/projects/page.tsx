"use client";

import { useState } from "react";
import { useWorkflow } from "@/lib/workflow-context";
import { ProjectCard } from "@/components/smarcomm/workflow/ProjectCard";
import { workflowChannels } from "@/lib/smarcomm/workflow-data";
import { Filter, FolderKanban } from "lucide-react";
import NextStepCTA from '@/components/smarcomm/NextStepCTA';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

export default function ProjectsPage() {
  const { projects } = useWorkflow();
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = projects.filter(p => {
    if (brandFilter !== 'all' && p.brandId !== brandFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const activeCount = projects.filter(p => p.status === 'Active').length;
  const avgProgress = Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length);
  const selectClass = "rounded-xl border border-border bg-white px-3 py-2 text-xs text-text focus:border-text focus:outline-none";

  return (
    <div className="max-w-5xl space-y-5">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">프로젝트</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">캠페인별 프로젝트 진행 현황을 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className={selectClass}>
            <option value="all">전체 채널</option>
            {workflowChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="all">전체 상태</option>
            <option value="Active">Active</option><option value="On Hold">On Hold</option><option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: '활성 프로젝트', value: activeCount }, { label: '전체 프로젝트', value: projects.length }, { label: '평균 진행률', value: `${avgProgress}%` }].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-4 flex items-center gap-3">
            <div className="rounded-xl bg-surface p-2.5"><FolderKanban className="h-4 w-4 text-text-sub" /></div>
            <div><p className="text-xl font-bold text-text">{s.value}</p><p className="text-[10px] text-text-muted">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
        {filtered.length === 0 && <div className="col-span-2 text-center py-16 text-text-muted text-sm">조건에 맞는 프로젝트가 없습니다</div>}
      </div>

      <NextStepCTA stage="기획 → 제작" title="프로젝트에 필요한 소재 제작" description="기획된 캠페인에 맞는 카피, 배너, 영상 소재를 AI로 제작하세요" actionLabel="소재 제작" href="/dashboard/creative" />
    </div>
  );
}
