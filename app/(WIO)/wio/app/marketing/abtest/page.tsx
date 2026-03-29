'use client';

import { useState } from 'react';
import { FlaskConical, CheckCircle2, Clock, XCircle, BarChart3, Trophy } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_EXPERIMENTS = [
  {
    id: 1, name: 'CTA 버튼 색상 테스트', type: 'UI', status: 'completed', startDate: '2026-02-15', endDate: '2026-03-15',
    traffic: 12400, confidence: 96.2, winner: 'B',
    variants: [
      { name: 'A: 파란색 (기존)', visitors: 6200, conversions: 248, cvr: 4.0 },
      { name: 'B: 초록색', visitors: 6200, conversions: 341, cvr: 5.5 },
    ]
  },
  {
    id: 2, name: '가격 페이지 레이아웃', type: 'Layout', status: 'running', startDate: '2026-03-10', endDate: '2026-04-10',
    traffic: 4800, confidence: 72.5, winner: null,
    variants: [
      { name: 'A: 3열 카드 (기존)', visitors: 2400, conversions: 72, cvr: 3.0 },
      { name: 'B: 비교 테이블', visitors: 2400, conversions: 84, cvr: 3.5 },
    ]
  },
  {
    id: 3, name: '이메일 제목라인 테스트', type: 'Email', status: 'running', startDate: '2026-03-20', endDate: '2026-04-03',
    traffic: 2000, confidence: 58.3, winner: null,
    variants: [
      { name: 'A: 혜택 강조', visitors: 1000, conversions: 185, cvr: 18.5 },
      { name: 'B: 호기심 유발', visitors: 1000, conversions: 201, cvr: 20.1 },
    ]
  },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  running: { label: '진행중', color: 'text-emerald-400 bg-emerald-500/10', icon: Clock },
  completed: { label: '완료', color: 'text-blue-400 bg-blue-500/10', icon: CheckCircle2 },
  stopped: { label: '중단', color: 'text-red-400 bg-red-500/10', icon: XCircle },
};

export default function ABTestPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';

  const experiments = isDemo ? MOCK_EXPERIMENTS : MOCK_EXPERIMENTS;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">A/B 테스트</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-ABT &middot; 실험 관리 및 통계적 유의성 분석</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <FlaskConical size={15} /> 실험 생성
        </button>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">진행중</div>
          <div className="text-lg font-bold">{experiments.filter(e => e.status === 'running').length}건</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">완료</div>
          <div className="text-lg font-bold">{experiments.filter(e => e.status === 'completed').length}건</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">총 트래픽</div>
          <div className="text-lg font-bold">{experiments.reduce((s, e) => s + e.traffic, 0).toLocaleString()}</div>
        </div>
      </div>

      {/* 실험 목록 */}
      <div className="space-y-4">
        {experiments.map(exp => {
          const st = STATUS_MAP[exp.status] || STATUS_MAP.running;
          const StIcon = st.icon;
          return (
            <div key={exp.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FlaskConical size={14} className="text-indigo-400" />
                  <span className="text-sm font-semibold">{exp.name}</span>
                  <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-white/5">{exp.type}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>
                    <StIcon size={10} /> {st.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{exp.startDate} ~ {exp.endDate}</div>
              </div>

              {/* 변형 비교 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {exp.variants.map((v, i) => (
                  <div key={i} className={`rounded-lg border p-3 ${exp.winner === String.fromCharCode(65 + i) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/[0.01]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold">{v.name}</span>
                      {exp.winner === String.fromCharCode(65 + i) && <Trophy size={12} className="text-emerald-400" />}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-slate-500">방문</span><div className="font-bold">{v.visitors.toLocaleString()}</div></div>
                      <div><span className="text-slate-500">전환</span><div className="font-bold">{v.conversions}</div></div>
                      <div><span className="text-slate-500">CVR</span><div className="font-bold">{v.cvr}%</div></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 신뢰도 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${exp.confidence >= 95 ? 'bg-emerald-500' : exp.confidence >= 80 ? 'bg-amber-500' : 'bg-slate-500'}`}
                    style={{ width: `${exp.confidence}%` }} />
                </div>
                <span className={`text-xs font-bold ${exp.confidence >= 95 ? 'text-emerald-400' : exp.confidence >= 80 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {exp.confidence}% 신뢰도
                </span>
                {exp.confidence >= 95 && <span className="text-[10px] text-emerald-400 font-semibold">통계적 유의</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
