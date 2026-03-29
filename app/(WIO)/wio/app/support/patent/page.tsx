'use client';

import { useState } from 'react';
import { FileCheck, Plus, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useWIO } from '../../layout';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  filed: { label: '출원', color: 'text-blue-400 bg-blue-500/10' },
  examination: { label: '심사중', color: 'text-amber-400 bg-amber-500/10' },
  registered: { label: '등록', color: 'text-emerald-400 bg-emerald-500/10' },
  renewal: { label: '갱신 필요', color: 'text-orange-400 bg-orange-500/10' },
  expired: { label: '만료', color: 'text-red-400 bg-red-500/10' },
};

const MOCK_PATENTS = [
  { id: 'PAT-001', title: 'AI 기반 실시간 고객 세그먼테이션 방법', number: '10-2025-0012345', inventor: '박상현', status: 'registered', filedDate: '2024-06-15', registeredDate: '2025-08-20', renewalDate: '2026-08-20', country: 'KR', licensing: null },
  { id: 'PAT-002', title: '멀티 테넌트 SaaS 데이터 격리 시스템', number: '10-2025-0023456', inventor: '김지은', status: 'examination', filedDate: '2025-03-10', registeredDate: null, renewalDate: null, country: 'KR', licensing: null },
  { id: 'PAT-003', title: '블록체인 기반 디지털 자산 인증 방법', number: 'US-2024-0567890', inventor: '이하은', status: 'registered', filedDate: '2024-01-20', registeredDate: '2025-05-15', renewalDate: '2027-05-15', country: 'US', licensing: { licensee: '글로벌테크', fee: 2000, period: '2025-06~2027-05' } },
  { id: 'PAT-004', title: 'NLP 기반 VOC 자동 분류 및 감성 분석 시스템', number: '10-2026-0034567', inventor: '박상현', status: 'filed', filedDate: '2026-02-28', registeredDate: null, renewalDate: null, country: 'KR', licensing: null },
  { id: 'PAT-005', title: '크로스 플랫폼 사용자 행동 추적 기술', number: '10-2023-0078901', inventor: '정현우', status: 'renewal', filedDate: '2023-04-10', registeredDate: '2024-09-30', renewalDate: '2026-04-10', country: 'KR', licensing: { licensee: '데이터솔루션', fee: 1500, period: '2025-01~2026-12' } },
];

export default function PatentPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [filter, setFilter] = useState('all');

  const filtered = MOCK_PATENTS.filter(p => filter === 'all' || p.status === filter);
  const needsRenewal = MOCK_PATENTS.filter(p => p.status === 'renewal').length;
  const totalLicensingFee = MOCK_PATENTS.filter(p => p.licensing).reduce((a, p) => a + (p.licensing?.fee || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">특허관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">RND-PAT &middot; 출원, 등록, 라이선싱</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 특허 등록
        </button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">전체</p>
          <p className="text-2xl font-bold mt-1">{MOCK_PATENTS.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">등록</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{MOCK_PATENTS.filter(p => p.status === 'registered').length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">갱신 필요</p>
          <p className={`text-2xl font-bold mt-1 ${needsRenewal > 0 ? 'text-orange-400' : 'text-slate-500'}`}>{needsRenewal}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">라이선싱 수익</p>
          <p className="text-2xl font-bold mt-1 text-indigo-400">{totalLicensingFee.toLocaleString()}만</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-1 mb-4">
        {['all', 'filed', 'examination', 'registered', 'renewal'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[10px] px-2.5 py-1 rounded-full ${filter === f ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-white/5'}`}>
            {f === 'all' ? '전체' : STATUS_MAP[f]?.label || f}
          </button>
        ))}
      </div>

      {/* 특허 목록 */}
      <div className="space-y-3">
        {filtered.map(p => {
          const st = STATUS_MAP[p.status];
          return (
            <div key={p.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{p.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-mono">{p.number}</span>
                    <span>{p.country}</span>
                    <span>발명자: {p.inventor}</span>
                  </div>
                </div>
                {p.status === 'renewal' && <AlertCircle size={16} className="text-orange-400 shrink-0" />}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1"><Calendar size={10} />출원 {p.filedDate}</span>
                {p.registeredDate && <span>등록 {p.registeredDate}</span>}
                {p.renewalDate && <span className={p.status === 'renewal' ? 'text-orange-400 font-medium' : ''}>갱신 {p.renewalDate}</span>}
              </div>

              {p.licensing && (
                <div className="mt-2 rounded-lg bg-white/[0.03] p-2 flex items-center gap-3">
                  <DollarSign size={12} className="text-emerald-400" />
                  <span className="text-xs text-slate-400">라이선싱: {p.licensing.licensee} &middot; {p.licensing.fee.toLocaleString()}만원/년 &middot; {p.licensing.period}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
