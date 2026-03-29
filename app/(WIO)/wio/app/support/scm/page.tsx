'use client';

import { useState } from 'react';
import { Link2, Star, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { useWIO } from '../../layout';

const RATING_MAP: Record<string, { label: string; color: string }> = {
  A: { label: 'A등급', color: 'text-emerald-400 bg-emerald-500/10' },
  B: { label: 'B등급', color: 'text-blue-400 bg-blue-500/10' },
  C: { label: 'C등급', color: 'text-amber-400 bg-amber-500/10' },
  D: { label: 'D등급', color: 'text-red-400 bg-red-500/10' },
};

const MOCK_SUPPLIERS = [
  { id: 'SUP-001', name: '한국PCB', category: '원자재', rating: 'A', qualityScore: 96, deliveryScore: 92, priceScore: 85, totalOrders: 48, onTimeRate: 95, defectRate: 0.8, contractEnd: '2026-12-31' },
  { id: 'SUP-002', name: '서울반도체', category: '원자재', rating: 'A', qualityScore: 98, deliveryScore: 95, priceScore: 80, totalOrders: 36, onTimeRate: 97, defectRate: 0.3, contractEnd: '2027-06-30' },
  { id: 'SUP-003', name: '대한커넥터', category: '원자재', rating: 'C', qualityScore: 72, deliveryScore: 68, priceScore: 90, totalOrders: 24, onTimeRate: 75, defectRate: 3.2, contractEnd: '2026-06-30' },
  { id: 'SUP-004', name: '코리아메탈', category: '원자재', rating: 'B', qualityScore: 88, deliveryScore: 85, priceScore: 88, totalOrders: 18, onTimeRate: 88, defectRate: 1.0, contractEnd: '2026-09-30' },
];

const MOCK_ORDERS = [
  { id: 'PO-001', supplier: '한국PCB', item: 'PCB 기판 (A타입)', qty: 5000, amount: 25000000, status: 'delivered', orderDate: '2026-03-20', deliveryDate: '2026-03-28' },
  { id: 'PO-002', supplier: '서울반도체', item: 'LED 칩셋', qty: 10000, amount: 45000000, status: 'in_transit', orderDate: '2026-03-22', deliveryDate: '2026-03-29' },
  { id: 'PO-003', supplier: '대한커넥터', item: '커넥터 모듈', qty: 3000, amount: 12000000, status: 'delayed', orderDate: '2026-03-18', deliveryDate: '2026-03-26' },
  { id: 'PO-004', supplier: '코리아메탈', item: '방열판', qty: 2000, amount: 8000000, status: 'ordered', orderDate: '2026-03-27', deliveryDate: '2026-04-03' },
];

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  ordered: { label: '발주', color: 'text-blue-400 bg-blue-500/10' },
  in_transit: { label: '운송중', color: 'text-indigo-400 bg-indigo-500/10' },
  delivered: { label: '납품완료', color: 'text-emerald-400 bg-emerald-500/10' },
  delayed: { label: '지연', color: 'text-red-400 bg-red-500/10' },
};

export default function SCMPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<'suppliers' | 'orders'>('suppliers');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">공급망관리</h1>
        <p className="text-xs text-slate-500 mt-0.5">LOG-SCM &middot; 발주, 납품추적, 업체 평가</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('suppliers')} className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg ${tab === 'suppliers' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <Star size={14} /> 공급업체 ({MOCK_SUPPLIERS.length})
        </button>
        <button onClick={() => setTab('orders')} className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg ${tab === 'orders' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <ShoppingCart size={14} /> 발주현황 ({MOCK_ORDERS.length})
        </button>
      </div>

      {tab === 'suppliers' && (
        <div className="space-y-3">
          {MOCK_SUPPLIERS.map(s => {
            const rt = RATING_MAP[s.rating];
            const avgScore = Math.round((s.qualityScore + s.deliveryScore + s.priceScore) / 3);
            return (
              <div key={s.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{s.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rt.color}`}>{rt.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">{s.category}</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-300">{avgScore}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: '품질', score: s.qualityScore },
                    { label: '납기', score: s.deliveryScore },
                    { label: '가격', score: s.priceScore },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>{m.label}</span><span>{m.score}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5">
                        <div className={`h-full rounded-full ${m.score >= 90 ? 'bg-emerald-500' : m.score >= 80 ? 'bg-indigo-500' : m.score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${m.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>주문 {s.totalOrders}건</span>
                  <span>정시납품 {s.onTimeRate}%</span>
                  <span>불량률 {s.defectRate}%</span>
                  <span>계약 ~{s.contractEnd}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-2">
          {MOCK_ORDERS.map(o => {
            const st = ORDER_STATUS[o.status];
            return (
              <div key={o.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                {o.status === 'delayed' && <AlertTriangle size={14} className="text-red-400 shrink-0" />}
                {o.status !== 'delayed' && <ShoppingCart size={14} className={st.color.split(' ')[0] + ' shrink-0'} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600">{o.id}</span>
                    <span className="text-sm font-medium">{o.item}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{o.supplier} &middot; {o.qty.toLocaleString()}개 &middot; 발주 {o.orderDate} &middot; 납기 {o.deliveryDate}</div>
                </div>
                <span className="text-sm font-bold text-indigo-300 shrink-0">{(o.amount / 10000).toLocaleString()}만</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
