'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, ArrowRight, Building2 } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type PurchaseOrder = {
  id: string;
  date: string;
  vendor: string;
  items: string;
  amount: number;
  stage: 'request' | 'order' | 'received' | 'paid';
  dueDate: string;
};

const STAGE_MAP: Record<string, { label: string; color: string; step: number }> = {
  request: { label: '구매요청', color: 'text-amber-400 bg-amber-500/10', step: 1 },
  order: { label: '발주완료', color: 'text-blue-400 bg-blue-500/10', step: 2 },
  received: { label: '입고완료', color: 'text-purple-400 bg-purple-500/10', step: 3 },
  paid: { label: '대금지급', color: 'text-emerald-400 bg-emerald-500/10', step: 4 },
};

const MOCK_PO: PurchaseOrder[] = [
  { id: 'PO-001', date: '2026-03-25', vendor: '한국IT솔루션', items: '서버 장비 2대', amount: 12000000, stage: 'paid', dueDate: '2026-04-10' },
  { id: 'PO-002', date: '2026-03-22', vendor: '오피스마트', items: '사무용품 일괄', amount: 850000, stage: 'received', dueDate: '2026-04-05' },
  { id: 'PO-003', date: '2026-03-20', vendor: '클라우드코리아', items: 'AWS 연간 라이선스', amount: 24000000, stage: 'order', dueDate: '2026-04-15' },
  { id: 'PO-004', date: '2026-03-18', vendor: '디자인웍스', items: '브랜드 디자인 용역', amount: 8500000, stage: 'request', dueDate: '2026-04-20' },
  { id: 'PO-005', date: '2026-03-15', vendor: '퍼니처랩', items: '사무용 의자 10개', amount: 3500000, stage: 'paid', dueDate: '2026-03-30' },
];

const VENDOR_SUMMARY = [
  { name: '한국IT솔루션', total: 45000000, orders: 8, unpaid: 12000000 },
  { name: '클라우드코리아', total: 72000000, orders: 3, unpaid: 24000000 },
  { name: '오피스마트', total: 5200000, orders: 12, unpaid: 850000 },
  { name: '디자인웍스', total: 18500000, orders: 4, unpaid: 8500000 },
  { name: '퍼니처랩', total: 7800000, orders: 3, unpaid: 0 },
];

export default function APPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'orders' | 'vendors'>('orders');
  const [orders, setOrders] = useState<PurchaseOrder[]>(isDemo ? MOCK_PO : []);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 매입 데이터 로드 (invoices where type='ap')
  const loadAP = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('invoices')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .eq('type', 'ap')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setOrders(data.map((row: any) => ({
          id: row.id,
          date: row.date ? row.date.split('T')[0] : '',
          vendor: row.vendor || row.counterpart || '',
          items: row.items || row.description || '',
          amount: row.amount || 0,
          stage: row.stage || row.status || 'request',
          dueDate: row.due_date ? row.due_date.split('T')[0] : '',
        })));
      } else {
        setOrders(MOCK_PO);
      }
    } catch {
      setOrders(MOCK_PO);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadAP(); }, [loadAP]);

  const STAGES = ['request', 'order', 'received', 'paid'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">매입관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">FIN-AP &middot; Accounts Payable</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 구매요청
        </button>
      </div>

      {/* 파이프라인 요약 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {STAGES.map((s, i) => {
          const info = STAGE_MAP[s];
          const count = orders.filter(p => p.stage === s).length;
          return (
            <div key={s} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <div className={`text-lg font-bold ${info.color.split(' ')[0]}`}>{count}</div>
              <div className="text-xs text-slate-500">{info.label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'orders' as const, label: '구매요청 목록' },
          { id: 'vendors' as const, label: '공급업체별 현황' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 구매요청 폼 */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="공급업체" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="date" defaultValue="2026-03-29" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <input placeholder="품목 내역" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="금액 (원)" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="date" placeholder="납기일" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">등록</button>
          </div>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-12">
          <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">데이터 로딩 중...</p>
        </div>
      )}

      {/* 구매요청 목록 */}
      {!loading && tab === 'orders' && (
        <div className="space-y-2">
          {orders.map(po => {
            const stage = STAGE_MAP[po.stage];
            return (
              <div key={po.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{po.id}</span>
                    <span className="text-sm font-medium">{po.items}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stage.color}`}>{stage.label}</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-300">{po.amount.toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Building2 size={11} />
                    <span>{po.vendor}</span>
                    <span className="mx-1">&middot;</span>
                    <span>요청일 {po.date}</span>
                  </div>
                  <span>납기 {po.dueDate}</span>
                </div>
                {/* 진행 바 */}
                <div className="flex items-center gap-1 mt-3">
                  {STAGES.map((s, i) => (
                    <div key={s} className={`h-1 flex-1 rounded-full ${STAGES.indexOf(po.stage) >= i ? 'bg-indigo-500' : 'bg-white/5'}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 공급업체별 현황 */}
      {tab === 'vendors' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-500">
                <th className="text-left px-4 py-3">공급업체</th>
                <th className="text-right px-4 py-3">총 거래액</th>
                <th className="text-right px-4 py-3">주문건수</th>
                <th className="text-right px-4 py-3">미지급액</th>
              </tr>
            </thead>
            <tbody>
              {VENDOR_SUMMARY.map(v => (
                <tr key={v.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-medium">{v.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{v.total.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-slate-400">{v.orders}건</td>
                  <td className={`px-4 py-2.5 text-right font-mono ${v.unpaid > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{v.unpaid.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
