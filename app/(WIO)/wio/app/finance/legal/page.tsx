'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type Contract = {
  id: string;
  name: string;
  counterpart: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired' | 'draft';
  type: string;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '유효', color: 'text-emerald-400 bg-emerald-500/10' },
  expiring: { label: '만료임박', color: 'text-amber-400 bg-amber-500/10' },
  expired: { label: '만료', color: 'text-red-400 bg-red-500/10' },
  draft: { label: '작성중', color: 'text-blue-400 bg-blue-500/10' },
};

const MOCK_CONTRACTS: Contract[] = [
  { id: 'CON-001', name: 'AI 컨설팅 용역 계약', counterpart: '글로벌테크', amount: 88000000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active', type: '용역' },
  { id: 'CON-002', name: '사무실 임대차 계약', counterpart: '삼성빌딩관리', amount: 48000000, startDate: '2025-06-01', endDate: '2026-05-31', status: 'expiring', type: '임대차' },
  { id: 'CON-003', name: '마케팅 대행 계약', counterpart: '(주)스마트미디어', amount: 120000000, startDate: '2026-01-01', endDate: '2026-06-30', status: 'active', type: '대행' },
  { id: 'CON-004', name: 'AWS 클라우드 서비스', counterpart: 'Amazon Web Services', amount: 72000000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active', type: '서비스' },
  { id: 'CON-005', name: '인재 파견 계약', counterpart: '에이치알플러스', amount: 36000000, startDate: '2025-09-01', endDate: '2026-02-28', status: 'expired', type: '파견' },
  { id: 'CON-006', name: '앱 개발 프로젝트 계약', counterpart: '넥스트이노베이션', amount: 150000000, startDate: '2026-04-01', endDate: '2026-09-30', status: 'draft', type: '개발' },
];

export default function LegalPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [contracts, setContracts] = useState<Contract[]>(isDemo ? MOCK_CONTRACTS : []);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 계약 데이터 로드
  const loadContracts = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('contracts')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setContracts(data.map((row: any) => ({
          id: row.id,
          name: row.name || '',
          counterpart: row.counterpart || '',
          amount: row.amount || 0,
          startDate: row.start_date ? row.start_date.split('T')[0] : '',
          endDate: row.end_date ? row.end_date.split('T')[0] : '',
          status: row.status || 'draft',
          type: row.type || '',
        })));
      } else {
        setContracts(MOCK_CONTRACTS);
      }
    } catch {
      setContracts(MOCK_CONTRACTS);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadContracts(); }, [loadContracts]);

  const filtered = filterStatus === 'all' ? contracts : contracts.filter(c => c.status === filterStatus);
  const expiringCount = contracts.filter(c => c.status === 'expiring').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">계약관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">LEG-CON &middot; Contract Management</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 계약 등록
        </button>
      </div>

      {/* 만료 임박 알림 */}
      {expiringCount > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <div>
            <div className="text-sm font-medium text-amber-400">{expiringCount}건의 계약이 만료 임박합니다</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {contracts.filter(c => c.status === 'expiring').map(c => c.name).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilterStatus('all')}
          className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${filterStatus === 'all' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          전체 ({contracts.length})
        </button>
        {Object.entries(STATUS_MAP).map(([key, val]) => {
          const count = contracts.filter(c => c.status === key).length;
          return (
            <button key={key} onClick={() => setFilterStatus(key)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${filterStatus === key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              {val.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 계약 등록 폼 */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="계약명" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input placeholder="상대방" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" placeholder="계약금액 (원)" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="date" placeholder="시작일" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="date" placeholder="종료일" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <input placeholder="계약 유형 (용역, 임대차, 대행 등)" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
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

      {/* 계약 목록 */}
      {!loading && <div className="space-y-2">
        {filtered.map(c => {
          const st = STATUS_MAP[c.status];
          const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return (
            <div key={c.id} className={`rounded-xl border p-4 ${c.status === 'expiring' ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-white/5 bg-white/[0.02]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{c.id}</span>
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  <span className="text-[10px] text-slate-600 px-2 py-0.5 rounded-full bg-white/5">{c.type}</span>
                </div>
                <span className="text-sm font-bold text-indigo-300">{c.amount.toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{c.counterpart} &middot; {c.startDate} ~ {c.endDate}</span>
                {c.status !== 'expired' && c.status !== 'draft' && (
                  <span className={daysLeft <= 30 ? 'text-amber-400' : ''}>
                    {daysLeft > 0 ? `D-${daysLeft}` : '만료'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
