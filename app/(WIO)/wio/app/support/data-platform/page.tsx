'use client';

import { useState } from 'react';
import { Database, Activity, CheckCircle, AlertTriangle, Cloud, HardDrive } from 'lucide-react';
import { useWIO } from '../../layout';

const PIPELINES = [
  { id: 'PL-001', name: 'CRM 이벤트 수집', source: 'Orbi CRM', destination: 'Data Lake', schedule: '실시간', status: 'running', eventsPerHour: 12400, errorRate: 0.02, lastRun: '2026-03-28 16:30' },
  { id: 'PL-002', name: '웹사이트 행동 로그', source: 'GA4 + GTM', destination: 'Data Lake', schedule: '5분', status: 'running', eventsPerHour: 45200, errorRate: 0.01, lastRun: '2026-03-28 16:25' },
  { id: 'PL-003', name: 'ERP 트랜잭션 동기화', source: 'WIO ERP', destination: 'Data Warehouse', schedule: '1시간', status: 'running', eventsPerHour: 3200, errorRate: 0, lastRun: '2026-03-28 16:00' },
  { id: 'PL-004', name: 'SNS 멘션 크롤링', source: 'Twitter/Insta API', destination: 'Data Lake', schedule: '15분', status: 'warning', eventsPerHour: 890, errorRate: 2.5, lastRun: '2026-03-28 16:15' },
  { id: 'PL-005', name: 'IoT 센서 데이터', source: 'MQTT Broker', destination: 'Time Series DB', schedule: '실시간', status: 'running', eventsPerHour: 86400, errorRate: 0.05, lastRun: '2026-03-28 16:30' },
];

const STORAGE_STATUS = [
  { name: 'Data Lake (S3)', type: 'lake', usedTB: 4.2, totalTB: 10, status: 'healthy' },
  { name: 'Data Warehouse (BigQuery)', type: 'warehouse', usedTB: 1.8, totalTB: 5, status: 'healthy' },
  { name: 'Time Series DB (InfluxDB)', type: 'tsdb', usedTB: 0.6, totalTB: 2, status: 'healthy' },
  { name: 'Redis Cache', type: 'cache', usedTB: 0.02, totalTB: 0.1, status: 'healthy' },
];

const DATA_QUALITY = [
  { metric: '데이터 완전성', score: 94, threshold: 90 },
  { metric: '데이터 정확성', score: 97, threshold: 95 },
  { metric: '데이터 일관성', score: 88, threshold: 85 },
  { metric: '데이터 적시성', score: 92, threshold: 90 },
  { metric: '데이터 유일성', score: 99, threshold: 95 },
];

const PIPELINE_STATUS: Record<string, { label: string; color: string }> = {
  running: { label: '정상', color: 'text-emerald-400 bg-emerald-500/10' },
  warning: { label: '주의', color: 'text-amber-400 bg-amber-500/10' },
  error: { label: '오류', color: 'text-red-400 bg-red-500/10' },
  stopped: { label: '중지', color: 'text-slate-400 bg-slate-500/10' },
};

export default function DataPlatformPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';

  const totalEvents = PIPELINES.reduce((a, p) => a + p.eventsPerHour, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">데이터플랫폼</h1>
        <p className="text-xs text-slate-500 mt-0.5">DAT-PLT &middot; 파이프라인, 레이크, 웨어하우스</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">파이프라인</p>
          <p className="text-2xl font-bold mt-1">{PIPELINES.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">이벤트/시간</p>
          <p className="text-2xl font-bold mt-1 text-indigo-400">{(totalEvents / 1000).toFixed(1)}K</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">총 스토리지</p>
          <p className="text-2xl font-bold mt-1">{STORAGE_STATUS.reduce((a, s) => a + s.usedTB, 0).toFixed(1)} TB</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">품질 점수</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{Math.round(DATA_QUALITY.reduce((a, d) => a + d.score, 0) / DATA_QUALITY.length)}</p>
        </div>
      </div>

      {/* 파이프라인 */}
      <h2 className="text-sm font-semibold mb-3">데이터 파이프라인</h2>
      <div className="space-y-2 mb-6">
        {PIPELINES.map(p => {
          const st = PIPELINE_STATUS[p.status];
          return (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <Activity size={14} className={st.color.split(' ')[0] + ' shrink-0'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{p.source} &rarr; {p.destination} &middot; {p.schedule}</div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-indigo-300">{p.eventsPerHour.toLocaleString()}/h</p>
                <p className={`text-[10px] ${p.errorRate > 1 ? 'text-red-400' : 'text-slate-500'}`}>에러 {p.errorRate}%</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 스토리지 */}
      <h2 className="text-sm font-semibold mb-3">스토리지 현황</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STORAGE_STATUS.map(s => {
          const usagePercent = Math.round((s.usedTB / s.totalTB) * 100);
          return (
            <div key={s.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                {s.type === 'lake' ? <Cloud size={14} className="text-blue-400" /> : <HardDrive size={14} className="text-indigo-400" />}
                <span className="text-xs font-medium truncate">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 60 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${usagePercent}%` }} />
                </div>
                <span className="text-[10px] text-slate-400">{usagePercent}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{s.usedTB} / {s.totalTB} TB</p>
            </div>
          );
        })}
      </div>

      {/* 데이터 품질 */}
      <h2 className="text-sm font-semibold mb-3">데이터 품질</h2>
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="space-y-3">
          {DATA_QUALITY.map(d => (
            <div key={d.metric} className="flex items-center gap-3">
              {d.score >= d.threshold ? <CheckCircle size={12} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={12} className="text-amber-400 shrink-0" />}
              <span className="text-xs w-24 shrink-0">{d.metric}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5">
                <div className={`h-full rounded-full ${d.score >= d.threshold ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${d.score}%` }} />
              </div>
              <span className="text-xs font-bold w-10 text-right">{d.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
