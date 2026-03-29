'use client';

import { useState } from 'react';
import { Database, Users, Filter, BarChart3, Plus, Layers, Activity } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_SEGMENTS = [
  { id: 'S01', name: '고가치 재구매 고객', description: 'LTV 300만+ & 최근 30일 구매', count: 245, rules: [{ field: 'ltv', op: '>=', value: '300만' }, { field: 'lastPurchase', op: '<=', value: '30일' }], growth: 12, color: 'bg-emerald-500' },
  { id: 'S02', name: '이탈 위험 고객', description: '90일 이상 비활동 & 이전 3회+ 구매', count: 128, rules: [{ field: 'inactive', op: '>=', value: '90일' }, { field: 'orders', op: '>=', value: '3회' }], growth: -8, color: 'bg-red-500' },
  { id: 'S03', name: '신규 가입 (30일)', description: '최근 30일 내 가입', count: 89, rules: [{ field: 'joinDate', op: '<=', value: '30일' }], growth: 23, color: 'bg-blue-500' },
  { id: 'S04', name: '모바일 헤비유저', description: '월 20회+ 앱 접속', count: 412, rules: [{ field: 'appVisits', op: '>=', value: '20회/월' }, { field: 'channel', op: '=', value: '모바일' }], growth: 5, color: 'bg-violet-500' },
  { id: 'S05', name: 'VIP 업그레이드 대상', description: 'Gold 등급 & 누적 450만+ 소비', count: 67, rules: [{ field: 'tier', op: '=', value: 'Gold' }, { field: 'totalSpend', op: '>=', value: '450만' }], growth: 3, color: 'bg-amber-500' },
];

const TOUCHPOINTS = [
  { channel: '웹사이트', events: 45200, percentage: 35 },
  { channel: '모바일 앱', events: 38600, percentage: 30 },
  { channel: '이메일', events: 19300, percentage: 15 },
  { channel: 'SNS', events: 12900, percentage: 10 },
  { channel: '콜센터', events: 6450, percentage: 5 },
  { channel: '오프라인', events: 6450, percentage: 5 },
];

const BEHAVIORS = [
  { action: '상품 조회', count: 28400, trend: 'up' },
  { action: '장바구니 추가', count: 8200, trend: 'up' },
  { action: '구매 완료', count: 3100, trend: 'stable' },
  { action: '리뷰 작성', count: 890, trend: 'down' },
  { action: '쿠폰 사용', count: 2400, trend: 'up' },
  { action: '위시리스트', count: 5600, trend: 'stable' },
];

export default function CDPPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const detail = selectedSegment ? MOCK_SEGMENTS.find(s => s.id === selectedSegment) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">고객데이터플랫폼</h1>
          <p className="text-xs text-slate-500 mt-0.5">CRM-CDP &middot; 접점 통합, 세그먼테이션, 행동 분석</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 세그먼트 생성
        </button>
      </div>

      {/* 접점 통합 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Layers size={14} className="text-indigo-400" />접점 통합</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TOUCHPOINTS.map(tp => (
            <div key={tp.channel} className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-1">
                <span className="text-lg font-bold text-indigo-300">{tp.percentage}%</span>
              </div>
              <p className="text-xs font-medium">{tp.channel}</p>
              <p className="text-[10px] text-slate-500">{tp.events.toLocaleString()} 이벤트</p>
            </div>
          ))}
        </div>
      </div>

      {/* 세그먼트 목록 */}
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Filter size={14} className="text-indigo-400" />세그먼트 ({MOCK_SEGMENTS.length})</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {MOCK_SEGMENTS.map(s => (
          <button key={s.id} onClick={() => setSelectedSegment(selectedSegment === s.id ? null : s.id)}
            className={`text-left rounded-xl border p-4 transition-all ${selectedSegment === s.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-sm font-medium">{s.name}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{s.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">{s.count.toLocaleString()}</span>
              <span className={`text-xs font-medium ${s.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {s.growth >= 0 ? '+' : ''}{s.growth}%
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 세그먼트 상세 */}
      {detail && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">{detail.name} - 규칙</h3>
            <button onClick={() => setSelectedSegment(null)} className="text-xs text-slate-500 hover:text-white">닫기</button>
          </div>
          <div className="space-y-2">
            {detail.rules.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {i > 0 && <span className="text-indigo-400 text-xs font-medium">AND</span>}
                <span className="px-2 py-1 rounded bg-white/5 text-slate-300">{r.field}</span>
                <span className="text-indigo-400">{r.op}</span>
                <span className="px-2 py-1 rounded bg-white/5 text-slate-300">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 행동 분석 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Activity size={14} className="text-indigo-400" />행동 분석 (최근 30일)</h2>
        <div className="space-y-2">
          {BEHAVIORS.map(b => (
            <div key={b.action} className="flex items-center gap-3">
              <span className="text-sm w-28 shrink-0">{b.action}</span>
              <div className="flex-1 h-5 rounded bg-white/5 overflow-hidden">
                <div className="h-full bg-indigo-500/40 rounded" style={{ width: `${(b.count / BEHAVIORS[0].count) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-400 w-16 text-right">{b.count.toLocaleString()}</span>
              <span className={`text-[10px] ${b.trend === 'up' ? 'text-emerald-400' : b.trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                {b.trend === 'up' ? '↑' : b.trend === 'down' ? '↓' : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
