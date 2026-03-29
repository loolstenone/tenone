'use client';

import { useState } from 'react';
import { Workflow, Zap, Mail, Clock, Users, ArrowRight, Play, Pause, Plus } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_JOURNEYS = [
  {
    id: 1, name: '신규 가입 온보딩', status: 'active', trigger: '회원가입 완료',
    enrolled: 2340, completed: 1820, conversionRate: 77.8,
    steps: [
      { type: 'trigger', label: '회원가입', icon: Users },
      { type: 'wait', label: '1일 대기', icon: Clock },
      { type: 'email', label: '환영 이메일', icon: Mail },
      { type: 'wait', label: '3일 대기', icon: Clock },
      { type: 'email', label: '가이드 이메일', icon: Mail },
      { type: 'condition', label: '활성화 여부', icon: Zap },
      { type: 'email', label: '혜택 안내', icon: Mail },
    ]
  },
  {
    id: 2, name: '장바구니 이탈 리마인드', status: 'active', trigger: '장바구니 이탈 30분',
    enrolled: 890, completed: 312, conversionRate: 35.1,
    steps: [
      { type: 'trigger', label: '장바구니 이탈', icon: Zap },
      { type: 'wait', label: '30분 대기', icon: Clock },
      { type: 'email', label: '리마인드 이메일', icon: Mail },
      { type: 'wait', label: '24시간 대기', icon: Clock },
      { type: 'email', label: '할인 쿠폰', icon: Mail },
    ]
  },
  {
    id: 3, name: 'MQL 육성 시퀀스', status: 'paused', trigger: '리드 스코어 50점 도달',
    enrolled: 456, completed: 178, conversionRate: 39.0,
    steps: [
      { type: 'trigger', label: '스코어 50+', icon: Zap },
      { type: 'email', label: '사례 소개', icon: Mail },
      { type: 'wait', label: '5일 대기', icon: Clock },
      { type: 'email', label: '데모 제안', icon: Mail },
      { type: 'condition', label: '데모 신청 여부', icon: Zap },
      { type: 'email', label: '후속 제안', icon: Mail },
    ]
  },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: '활성', color: 'text-emerald-400 bg-emerald-500/10', icon: Play },
  paused: { label: '일시정지', color: 'text-amber-400 bg-amber-500/10', icon: Pause },
  draft: { label: '초안', color: 'text-slate-400 bg-slate-500/10', icon: Pause },
};

const STEP_COLOR: Record<string, string> = {
  trigger: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  wait: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  email: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  condition: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function AutomationPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';

  const journeys = isDemo ? MOCK_JOURNEYS : MOCK_JOURNEYS;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">마케팅 자동화</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-AUT &middot; 고객 여정 빌더 및 자동화 관리</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 여정 생성
        </button>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">활성 여정</div>
          <div className="text-lg font-bold">{journeys.filter(j => j.status === 'active').length}개</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">현재 진행중</div>
          <div className="text-lg font-bold">{journeys.reduce((s, j) => s + j.enrolled - j.completed, 0).toLocaleString()}명</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">총 완료</div>
          <div className="text-lg font-bold">{journeys.reduce((s, j) => s + j.completed, 0).toLocaleString()}명</div>
        </div>
      </div>

      {/* 여정 목록 */}
      <div className="space-y-4">
        {journeys.map(j => {
          const st = STATUS_MAP[j.status] || STATUS_MAP.draft;
          return (
            <div key={j.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Workflow size={14} className="text-indigo-400" />
                  <span className="text-sm font-semibold">{j.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>진입 {j.enrolled.toLocaleString()}</span>
                  <span>완료 {j.completed.toLocaleString()}</span>
                  <span className="font-bold text-indigo-400">전환 {j.conversionRate}%</span>
                </div>
              </div>

              {/* 비주얼 플로우 */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {j.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap ${STEP_COLOR[step.type]}`}>
                      <step.icon size={12} />
                      {step.label}
                    </div>
                    {i < j.steps.length - 1 && <ArrowRight size={12} className="text-slate-600 shrink-0" />}
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-500 mt-2">트리거: {j.trigger}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
