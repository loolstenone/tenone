'use client';

import { useState } from 'react';
import { Truck, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useWIO } from '../../layout';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  dispatched: { label: '배차', color: 'text-blue-400 bg-blue-500/10' },
  in_transit: { label: '운송중', color: 'text-indigo-400 bg-indigo-500/10' },
  delivered: { label: '배송완료', color: 'text-emerald-400 bg-emerald-500/10' },
  delayed: { label: '지연', color: 'text-red-400 bg-red-500/10' },
  pending: { label: '대기', color: 'text-amber-400 bg-amber-500/10' },
};

const MOCK_SHIPMENTS = [
  { id: 'SHP-001', item: 'IoT 게이트웨이 x200', origin: '인천 물류센터', destination: '서울 고객사A', carrier: '한진택배', vehicle: '5톤 화물', status: 'in_transit', eta: '2026-03-28 17:00', cost: 180000, tracking: '54321098' },
  { id: 'SHP-002', item: '스마트 센서 모듈 x100', origin: '인천 물류센터', destination: '부산 고객사B', carrier: 'CJ대한통운', vehicle: '11톤 윙바디', status: 'dispatched', eta: '2026-03-29 10:00', cost: 320000, tracking: '98765432' },
  { id: 'SHP-003', item: '컨트롤러 보드 v3 x50', origin: '인천 물류센터', destination: '대전 고객사C', carrier: '로젠택배', vehicle: '1톤 밴', status: 'delivered', eta: '2026-03-27 14:00', cost: 85000, tracking: '12345678' },
  { id: 'SHP-004', item: 'PCB 기판 x3000 (입고)', origin: '한국PCB 공장', destination: '인천 물류센터', carrier: '합동택배', vehicle: '5톤 화물', status: 'delayed', eta: '2026-03-28 12:00', cost: 150000, tracking: '11223344' },
  { id: 'SHP-005', item: 'LED 칩셋 x5000 (입고)', origin: '서울반도체', destination: '인천 물류센터', carrier: '한진택배', vehicle: '1톤 밴', status: 'pending', eta: '2026-03-29 09:00', cost: 95000, tracking: null },
];

export default function TransportPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [filter, setFilter] = useState('all');

  const filtered = MOCK_SHIPMENTS.filter(s => filter === 'all' || s.status === filter);
  const totalCost = MOCK_SHIPMENTS.reduce((a, s) => a + s.cost, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">운송관리</h1>
        <p className="text-xs text-slate-500 mt-0.5">LOG-TMS &middot; 배차, 배송추적, 운임정산</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">전체 건</p>
          <p className="text-2xl font-bold mt-1">{MOCK_SHIPMENTS.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">운송중</p>
          <p className="text-2xl font-bold mt-1 text-indigo-400">{MOCK_SHIPMENTS.filter(s => s.status === 'in_transit' || s.status === 'dispatched').length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">지연</p>
          <p className={`text-2xl font-bold mt-1 ${MOCK_SHIPMENTS.filter(s => s.status === 'delayed').length > 0 ? 'text-red-400' : 'text-slate-500'}`}>{MOCK_SHIPMENTS.filter(s => s.status === 'delayed').length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">총 운임</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">{(totalCost / 10000).toFixed(1)}만</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-1 mb-4">
        {['all', 'pending', 'dispatched', 'in_transit', 'delayed', 'delivered'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[10px] px-2.5 py-1 rounded-full ${filter === f ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-white/5'}`}>
            {f === 'all' ? '전체' : STATUS_MAP[f]?.label || f}
          </button>
        ))}
      </div>

      {/* 운송 목록 */}
      <div className="space-y-3">
        {filtered.map(s => {
          const st = STATUS_MAP[s.status];
          return (
            <div key={s.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Truck size={14} className={st.color.split(' ')[0]} />
                  <span className="text-xs font-mono text-slate-600">{s.id}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <span className="text-xs text-slate-500">{s.carrier} &middot; {s.vehicle}</span>
              </div>

              <p className="text-sm font-medium mb-2">{s.item}</p>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <MapPin size={10} />
                <span>{s.origin}</span>
                <span className="text-slate-600">&rarr;</span>
                <span>{s.destination}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock size={10} />ETA: {s.eta}</span>
                <span className="flex items-center gap-1"><DollarSign size={10} />{s.cost.toLocaleString()}원</span>
                {s.tracking && <span className="font-mono text-slate-600">#{s.tracking}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
