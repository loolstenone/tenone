'use client';

import { useState } from 'react';
import { Monitor, Globe, Share2, DollarSign, BarChart3, FileText } from 'lucide-react';
import { useWIO } from '../../layout';

type MediaTab = 'paid' | 'owned' | 'earned';

const MOCK_MEDIA = [
  { id: 1, name: '네이버 검색광고', type: 'paid' as const, category: 'Search', monthlyBudget: 1200, spent: 980, impressions: 520000, ctr: 3.2, status: 'active' },
  { id: 2, name: '구글 디스플레이', type: 'paid' as const, category: 'Display', monthlyBudget: 800, spent: 620, impressions: 1400000, ctr: 0.8, status: 'active' },
  { id: 3, name: '메타 광고', type: 'paid' as const, category: 'Social', monthlyBudget: 600, spent: 540, impressions: 380000, ctr: 1.9, status: 'active' },
  { id: 4, name: '카카오모먼트', type: 'paid' as const, category: 'Social', monthlyBudget: 400, spent: 280, impressions: 210000, ctr: 2.1, status: 'active' },
  { id: 5, name: '공식 블로그', type: 'owned' as const, category: 'Blog', monthlyBudget: 0, spent: 0, impressions: 45000, ctr: 4.5, status: 'active' },
  { id: 6, name: '뉴스레터', type: 'owned' as const, category: 'Email', monthlyBudget: 50, spent: 50, impressions: 12000, ctr: 18.5, status: 'active' },
  { id: 7, name: '언론 보도', type: 'earned' as const, category: 'PR', monthlyBudget: 0, spent: 0, impressions: 280000, ctr: 0, status: 'active' },
  { id: 8, name: '인플루언서 멘션', type: 'earned' as const, category: 'Social', monthlyBudget: 0, spent: 0, impressions: 95000, ctr: 0, status: 'active' },
];

const MEDIA_PLAN = [
  { month: '3월', paid: 2800, owned: 50, earned: 0, total: 2850 },
  { month: '4월', paid: 3200, owned: 50, earned: 0, total: 3250 },
  { month: '5월', paid: 2600, owned: 50, earned: 0, total: 2650 },
];

const TAB_MAP: Record<MediaTab, { label: string; icon: any; color: string }> = {
  paid: { label: 'Paid', icon: DollarSign, color: 'text-amber-400' },
  owned: { label: 'Owned', icon: Globe, color: 'text-emerald-400' },
  earned: { label: 'Earned', icon: Share2, color: 'text-violet-400' },
};

export default function MediaPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [tab, setTab] = useState<MediaTab>('paid');

  const media = (isDemo ? MOCK_MEDIA : MOCK_MEDIA).filter(m => m.type === tab);
  const totalSpent = MOCK_MEDIA.filter(m => m.type === 'paid').reduce((s, m) => s + m.spent, 0);
  const totalBudget = MOCK_MEDIA.filter(m => m.type === 'paid').reduce((s, m) => s + m.monthlyBudget, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">매체 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-MDI &middot; Paid / Owned / Earned 매체 통합 관리</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">Paid 매체</div>
          <div className="text-lg font-bold">{MOCK_MEDIA.filter(m => m.type === 'paid').length}개</div>
          <div className="text-[11px] text-slate-500">월 예산 {totalBudget.toLocaleString()}만</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">Owned 매체</div>
          <div className="text-lg font-bold">{MOCK_MEDIA.filter(m => m.type === 'owned').length}개</div>
          <div className="text-[11px] text-slate-500">자사 채널</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">Earned 매체</div>
          <div className="text-lg font-bold">{MOCK_MEDIA.filter(m => m.type === 'earned').length}개</div>
          <div className="text-[11px] text-slate-500">획득 채널</div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {(Object.entries(TAB_MAP) as [MediaTab, typeof TAB_MAP[MediaTab]][]).map(([key, v]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${tab === key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <v.icon size={14} /> {v.label}
          </button>
        ))}
      </div>

      {/* 매체 목록 */}
      <div className="space-y-2 mb-6">
        {media.map(m => (
          <div key={m.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <Monitor size={16} className="text-slate-500" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{m.name}</span>
                <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-white/5">{m.category}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">노출 {m.impressions.toLocaleString()} &middot; CTR {m.ctr}%</div>
            </div>
            {m.monthlyBudget > 0 && (
              <div className="text-right">
                <div className="text-sm font-bold">{m.spent.toLocaleString()}만</div>
                <div className="text-[11px] text-slate-500">/ {m.monthlyBudget.toLocaleString()}만</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 매체 플랜 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText size={14} /> 매체 플랜</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500">
                <th className="text-left py-2 pr-4">월</th>
                <th className="text-right py-2 px-3">Paid</th>
                <th className="text-right py-2 px-3">Owned</th>
                <th className="text-right py-2 px-3">Earned</th>
                <th className="text-right py-2 pl-3">합계</th>
              </tr>
            </thead>
            <tbody>
              {MEDIA_PLAN.map((p, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="py-2 pr-4 font-medium">{p.month}</td>
                  <td className="py-2 px-3 text-right">{p.paid.toLocaleString()}만</td>
                  <td className="py-2 px-3 text-right">{p.owned.toLocaleString()}만</td>
                  <td className="py-2 px-3 text-right">-</td>
                  <td className="py-2 pl-3 text-right font-bold">{p.total.toLocaleString()}만</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
