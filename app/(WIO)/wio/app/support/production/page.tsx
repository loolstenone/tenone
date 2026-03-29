'use client';

import { useState } from 'react';
import { Factory, Plus, Calendar, ClipboardList } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_MPS = [
  { id: 'MPS-001', product: '스마트 센서 모듈 A', sku: 'SSM-A100', month: '2026-04', planned: 5000, confirmed: 4200, completed: 0, status: 'scheduled' },
  { id: 'MPS-002', product: '스마트 센서 모듈 B', sku: 'SSM-B200', month: '2026-04', planned: 3000, confirmed: 3000, completed: 0, status: 'scheduled' },
  { id: 'MPS-003', product: 'IoT 게이트웨이', sku: 'IGW-500', month: '2026-03', planned: 2000, confirmed: 2000, completed: 1850, status: 'in_progress' },
  { id: 'MPS-004', product: '컨트롤러 보드 v3', sku: 'CTB-V3', month: '2026-03', planned: 1500, confirmed: 1500, completed: 1500, status: 'completed' },
];

const MOCK_WORK_ORDERS = [
  { id: 'WO-2601', product: 'IoT 게이트웨이', line: 'Line A', quantity: 500, startDate: '2026-03-25', endDate: '2026-03-28', status: 'in_progress', progress: 72 },
  { id: 'WO-2602', product: 'IoT 게이트웨이', line: 'Line B', quantity: 350, startDate: '2026-03-26', endDate: '2026-03-29', status: 'in_progress', progress: 45 },
  { id: 'WO-2603', product: '스마트 센서 모듈 A', line: 'Line A', quantity: 1000, startDate: '2026-04-01', endDate: '2026-04-05', status: 'planned', progress: 0 },
  { id: 'WO-2604', product: '컨트롤러 보드 v3', line: 'Line C', quantity: 500, startDate: '2026-03-20', endDate: '2026-03-24', status: 'completed', progress: 100 },
  { id: 'WO-2605', product: '스마트 센서 모듈 B', line: 'Line B', quantity: 800, startDate: '2026-04-02', endDate: '2026-04-08', status: 'planned', progress: 0 },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  planned: { label: '예정', color: 'text-slate-400 bg-slate-500/10' },
  scheduled: { label: '확정', color: 'text-blue-400 bg-blue-500/10' },
  in_progress: { label: '진행중', color: 'text-indigo-400 bg-indigo-500/10' },
  completed: { label: '완료', color: 'text-emerald-400 bg-emerald-500/10' },
};

export default function ProductionPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<'mps' | 'orders'>('mps');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">생산계획</h1>
          <p className="text-xs text-slate-500 mt-0.5">PRD-PLN &middot; MPS &amp; 작업지시</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> {tab === 'mps' ? '생산계획' : '작업지시'} 등록
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('mps')} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${tab === 'mps' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <Factory size={14} /> MPS
        </button>
        <button onClick={() => setTab('orders')} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm ${tab === 'orders' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <ClipboardList size={14} /> 작업지시
        </button>
      </div>

      {tab === 'mps' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-500">
                <th className="text-left py-2 pr-4">품목</th>
                <th className="text-left py-2 pr-4">SKU</th>
                <th className="text-left py-2 pr-4">월</th>
                <th className="text-right py-2 pr-4">계획</th>
                <th className="text-right py-2 pr-4">확정</th>
                <th className="text-right py-2 pr-4">완료</th>
                <th className="text-right py-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MPS.map(m => {
                const st = STATUS_MAP[m.status];
                return (
                  <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-medium">{m.product}</td>
                    <td className="py-3 pr-4 text-xs font-mono text-slate-500">{m.sku}</td>
                    <td className="py-3 pr-4 text-slate-400">{m.month}</td>
                    <td className="py-3 pr-4 text-right">{m.planned.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right">{m.confirmed.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right font-bold">{m.completed.toLocaleString()}</td>
                    <td className="py-3 text-right"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {MOCK_WORK_ORDERS.map(wo => {
            const st = STATUS_MAP[wo.status];
            return (
              <div key={wo.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600">{wo.id}</span>
                    <span className="text-sm font-medium">{wo.product}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">{wo.line}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                  <span>수량: {wo.quantity.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} />{wo.startDate} ~ {wo.endDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/5">
                    <div className={`h-full rounded-full ${wo.progress >= 100 ? 'bg-emerald-500' : wo.progress > 0 ? 'bg-indigo-500' : 'bg-slate-600'}`} style={{ width: `${wo.progress}%` }} />
                  </div>
                  <span className="text-xs font-bold w-10 text-right">{wo.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
