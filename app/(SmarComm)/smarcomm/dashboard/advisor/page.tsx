'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Target, DollarSign, Zap, ChevronRight, Eye, EyeOff, SlidersHorizontal, FileText, Rocket, ArrowRight, RefreshCw, Loader2, Bell, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { CampaignPlan } from '@/lib/smarcomm/campaign-plan';
import { type CampaignExecution, createExecution, saveExecution, loadExecution, calculateScoreChanges, generateAlerts, generateImprovementSuggestions } from '@/lib/smarcomm/campaign-tracker';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import BarChart from '@/components/smarcomm/charts/BarChart';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

type InsightSeverity = 'danger' | 'warning' | 'opportunity' | 'suggestion';
type FunnelStageKey = 'awareness' | 'interest' | 'consideration' | 'purchase' | 'retention' | 'advocacy';

interface Insight {
  id: string;
  severity: InsightSeverity;
  stage: FunnelStageKey;
  title: string;
  message: string;
  action: string;
  actionHref: string;
  impact: 'high' | 'medium' | 'low';
  ease: 'easy' | 'medium' | 'hard';
  status: 'new' | 'in_progress' | 'resolved' | 'dismissed';
  createdAt: string;
}

interface BeforeAfter {
  id: string;
  action: string;
  executedAt: string;
  metric: string;
  before: string;
  after: string;
  change: string;
  positive: boolean;
}

const STAGES: { key: FunnelStageKey; label: string }[] = [
  { key: 'awareness', label: '인지' }, { key: 'interest', label: '관심' },
  { key: 'consideration', label: '고려' }, { key: 'purchase', label: '구매' },
  { key: 'retention', label: '유지' }, { key: 'advocacy', label: '추천' },
];

const SEVERITY_CONFIG: Record<InsightSeverity, { icon: typeof AlertTriangle; color: string; label: string; bg: string }> = {
  danger: { icon: AlertTriangle, color: 'text-danger', label: '위험', bg: 'bg-red-50' },
  warning: { icon: AlertTriangle, color: 'text-warning', label: '주의', bg: 'bg-amber-50' },
  opportunity: { icon: Target, color: 'text-success', label: '기회', bg: 'bg-emerald-50' },
  suggestion: { icon: Lightbulb, color: 'text-point', label: '제안', bg: 'bg-blue-50' },
};

const MOCK_INSIGHTS: Insight[] = [
  { id: 'i1', severity: 'danger', stage: 'consideration', title: 'Consideration 단계 전환율 급락',
    message: 'Consideration → Purchase 전환율이 업종 평균보다 42% 낮습니다. 랜딩 페이지의 이탈률이 58%로 매우 높습니다. CTA 위치를 스크롤 없이 보이는 영역으로 이동하고, 소셜 프루프(리뷰/사례)를 추가하세요.',
    action: 'A/B 테스트 시작', actionHref: '/dashboard/abtest', impact: 'high', ease: 'medium', status: 'new', createdAt: '2026-03-22' },
  { id: 'i2', severity: 'warning', stage: 'retention', title: 'Retention 재방문율 하락 추세',
    message: '지난 4주 동안 재방문율이 28%→23%로 지속 하락 중입니다. 7일 미방문 사용자에게 자동 리마인더를 설정하고, 14일 미방문 사용자에게 인센티브(쿠폰/할인)를 제공하세요.',
    action: '자동화 설정', actionHref: '/dashboard/workflow/automation', impact: 'high', ease: 'easy', status: 'new', createdAt: '2026-03-22' },
  { id: 'i3', severity: 'opportunity', stage: 'purchase', title: 'Purchase CVR 상승 기회',
    message: '현재 전환율 1.72%로 업종 평균(1.5%) 대비 양호하지만, A/B 테스트에서 "30초 무료 점검" CTA가 "무료 진단 시작"보다 전환율 17% 높았습니다. 승리 소재를 전체 적용하면 CVR 2.0% 달성이 가능합니다.',
    action: '소재 전체 적용', actionHref: '/dashboard/creative', impact: 'medium', ease: 'easy', status: 'in_progress', createdAt: '2026-03-21' },
  { id: 'i4', severity: 'suggestion', stage: 'awareness', title: '네이버 SA 키워드 확장 제안',
    message: '"GEO 마케팅", "AI 검색 최적화" 키워드의 검색량이 전월 대비 45% 증가했습니다. 이 키워드를 네이버 SA 캠페인에 추가하면 Awareness 단계의 노출을 20% 이상 늘릴 수 있습니다.',
    action: '캠페인 수정', actionHref: '/dashboard/campaigns', impact: 'medium', ease: 'easy', status: 'new', createdAt: '2026-03-21' },
  { id: 'i5', severity: 'suggestion', stage: 'advocacy', title: 'NPS 상승 — 리뷰 캠페인 추천',
    message: 'NPS가 31→36으로 상승했습니다. 이 모멘텀을 활용하여 구매 후 7일 시점에 자동 리뷰 요청 이메일을 발송하면 리뷰 수를 50% 이상 늘릴 수 있습니다.',
    action: '이메일 자동화', actionHref: '/dashboard/crm/email', impact: 'low', ease: 'easy', status: 'new', createdAt: '2026-03-20' },
  { id: 'i6', severity: 'warning', stage: 'interest', title: 'Meta 광고 CTR 하락',
    message: '인스타그램 광고 CTR이 2.8%→2.1%로 하락했습니다. 광고 피로도가 높아진 것으로 보입니다. 새로운 소재를 제작하고 오디언스를 리프레시하세요.',
    action: '소재 제작', actionHref: '/dashboard/creative', impact: 'medium', ease: 'medium', status: 'new', createdAt: '2026-03-20' },
];

const MOCK_BEFORE_AFTER: BeforeAfter[] = [
  { id: 'ba1', action: 'CTA 변경: "무료 진단" → "30초 무료 점검"', executedAt: '2026-03-10', metric: 'Purchase CVR', before: '1.52%', after: '1.72%', change: '+13.2%', positive: true },
  { id: 'ba2', action: '네이버 SA 키워드 10개 추가', executedAt: '2026-03-05', metric: 'Awareness 노출수', before: '680K', after: '980K', change: '+44.1%', positive: true },
  { id: 'ba3', action: 'FAQ 스키마 마크업 추가', executedAt: '2026-02-28', metric: 'GEO 점수', before: '42점', after: '65점', change: '+23점', positive: true },
  { id: 'ba4', action: '이메일 제목 A/B 테스트', executedAt: '2026-02-25', metric: '오픈율', before: '22.3%', after: '35.8%', change: '+60.5%', positive: true },
];

// 현재 vs AI 추천 예산 배분
const BUDGET_CURRENT = [
  { label: '메타', value: 35 }, { label: '네이버', value: 30 }, { label: '구글', value: 20 }, { label: '카카오', value: 10 }, { label: '기타', value: 5 },
];
const BUDGET_RECOMMENDED = [
  { label: '메타', value: 25 }, { label: '네이버', value: 40 }, { label: '구글', value: 20 }, { label: '카카오', value: 10 }, { label: '기타', value: 5 },
];

export default function AdvisorPage() {
  const router = useRouter();
  const [stageFilter, setStageFilter] = useState<FunnelStageKey | 'all'>('all');
  const [insights, setInsights] = useState(MOCK_INSIGHTS);
  const [showBudget, setShowBudget] = useState(false);
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [execution, setExecution] = useState<CampaignExecution | null>(null);
  const [rescanning, setRescanning] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('campaignPlan');
      if (stored) setCampaignPlan(JSON.parse(stored));
      const exec = loadExecution();
      if (exec) setExecution(exec);
    } catch {}
  }, []);

  // 기획서가 있고 실행 추적이 없으면 자동 생성
  useEffect(() => {
    if (campaignPlan && !execution) {
      try {
        const scanKeys = Object.keys(sessionStorage).filter(k => k.startsWith('scan_'));
        if (scanKeys.length > 0) {
          const scanResult = JSON.parse(sessionStorage.getItem(scanKeys[scanKeys.length - 1])!);
          const exec = createExecution(campaignPlan, scanResult);
          setExecution(exec);
          saveExecution(exec);
        }
      } catch {}
    }
  }, [campaignPlan, execution]);

  // 액션 상태 변경
  const updateActionStatus = (idx: number, status: 'pending' | 'in_progress' | 'published' | 'completed') => {
    if (!execution) return;
    const updated = { ...execution, actions: execution.actions.map(a => a.action_index === idx ? { ...a, status, published_at: status === 'published' ? new Date().toISOString() : a.published_at } : a) };
    setExecution(updated);
    saveExecution(updated);
  };

  // 재스캔 (Before/After)
  const handleRescan = async () => {
    if (!execution) return;
    setRescanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: execution.scan_url }),
      });
      if (res.ok) {
        const scanResult = await res.json();
        const afterScan = {
          scanned_at: new Date().toISOString(),
          total_score: scanResult.totalScore,
          seo_score: scanResult.seoScore,
          geo_score: scanResult.geoScore,
          performance_score: scanResult.performanceScore,
        };
        const changes = calculateScoreChanges(execution.before_scan, afterScan);
        const alerts = changes ? generateAlerts(changes, execution) : [];
        const suggestions = generateImprovementSuggestions(changes, execution);
        const updated = { ...execution, after_scan: afterScan, alerts: [...execution.alerts, ...alerts], improvement_suggestions: suggestions };
        setExecution(updated);
        saveExecution(updated);
      }
    } catch (e) {
      console.error('Rescan failed:', e);
    }
    setRescanning(false);
  };

  const scoreChanges = execution?.after_scan ? calculateScoreChanges(execution.before_scan, execution.after_scan) : null;

  const filtered = insights.filter(ins => {
    if (stageFilter !== 'all' && ins.stage !== stageFilter) return false;
    return ins.status !== 'dismissed';
  });

  const updateStatus = (id: string, status: Insight['status']) => {
    setInsights(insights.map(i => i.id === id ? { ...i, status } : i));
  };

  const pc = getChartColors(7);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">AI 어드바이저</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">퍼널 분석 데이터 기반 AI 개선 추천</p>
        </div>
        <button onClick={() => setShowBudget(!showBudget)}
          className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs text-text-sub hover:text-text hover:bg-surface">
          <SlidersHorizontal size={13} /> 예산 재분배 제안
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {[
          { label: '위험', count: insights.filter(i => i.severity === 'danger' && i.status !== 'resolved').length, color: 'text-danger', bg: 'bg-red-50' },
          { label: '주의', count: insights.filter(i => i.severity === 'warning' && i.status !== 'resolved').length, color: 'text-warning', bg: 'bg-amber-50' },
          { label: '기회', count: insights.filter(i => i.severity === 'opportunity').length, color: 'text-success', bg: 'bg-emerald-50' },
          { label: '제안', count: insights.filter(i => i.severity === 'suggestion').length, color: 'text-point', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 예산 재분배 제안 (토글) */}
      {showBudget && (
        <div className="mb-6 rounded-2xl border border-border bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">채널별 예산 재분배 제안</h3>
          <p className="mb-3 text-xs text-text-sub">메타 예산을 10% 줄이고 네이버로 이동하면 전체 ROAS가 15% 개선될 것으로 예측됩니다.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-2 text-[10px] font-bold text-text-muted">현재 배분</div>
              <BarChart data={BUDGET_CURRENT.map((b, i) => ({ ...b, color: pc[i] }))} height={150} />
            </div>
            <div>
              <div className="mb-2 text-[10px] font-bold text-text-muted">AI 추천 배분</div>
              <BarChart data={BUDGET_RECOMMENDED.map((b, i) => ({ ...b, color: pc[i] }))} height={150} />
            </div>
          </div>
        </div>
      )}

      {/* AI 캠페인 기획서 */}
      {campaignPlan && (
        <div className="mb-6 rounded-2xl border border-border bg-white p-5">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rocket size={16} className="text-point" />
              <h3 className="text-sm font-bold text-text">AI 캠페인 기획서</h3>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
              campaignPlan.generated_by === 'ai'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {campaignPlan.generated_by === 'ai' ? 'AI 생성' : '규칙 기반'}
            </span>
          </div>

          <div className="mb-4 text-xs text-text-muted">
            URL: <span className="text-text-sub font-medium">{campaignPlan.scan_url}</span>
          </div>

          {/* 배경 */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <FileText size={13} className="text-text-muted" />
              <span className="text-xs font-semibold text-text">배경</span>
            </div>
            <div className="space-y-1 ml-5 text-xs text-text-sub">
              <div><span className="text-text-muted">문제:</span> {campaignPlan.background.problem}</div>
              <div><span className="text-text-muted">원인:</span> {campaignPlan.background.cause}</div>
              <div><span className="text-text-muted">목표:</span> {campaignPlan.background.goal}</div>
            </div>
          </div>

          {/* 전략 */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Target size={13} className="text-text-muted" />
              <span className="text-xs font-semibold text-text">전략</span>
            </div>
            <div className="space-y-1 ml-5 text-xs text-text-sub">
              <div><span className="text-text-muted">단계:</span> {campaignPlan.strategy.target_stage}</div>
              <div><span className="text-text-muted">접근:</span> {campaignPlan.strategy.approach}</div>
              <div><span className="text-text-muted">기간:</span> {campaignPlan.strategy.duration}</div>
              <div><span className="text-text-muted">예산:</span> {campaignPlan.strategy.budget_suggestion}</div>
            </div>
          </div>

          {/* 실행 항목 */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={13} className="text-text-muted" />
              <span className="text-xs font-semibold text-text">실행 항목</span>
            </div>
            <div className="space-y-2 ml-5">
              {campaignPlan.actions.map((action, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        action.priority === 'high' ? 'bg-red-50 text-danger' :
                        action.priority === 'medium' ? 'bg-amber-50 text-warning' :
                        'bg-gray-100 text-text-muted'
                      }`}>{action.priority}</span>
                      <span className="text-xs font-semibold text-text">{action.title}</span>
                    </div>
                    <span className="text-[10px] text-text-muted">{action.channel}</span>
                  </div>
                  <p className="text-[11px] text-text-sub leading-relaxed">{action.description}</p>
                  {action.auto_creatable && (
                    <button
                      onClick={() => {
                        const params = new URLSearchParams({
                          action: action.title,
                          channel: action.channel,
                          desc: action.description,
                        });
                        router.push(`/dashboard/creative?${params.toString()}`);
                      }}
                      className="mt-2 flex items-center gap-1 rounded-lg bg-text px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-accent-sub"
                    >
                      소재 만들기 <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 예상 효과 */}
          <div className="rounded-xl bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={13} className="text-success" />
              <span className="text-xs font-semibold text-success">예상 효과</span>
            </div>
            <p className="mt-1 ml-5 text-xs text-text-sub">{campaignPlan.expected_outcome}</p>
          </div>
        </div>
      )}

      {/* ④⑤⑥ 캠페인 실행 추적 + 모니터링 + 개선 */}
      {execution && (
        <div className="mb-6 space-y-4">
          {/* ④ 실행 상태 추적 */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket size={15} className="text-point" />
                <h3 className="text-sm font-semibold text-text">캠페인 실행 현황</h3>
              </div>
              <span className="text-[10px] text-text-muted">
                {execution.actions.filter(a => a.status === 'published' || a.status === 'completed').length}/{execution.actions.length} 완료
              </span>
            </div>
            <div className="space-y-2">
              {execution.actions.map(action => (
                <div key={action.action_index} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateActionStatus(action.action_index,
                        action.status === 'pending' ? 'in_progress' :
                        action.status === 'in_progress' ? 'published' :
                        action.status === 'published' ? 'completed' : 'pending'
                      )}
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                        action.status === 'completed' ? 'border-success bg-success text-white' :
                        action.status === 'published' ? 'border-point bg-point text-white' :
                        action.status === 'in_progress' ? 'border-warning bg-warning text-white' :
                        'border-border'
                      }`}>
                      {action.status === 'completed' ? '✓' : action.status === 'published' ? '✓' : action.status === 'in_progress' ? '→' : ''}
                    </button>
                    <span className={`text-xs ${action.status === 'completed' ? 'text-text-muted line-through' : 'text-text'}`}>{action.title}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {action.status === 'pending' ? '대기' : action.status === 'in_progress' ? '진행 중' : action.status === 'published' ? '게시됨' : '완료'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ⑤ 모니터링 — Before/After */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-text-sub" />
                <h3 className="text-sm font-semibold text-text">Before / After 모니터링</h3>
              </div>
              <button onClick={handleRescan} disabled={rescanning}
                className="flex items-center gap-1 rounded-lg bg-text px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-accent-sub disabled:opacity-50">
                {rescanning ? <><Loader2 size={10} className="animate-spin" /> 재스캔 중...</> : <><RefreshCw size={10} /> 지금 재스캔</>}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: '종합', key: 'total' as const },
                { label: 'SEO', key: 'seo' as const },
                { label: 'GEO', key: 'geo' as const },
                { label: '성능', key: 'performance' as const },
              ].map(item => {
                const change = scoreChanges?.[item.key];
                return (
                  <div key={item.key} className="rounded-xl border border-border p-3 text-center">
                    <div className="text-[10px] text-text-muted">{item.label}</div>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <span className="text-lg font-bold text-text">
                        {change ? change.after : item.key === 'total' ? execution.before_scan.total_score : item.key === 'seo' ? execution.before_scan.seo_score : item.key === 'geo' ? execution.before_scan.geo_score : execution.before_scan.performance_score}
                      </span>
                    </div>
                    {change && (
                      <div className={`mt-0.5 flex items-center justify-center gap-0.5 text-[10px] font-medium ${change.change > 0 ? 'text-success' : change.change < 0 ? 'text-danger' : 'text-text-muted'}`}>
                        {change.change > 0 ? <ArrowUpRight size={10} /> : change.change < 0 ? <ArrowDownRight size={10} /> : <Minus size={10} />}
                        {change.change > 0 ? '+' : ''}{change.change}점
                      </div>
                    )}
                    {!change && <div className="mt-0.5 text-[10px] text-text-muted">기준점</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 알림 */}
          {execution.alerts.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Bell size={15} className="text-warning" />
                <h3 className="text-sm font-semibold text-text">알림 ({execution.alerts.length})</h3>
              </div>
              <div className="space-y-2">
                {execution.alerts.slice(-5).map(alert => (
                  <div key={alert.id} className={`rounded-xl border px-4 py-2.5 ${alert.severity === 'critical' ? 'border-danger bg-red-50' : alert.severity === 'warning' ? 'border-warning bg-yellow-50' : 'border-border'}`}>
                    <div className="text-xs font-medium text-text">{alert.title}</div>
                    <p className="mt-0.5 text-[11px] text-text-sub">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ⑥ AI 개선 제안 */}
          {execution.improvement_suggestions && execution.improvement_suggestions.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb size={15} className="text-point" />
                <h3 className="text-sm font-semibold text-text">AI 개선 제안</h3>
              </div>
              <div className="space-y-2">
                {execution.improvement_suggestions.map((suggestion, i) => (
                  <div key={i} className="flex gap-2 rounded-xl bg-surface px-4 py-2.5">
                    <span className="mt-0.5 text-xs text-point">→</span>
                    <span className="text-xs text-text-sub leading-relaxed">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 퍼널 단계 필터 */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto scrollbar-hide">
        <button onClick={() => setStageFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${stageFilter === 'all' ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>전체</button>
        {STAGES.map(s => (
          <button key={s.key} onClick={() => setStageFilter(s.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${stageFilter === s.key ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>{s.label}</button>
        ))}
      </div>

      {/* 인사이트 피드 */}
      <div className="mb-6 space-y-3">
        {filtered.map(ins => {
          const cfg = SEVERITY_CONFIG[ins.severity];
          const Icon = cfg.icon;
          const stageName = STAGES.find(s => s.key === ins.stage)?.label || ins.stage;
          return (
            <div key={ins.id} className={`rounded-2xl border border-border bg-white p-5 ${ins.status === 'resolved' ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`shrink-0 rounded-lg p-2 ${cfg.bg}`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      <span className="rounded bg-surface px-1.5 py-0.5 text-[9px] text-text-muted">{stageName}</span>
                      <span className="text-[9px] text-text-muted">{ins.createdAt}</span>
                    </div>
                    <h3 className="text-sm font-bold text-text">{ins.title}</h3>
                    <p className="mt-1 text-xs text-text-sub leading-relaxed">{ins.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[9px] text-text-muted">영향도: <b className="text-text-sub">{ins.impact === 'high' ? '높음' : ins.impact === 'medium' ? '중간' : '낮음'}</b></span>
                      <span className="text-[9px] text-text-muted">실행 난이도: <b className="text-text-sub">{ins.ease === 'easy' ? '쉬움' : ins.ease === 'medium' ? '보통' : '어려움'}</b></span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {ins.action && ins.status !== 'resolved' && (
                    <a href={ins.actionHref} className="flex items-center gap-1 rounded-lg bg-text px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-accent-sub">
                      {ins.action} <ChevronRight size={10} />
                    </a>
                  )}
                  <div className="flex gap-1">
                    {ins.status !== 'resolved' && (
                      <button onClick={() => updateStatus(ins.id, 'resolved')} className="rounded px-2 py-1 text-[9px] text-text-muted hover:bg-surface">해결됨</button>
                    )}
                    {ins.status !== 'dismissed' && (
                      <button onClick={() => updateStatus(ins.id, 'dismissed')} className="rounded px-2 py-1 text-[9px] text-text-muted hover:bg-surface">무시</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-success/30" />
            <p className="text-sm text-text-muted">모든 인사이트를 처리했습니다</p>
          </div>
        )}
      </div>

      {/* Before/After 트래커 */}
      <div className="rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-text">Before / After 트래커</h3>
          <p className="text-[10px] text-text-muted mt-0.5">과거 추천 액션의 실행 결과를 추적합니다</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] text-text-muted">
              <th className="px-5 py-2.5 text-left font-medium">실행한 액션</th>
              <th className="px-5 py-2.5 text-left font-medium">지표</th>
              <th className="px-5 py-2.5 text-center font-medium">Before</th>
              <th className="px-5 py-2.5 text-center font-medium">After</th>
              <th className="px-5 py-2.5 text-right font-medium">변화</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_BEFORE_AFTER.map(ba => (
              <tr key={ba.id} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="px-5 py-3">
                  <div className="text-xs font-medium text-text">{ba.action}</div>
                  <div className="text-[9px] text-text-muted mt-0.5">{ba.executedAt}</div>
                </td>
                <td className="px-5 py-3 text-xs text-text-sub">{ba.metric}</td>
                <td className="px-5 py-3 text-center text-xs text-text-muted">{ba.before}</td>
                <td className="px-5 py-3 text-center text-xs font-medium text-text">{ba.after}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`flex items-center justify-end gap-0.5 text-xs font-bold ${ba.positive ? 'text-success' : 'text-danger'}`}>
                    {ba.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {ba.change}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
