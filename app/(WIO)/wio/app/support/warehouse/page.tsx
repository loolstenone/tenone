'use client';

import { useState } from 'react';
import { Warehouse, Search, ArrowDownToLine, ArrowUpFromLine, MapPin } from 'lucide-react';
import { useWIO } from '../../layout';

type Tab = 'inventory' | 'inbound' | 'outbound';

const MOCK_INVENTORY = [
  { id: 'SKU-001', name: 'PCB 기판 (A타입)', category: '원자재', location: 'A-01-01', qty: 4200, minQty: 1000, unit: 'EA', lastUpdated: '2026-03-28' },
  { id: 'SKU-002', name: 'LED 칩셋', category: '원자재', location: 'A-01-02', qty: 8500, minQty: 2000, unit: 'EA', lastUpdated: '2026-03-28' },
  { id: 'SKU-003', name: '커넥터 모듈', category: '원자재', location: 'A-02-01', qty: 1200, minQty: 1500, unit: 'EA', lastUpdated: '2026-03-27' },
  { id: 'SKU-004', name: 'IoT 게이트웨이 (완)', category: '완제품', location: 'B-01-01', qty: 850, minQty: 200, unit: 'EA', lastUpdated: '2026-03-28' },
  { id: 'SKU-005', name: '스마트 센서 모듈 A (완)', category: '완제품', location: 'B-01-02', qty: 320, minQty: 100, unit: 'EA', lastUpdated: '2026-03-27' },
  { id: 'SKU-006', name: '방열판', category: '원자재', location: 'A-03-01', qty: 3600, minQty: 500, unit: 'EA', lastUpdated: '2026-03-26' },
  { id: 'SKU-007', name: '컨트롤러 보드 v3 (완)', category: '완제품', location: 'B-02-01', qty: 180, minQty: 50, unit: 'EA', lastUpdated: '2026-03-28' },
  { id: 'SKU-008', name: '포장 박스 (M)', category: '부자재', location: 'C-01-01', qty: 2100, minQty: 500, unit: 'EA', lastUpdated: '2026-03-25' },
  { id: 'SKU-009', name: '납땜 솔더 페이스트', category: '소모품', location: 'A-04-01', qty: 45, minQty: 20, unit: 'KG', lastUpdated: '2026-03-28' },
  { id: 'SKU-010', name: '보호 필름', category: '부자재', location: 'C-01-02', qty: 5500, minQty: 1000, unit: 'EA', lastUpdated: '2026-03-26' },
];

const MOCK_INBOUND = [
  { id: 'IN-001', item: 'PCB 기판 (A타입)', qty: 3000, supplier: '한국PCB', status: 'completed', date: '2026-03-28' },
  { id: 'IN-002', item: 'LED 칩셋', qty: 5000, supplier: '서울반도체', status: 'receiving', date: '2026-03-28' },
  { id: 'IN-003', item: '커넥터 모듈', qty: 2000, supplier: '대한커넥터', status: 'expected', date: '2026-03-30' },
];

const MOCK_OUTBOUND = [
  { id: 'OUT-001', item: 'IoT 게이트웨이', qty: 200, destination: '고객사A', status: 'shipped', date: '2026-03-28' },
  { id: 'OUT-002', item: '스마트 센서 모듈 A', qty: 100, destination: '고객사B', status: 'picking', date: '2026-03-28' },
  { id: 'OUT-003', item: '컨트롤러 보드 v3', qty: 50, destination: '고객사C', status: 'packed', date: '2026-03-28' },
];

const IO_STATUS: Record<string, { label: string; color: string }> = {
  expected: { label: '예정', color: 'text-slate-400 bg-slate-500/10' },
  receiving: { label: '입고중', color: 'text-blue-400 bg-blue-500/10' },
  completed: { label: '완료', color: 'text-emerald-400 bg-emerald-500/10' },
  picking: { label: '피킹', color: 'text-indigo-400 bg-indigo-500/10' },
  packed: { label: '포장', color: 'text-amber-400 bg-amber-500/10' },
  shipped: { label: '출하', color: 'text-emerald-400 bg-emerald-500/10' },
};

export default function WarehousePage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<Tab>('inventory');
  const [search, setSearch] = useState('');

  const lowStock = MOCK_INVENTORY.filter(i => i.qty < i.minQty);
  const filtered = MOCK_INVENTORY.filter(i => !search || i.name.includes(search) || i.id.includes(search));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">창고관리</h1>
        <p className="text-xs text-slate-500 mt-0.5">LOG-WMS &middot; 입출고, 재고, 로케이션</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">총 SKU</p>
          <p className="text-2xl font-bold mt-1">{MOCK_INVENTORY.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">재고 부족</p>
          <p className={`text-2xl font-bold mt-1 ${lowStock.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{lowStock.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">입고 대기</p>
          <p className="text-2xl font-bold mt-1 text-blue-400">{MOCK_INBOUND.filter(i => i.status !== 'completed').length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">출고 진행</p>
          <p className="text-2xl font-bold mt-1 text-indigo-400">{MOCK_OUTBOUND.filter(o => o.status !== 'shipped').length}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('inventory')} className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg ${tab === 'inventory' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <Warehouse size={14} /> 재고현황
        </button>
        <button onClick={() => setTab('inbound')} className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg ${tab === 'inbound' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <ArrowDownToLine size={14} /> 입고
        </button>
        <button onClick={() => setTab('outbound')} className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg ${tab === 'outbound' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          <ArrowUpFromLine size={14} /> 출고
        </button>
      </div>

      {tab === 'inventory' && (
        <>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="품목 검색..."
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500">
                  <th className="text-left py-2 pr-3">SKU</th>
                  <th className="text-left py-2 pr-3">품목</th>
                  <th className="text-left py-2 pr-3">분류</th>
                  <th className="text-left py-2 pr-3">위치</th>
                  <th className="text-right py-2 pr-3">수량</th>
                  <th className="text-right py-2">상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => {
                  const isLow = i.qty < i.minQty;
                  return (
                    <tr key={i.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-3 text-xs font-mono text-slate-500">{i.id}</td>
                      <td className="py-2.5 pr-3 font-medium">{i.name}</td>
                      <td className="py-2.5 pr-3 text-xs text-slate-400">{i.category}</td>
                      <td className="py-2.5 pr-3 text-xs text-slate-500 flex items-center gap-1"><MapPin size={9} />{i.location}</td>
                      <td className={`py-2.5 pr-3 text-right font-bold ${isLow ? 'text-red-400' : ''}`}>{i.qty.toLocaleString()} {i.unit}</td>
                      <td className="py-2.5 text-right">
                        {isLow ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-red-400 bg-red-500/10">부족</span> :
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10">정상</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'inbound' && (
        <div className="space-y-2">
          {MOCK_INBOUND.map(i => {
            const st = IO_STATUS[i.status];
            return (
              <div key={i.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <ArrowDownToLine size={14} className="text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{i.item}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{i.supplier} &middot; {i.qty.toLocaleString()}개 &middot; {i.date}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'outbound' && (
        <div className="space-y-2">
          {MOCK_OUTBOUND.map(o => {
            const st = IO_STATUS[o.status];
            return (
              <div key={o.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <ArrowUpFromLine size={14} className="text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{o.item}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{o.destination} &middot; {o.qty.toLocaleString()}개 &middot; {o.date}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
