'use client';

import { useState } from 'react';
import { FlaskConical, Plus, Calendar, FileText, BarChart3 } from 'lucide-react';
import { useWIO } from '../../layout';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  planning: { label: '기획', color: 'text-slate-400 bg-slate-500/10' },
  active: { label: '진행중', color: 'text-indigo-400 bg-indigo-500/10' },
  review: { label: '검토', color: 'text-amber-400 bg-amber-500/10' },
  completed: { label: '완료', color: 'text-emerald-400 bg-emerald-500/10' },
};

const MOCK_PROJECTS = [
  { id: 'RND-001', title: 'AI 기반 고객 세그먼테이션 자동화', lead: '박상현', status: 'active', progress: 68, budget: 5000, spent: 3200, startDate: '2026-01-15', endDate: '2026-06-30', outputs: ['중간보고서', '프로토타입 v1'], team: 4 },
  { id: 'RND-002', title: '실시간 추천 엔진 고도화', lead: '김지은', status: 'active', progress: 42, budget: 8000, spent: 3800, startDate: '2026-02-01', endDate: '2026-09-30', outputs: ['요구사항 정의서'], team: 6 },
  { id: 'RND-003', title: 'NLP 기반 VOC 자동 분류 시스템', lead: '이하은', status: 'review', progress: 95, budget: 3000, spent: 2850, startDate: '2025-09-01', endDate: '2026-03-31', outputs: ['최종보고서', '모델 v2.1', '특허출원서'], team: 3 },
  { id: 'RND-004', title: '블록체인 기반 데이터 무결성 검증', lead: '정현우', status: 'planning', progress: 10, budget: 6000, spent: 200, startDate: '2026-04-01', endDate: '2026-12-31', outputs: [], team: 5 },
];

export default function RndPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';

  const totalBudget = MOCK_PROJECTS.reduce((a, p) => a + p.budget, 0);
  const totalSpent = MOCK_PROJECTS.reduce((a, p) => a + p.spent, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">연구프로젝트</h1>
          <p className="text-xs text-slate-500 mt-0.5">RND-PRJ &middot; 연구과제 관리</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 과제 등록
        </button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">전체 과제</p>
          <p className="text-2xl font-bold mt-1">{MOCK_PROJECTS.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">진행중</p>
          <p className="text-2xl font-bold mt-1 text-indigo-400">{MOCK_PROJECTS.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">총 예산</p>
          <p className="text-2xl font-bold mt-1">{(totalBudget / 10000).toFixed(1)}억</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">집행률</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">{Math.round(totalSpent / totalBudget * 100)}%</p>
        </div>
      </div>

      {/* 과제 목록 */}
      <div className="space-y-3">
        {MOCK_PROJECTS.map(p => {
          const st = STATUS_MAP[p.status];
          return (
            <div key={p.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-600">{p.id}</span>
                  <span className="text-sm font-medium">{p.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <span className="text-xs text-slate-500">{p.team}명</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-slate-500">책임: {p.lead}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={10} />{p.startDate} ~ {p.endDate}</span>
              </div>

              {/* 진척률 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-2 rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${p.progress >= 90 ? 'bg-emerald-500' : p.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-xs font-bold w-10 text-right">{p.progress}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">예산 {(p.budget).toLocaleString()}만 / 집행 {(p.spent).toLocaleString()}만</span>
                </div>
                {p.outputs.length > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText size={10} className="text-slate-500" />
                    <span className="text-[10px] text-slate-500">산출물 {p.outputs.length}건</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
