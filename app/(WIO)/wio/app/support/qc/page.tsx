'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type Tab = 'incoming' | 'process' | 'outgoing';

const MOCK_INCOMING = [
  { id: 'IQC-001', item: 'PCB 기판 (A타입)', supplier: '한국PCB', lot: 'LOT-2603-A', qty: 2000, inspected: 200, defects: 3, result: 'pass', date: '2026-03-28' },
  { id: 'IQC-002', item: 'LED 칩셋', supplier: '서울반도체', lot: 'LOT-2603-B', qty: 5000, inspected: 500, defects: 2, result: 'pass', date: '2026-03-27' },
  { id: 'IQC-003', item: '커넥터 모듈', supplier: '대한커넥터', lot: 'LOT-2603-C', qty: 3000, inspected: 300, defects: 28, result: 'fail', date: '2026-03-26' },
  { id: 'IQC-004', item: '방열판', supplier: '코리아메탈', lot: 'LOT-2603-D', qty: 1500, inspected: 150, defects: 1, result: 'pass', date: '2026-03-25' },
];

const MOCK_PROCESS = [
  { id: 'PQC-001', line: 'Line A', process: 'SMT 솔더링', samples: 50, defects: 2, defectRate: 4.0, standard: 5.0, result: 'pass' },
  { id: 'PQC-002', line: 'Line B', process: '부품 실장', samples: 50, defects: 4, defectRate: 8.0, standard: 5.0, result: 'fail' },
  { id: 'PQC-003', line: 'Line D', process: '외관 검사', samples: 100, defects: 1, defectRate: 1.0, standard: 3.0, result: 'pass' },
];

const MOCK_OUTGOING = [
  { id: 'OQC-001', product: 'IoT 게이트웨이', lot: 'PRD-2603-01', qty: 500, inspected: 50, defects: 0, result: 'pass', date: '2026-03-28' },
  { id: 'OQC-002', product: '컨트롤러 보드 v3', lot: 'PRD-2603-02', qty: 300, inspected: 30, defects: 1, result: 'pass', date: '2026-03-27' },
];

const DEFECT_TREND = [
  { month: '2025-10', incoming: 1.8, process: 3.2, outgoing: 0.5 },
  { month: '2025-11', incoming: 1.5, process: 2.8, outgoing: 0.3 },
  { month: '2025-12', incoming: 2.1, process: 3.5, outgoing: 0.6 },
  { month: '2026-01', incoming: 1.2, process: 2.4, outgoing: 0.2 },
  { month: '2026-02', incoming: 1.0, process: 2.0, outgoing: 0.1 },
  { month: '2026-03', incoming: 1.4, process: 2.6, outgoing: 0.3 },
];

export default function QCPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<Tab>('incoming');
  const [incomingData, setIncomingData] = useState(MOCK_INCOMING);
  const [processData, setProcessData] = useState(MOCK_PROCESS);
  const [outgoingData, setOutgoingData] = useState(MOCK_OUTGOING);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 품질검사 데이터 로드
  const loadData = useCallback(async () => {
    if (isDemo) return;
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('wio_quality_inspections')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        // type별 분류
        const incoming = data.filter((r: any) => r.type === 'incoming');
        const process = data.filter((r: any) => r.type === 'process');
        const outgoing = data.filter((r: any) => r.type === 'outgoing');
        if (incoming.length > 0) {
          setIncomingData(incoming.map((r: any) => ({
            id: r.id, item: r.product_id || '', supplier: '', lot: '', qty: 0,
            inspected: 0, defects: 0, result: r.result || 'pending',
            date: r.inspected_at?.split('T')[0] || r.created_at?.split('T')[0] || '',
          })));
        }
        if (process.length > 0) {
          setProcessData(process.map((r: any) => ({
            id: r.id, line: '', process: '', samples: 0, defects: 0,
            defectRate: 0, standard: 5.0, result: r.result || 'pending',
          })));
        }
        if (outgoing.length > 0) {
          setOutgoingData(outgoing.map((r: any) => ({
            id: r.id, product: r.product_id || '', lot: '', qty: 0,
            inspected: 0, defects: 0, result: r.result || 'pending',
            date: r.inspected_at?.split('T')[0] || r.created_at?.split('T')[0] || '',
          })));
        }
      }
    } catch {
      // DB 실패 시 Mock 유지
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">품질관리</h1>
        <p className="text-xs text-slate-500 mt-0.5">PRD-QC &middot; 수입/공정/출하 검사</p>
      </div>

      {/* 불량률 추이 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">불량률 추이 (%)</h2>
        <div className="flex items-end gap-3 h-24">
          {DEFECT_TREND.map(d => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center gap-0.5">
                <div className="w-3 bg-red-500/40 rounded-t" style={{ height: `${d.process * 8}px` }} title={`공정 ${d.process}%`} />
                <div className="w-3 bg-amber-500/40 rounded-t" style={{ height: `${d.incoming * 8}px` }} title={`수입 ${d.incoming}%`} />
                <div className="w-3 bg-emerald-500/40 rounded-t" style={{ height: `${d.outgoing * 8}px` }} title={`출하 ${d.outgoing}%`} />
              </div>
              <span className="text-[9px] text-slate-600">{d.month.slice(5)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2 justify-center">
          <span className="flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded bg-amber-500/40" />수입</span>
          <span className="flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded bg-red-500/40" />공정</span>
          <span className="flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded bg-emerald-500/40" />출하</span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'incoming' as const, label: '수입검사' },
          { key: 'process' as const, label: '공정검사' },
          { key: 'outgoing' as const, label: '출하검사' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-2 rounded-lg ${tab === t.key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'incoming' && (
        <div className="space-y-2">
          {incomingData.map(i => (
            <div key={i.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              {i.result === 'pass' ? <CheckCircle size={14} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={14} className="text-red-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{i.item}</span>
                  <span className="text-[10px] text-slate-600 font-mono">{i.lot}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{i.supplier} &middot; {i.date} &middot; {i.qty.toLocaleString()}개 중 {i.inspected}개 검사</div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${i.result === 'pass' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>{i.result === 'pass' ? '합격' : '불합격'}</span>
                <p className="text-[10px] text-slate-500 mt-1">불량 {i.defects}건 ({(i.defects / i.inspected * 100).toFixed(1)}%)</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'process' && (
        <div className="space-y-2">
          {processData.map(p => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              {p.result === 'pass' ? <CheckCircle size={14} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={14} className="text-red-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{p.process}</span>
                  <span className="text-xs text-slate-500">{p.line}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">샘플 {p.samples}개 &middot; 불량 {p.defects}건 &middot; 기준 {p.standard}%</div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-sm font-bold ${p.defectRate <= p.standard ? 'text-emerald-400' : 'text-red-400'}`}>{p.defectRate}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'outgoing' && (
        <div className="space-y-2">
          {outgoingData.map(o => (
            <div key={o.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{o.product}</span>
                  <span className="text-[10px] text-slate-600 font-mono">{o.lot}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{o.date} &middot; {o.qty.toLocaleString()}개 중 {o.inspected}개 검사</div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10`}>합격</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
