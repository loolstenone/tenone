'use client';

import { useState } from 'react';
import { Building2, DollarSign, Receipt, ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_AGENCIES = [
  { id: 1, name: '디지털웍스', type: '종합대행사', contract: '연간', monthlyFee: 800, campaigns: 3, status: 'active', paymentStatus: 'paid', lastPayment: '2026-03-05' },
  { id: 2, name: '미디어플러스', type: '매체 대행', contract: '프로젝트', monthlyFee: 400, campaigns: 2, status: 'active', paymentStatus: 'pending', lastPayment: '2026-02-28' },
  { id: 3, name: '크리에이티브랩', type: '소재 제작', contract: '건별', monthlyFee: 200, campaigns: 1, status: 'active', paymentStatus: 'paid', lastPayment: '2026-03-10' },
  { id: 4, name: 'SNS매니지먼트', type: 'SNS 운영', contract: '월간', monthlyFee: 150, campaigns: 1, status: 'paused', paymentStatus: 'overdue', lastPayment: '2026-01-31' },
];

const MOCK_SETTLEMENTS = [
  { id: 1, month: '2026-03', agency: '디지털웍스', type: '대행 수수료', amount: 800, status: 'paid', date: '2026-03-05' },
  { id: 2, month: '2026-03', agency: '미디어플러스', type: '매체비 정산', amount: 2400, status: 'pending', date: '-' },
  { id: 3, month: '2026-03', agency: '크리에이티브랩', type: '소재 제작비', amount: 350, status: 'paid', date: '2026-03-10' },
  { id: 4, month: '2026-03', agency: '네이버', type: '매체비 (직접)', amount: 1200, status: 'paid', date: '2026-03-01' },
  { id: 5, month: '2026-03', agency: '구글', type: '매체비 (직접)', amount: 800, status: 'paid', date: '2026-03-01' },
  { id: 6, month: '2026-03', agency: '메타', type: '매체비 (직접)', amount: 600, status: 'pending', date: '-' },
];

const MOCK_BUDGET_TRACK = [
  { category: '매체비 (Paid)', planned: 3000, actual: 2600, pct: 87 },
  { category: '대행 수수료', planned: 1550, actual: 1350, pct: 87 },
  { category: '소재 제작비', planned: 500, actual: 350, pct: 70 },
  { category: '인플루언서', planned: 400, actual: 280, pct: 70 },
  { category: '기타', planned: 200, actual: 120, pct: 60 },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '활성', color: 'text-emerald-400 bg-emerald-500/10' },
  paused: { label: '일시정지', color: 'text-amber-400 bg-amber-500/10' },
  ended: { label: '종료', color: 'text-slate-400 bg-slate-500/10' },
};

const PAY_MAP: Record<string, { label: string; color: string; icon: any }> = {
  paid: { label: '정산완료', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  pending: { label: '정산대기', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
  overdue: { label: '미정산', color: 'text-red-400 bg-red-500/10', icon: AlertTriangle },
};

export default function OpsPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [tab, setTab] = useState<'agencies' | 'settlements' | 'budget'>('agencies');

  const agencies = isDemo ? MOCK_AGENCIES : MOCK_AGENCIES;
  const totalMonthly = agencies.filter(a => a.status === 'active').reduce((s, a) => s + a.monthlyFee, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">마케팅 운영</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-OPS &middot; 대행사/벤더 관리, 정산, 예산 집행 추적</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">활성 대행사</div>
          <div className="text-lg font-bold">{agencies.filter(a => a.status === 'active').length}개</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">월 대행 비용</div>
          <div className="text-lg font-bold">{totalMonthly.toLocaleString()}만</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">이번달 정산</div>
          <div className="text-lg font-bold">{MOCK_SETTLEMENTS.reduce((s, t) => s + t.amount, 0).toLocaleString()}만</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">미정산</div>
          <div className="text-lg font-bold text-amber-400">{MOCK_SETTLEMENTS.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}만</div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'agencies' as const, label: '대행사/벤더', icon: Building2 },
          { key: 'settlements' as const, label: '정산', icon: Receipt },
          { key: 'budget' as const, label: '예산 집행', icon: DollarSign },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${tab === t.key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'agencies' && (
        <div className="space-y-2">
          {agencies.map(a => {
            const st = STATUS_MAP[a.status] || STATUS_MAP.active;
            const pay = PAY_MAP[a.paymentStatus] || PAY_MAP.pending;
            const PayIcon = pay.icon;
            return (
              <div key={a.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <Building2 size={16} className="text-slate-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{a.name}</span>
                    <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-white/5">{a.type}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{a.contract} 계약 &middot; {a.campaigns}건 캠페인 연결</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{a.monthlyFee.toLocaleString()}만/월</div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${pay.color}`}>
                    <PayIcon size={10} /> {pay.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'settlements' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="text-left py-2 pr-3">대행사/매체</th>
                  <th className="text-left py-2 px-3">항목</th>
                  <th className="text-right py-2 px-3">금액</th>
                  <th className="text-left py-2 px-3">상태</th>
                  <th className="text-left py-2 pl-3">정산일</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SETTLEMENTS.map(s => {
                  const pay = PAY_MAP[s.status] || PAY_MAP.pending;
                  const PayIcon = pay.icon;
                  return (
                    <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-3 font-medium">{s.agency}</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.type}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{s.amount.toLocaleString()}만</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${pay.color}`}>
                          <PayIcon size={10} /> {pay.label}
                        </span>
                      </td>
                      <td className="py-2.5 pl-3 text-slate-500">{s.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'budget' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h2 className="text-sm font-semibold mb-3">3월 예산 집행 현황</h2>
          <div className="space-y-4">
            {MOCK_BUDGET_TRACK.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{b.category}</span>
                  <span className="text-slate-400">{b.actual.toLocaleString()} / {b.planned.toLocaleString()}만 ({b.pct}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${b.pct >= 90 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="border-t border-white/5 pt-3 flex justify-between text-sm font-bold">
              <span>합계</span>
              <span>{MOCK_BUDGET_TRACK.reduce((s, b) => s + b.actual, 0).toLocaleString()} / {MOCK_BUDGET_TRACK.reduce((s, b) => s + b.planned, 0).toLocaleString()}만</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
