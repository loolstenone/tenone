'use client';

import { useState } from 'react';
import { Users, Star, DollarSign, TrendingUp, Link2, Filter } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_INFLUENCERS = [
  { id: 1, name: '김소영', handle: '@soyoung_mkt', platform: 'Instagram', followers: 125000, tier: 'Macro', engRate: 3.8, fee: 500, campaigns: 3, status: 'active', category: '마케팅' },
  { id: 2, name: '이준혁', handle: '@junhyuk_tech', platform: 'YouTube', followers: 82000, tier: 'Mid', engRate: 5.2, fee: 300, campaigns: 2, status: 'active', category: '테크' },
  { id: 3, name: '박하늘', handle: '@haneul_life', platform: 'Instagram', followers: 45000, tier: 'Micro', engRate: 7.1, fee: 150, campaigns: 1, status: 'contracted', category: '라이프스타일' },
  { id: 4, name: '최민수', handle: '@minsu_biz', platform: 'LinkedIn', followers: 18000, tier: 'Micro', engRate: 4.5, fee: 100, campaigns: 0, status: 'pool', category: '비즈니스' },
  { id: 5, name: '정다은', handle: '@daeun_style', platform: 'Instagram', followers: 210000, tier: 'Macro', engRate: 2.9, fee: 800, campaigns: 5, status: 'active', category: '패션' },
  { id: 6, name: '한지우', handle: '@jiwoo_edu', platform: 'YouTube', followers: 56000, tier: 'Mid', engRate: 6.0, fee: 250, campaigns: 1, status: 'pool', category: '교육' },
];

const TIER_MAP: Record<string, { color: string }> = {
  Mega: { color: 'text-amber-400 bg-amber-500/10' },
  Macro: { color: 'text-violet-400 bg-violet-500/10' },
  Mid: { color: 'text-blue-400 bg-blue-500/10' },
  Micro: { color: 'text-emerald-400 bg-emerald-500/10' },
  Nano: { color: 'text-slate-400 bg-slate-500/10' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '활성', color: 'text-emerald-400 bg-emerald-500/10' },
  contracted: { label: '계약중', color: 'text-blue-400 bg-blue-500/10' },
  pool: { label: '풀', color: 'text-slate-400 bg-slate-500/10' },
};

export default function InfluencerPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [filter, setFilter] = useState<string>('all');

  const influencers = isDemo ? MOCK_INFLUENCERS : MOCK_INFLUENCERS;
  const filtered = filter === 'all' ? influencers : influencers.filter(i => i.status === filter);

  const totalFee = influencers.filter(i => i.status === 'active').reduce((s, i) => s + i.fee, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">인플루언서 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-INF &middot; 인플루언서 DB, 매칭, 정산</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">인플루언서 풀</div>
          <div className="text-lg font-bold">{influencers.length}명</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">활성 계약</div>
          <div className="text-lg font-bold">{influencers.filter(i => i.status === 'active').length}명</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">월 비용</div>
          <div className="text-lg font-bold">{totalFee.toLocaleString()}만</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">캠페인 연결</div>
          <div className="text-lg font-bold">{influencers.reduce((s, i) => s + i.campaigns, 0)}건</div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        {[{ key: 'all', label: '전체' }, { key: 'active', label: '활성' }, { key: 'contracted', label: '계약중' }, { key: 'pool', label: '풀' }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${filter === f.key ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 인플루언서 목록 */}
      <div className="space-y-2">
        {filtered.map(inf => {
          const tier = TIER_MAP[inf.tier] || TIER_MAP.Micro;
          const st = STATUS_MAP[inf.status] || STATUS_MAP.pool;
          return (
            <div key={inf.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-sm font-bold">{inf.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{inf.name}</span>
                  <span className="text-xs text-slate-500">{inf.handle}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tier.color}`}>{inf.tier}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{inf.platform} &middot; {inf.category} &middot; 팔로워 {(inf.followers / 1000).toFixed(0)}K &middot; 참여율 {inf.engRate}%</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{inf.fee}만</div>
                <div className="text-[11px] text-slate-500">{inf.campaigns}건 캠페인</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
