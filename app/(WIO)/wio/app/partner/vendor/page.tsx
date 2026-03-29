'use client';

import { useState } from 'react';
import { Briefcase, Star, BarChart3 } from 'lucide-react';
import { useWIO } from '../../layout';

type Vendor = {
  id: string;
  name: string;
  category: string;
  quality: number;
  delivery: number;
  price: number;
  service: number;
  overall: number;
  contractCount: number;
  totalAmount: number;
};

type Bid = {
  id: string;
  title: string;
  deadline: string;
  vendors: string[];
  status: 'open' | 'evaluating' | 'awarded';
  selectedVendor?: string;
};

const BID_STATUS: Record<string, { label: string; color: string }> = {
  open: { label: '입찰중', color: 'text-blue-400 bg-blue-500/10' },
  evaluating: { label: '심사중', color: 'text-amber-400 bg-amber-500/10' },
  awarded: { label: '낙찰', color: 'text-emerald-400 bg-emerald-500/10' },
};

const MOCK_VENDORS: Vendor[] = [
  { id: 'V-001', name: '클라우드코리아', category: '클라우드/인프라', quality: 92, delivery: 88, price: 75, service: 90, overall: 86, contractCount: 3, totalAmount: 72000000 },
  { id: 'V-002', name: '한국IT솔루션', category: 'IT장비', quality: 85, delivery: 90, price: 82, service: 78, overall: 84, contractCount: 8, totalAmount: 45000000 },
  { id: 'V-003', name: '오피스마트', category: '사무용품', quality: 78, delivery: 95, price: 90, service: 72, overall: 84, contractCount: 12, totalAmount: 5200000 },
  { id: 'V-004', name: '디자인웍스', category: '디자인', quality: 95, delivery: 70, price: 65, service: 88, overall: 80, contractCount: 4, totalAmount: 18500000 },
  { id: 'V-005', name: '퍼니처랩', category: '가구/인테리어', quality: 88, delivery: 82, price: 78, service: 80, overall: 82, contractCount: 3, totalAmount: 7800000 },
];

const MOCK_BIDS: Bid[] = [
  { id: 'BID-001', title: '2026 클라우드 서비스 연간 계약', deadline: '2026-04-15', vendors: ['클라우드코리아', 'AWS코리아', '네이버클라우드'], status: 'open' },
  { id: 'BID-002', title: '사무실 리모델링 공사', deadline: '2026-04-01', vendors: ['퍼니처랩', '인테리어플러스'], status: 'evaluating' },
  { id: 'BID-003', title: '보안 솔루션 도입', deadline: '2026-03-20', vendors: ['시큐리티원', '한국IT솔루션', '사이버텍'], status: 'awarded', selectedVendor: '시큐리티원' },
];

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 85 ? 'bg-emerald-500/50' : value >= 70 ? 'bg-indigo-500/50' : 'bg-amber-500/50';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-8">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono text-slate-400 w-6 text-right">{value}</span>
    </div>
  );
}

export default function VendorPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [tab, setTab] = useState<'matrix' | 'bids'>('matrix');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">공급업체관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">PTN-SRM &middot; Supplier Relationship Management</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'matrix' as const, label: '벤더 평가' },
          { id: 'bids' as const, label: '입찰 현황' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 벤더 평가 매트릭스 */}
      {tab === 'matrix' && (
        <div className="space-y-3">
          {MOCK_VENDORS.map(v => (
            <div key={v.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{v.name}</span>
                    <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-white/5">{v.category}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">거래 {v.contractCount}건 &middot; 총 {v.totalAmount.toLocaleString()}원</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400" />
                    <span className="text-lg font-bold">{v.overall}</span>
                  </div>
                  <div className="text-[10px] text-slate-600">종합 점수</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <ScoreBar label="품질" value={v.quality} />
                <ScoreBar label="납기" value={v.delivery} />
                <ScoreBar label="가격" value={v.price} />
                <ScoreBar label="서비스" value={v.service} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 입찰 현황 */}
      {tab === 'bids' && (
        <div className="space-y-2">
          {MOCK_BIDS.map(bid => {
            const st = BID_STATUS[bid.status];
            return (
              <div key={bid.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{bid.id}</span>
                    <span className="text-sm font-medium">{bid.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">마감 {bid.deadline}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-slate-600">참여업체:</span>
                    {bid.vendors.map(v => (
                      <span key={v} className={`px-1.5 py-0.5 rounded bg-white/5 ${bid.selectedVendor === v ? 'text-emerald-400 bg-emerald-500/10 font-semibold' : ''}`}>
                        {v} {bid.selectedVendor === v && '(낙찰)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
