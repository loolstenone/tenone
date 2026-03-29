'use client';

import { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, Clock, ArrowDownToLine } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_SOURCES = [
  { id: 1, name: '네이버 검색광고', type: 'API', lastSync: '2026-03-29 09:15', status: 'synced', records: 124500, normalized: 124500 },
  { id: 2, name: '구글 Ads', type: 'API', lastSync: '2026-03-29 09:12', status: 'synced', records: 89200, normalized: 89200 },
  { id: 3, name: '메타 Ads Manager', type: 'API', lastSync: '2026-03-29 09:10', status: 'synced', records: 56800, normalized: 56300 },
  { id: 4, name: '카카오모먼트', type: 'API', lastSync: '2026-03-29 08:50', status: 'synced', records: 34100, normalized: 34100 },
  { id: 5, name: 'GA4', type: 'API', lastSync: '2026-03-29 09:00', status: 'synced', records: 245000, normalized: 245000 },
  { id: 6, name: '네이버 애널리틱스', type: 'API', lastSync: '2026-03-28 23:00', status: 'delayed', records: 18200, normalized: 18000 },
  { id: 7, name: 'CRM 리드 데이터', type: 'DB', lastSync: '2026-03-29 09:05', status: 'synced', records: 8400, normalized: 8400 },
  { id: 8, name: '오프라인 이벤트', type: 'CSV', lastSync: '2026-03-25 14:00', status: 'manual', records: 320, normalized: 310 },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  synced: { label: '동기화 완료', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  syncing: { label: '동기화중', color: 'text-blue-400 bg-blue-500/10', icon: RefreshCw },
  delayed: { label: '지연', color: 'text-amber-400 bg-amber-500/10', icon: AlertTriangle },
  error: { label: '오류', color: 'text-red-400 bg-red-500/10', icon: AlertTriangle },
  manual: { label: '수동', color: 'text-slate-400 bg-slate-500/10', icon: ArrowDownToLine },
};

export default function DataHubPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';

  const sources = isDemo ? MOCK_SOURCES : MOCK_SOURCES;
  const totalRecords = sources.reduce((s, d) => s + d.records, 0);
  const totalNormalized = sources.reduce((s, d) => s + d.normalized, 0);
  const syncedCount = sources.filter(s => s.status === 'synced').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">매체 데이터 허브</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-DTA &middot; 전 매체 데이터 통합 및 정규화</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <RefreshCw size={15} /> 전체 동기화
        </button>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">데이터 소스</div>
          <div className="text-lg font-bold">{sources.length}개</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">정상 동기화</div>
          <div className="text-lg font-bold text-emerald-400">{syncedCount}/{sources.length}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">총 레코드</div>
          <div className="text-lg font-bold">{(totalRecords / 10000).toFixed(1)}만</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">정규화율</div>
          <div className="text-lg font-bold">{(totalNormalized / totalRecords * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* 데이터 소스 테이블 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Database size={14} /> 데이터 소스 현황</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500">
                <th className="text-left py-2 pr-3">소스명</th>
                <th className="text-left py-2 px-3">연결방식</th>
                <th className="text-left py-2 px-3">상태</th>
                <th className="text-left py-2 px-3">마지막 동기화</th>
                <th className="text-right py-2 px-3">레코드</th>
                <th className="text-right py-2 pl-3">정규화</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(s => {
                const st = STATUS_MAP[s.status] || STATUS_MAP.synced;
                const StIcon = st.icon;
                return (
                  <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3 font-medium">{s.name}</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px]">{s.type}</span></td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>
                        <StIcon size={10} /> {st.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{s.lastSync}</td>
                    <td className="py-2.5 px-3 text-right">{s.records.toLocaleString()}</td>
                    <td className="py-2.5 pl-3 text-right">
                      <span className={s.normalized === s.records ? 'text-emerald-400' : 'text-amber-400'}>
                        {s.normalized.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
