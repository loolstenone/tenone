'use client';

// V2.0 § 3-B Smart-Data Hub — ② 분석 (Data Intelligence)
// 도메인별 시계열 4지표 추이 + 자동 인사이트

import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';
import type { InsightsSummary, AxisTimeSeries } from '@/lib/smarcomm/insights';
import type { LlmInsight } from '@/lib/smarcomm/insights-llm';

export default function InsightsPage() {
  const [domain, setDomain] = useState('smarcomm.biz');
  const [input, setInput] = useState('smarcomm.biz');
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [llmInsight, setLlmInsight] = useState<LlmInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (dom: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/smarcomm/insights?domain=${encodeURIComponent(dom)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setSummary(data.summary);
      setLlmInsight(data.llmInsight ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsights(domain); /* eslint-disable-next-line */ }, []);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-text">② 분석 — Data Intelligence</h1>
          <GuideHelpButton />
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">V2.0 · Smart-Data Hub</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">진단 시계열에서 자동 인사이트 도출 — Smart-Loop ②→③ 인풋</p>
      </div>

      {/* 도메인 검색 */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setDomain(input); fetchInsights(input); } }}
            placeholder="분석할 도메인 (예: smarcomm.biz)"
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-11 pr-4 text-sm text-text focus:border-text focus:outline-none"
          />
        </div>
        <button
          onClick={() => { setDomain(input); fetchInsights(input); }}
          className="rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub"
        >
          분석
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">로딩 중…</div>
      ) : !summary ? null : summary.scanCount === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <p className="text-sm font-medium text-text">"{domain}" 진단 이력이 없습니다</p>
          <p className="mt-1 text-xs text-text-muted">진단을 먼저 실행하세요.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* LLM 동적 인사이트 (V2.1 § 1.10) */}
          {llmInsight && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-5">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-bold text-text">🤖 LLM 동적 인사이트</h2>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-medium text-blue-700">Claude Haiku</span>
                <span className="ml-auto text-[10px] text-text-muted">{summary.scanCount}회 시계열 분석</span>
              </div>
              <p className="mb-2 text-sm font-semibold text-text">{llmInsight.headline}</p>
              <p className="mb-2 text-xs text-text-sub leading-relaxed">{llmInsight.explanation}</p>
              <div className="rounded-md bg-white border border-blue-200 px-3 py-2">
                <span className="text-[10px] font-medium text-blue-700">다음 행동 →</span>
                <p className="text-xs text-text mt-0.5">{llmInsight.nextAction}</p>
              </div>
            </div>
          )}

          {/* 인사이트 자동 텍스트 (휴리스틱 임계값 분기 — 보조) */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-text">{domain} · 최근 {summary.scanCount}회 진단</h2>
                {!llmInsight && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700" title="ANTHROPIC_API_KEY 미설정 — Claude Haiku 동적 인사이트 사용 불가, 휴리스틱 분기만 표시">⚠ LLM 미가용</span>
                )}
              </div>
              <span className="text-[10px] text-text-muted">
                {summary.firstAt && new Date(summary.firstAt).toLocaleDateString('ko-KR')} → {summary.lastAt && new Date(summary.lastAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-text leading-relaxed">
              {summary.insights.map((ins, i) => <li key={i}>{ins}</li>)}
            </ul>
            <p className="mt-2 text-[10px] text-text-muted">📋 위 메시지는 임계값 분기 산출 (보조). LLM 동적 인사이트가 주 신호 — § 1.10 정직 원칙.</p>
          </div>

          {/* Index 3축 시계열 */}
          <div>
            <h2 className="mb-3 text-sm font-bold text-text">Index 3축 추이</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SeriesCard series={summary.indexSeries} color="#0F172A" />
              <SeriesCard series={summary.findabilitySeries} color="#3B82F6" />
              <SeriesCard series={summary.trustSeries} color="#A855F7" />
              <SeriesCard series={summary.citabilitySeries} color="#10B981" />
            </div>
          </div>

          {/* AI Brand Journey 4지표 */}
          {(summary.awarenessSeries || summary.sentimentSeries) && (
            <div>
              <h2 className="mb-3 text-sm font-bold text-text">AI Brand Journey 4지표 추이</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {summary.awarenessSeries && <SeriesCard series={summary.awarenessSeries} color="#3B82F6" />}
                {summary.depthSeries && <SeriesCard series={summary.depthSeries} color="#10B981" />}
                {summary.journeyTrustSeries && <SeriesCard series={summary.journeyTrustSeries} color="#F59E0B" />}
                {summary.sentimentSeries && <SeriesCard series={summary.sentimentSeries} color="#DC2626" />}
              </div>
            </div>
          )}

          <NextStepHint />
        </div>
      )}
    </div>
  );
}

function SeriesCard({ series, color }: { series: AxisTimeSeries; color: string }) {
  const TrendIcon = series.delta > 0 ? TrendingUp : series.delta < 0 ? TrendingDown : Minus;
  const trendColor = series.delta > 0 ? '#10B981' : series.delta < 0 ? '#DC2626' : '#6B7280';

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{series.icon}</span>
          <span className="text-xs font-semibold text-text">{series.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon size={12} style={{ color: trendColor }} />
          <span className="text-[11px] font-medium" style={{ color: trendColor }}>
            {series.delta > 0 ? '+' : ''}{series.delta} ({series.deltaPct > 0 ? '+' : ''}{series.deltaPct}%)
          </span>
        </div>
      </div>
      <div className="mb-2 text-3xl font-bold" style={{ color }}>{series.current}</div>
      <MiniSparkline points={series.points} color={color} />
      <div className="mt-1 text-[10px] text-text-muted">{series.points.length}개 진단 시점</div>
    </div>
  );
}

function MiniSparkline({ points, color }: { points: Array<{ at: string; value: number }>; color: string }) {
  if (points.length < 2) {
    return <div className="h-12 flex items-center justify-center text-[10px] text-text-muted">진단 2회 이상 필요</div>;
  }
  const w = 280, h = 48;
  const values = points.map(p => p.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const range = max - min || 1;
  const stepX = w / (points.length - 1);
  const path = points.map((p, i) => {
    const x = i * stepX;
    const y = h - ((p.value - min) / range) * h;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <path d={path} stroke={color} strokeWidth="2" fill="none" />
      {points.map((p, i) => {
        const x = i * stepX;
        const y = h - ((p.value - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
      })}
    </svg>
  );
}

function NextStepHint() {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
      <h3 className="mb-2 text-sm font-bold text-text">② → ③ 전략 인풋</h3>
      <p className="text-xs text-text-sub leading-relaxed">
        이 인사이트가 ③ 전략(Omni-Strategy)의 인풋이 됩니다. 인지가 낮으면 → 자산화 + 권위 매체 노출, 평판이 나쁘면 → AIRM, 추천이 약하면 → 경쟁 비교 콘텐츠로 자동 추천됩니다.
      </p>
      <div className="mt-3 flex gap-2">
        <a href="/smarcomm/dashboard/advisor" className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-text hover:bg-surface">
          AI 어드바이저 → <ArrowRight size={11} />
        </a>
        <a href="/smarcomm/dashboard/ai-tracker" className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-text hover:bg-surface">
          AI Tracker → <ArrowRight size={11} />
        </a>
      </div>
    </div>
  );
}
