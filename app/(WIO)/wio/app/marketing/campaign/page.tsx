'use client';

import { useState } from 'react';
import { Megaphone, Plus, Calendar, TrendingUp, Pause, CheckCircle2, XCircle } from 'lucide-react';
import { useWIO } from '../../layout';

const LIFECYCLE_STEPS = ['기획', '승인', '소재제작', '매체세팅', '검수', '라이브', '최적화', '중간보고', '종료', '결산'];

const MOCK_CAMPAIGNS = [
  { id: 1, name: '2026 봄 브랜드 캠페인', type: 'brand', startDate: '2026-03-01', endDate: '2026-04-30', budget: 5000, spent: 2800, step: 6, status: 'live', impressions: 1240000, clicks: 38400, conversions: 1260 },
  { id: 2, name: '스타트업 리드젠 Q1', type: 'performance', startDate: '2026-01-15', endDate: '2026-03-31', budget: 3000, spent: 2950, step: 8, status: 'live', impressions: 890000, clicks: 42100, conversions: 2080 },
  { id: 3, name: '제품 런칭 프로모션', type: 'promotion', startDate: '2026-04-01', endDate: '2026-04-15', budget: 2000, spent: 0, step: 2, status: 'draft', impressions: 0, clicks: 0, conversions: 0 },
  { id: 4, name: '채용 브랜딩 시리즈', type: 'content', startDate: '2026-02-01', endDate: '2026-06-30', budget: 1500, spent: 600, step: 6, status: 'live', impressions: 320000, clicks: 9600, conversions: 480 },
  { id: 5, name: '연말 세일 캠페인', type: 'performance', startDate: '2026-11-15', endDate: '2026-12-31', budget: 8000, spent: 0, step: 0, status: 'planned', impressions: 0, clicks: 0, conversions: 0 },
];

const TYPE_MAP: Record<string, string> = { brand: '브랜드', performance: '퍼포먼스', promotion: '프로모션', content: '콘텐츠' };
const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: '초안', color: 'text-slate-400 bg-slate-500/10', icon: Pause },
  planned: { label: '예정', color: 'text-blue-400 bg-blue-500/10', icon: Calendar },
  live: { label: '라이브', color: 'text-emerald-400 bg-emerald-500/10', icon: TrendingUp },
  paused: { label: '일시정지', color: 'text-amber-400 bg-amber-500/10', icon: Pause },
  completed: { label: '완료', color: 'text-indigo-400 bg-indigo-500/10', icon: CheckCircle2 },
  cancelled: { label: '취소', color: 'text-red-400 bg-red-500/10', icon: XCircle },
};

export default function CampaignPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [filter, setFilter] = useState<string>('all');

  const campaigns = isDemo ? MOCK_CAMPAIGNS : MOCK_CAMPAIGNS;
  const filtered = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">캠페인 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-CMP &middot; 캠페인 라이프사이클 관리</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 캠페인 생성
        </button>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[{ key: 'all', label: '전체' }, { key: 'live', label: '라이브' }, { key: 'draft', label: '초안' }, { key: 'planned', label: '예정' }, { key: 'completed', label: '완료' }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 캠페인 목록 */}
      <div className="space-y-3">
        {filtered.map(c => {
          const st = STATUS_MAP[c.status] || STATUS_MAP.draft;
          return (
            <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Megaphone size={14} className="text-indigo-400" />
                  <span className="text-sm font-semibold">{c.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-white/5">{TYPE_MAP[c.type]}</span>
                </div>
                <div className="text-xs text-slate-500">{c.startDate} ~ {c.endDate}</div>
              </div>

              {/* 라이프사이클 진행바 */}
              <div className="mb-3">
                <div className="flex gap-0.5 mb-1">
                  {LIFECYCLE_STEPS.map((step, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className={`h-1.5 w-full rounded-full ${i < c.step ? 'bg-indigo-500' : i === c.step ? 'bg-indigo-500/50' : 'bg-white/5'}`} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-600">
                  <span>{LIFECYCLE_STEPS[0]}</span>
                  <span>{c.step > 0 ? LIFECYCLE_STEPS[Math.min(c.step, 9)] : ''}</span>
                  <span>{LIFECYCLE_STEPS[9]}</span>
                </div>
              </div>

              {/* KPI */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div><span className="text-slate-500">예산</span><div className="font-bold">{c.budget.toLocaleString()}만</div></div>
                <div><span className="text-slate-500">집행</span><div className="font-bold">{c.spent.toLocaleString()}만 ({c.budget ? Math.round((c.spent / c.budget) * 100) : 0}%)</div></div>
                <div><span className="text-slate-500">노출</span><div className="font-bold">{c.impressions.toLocaleString()}</div></div>
                <div><span className="text-slate-500">클릭</span><div className="font-bold">{c.clicks.toLocaleString()}</div></div>
                <div><span className="text-slate-500">전환</span><div className="font-bold">{c.conversions.toLocaleString()}</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
