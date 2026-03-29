'use client';

import { useState } from 'react';
import { Monitor, Armchair, Car, Code2, Filter } from 'lucide-react';
import { useWIO } from '../../layout';

type Asset = {
  id: string;
  code: string;
  name: string;
  category: 'IT장비' | '가구' | '차량' | '소프트웨어';
  acquiredDate: string;
  cost: number;
  depreciation: number;
  bookValue: number;
  usefulLife: number;
  location: string;
};

const CATEGORY_MAP: Record<string, { icon: any; color: string }> = {
  'IT장비': { icon: Monitor, color: 'text-blue-400 bg-blue-500/10' },
  '가구': { icon: Armchair, color: 'text-amber-400 bg-amber-500/10' },
  '차량': { icon: Car, color: 'text-emerald-400 bg-emerald-500/10' },
  '소프트웨어': { icon: Code2, color: 'text-purple-400 bg-purple-500/10' },
};

const MOCK_ASSETS: Asset[] = [
  { id: '1', code: 'AST-IT-001', name: 'MacBook Pro 16형', category: 'IT장비', acquiredDate: '2025-06-15', cost: 4200000, depreciation: 1400000, bookValue: 2800000, usefulLife: 3, location: '개발팀' },
  { id: '2', code: 'AST-IT-002', name: '서버 장비 (Dell R750)', category: 'IT장비', acquiredDate: '2025-01-10', cost: 12000000, depreciation: 3000000, bookValue: 9000000, usefulLife: 5, location: '서버실' },
  { id: '3', code: 'AST-FN-001', name: 'Herman Miller 의자 10개', category: '가구', acquiredDate: '2025-03-20', cost: 15000000, depreciation: 1500000, bookValue: 13500000, usefulLife: 10, location: '전 사무실' },
  { id: '4', code: 'AST-FN-002', name: '회의실 테이블 세트', category: '가구', acquiredDate: '2025-03-20', cost: 5000000, depreciation: 500000, bookValue: 4500000, usefulLife: 10, location: '회의실 A' },
  { id: '5', code: 'AST-VH-001', name: '업무용 차량 (K5)', category: '차량', acquiredDate: '2024-09-01', cost: 32000000, depreciation: 9600000, bookValue: 22400000, usefulLife: 5, location: '지하주차장' },
  { id: '6', code: 'AST-SW-001', name: 'Figma Enterprise', category: '소프트웨어', acquiredDate: '2025-01-01', cost: 8400000, depreciation: 2800000, bookValue: 5600000, usefulLife: 3, location: '디자인팀' },
  { id: '7', code: 'AST-SW-002', name: 'GitHub Enterprise', category: '소프트웨어', acquiredDate: '2025-01-01', cost: 12000000, depreciation: 4000000, bookValue: 8000000, usefulLife: 3, location: '개발팀' },
  { id: '8', code: 'AST-IT-003', name: '4K 모니터 (LG) 8대', category: 'IT장비', acquiredDate: '2025-06-15', cost: 9600000, depreciation: 3200000, bookValue: 6400000, usefulLife: 3, location: '개발팀' },
];

export default function AssetPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? MOCK_ASSETS : MOCK_ASSETS.filter(a => a.category === filter);
  const totalCost = MOCK_ASSETS.reduce((s, a) => s + a.cost, 0);
  const totalDepreciation = MOCK_ASSETS.reduce((s, a) => s + a.depreciation, 0);
  const totalBookValue = MOCK_ASSETS.reduce((s, a) => s + a.bookValue, 0);

  const categorySummary = Object.entries(CATEGORY_MAP).map(([cat, info]) => {
    const items = MOCK_ASSETS.filter(a => a.category === cat);
    return { category: cat, count: items.length, bookValue: items.reduce((s, a) => s + a.bookValue, 0), ...info };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">자산관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">FIN-AST &middot; Asset Management</p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">총 취득가</div>
          <div className="text-lg font-bold">{totalCost.toLocaleString()}원</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">감가상각 누계</div>
          <div className="text-lg font-bold text-amber-400">{totalDepreciation.toLocaleString()}원</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">장부가 합계</div>
          <div className="text-lg font-bold text-indigo-400">{totalBookValue.toLocaleString()}원</div>
        </div>
      </div>

      {/* 유형별 분류 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {categorySummary.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.category} onClick={() => setFilter(filter === c.category ? 'all' : c.category)}
              className={`rounded-xl border p-3 text-left transition-colors ${filter === c.category ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
              <Icon size={16} className={c.color.split(' ')[0]} />
              <div className="text-sm font-medium mt-1">{c.category}</div>
              <div className="text-[10px] text-slate-500">{c.count}건 &middot; {c.bookValue.toLocaleString()}</div>
            </button>
          );
        })}
      </div>

      {/* 자산 목록 테이블 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs text-slate-500">
              <th className="text-left px-4 py-3">코드</th>
              <th className="text-left px-4 py-3">명칭</th>
              <th className="text-center px-4 py-3">유형</th>
              <th className="text-right px-4 py-3">취득가</th>
              <th className="text-right px-4 py-3">감가상각</th>
              <th className="text-right px-4 py-3">장부가</th>
              <th className="text-left px-4 py-3">위치</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const catInfo = CATEGORY_MAP[a.category];
              return (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{a.code}</td>
                  <td className="px-4 py-2.5 font-medium">{a.name}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catInfo.color}`}>{a.category}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{a.cost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-amber-400">{a.depreciation.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-indigo-300">{a.bookValue.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-400">{a.location}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 감가상각 스케줄 */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold mb-3">감가상각 스케줄 (정액법)</h3>
        <div className="space-y-2">
          {MOCK_ASSETS.slice(0, 4).map(a => {
            const annualDep = Math.round(a.cost / a.usefulLife);
            const elapsed = Math.round(a.depreciation / annualDep);
            return (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-40 truncate">{a.name}</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-indigo-500/50 rounded-full" style={{ width: `${(a.depreciation / a.cost) * 100}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 w-24 text-right">{elapsed}/{a.usefulLife}년 &middot; {Math.round((a.depreciation / a.cost) * 100)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
