'use client';

import { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useWIO } from '../../layout';

type Invoice = {
  id: string;
  date: string;
  client: string;
  description: string;
  amount: number;
  stage: 'billed' | 'collecting' | 'completed';
  dueDate: string;
  overdue: boolean;
};

const STAGE_MAP: Record<string, { label: string; color: string }> = {
  billed: { label: '청구', color: 'text-blue-400 bg-blue-500/10' },
  collecting: { label: '수금중', color: 'text-amber-400 bg-amber-500/10' },
  completed: { label: '완료', color: 'text-emerald-400 bg-emerald-500/10' },
};

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', date: '2026-03-15', client: '(주)스마트미디어', description: '3월 마케팅 캠페인 운영', amount: 35000000, stage: 'billed', dueDate: '2026-04-15', overdue: false },
  { id: 'INV-002', date: '2026-03-01', client: '글로벌테크', description: 'AI 컨설팅 1차', amount: 22000000, stage: 'collecting', dueDate: '2026-03-31', overdue: false },
  { id: 'INV-003', date: '2026-02-20', client: '넥스트이노베이션', description: '앱 개발 중간금', amount: 45000000, stage: 'collecting', dueDate: '2026-03-20', overdue: true },
  { id: 'INV-004', date: '2026-02-10', client: '(주)에듀플러스', description: '교육 플랫폼 구축', amount: 18000000, stage: 'completed', dueDate: '2026-03-10', overdue: false },
  { id: 'INV-005', date: '2026-01-25', client: '디지털크루', description: '월간 유지보수', amount: 5500000, stage: 'completed', dueDate: '2026-02-25', overdue: false },
];

const CLIENT_SUMMARY = [
  { name: '(주)스마트미디어', totalSales: 120000000, receivable: 35000000, completed: 85000000 },
  { name: '글로벌테크', totalSales: 88000000, receivable: 22000000, completed: 66000000 },
  { name: '넥스트이노베이션', totalSales: 95000000, receivable: 45000000, completed: 50000000 },
  { name: '(주)에듀플러스', totalSales: 42000000, receivable: 0, completed: 42000000 },
  { name: '디지털크루', totalSales: 33000000, receivable: 0, completed: 33000000 },
];

export default function ARPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [tab, setTab] = useState<'pipeline' | 'clients'>('pipeline');

  const totalReceivable = MOCK_INVOICES.filter(i => i.stage !== 'completed').reduce((s, i) => s + i.amount, 0);
  const overdueAmount = MOCK_INVOICES.filter(i => i.overdue).reduce((s, i) => s + i.amount, 0);
  const completedAmount = MOCK_INVOICES.filter(i => i.stage === 'completed').reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">매출관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">FIN-AR &middot; Accounts Receivable</p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">미수금 합계</div>
          <div className="text-lg font-bold text-amber-400">{totalReceivable.toLocaleString()}원</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">연체금액</div>
          <div className="text-lg font-bold text-red-400">{overdueAmount.toLocaleString()}원</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">수금완료 (최근)</div>
          <div className="text-lg font-bold text-emerald-400">{completedAmount.toLocaleString()}원</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'pipeline' as const, label: '매출 파이프라인' },
          { id: 'clients' as const, label: '거래처별 매출' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 파이프라인 */}
      {tab === 'pipeline' && (
        <div className="space-y-2">
          {MOCK_INVOICES.map(inv => {
            const stage = STAGE_MAP[inv.stage];
            return (
              <div key={inv.id} className={`rounded-xl border p-4 ${inv.overdue ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-white/5 bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{inv.id}</span>
                    <span className="text-sm font-medium">{inv.description}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stage.color}`}>{stage.label}</span>
                    {inv.overdue && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-red-400 bg-red-500/10 flex items-center gap-1">
                        <AlertCircle size={10} /> 연체
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-indigo-300">{inv.amount.toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{inv.client} &middot; 청구일 {inv.date}</span>
                  <span className={inv.overdue ? 'text-red-400' : ''}>만기 {inv.dueDate}</span>
                </div>
                {/* 진행 표시 */}
                <div className="flex items-center gap-2 mt-3 text-[10px]">
                  {['billed', 'collecting', 'completed'].map((s, i) => {
                    const stages = ['billed', 'collecting', 'completed'];
                    const current = stages.indexOf(inv.stage);
                    const active = i <= current;
                    return (
                      <div key={s} className="flex items-center gap-1 flex-1">
                        <div className={`h-1 flex-1 rounded-full ${active ? 'bg-indigo-500' : 'bg-white/5'}`} />
                        {i < stages.length - 1 && <ArrowRight size={8} className="text-slate-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 거래처별 매출 */}
      {tab === 'clients' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-500">
                <th className="text-left px-4 py-3">거래처</th>
                <th className="text-right px-4 py-3">총 매출</th>
                <th className="text-right px-4 py-3">미수금</th>
                <th className="text-right px-4 py-3">수금완료</th>
              </tr>
            </thead>
            <tbody>
              {CLIENT_SUMMARY.map(c => (
                <tr key={c.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{c.totalSales.toLocaleString()}</td>
                  <td className={`px-4 py-2.5 text-right font-mono ${c.receivable > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{c.receivable.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-400">{c.completed.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
