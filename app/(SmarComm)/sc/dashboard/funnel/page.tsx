'use client';

import { useState } from 'react';
import { ChevronRight, Users, Eye, UserPlus, CreditCard, ArrowDown, FileBarChart, Download } from 'lucide-react';
import LineChart from '@/components/smarcomm/charts/LineChart';
import BarChart from '@/components/smarcomm/charts/BarChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';

interface FunnelStage { id: string; label: string; count: number; }

const PERIODS: Record<string, { label: string; stages: FunnelStage[] }> = {
  '7d': {
    label: '최근 7일',
    stages: [
      { id: 'visit', label: '사이트 방문', count: 3200 },
      { id: 'scan', label: '무료 진단', count: 1280 },
      { id: 'signup', label: '회원가입', count: 384 },
      { id: 'active', label: '리포트 열람', count: 307 },
      { id: 'paid', label: '유료 전환', count: 38 },
    ],
  },
  '30d': {
    label: '최근 30일',
    stages: [
      { id: 'visit', label: '사이트 방문', count: 12400 },
      { id: 'scan', label: '무료 진단', count: 4960 },
      { id: 'signup', label: '회원가입', count: 1488 },
      { id: 'active', label: '리포트 열람', count: 1190 },
      { id: 'paid', label: '유료 전환', count: 149 },
    ],
  },
  '90d': {
    label: '최근 90일',
    stages: [
      { id: 'visit', label: '사이트 방문', count: 34000 },
      { id: 'scan', label: '무료 진단', count: 13600 },
      { id: 'signup', label: '회원가입', count: 4080 },
      { id: 'active', label: '리포트 열람', count: 3264 },
      { id: 'paid', label: '유료 전환', count: 408 },
    ],
  },
};


// 일별 전환율 추이 Mock
const DAILY_CONVERSION = [
  { label: '3/15', value: 38 },
  { label: '3/16', value: 42 },
  { label: '3/17', value: 35 },
  { label: '3/18', value: 40 },
  { label: '3/19', value: 44 },
  { label: '3/20', value: 39 },
  { label: '3/21', value: 41 },
];

const STEP_COLORS = getChartColors(5);

export default function FunnelPage() {
  const [period, setPeriod] = useState('30d');

  const stages = PERIODS[period].stages;
  const maxCount = stages[0].count;

  // 단계별 전환율
  const conversions = stages.slice(1).map((s, i) => ({
    from: stages[i].label,
    to: s.label,
    rate: ((s.count / stages[i].count) * 100).toFixed(1),
    drop: ((1 - s.count / stages[i].count) * 100).toFixed(1),
    dropCount: stages[i].count - s.count,
  }));

  const overallRate = ((stages[stages.length - 1].count / stages[0].count) * 100).toFixed(2);

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">퍼널 분석</h1>
          <p className="mt-1 text-xs text-text-muted">방문부터 유료 전환까지, 어디서 고객을 잃고 있는지 확인하세요</p>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(PERIODS).map(([key, val]) => (
            <button key={key} onClick={() => setPeriod(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${period === key ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
              {val.label}
            </button>
          ))}
          <button className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text">
            <Download size={12} /> 내보내기
          </button>
        </div>
      </div>

      {/* 전체 전환율 */}
      <div className="mb-6 grid gap-4 sm:grid-cols-5">
        <div className="sm:col-span-2 rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">전체 전환율 (방문→유료)</div>
          <div className="mt-1 text-3xl font-bold text-text">{overallRate}%</div>
          <div className="mt-1 text-xs text-success">전월 대비 +0.3%</div>
        </div>
        {conversions.slice(0, 3).map((c, i) => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5">
            <div className="text-xs text-text-muted">{c.from}→{c.to}</div>
            <div className="mt-1 text-2xl font-bold text-text">{c.rate}%</div>
            <div className="mt-1 text-xs text-danger">이탈 {c.drop}%</div>
          </div>
        ))}
      </div>

      {/* 퍼널 시각화 */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">전환 퍼널</h2>
        <div className="space-y-0">
          {stages.map((stage, i) => {
            const widthPct = Math.max(20, (stage.count / maxCount) * 100);
            const prevCount = i > 0 ? stages[i - 1].count : stage.count;
            const dropRate = i > 0 ? ((1 - stage.count / prevCount) * 100).toFixed(1) : null;
            const convRate = ((stage.count / maxCount) * 100).toFixed(1);

            return (
              <div key={stage.id}>
                {i > 0 && (
                  <div className="flex items-center gap-2 py-1.5 pl-28">
                    <ArrowDown size={11} className="text-text-muted" />
                    <span className="text-xs text-danger font-medium">-{dropRate}%</span>
                    <span className="text-[10px] text-text-muted">({(prevCount - stage.count).toLocaleString()}명 이탈)</span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="w-24 shrink-0 text-right text-sm font-medium text-text">{stage.label}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between rounded-xl px-4 py-2.5 text-white transition-all"
                      style={{ width: `${widthPct}%`, background: STEP_COLORS[i], minWidth: '100px' }}>
                      <span className="text-sm font-bold">{stage.count.toLocaleString()}</span>
                      <span className="text-xs opacity-80">{convRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">일별 방문→진단 전환율 추이</h2>
          <LineChart data={DAILY_CONVERSION} height={180} color={getChartColors()[0]} />
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">단계별 이탈 인원</h2>
          <BarChart data={conversions.map(c => ({ label: `${c.from.charAt(0)}→${c.to.charAt(0)}`, value: c.dropCount }))} height={180} color={getChartColors()[2]} />
        </div>
      </div>

      {/* 인사이트 */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">SmarComm. 인사이트</h2>
        <div className="space-y-2.5">
          {[
            { emoji: '💡', text: '진단→가입 전환율이 30%로 양호합니다. 리포트 잠금 콘텐츠가 효과적입니다.' },
            { emoji: '⚠️', text: '활성화→유료 전환율이 12.5%로 목표(15%) 대비 낮습니다. 미팅 예약 유도를 강화하세요.' },
            { emoji: '📊', text: '무료 진단 3회 완료 사용자의 유료 전환율이 2.3배 높습니다. 리테스트를 적극 권유하세요.' },
            { emoji: '🎯', text: '소상공인 업종의 가입→활성화 비율이 가장 높습니다 (85%). 타깃 집중을 권장합니다.' },
          ].map((insight, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border px-4 py-3">
              <span className="mt-0.5 text-sm">{insight.emoji}</span>
              <span className="text-sm text-text-sub">{insight.text}</span>
            </div>
          ))}
        </div>
      </div>

      <NextStepCTA stage="진단 → 기획" title="이탈 구간 기반으로 사용자 여정 설계" description="퍼널 병목을 해소하는 고객 접점 시나리오를 설계하세요" actionLabel="여정 설계" href="/sc/dashboard/journey" />
    </div>
  );
}
