'use client';

import { useState } from 'react';
import {
  Package, Truck, CheckCircle2, Clock, Filter, X, FileText, CreditCard, ArrowRight,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Types ── */
type OrderStatus = 'confirmed' | 'in_progress' | 'delivered' | 'completed';
type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  amount: number;
  deliveryDate: string;
  status: OrderStatus;
  contractRef: string;
  items: string[];
  paymentStatus: 'pending' | 'partial' | 'paid';
  createdAt: string;
};

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; icon: typeof Package }> = {
  confirmed: { label: '확정', color: 'text-blue-400 bg-blue-500/10', icon: CheckCircle2 },
  in_progress: { label: '진행', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
  delivered: { label: '납품', color: 'text-violet-400 bg-violet-500/10', icon: Truck },
  completed: { label: '완료', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
};

const PAYMENT_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '미수금', color: 'text-red-400 bg-red-500/10' },
  partial: { label: '부분수금', color: 'text-amber-400 bg-amber-500/10' },
  paid: { label: '수금완료', color: 'text-emerald-400 bg-emerald-500/10' },
};

/* ── Mock data: 6 orders ── */
const MOCK_ORDERS: Order[] = [
  { id: 'o1', orderNumber: 'ORD-2026-001', customer: '카카오엔터프라이즈', amount: 75680000, deliveryDate: '2026-04-15', status: 'confirmed', contractRef: 'CTR-2026-003', items: ['WIO Starter 연간 라이선스', '온보딩 지원'], paymentStatus: 'partial', createdAt: '2026-03-15' },
  { id: 'o2', orderNumber: 'ORD-2026-002', customer: '리디', amount: 64680000, deliveryDate: '2026-04-01', status: 'in_progress', contractRef: 'CTR-2026-007', items: ['WIO Starter 연간 라이선스'], paymentStatus: 'pending', createdAt: '2026-03-25' },
  { id: 'o3', orderNumber: 'ORD-2026-003', customer: '삼성SDS', amount: 273680000, deliveryDate: '2026-05-01', status: 'confirmed', contractRef: 'CTR-2026-001', items: ['WIO Pro 연간 라이선스', '초기 세팅 및 커스터마이징', '교육 (2일)'], paymentStatus: 'pending', createdAt: '2026-03-28' },
  { id: 'o4', orderNumber: 'ORD-2025-018', customer: '하이브', amount: 198000000, deliveryDate: '2026-02-28', status: 'delivered', contractRef: 'CTR-2025-018', items: ['WIO Business 연간 라이선스', '콘텐츠 파이프라인 구축'], paymentStatus: 'partial', createdAt: '2025-12-10' },
  { id: 'o5', orderNumber: 'ORD-2025-015', customer: '무신사', amount: 85000000, deliveryDate: '2026-01-31', status: 'completed', contractRef: 'CTR-2025-015', items: ['WIO Pro 연간 라이선스', 'SCM 모듈 추가'], paymentStatus: 'paid', createdAt: '2025-11-05' },
  { id: 'o6', orderNumber: 'ORD-2025-012', customer: '토스', amount: 142000000, deliveryDate: '2026-03-15', status: 'completed', contractRef: 'CTR-2025-012', items: ['WIO Business 연간 라이선스', 'API 연동'], paymentStatus: 'paid', createdAt: '2025-10-20' },
];

const fmtKRW = (n: number) => {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  return `${(n / 10000).toLocaleString('ko-KR')}만원`;
};

export default function OrderPage() {
  const { isDemo } = useWIO();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = statusFilter === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === statusFilter);
  const totalAmount = MOCK_ORDERS.filter(o => o.status !== 'completed').reduce((s, o) => s + o.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">수주 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">SAL-ORD · 진행중 수주 금액 {fmtKRW(totalAmount)}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {(['confirmed', 'in_progress', 'delivered', 'completed'] as OrderStatus[]).map(s => {
          const st = STATUS_MAP[s];
          const cnt = MOCK_ORDERS.filter(o => o.status === s).length;
          const amt = MOCK_ORDERS.filter(o => o.status === s).reduce((sum, o) => sum + o.amount, 0);
          return (
            <div key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`rounded-xl border p-3 cursor-pointer transition-colors ${statusFilter === s ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
              <div className={`text-xs font-semibold ${st.color.split(' ')[0]}`}>{st.label}</div>
              <div className="text-lg font-bold mt-1">{cnt}건</div>
              <div className="text-xs text-slate-500">{fmtKRW(amt)}</div>
            </div>
          );
        })}
      </div>

      {/* Order list */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.02] text-xs text-slate-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">주문번호</th>
              <th className="text-left px-4 py-3">고객</th>
              <th className="text-right px-4 py-3">금액</th>
              <th className="text-center px-4 py-3">납품일</th>
              <th className="text-center px-4 py-3">상태</th>
              <th className="text-center px-4 py-3">정산</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const st = STATUS_MAP[o.status];
              const ps = PAYMENT_MAP[o.paymentStatus];
              return (
                <tr key={o.id} onClick={() => setSelected(o)} className="border-t border-white/5 hover:bg-white/[0.02] cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                  <td className="px-4 py-3 font-medium">{o.customer}</td>
                  <td className="px-4 py-3 text-right font-bold text-indigo-300">{fmtKRW(o.amount)}</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-400">{o.deliveryDate}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ps.color}`}>{ps.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-[#0f1117] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-white/5"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">고객</span>
                <span className="font-medium">{selected.customer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">금액</span>
                <span className="font-bold text-indigo-300">{fmtKRW(selected.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">상태</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_MAP[selected.status].color}`}>{STATUS_MAP[selected.status].label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">정산</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PAYMENT_MAP[selected.paymentStatus].color}`}>{PAYMENT_MAP[selected.paymentStatus].label}</span>
              </div>

              {/* Contract link */}
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2"><FileText size={12} />연결 계약</div>
                <div className="text-sm font-mono">{selected.contractRef}</div>
              </div>

              {/* Items */}
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2"><Package size={12} />항목</div>
                <div className="space-y-1">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ArrowRight size={10} className="text-slate-600" />{item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery tracking */}
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2"><Truck size={12} />납품 추적</div>
                <div className="flex items-center gap-3">
                  {(['confirmed', 'in_progress', 'delivered', 'completed'] as OrderStatus[]).map((step, i) => {
                    const active = ['confirmed', 'in_progress', 'delivered', 'completed'].indexOf(selected.status) >= i;
                    return (
                      <div key={step} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                        <span className={`text-xs ${active ? 'text-white' : 'text-slate-600'}`}>{STATUS_MAP[step].label}</span>
                        {i < 3 && <div className={`w-6 h-0.5 ${active ? 'bg-indigo-500/50' : 'bg-slate-800'}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/5">
                <span>수주일: {selected.createdAt}</span>
                <span>납품일: {selected.deliveryDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
