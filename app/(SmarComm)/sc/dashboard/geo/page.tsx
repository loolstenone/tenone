'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, TrendingUp, TrendingDown, MessageSquare, Search, Users, Target, Plus, Globe, HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import DonutChart from '@/components/smarcomm/charts/DonutChart';
import LineChart from '@/components/smarcomm/charts/LineChart';
import BarChart from '@/components/smarcomm/charts/BarChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

type GeoTab = 'overview' | 'competitors' | 'brand';

// ── Mock: AI 플랫폼별 가시성 데이터 ──
const PLATFORMS = [
  { name: 'ChatGPT', mentioned: true, sentiment: 'positive', mentions: 8, totalPrompts: 15, score: 73 },
  { name: 'Perplexity', mentioned: true, sentiment: 'positive', mentions: 6, totalPrompts: 12, score: 67 },
  { name: 'Gemini', mentioned: false, sentiment: 'neutral', mentions: 2, totalPrompts: 10, score: 32 },
  { name: 'Claude', mentioned: true, sentiment: 'positive', mentions: 5, totalPrompts: 10, score: 65 },
  { name: 'Naver Cue', mentioned: false, sentiment: 'neutral', mentions: 1, totalPrompts: 8, score: 18 },
];

const WEEKLY_VISIBILITY = [
  { label: 'W1', value: 42 }, { label: 'W2', value: 48 }, { label: 'W3', value: 45 },
  { label: 'W4', value: 52 }, { label: 'W5', value: 58 }, { label: 'W6', value: 55 }, { label: 'W7', value: 61 },
];

const OVERVIEW_COMPETITORS = [
  { name: '우리 브랜드', score: 61, mentions: 22, sentiment: 82 },
  { name: 'competitor-a.com', score: 74, mentions: 31, sentiment: 78 },
  { name: 'competitor-b.com', score: 55, mentions: 18, sentiment: 85 },
  { name: 'competitor-c.com', score: 43, mentions: 12, sentiment: 70 },
];

const TOP_PROMPTS = [
  { prompt: '한국에서 좋은 마케팅 자동화 도구 추천해줘', mentioned: true, platform: 'ChatGPT', sentiment: 'positive' },
  { prompt: 'SEO 진단 도구 비교해줘', mentioned: true, platform: 'Perplexity', sentiment: 'positive' },
  { prompt: '소상공인 마케팅 플랫폼 추천', mentioned: false, platform: 'Gemini', sentiment: 'neutral' },
  { prompt: 'GEO 최적화 방법 알려줘', mentioned: true, platform: 'Claude', sentiment: 'positive' },
  { prompt: '광고 성과 분석 도구 뭐가 좋아?', mentioned: false, platform: 'ChatGPT', sentiment: 'neutral' },
];

// ── Mock: 경쟁사 상세 ──
interface Competitor {
  domain: string;
  overallScore: number;
  platforms: { name: string; score: number; mentions: number; sentiment: string }[];
  topKeywords: string[];
  trend: 'up' | 'down' | 'stable';
}

const COMPETITORS: Competitor[] = [
  { domain: '우리 브랜드 (smarcomm.com)', overallScore: 61, trend: 'up',
    platforms: [{ name: 'ChatGPT', score: 73, mentions: 8, sentiment: 'positive' }, { name: 'Perplexity', score: 67, mentions: 6, sentiment: 'positive' }, { name: 'Gemini', score: 32, mentions: 2, sentiment: 'neutral' }, { name: 'Claude', score: 65, mentions: 5, sentiment: 'positive' }],
    topKeywords: ['마케팅 자동화', 'SEO 진단', 'GEO 최적화'] },
  { domain: 'competitor-a.com', overallScore: 74, trend: 'up',
    platforms: [{ name: 'ChatGPT', score: 82, mentions: 12, sentiment: 'positive' }, { name: 'Perplexity', score: 78, mentions: 9, sentiment: 'positive' }, { name: 'Gemini', score: 65, mentions: 5, sentiment: 'positive' }, { name: 'Claude', score: 71, mentions: 5, sentiment: 'positive' }],
    topKeywords: ['디지털 마케팅', '광고 최적화', 'ROI 분석'] },
  { domain: 'competitor-b.com', overallScore: 55, trend: 'down',
    platforms: [{ name: 'ChatGPT', score: 62, mentions: 6, sentiment: 'neutral' }, { name: 'Perplexity', score: 52, mentions: 4, sentiment: 'neutral' }, { name: 'Gemini', score: 48, mentions: 3, sentiment: 'neutral' }, { name: 'Claude', score: 58, mentions: 5, sentiment: 'positive' }],
    topKeywords: ['SNS 마케팅', '콘텐츠 마케팅', '인플루언서'] },
  { domain: 'competitor-c.com', overallScore: 43, trend: 'stable',
    platforms: [{ name: 'ChatGPT', score: 45, mentions: 4, sentiment: 'neutral' }, { name: 'Perplexity', score: 38, mentions: 2, sentiment: 'neutral' }, { name: 'Gemini', score: 42, mentions: 3, sentiment: 'neutral' }, { name: 'Claude', score: 47, mentions: 3, sentiment: 'neutral' }],
    topKeywords: ['이메일 마케팅', '뉴스레터', 'CRM'] },
];

// ── Mock: 브랜드 실적 ──
const BRAND_METRICS = {
  overallPerception: 72,
  sentimentBreakdown: { positive: 68, neutral: 24, negative: 8 },
  weeklyTrend: [
    { label: 'W1', value: 58 }, { label: 'W2', value: 62 }, { label: 'W3', value: 65 },
    { label: 'W4', value: 68 }, { label: 'W5', value: 71 }, { label: 'W6', value: 70 }, { label: 'W7', value: 72 },
  ],
};

const NARRATIVES = [
  { factor: 'GEO/SEO 진단 전문성', score: 85, impact: 'high', description: 'AI가 SmarComm을 SEO 진단 도구로 자주 언급합니다' },
  { factor: '마케팅 자동화', score: 62, impact: 'medium', description: '자동화 기능은 언급되지만 HubSpot, Mailchimp 대비 인지도 낮음' },
  { factor: '소상공인 타겟', score: 78, impact: 'high', description: '"소상공인 마케팅"과 관련하여 자주 추천됩니다' },
  { factor: '가격 경쟁력', score: 70, impact: 'medium', description: '가격 대비 기능 면에서 긍정적으로 언급됨' },
  { factor: '한국 매체 지원', score: 88, impact: 'high', description: '네이버/카카오 지원이 차별화 요소로 인식됨' },
  { factor: '데이터 분석 깊이', score: 45, impact: 'low', description: 'Amplitude, Mixpanel 대비 분석 깊이가 부족하다고 인식됨' },
];

const TOP_QUESTIONS = [
  { question: 'SmarComm이 뭐하는 서비스야?', frequency: 120, answered: true },
  { question: 'SmarComm 가격은 얼마야?', frequency: 85, answered: true },
  { question: 'SmarComm vs Semrush 차이가 뭐야?', frequency: 62, answered: true },
  { question: 'SmarComm 무료 플랜으로 뭘 할 수 있어?', frequency: 48, answered: true },
  { question: 'SmarComm GEO 점수가 뭐야?', frequency: 35, answered: false },
  { question: 'SmarComm으로 네이버 광고 관리할 수 있어?', frequency: 28, answered: true },
];

const sentimentColor = (s: string) => s === 'positive' ? 'text-success' : s === 'negative' ? 'text-danger' : 'text-text-muted';
const sentimentLabel = (s: string) => s === 'positive' ? '긍정' : s === 'negative' ? '부정' : '중립';

export default function GeoPage() {
  const [tab, setTab] = useState<GeoTab>('overview');
  const pc = getChartColors(7);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Eye size={20} className="text-point" />
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">AI 가시성</h1><GuideHelpButton /></div>
        </div>
        <p className="text-xs text-text-muted">AI 검색에서 브랜드 가시성, 경쟁사, 브랜드 실적을 통합 관리합니다</p>
      </div>

      {/* 메인 탭 */}
      <div className="mb-6 flex gap-1">
        {([
          { id: 'overview' as GeoTab, label: '가시성 개요' },
          { id: 'competitors' as GeoTab, label: '경쟁사 리서치' },
          { id: 'brand' as GeoTab, label: '브랜드 실적' },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab pc={pc} />}
      {tab === 'competitors' && <CompetitorsTab pc={pc} />}
      {tab === 'brand' && <BrandTab pc={pc} />}

      <NextStepCTA stage="진단 → 기획" title="AI 가시성 개선 프로젝트 시작" description="AI 검색에서 브랜드 노출을 높이기 위한 GEO 최적화 프로젝트를 생성하세요" actionLabel="프로젝트 생성" href="/sc/dashboard/workflow/projects" />
    </div>
  );
}

/* ── 가시성 개요 탭 ── */
function OverviewTab({ pc }: { pc: string[] }) {
  const avgScore = Math.round(PLATFORMS.reduce((s, p) => s + p.score, 0) / PLATFORMS.length);
  const totalMentions = PLATFORMS.reduce((s, p) => s + p.mentions, 0);
  const mentionRate = Math.round(PLATFORMS.filter(p => p.mentioned).length / PLATFORMS.length * 100);

  return (
    <div>
      {/* KPI */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">AI 가시성 점수</div>
          <div className="mt-1 text-2xl font-bold text-text">{avgScore}<span className="text-sm text-text-muted">/100</span></div>
          <div className="mt-1 flex items-center gap-1 text-xs text-success"><TrendingUp size={11} /> +7점 (전주 대비)</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">총 멘션 수</div>
          <div className="mt-1 text-2xl font-bold text-text">{totalMentions}회</div>
          <div className="mt-1 text-xs text-text-muted">최근 7일</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">멘션 비율</div>
          <div className="mt-1 text-2xl font-bold text-text">{mentionRate}%</div>
          <div className="mt-1 text-xs text-text-muted">{PLATFORMS.filter(p => p.mentioned).length}/{PLATFORMS.length} 플랫폼</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">감성 분석</div>
          <div className="mt-1 text-2xl font-bold text-success">긍정</div>
          <div className="mt-1 text-xs text-text-muted">전체 멘션의 73%</div>
        </div>
      </div>

      {/* 차트 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">주간 가시성 추이</h2>
          <LineChart data={WEEKLY_VISIBILITY} height={200} color={pc[0]} />
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">플랫폼별 멘션 비중</h2>
          <DonutChart
            data={PLATFORMS.map((p, i) => ({ label: p.name, value: p.mentions, color: pc[i] }))}
            size={160} centerLabel="총 멘션" centerValue={String(totalMentions)}
          />
        </div>
      </div>

      {/* 플랫폼별 상세 */}
      <div className="mb-6 rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">플랫폼별 가시성</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="px-5 py-2.5 text-left font-medium">플랫폼</th>
              <th className="px-5 py-2.5 text-center font-medium">노출 여부</th>
              <th className="px-5 py-2.5 text-center font-medium">멘션 수</th>
              <th className="px-5 py-2.5 text-center font-medium">감성</th>
              <th className="px-5 py-2.5 text-right font-medium">가시성 점수</th>
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map(p => (
              <tr key={p.name} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="px-5 py-3 font-medium text-text">{p.name}</td>
                <td className="px-5 py-3 text-center">
                  {p.mentioned ? <span className="text-success text-xs font-semibold">노출</span> : <span className="text-danger text-xs">미노출</span>}
                </td>
                <td className="px-5 py-3 text-center text-text-sub">{p.mentions}/{p.totalPrompts}</td>
                <td className="px-5 py-3 text-center"><span className={`text-xs font-semibold ${sentimentColor(p.sentiment)}`}>{sentimentLabel(p.sentiment)}</span></td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-point transition-all" style={{ width: `${p.score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-text w-8 text-right">{p.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 경쟁사 비교 + 인기 프롬프트 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">경쟁사 AI 가시성 비교</h2>
          <div className="space-y-2.5">
            {OVERVIEW_COMPETITORS.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-28 truncate text-xs ${i === 0 ? 'font-bold text-text' : 'text-text-sub'}`}>{c.name}</span>
                <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${c.score}%`, background: pc[i] }} />
                </div>
                <span className="text-xs font-bold text-text w-8 text-right">{c.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">주요 프롬프트</h2>
            <Link href="/sc/dashboard/geo/prompts" className="text-[10px] text-text-muted hover:text-text">전체 →</Link>
          </div>
          <div className="space-y-2">
            {TOP_PROMPTS.map((tp, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2">
                <MessageSquare size={12} className="mt-0.5 shrink-0 text-text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-text truncate">&quot;{tp.prompt}&quot;</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[9px] text-text-muted">
                    <span>{tp.platform}</span>
                    <span className={sentimentColor(tp.sentiment)}>{tp.mentioned ? '멘션됨' : '미멘션'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 경쟁사 리서치 탭 ── */
function CompetitorsTab({ pc }: { pc: string[] }) {
  const [newDomain, setNewDomain] = useState('');

  return (
    <div>
      {/* 경쟁사 추가 */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="경쟁사 도메인 추가 (예: competitor.com)"
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-text px-5 py-2.5 text-xs font-semibold text-white hover:bg-accent-sub">
            <Plus size={13} /> 추가
          </button>
        </div>
      </div>

      {/* 점수 비교 차트 */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-text">AI 가시성 점수 비교</h2>
        <BarChart data={COMPETITORS.map((c, i) => ({ label: c.domain.split(' ')[0].replace('(', ''), value: c.overallScore, color: pc[i] }))} height={200} />
      </div>

      {/* 상세 비교 테이블 */}
      <div className="rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">플랫폼별 상세 비교</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="px-5 py-2.5 text-left font-medium">도메인</th>
                <th className="px-5 py-2.5 text-center font-medium">종합</th>
                <th className="px-5 py-2.5 text-center font-medium">ChatGPT</th>
                <th className="px-5 py-2.5 text-center font-medium">Perplexity</th>
                <th className="px-5 py-2.5 text-center font-medium">Gemini</th>
                <th className="px-5 py-2.5 text-center font-medium">Claude</th>
                <th className="px-5 py-2.5 text-center font-medium">추세</th>
                <th className="px-5 py-2.5 text-left font-medium">주요 키워드</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c, i) => (
                <tr key={i} className={`border-b border-border last:border-0 hover:bg-surface ${i === 0 ? 'bg-surface/50' : ''}`}>
                  <td className="px-5 py-3"><span className={`text-xs ${i === 0 ? 'font-bold text-text' : 'text-text-sub'}`}>{c.domain}</span></td>
                  <td className="px-5 py-3 text-center"><span className="text-sm font-bold text-text">{c.overallScore}</span></td>
                  {c.platforms.map(p => (
                    <td key={p.name} className="px-5 py-3 text-center text-xs text-text-sub">{p.score}</td>
                  ))}
                  <td className="px-5 py-3 text-center">
                    {c.trend === 'up' ? <TrendingUp size={14} className="mx-auto text-success" /> : c.trend === 'down' ? <TrendingDown size={14} className="mx-auto text-danger" /> : <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {c.topKeywords.slice(0, 2).map(kw => <span key={kw} className="rounded bg-surface px-1.5 py-0.5 text-[9px] text-text-muted">{kw}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── 브랜드 실적 탭 ── */
function BrandTab({ pc }: { pc: string[] }) {
  return (
    <div>
      {/* KPI */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">브랜드 인식 점수</div>
          <div className="mt-1 text-2xl font-bold text-text">{BRAND_METRICS.overallPerception}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-success"><TrendingUp size={11} /> +4점</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">긍정 비율</div>
          <div className="mt-1 text-2xl font-bold text-success">{BRAND_METRICS.sentimentBreakdown.positive}%</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">중립</div>
          <div className="mt-1 text-2xl font-bold text-text-sub">{BRAND_METRICS.sentimentBreakdown.neutral}%</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">부정</div>
          <div className="mt-1 text-2xl font-bold text-danger">{BRAND_METRICS.sentimentBreakdown.negative}%</div>
        </div>
      </div>

      {/* 차트 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">주간 인식 점수 추이</h2>
          <LineChart data={BRAND_METRICS.weeklyTrend} height={200} color={pc[0]} />
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">감성 분포</h2>
          <DonutChart
            data={[
              { label: '긍정', value: BRAND_METRICS.sentimentBreakdown.positive, color: '#059669' },
              { label: '중립', value: BRAND_METRICS.sentimentBreakdown.neutral, color: '#9CA3AF' },
              { label: '부정', value: BRAND_METRICS.sentimentBreakdown.negative, color: '#DC2626' },
            ]}
            size={160} centerLabel="인식 점수" centerValue={String(BRAND_METRICS.overallPerception)}
          />
        </div>
      </div>

      {/* 내러티브 요인 */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-text">내러티브 요인 분석</h2>
        <p className="mb-3 text-xs text-text-muted">AI가 브랜드를 설명할 때 어떤 요인을 강조하는지 분석합니다</p>
        <div className="space-y-3">
          {NARRATIVES.map((n, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-36 shrink-0 text-xs font-medium text-text">{n.factor}</span>
              <div className="flex-1 h-3 rounded-full bg-surface overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${n.score}%`, background: n.score >= 70 ? '#059669' : n.score >= 50 ? '#D97706' : '#DC2626' }} />
              </div>
              <span className="w-8 text-right text-xs font-bold text-text">{n.score}</span>
              <span className={`w-10 text-right text-[9px] font-semibold ${n.impact === 'high' ? 'text-success' : n.impact === 'medium' ? 'text-warning' : 'text-text-muted'}`}>
                {n.impact === 'high' ? '높음' : n.impact === 'medium' ? '보통' : '낮음'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 사용자 질문 */}
      <div className="rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">브랜드 관련 질문</h2>
          <p className="text-[10px] text-text-muted mt-0.5">사용자들이 AI에게 브랜드에 대해 묻는 질문</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="px-5 py-2.5 text-left font-medium">질문</th>
              <th className="px-5 py-2.5 text-center font-medium">빈도</th>
              <th className="px-5 py-2.5 text-center font-medium">정확한 응답</th>
            </tr>
          </thead>
          <tbody>
            {TOP_QUESTIONS.map((q, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="px-5 py-3">
                  <div className="flex items-start gap-2">
                    <HelpCircle size={12} className="mt-0.5 shrink-0 text-text-muted" />
                    <span className="text-xs text-text">&quot;{q.question}&quot;</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-center text-xs text-text-sub">월 {q.frequency}회</td>
                <td className="px-5 py-3 text-center">
                  {q.answered ? <ThumbsUp size={13} className="mx-auto text-success" /> : <ThumbsDown size={13} className="mx-auto text-danger" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
