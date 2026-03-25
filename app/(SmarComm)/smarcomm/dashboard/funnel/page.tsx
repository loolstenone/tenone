'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import LineChart from '@/components/smarcomm/charts/LineChart';
import BarChart from '@/components/smarcomm/charts/BarChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';
import GaugeChart from '@/components/smarcomm/GaugeChart';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';


// 퍼널 분석 6단계 정의
interface FunnelStageData {
  id: string;
  label: string;
  labelEn: string;
  count: number;
  score: number; // 0~100 건강도 점수
  benchmark: number; // 업종 평균
  metrics: { label: string; value: string; change: string; positive: boolean }[];
}

const PERIODS: Record<string, { label: string; stages: FunnelStageData[] }> = {
  '7d': {
    label: '최근 7일',
    stages: [
      { id: 'awareness', label: '인지', labelEn: 'Awareness', count: 18500, score: 72, benchmark: 65,
        metrics: [{ label: '노출수', value: '245,000', change: '+12%', positive: true }, { label: '도달수', value: '18,500', change: '+8%', positive: true }, { label: 'CPM', value: '4,200원', change: '-5%', positive: true }] },
      { id: 'interest', label: '관심', labelEn: 'Interest', count: 6200, score: 68, benchmark: 60,
        metrics: [{ label: '클릭수', value: '6,200', change: '+15%', positive: true }, { label: 'CTR', value: '2.53%', change: '+0.3%', positive: true }, { label: 'CPC', value: '680원', change: '-8%', positive: true }] },
      { id: 'consideration', label: '고려', labelEn: 'Consideration', count: 2480, score: 45, benchmark: 55,
        metrics: [{ label: '세션 시간', value: '2분 34초', change: '-12%', positive: false }, { label: '페이지/세션', value: '3.2', change: '-0.4', positive: false }, { label: '이탈률', value: '62%', change: '+5%', positive: false }] },
      { id: 'purchase', label: '구매', labelEn: 'Purchase', count: 310, score: 58, benchmark: 50,
        metrics: [{ label: '전환수', value: '310', change: '+22%', positive: true }, { label: 'CVR', value: '1.68%', change: '+0.2%', positive: true }, { label: 'CPA', value: '12,400원', change: '-15%', positive: true }] },
      { id: 'retention', label: '유지', labelEn: 'Retention', count: 186, score: 35, benchmark: 45,
        metrics: [{ label: '재방문율', value: '23%', change: '-3%', positive: false }, { label: '재구매율', value: '12%', change: '-1%', positive: false }, { label: 'DAU/MAU', value: '18%', change: '-2%', positive: false }] },
      { id: 'advocacy', label: '추천', labelEn: 'Advocacy', count: 42, score: 52, benchmark: 40,
        metrics: [{ label: '리뷰수', value: '42', change: '+8', positive: true }, { label: '공유수', value: '156', change: '+25%', positive: true }, { label: 'NPS', value: '34', change: '+3', positive: true }] },
    ],
  },
  '30d': {
    label: '최근 30일',
    stages: [
      { id: 'awareness', label: '인지', labelEn: 'Awareness', count: 72000, score: 74, benchmark: 65,
        metrics: [{ label: '노출수', value: '980,000', change: '+18%', positive: true }, { label: '도달수', value: '72,000', change: '+14%', positive: true }, { label: 'CPM', value: '3,800원', change: '-8%', positive: true }] },
      { id: 'interest', label: '관심', labelEn: 'Interest', count: 24800, score: 70, benchmark: 60,
        metrics: [{ label: '클릭수', value: '24,800', change: '+22%', positive: true }, { label: 'CTR', value: '2.53%', change: '+0.4%', positive: true }, { label: 'CPC', value: '620원', change: '-12%', positive: true }] },
      { id: 'consideration', label: '고려', labelEn: 'Consideration', count: 8680, score: 42, benchmark: 55,
        metrics: [{ label: '세션 시간', value: '2분 48초', change: '-8%', positive: false }, { label: '페이지/세션', value: '3.5', change: '-0.2', positive: false }, { label: '이탈률', value: '58%', change: '+3%', positive: false }] },
      { id: 'purchase', label: '구매', labelEn: 'Purchase', count: 1240, score: 62, benchmark: 50,
        metrics: [{ label: '전환수', value: '1,240', change: '+28%', positive: true }, { label: 'CVR', value: '1.72%', change: '+0.3%', positive: true }, { label: 'CPA', value: '11,200원', change: '-18%', positive: true }] },
      { id: 'retention', label: '유지', labelEn: 'Retention', count: 620, score: 38, benchmark: 45,
        metrics: [{ label: '재방문율', value: '25%', change: '-2%', positive: false }, { label: '재구매율', value: '14%', change: '+1%', positive: true }, { label: 'DAU/MAU', value: '20%', change: '-1%', positive: false }] },
      { id: 'advocacy', label: '추천', labelEn: 'Advocacy', count: 168, score: 55, benchmark: 40,
        metrics: [{ label: '리뷰수', value: '168', change: '+32', positive: true }, { label: '공유수', value: '620', change: '+40%', positive: true }, { label: 'NPS', value: '36', change: '+5', positive: true }] },
    ],
  },
  '90d': {
    label: '최근 90일',
    stages: [
      { id: 'awareness', label: '인지', labelEn: 'Awareness', count: 198000, score: 71, benchmark: 65,
        metrics: [{ label: '노출수', value: '2,850,000', change: '+15%', positive: true }, { label: '도달수', value: '198,000', change: '+11%', positive: true }, { label: 'CPM', value: '4,100원', change: '-3%', positive: true }] },
      { id: 'interest', label: '관심', labelEn: 'Interest', count: 68200, score: 67, benchmark: 60,
        metrics: [{ label: '클릭수', value: '68,200', change: '+18%', positive: true }, { label: 'CTR', value: '2.39%', change: '+0.2%', positive: true }, { label: 'CPC', value: '710원', change: '-6%', positive: true }] },
      { id: 'consideration', label: '고려', labelEn: 'Consideration', count: 23800, score: 44, benchmark: 55,
        metrics: [{ label: '세션 시간', value: '2분 52초', change: '-5%', positive: false }, { label: '페이지/세션', value: '3.4', change: '-0.1', positive: false }, { label: '이탈률', value: '60%', change: '+2%', positive: false }] },
      { id: 'purchase', label: '구매', labelEn: 'Purchase', count: 3420, score: 60, benchmark: 50,
        metrics: [{ label: '전환수', value: '3,420', change: '+25%', positive: true }, { label: 'CVR', value: '1.73%', change: '+0.3%', positive: true }, { label: 'CPA', value: '11,800원', change: '-14%', positive: true }] },
      { id: 'retention', label: '유지', labelEn: 'Retention', count: 1710, score: 36, benchmark: 45,
        metrics: [{ label: '재방문율', value: '24%', change: '-1%', positive: false }, { label: '재구매율', value: '13%', change: '+2%', positive: true }, { label: 'DAU/MAU', value: '19%', change: '0%', positive: true }] },
      { id: 'advocacy', label: '추천', labelEn: 'Advocacy', count: 462, score: 53, benchmark: 40,
        metrics: [{ label: '리뷰수', value: '462', change: '+85', positive: true }, { label: '공유수', value: '1,780', change: '+35%', positive: true }, { label: 'NPS', value: '35', change: '+4', positive: true }] },
    ],
  },
};

// 점수 → 상태
function getScoreStatus(score: number, benchmark: number): { color: string; label: string; icon: typeof CheckCircle2 } {
  if (score >= benchmark + 10) return { color: 'text-success', label: '양호', icon: CheckCircle2 };
  if (score >= benchmark - 10) return { color: 'text-warning', label: '주의', icon: AlertTriangle };
  return { color: 'text-danger', label: '위험', icon: AlertTriangle };
}

const STAGE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#F97316', '#EC4899'];

// 일별 전환 추이
const DAILY_CVR = [
  { label: '3/15', value: 1.52 }, { label: '3/16', value: 1.68 }, { label: '3/17', value: 1.45 },
  { label: '3/18', value: 1.72 }, { label: '3/19', value: 1.80 }, { label: '3/20', value: 1.65 }, { label: '3/21', value: 1.73 },
];

export default function FunnelPage() {
  const [period, setPeriod] = useState('30d');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const stages = PERIODS[period].stages;
  const maxCount = stages[0].count;
  const totalScore = Math.round(stages.reduce((s, st) => s + st.score, 0) / stages.length);

  // 가중치 기반 퍼널 건강도 (Purchase 30%, Consideration 20%, Interest 15%, Awareness 15%, Retention 10%, Advocacy 10%)
  const weights = [15, 15, 20, 30, 10, 10];
  const weightedScore = Math.round(stages.reduce((s, st, i) => s + st.score * weights[i], 0) / 100);

  // 병목 자동 감지 (벤치마크 대비 가장 낮은 2개)
  const bottlenecks = [...stages]
    .map(s => ({ ...s, gap: s.score - s.benchmark }))
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 2);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div>
            <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">퍼널 분석</h1><GuideHelpButton /></div>
            <p className="mt-1 text-xs text-text-muted">6단계 마케팅 퍼널을 자동 진단하고, 어디가 막혀있는지 확인합니다</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(PERIODS).map(([key, val]) => (
            <button key={key} onClick={() => setPeriod(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${period === key ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* 퍼널 건강도 + 병목 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5 flex flex-col items-center justify-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">퍼널 건강도</div>
          <GaugeChart score={weightedScore} label="" size={120} color={weightedScore >= 60 ? getChartColors()[0] : weightedScore >= 40 ? '#D97706' : '#DC2626'} />
          <div className="mt-2 text-center">
            <div className="text-2xl font-bold text-text">{weightedScore}<span className="text-sm text-text-muted">/100</span></div>
            <div className="text-xs text-text-muted">업종 평균 대비 {weightedScore > 53 ? '+' : ''}{weightedScore - 53}점</div>
          </div>
        </div>

        {/* 병목 진단 카드 */}
        <div className="lg:col-span-3 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">자동 감지된 병목</div>
          {bottlenecks.map(bn => {
            const status = getScoreStatus(bn.score, bn.benchmark);
            const StatusIcon = status.icon;
            return (
              <div key={bn.id} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <StatusIcon size={16} className={`mt-0.5 ${status.color}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text">{bn.label} ({bn.labelEn})</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${status.color === 'text-danger' ? 'bg-red-50 text-danger' : 'bg-amber-50 text-warning'}`}>{status.label}</span>
                      </div>
                      <p className="mt-1 text-xs text-text-sub">
                        {bn.label} 단계 점수 {bn.score}점 — 업종 평균({bn.benchmark}점) 대비 {bn.gap > 0 ? '+' : ''}{bn.gap}점
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-text">{bn.score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 퍼널 분석 6단계 시각화 */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">퍼널 분석</h2>
        <div className="space-y-0">
          {stages.map((stage, i) => {
            const widthPct = Math.max(15, (stage.count / maxCount) * 100);
            const prevCount = i > 0 ? stages[i - 1].count : stage.count;
            const dropRate = i > 0 ? ((1 - stage.count / prevCount) * 100).toFixed(1) : null;
            const convRate = i > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : '100';
            const status = getScoreStatus(stage.score, stage.benchmark);
            const isExpanded = expandedStage === stage.id;

            return (
              <div key={stage.id}>
                {i > 0 && (
                  <div className="flex items-center gap-2 py-1 pl-[140px]">
                    <ChevronDown size={10} className="text-text-muted" />
                    <span className="text-[10px] font-medium text-text-sub">{convRate}% 전환</span>
                    <span className="text-[10px] text-danger">(-{dropRate}% 이탈, {(prevCount - stage.count).toLocaleString()}명)</span>
                  </div>
                )}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedStage(isExpanded ? null : stage.id)}>
                  <div className="w-[130px] shrink-0 text-right">
                    <div className="text-xs font-bold text-text">{stage.label}</div>
                    <div className="text-[9px] text-text-muted">{stage.labelEn}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-white transition-all"
                      style={{ width: `${widthPct}%`, background: STAGE_COLORS[i], minWidth: '140px' }}>
                      <span className="text-sm font-bold">{stage.count.toLocaleString()}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${stage.score >= stage.benchmark ? 'bg-white/20' : 'bg-white/30'}`}>{stage.score}점</span>
                        <ChevronRight size={12} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 상세 드릴다운 */}
                {isExpanded && (
                  <div className="ml-[142px] mt-2 mb-3 rounded-xl border border-border bg-surface p-4">
                    <div className="grid grid-cols-3 gap-3">
                      {stage.metrics.map((m, mi) => (
                        <div key={mi}>
                          <div className="text-[10px] text-text-muted">{m.label}</div>
                          <div className="text-sm font-bold text-text">{m.value}</div>
                          <div className={`text-[10px] flex items-center gap-0.5 ${m.positive ? 'text-success' : 'text-danger'}`}>
                            {m.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {m.change}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted">
                      <Info size={10} />
                      <span>업종 평균: {stage.benchmark}점 | 현재: {stage.score}점 ({stage.score >= stage.benchmark ? '평균 이상' : '개선 필요'})</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 단계별 점수 바 차트 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">단계별 건강도 점수</h2>
          <BarChart data={stages.map((s, i) => ({ label: s.label, value: s.score, color: STAGE_COLORS[i] }))} height={200} />
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">일별 전환율(CVR) 추이</h2>
          <LineChart data={DAILY_CVR.map(d => ({ label: d.label, value: Math.round(d.value * 100) }))} height={200} color={getChartColors()[0]} />
        </div>
      </div>

      {/* AI 인사이트 */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">SmarComm. AI 인사이트</h2>
        <div className="space-y-2.5">
          {[
            { severity: 'danger', icon: '🔴', text: 'Consideration 단계가 업종 평균보다 13점 낮습니다. 랜딩 페이지 이탈률(58%)을 줄이기 위해 CTA 위치와 메시지를 개선하세요.', action: 'A/B 테스트 시작', href: '/dashboard/abtest' },
            { severity: 'warning', icon: '🟡', text: 'Retention 단계의 재방문율이 지속 하락 중입니다(-2%). 7일 미방문 사용자에게 자동 리마인더를 설정하세요.', action: '자동화 설정', href: '/dashboard/workflow/automation' },
            { severity: 'success', icon: '🟢', text: 'Purchase 전환율이 전월 대비 +0.3% 상승하여 업종 평균을 초과했습니다. 현재 소재와 랜딩을 유지하세요.', action: '', href: '' },
            { severity: 'info', icon: '💡', text: 'Advocacy 단계의 NPS가 36으로 상승 중입니다. 리뷰 작성 인센티브를 도입하면 추천 전환이 더 늘어날 것으로 예상됩니다.', action: '푸시 발송', href: '/dashboard/crm/push' },
          ].map((insight, i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 text-sm shrink-0">{insight.icon}</span>
                <span className="text-xs text-text-sub leading-relaxed">{insight.text}</span>
              </div>
              {insight.action && (
                <a href={insight.href} className="shrink-0 rounded-lg bg-surface px-3 py-1.5 text-[10px] font-semibold text-text-sub hover:text-text hover:bg-border/50">
                  {insight.action} →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <NextStepCTA stage="진단 → 기획" title="병목 구간 기반으로 개선 프로젝트 시작" description="퍼널 분석 결과를 프로젝트와 태스크로 전환하여 체계적으로 개선하세요" actionLabel="프로젝트 생성" href="/dashboard/workflow/projects" />
    </div>
  );
}
