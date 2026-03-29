'use client';

import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Pause, Play } from 'lucide-react';
import { useWIO } from '../../layout';

const LINE_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  running: { label: '가동', color: 'text-emerald-400 bg-emerald-500/10', icon: Play },
  idle: { label: '대기', color: 'text-amber-400 bg-amber-500/10', icon: Pause },
  maintenance: { label: '점검', color: 'text-blue-400 bg-blue-500/10', icon: Activity },
  error: { label: '이상', color: 'text-red-400 bg-red-500/10', icon: AlertTriangle },
};

const MOCK_LINES = [
  { id: 'LINE-A', name: 'Line A (SMT)', status: 'running', product: 'IoT 게이트웨이', speed: 95, temperature: 24.5, oee: 87, defectRate: 0.8 },
  { id: 'LINE-B', name: 'Line B (Assembly)', status: 'running', product: '스마트 센서 모듈', speed: 88, temperature: 23.8, oee: 82, defectRate: 1.2 },
  { id: 'LINE-C', name: 'Line C (Test)', status: 'idle', product: '-', speed: 0, temperature: 22.0, oee: 0, defectRate: 0 },
  { id: 'LINE-D', name: 'Line D (Packaging)', status: 'running', product: '컨트롤러 보드 v3', speed: 92, temperature: 23.2, oee: 91, defectRate: 0.3 },
];

const MOCK_PERFORMANCE = [
  { date: '03/22', output: 1200, target: 1300, defects: 15 },
  { date: '03/23', output: 1350, target: 1300, defects: 12 },
  { date: '03/24', output: 1280, target: 1300, defects: 18 },
  { date: '03/25', output: 1400, target: 1300, defects: 8 },
  { date: '03/26', output: 1320, target: 1300, defects: 14 },
  { date: '03/27', output: 1380, target: 1300, defects: 10 },
  { date: '03/28', output: 950, target: 1300, defects: 6 },
];

const DEFECT_TYPES = [
  { type: '솔더 불량', count: 32, percentage: 38 },
  { type: '부품 누락', count: 18, percentage: 21 },
  { type: '외관 손상', count: 15, percentage: 18 },
  { type: '기능 불량', count: 12, percentage: 14 },
  { type: '기타', count: 8, percentage: 9 },
];

export default function ProcessPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';

  const avgOEE = Math.round(MOCK_LINES.filter(l => l.status === 'running').reduce((a, l) => a + l.oee, 0) / MOCK_LINES.filter(l => l.status === 'running').length);
  const avgDefect = (MOCK_LINES.filter(l => l.status === 'running').reduce((a, l) => a + l.defectRate, 0) / MOCK_LINES.filter(l => l.status === 'running').length).toFixed(1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">공정관리</h1>
        <p className="text-xs text-slate-500 mt-0.5">PRD-MES &middot; 공정 모니터링, 실적, 불량률</p>
      </div>

      {/* 라인별 모니터링 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {MOCK_LINES.map(line => {
          const st = LINE_STATUS[line.status];
          const Icon = st.icon;
          return (
            <div key={line.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={st.color.split(' ')[0]} />
                  <span className="text-sm font-bold">{line.name}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">생산품목: {line.product}</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-slate-600">가동률</p>
                  <p className={`text-sm font-bold ${line.speed > 90 ? 'text-emerald-400' : line.speed > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{line.speed}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600">OEE</p>
                  <p className={`text-sm font-bold ${line.oee > 85 ? 'text-emerald-400' : line.oee > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{line.oee}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600">온도</p>
                  <p className="text-sm font-bold">{line.temperature}°C</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600">불량률</p>
                  <p className={`text-sm font-bold ${line.defectRate > 1 ? 'text-red-400' : 'text-emerald-400'}`}>{line.defectRate}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 일별 실적 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">일별 생산 실적</h2>
        <div className="flex items-end gap-2 h-28">
          {MOCK_PERFORMANCE.map(d => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-400">{d.output}</span>
              <div className="w-full rounded-t relative" style={{ height: `${(d.output / 1500) * 100}%` }}>
                <div className={`absolute inset-0 rounded-t ${d.output >= d.target ? 'bg-emerald-500/50' : 'bg-amber-500/50'}`} />
              </div>
              <span className="text-[9px] text-slate-600">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 불량 분석 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold mb-3">불량 유형 분석</h2>
        <div className="space-y-2">
          {DEFECT_TYPES.map(d => (
            <div key={d.type} className="flex items-center gap-3">
              <span className="text-xs w-20 shrink-0">{d.type}</span>
              <div className="flex-1 h-4 rounded bg-white/5 overflow-hidden">
                <div className="h-full bg-red-500/40 rounded" style={{ width: `${d.percentage}%` }} />
              </div>
              <span className="text-xs text-slate-400 w-12 text-right">{d.count}건</span>
              <span className="text-xs text-slate-500 w-10 text-right">{d.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
