'use client';

import { use, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, AlertTriangle, CheckCircle2, XCircle,
  ExternalLink, Clock, Target, ChevronRight, Lock,
  Download, Share2, Printer, Gauge, Zap, Timer,
  Lightbulb, Loader2, Bot, ShieldCheck, Search
} from 'lucide-react';
import Header from '@/features/smarcomm/Header';
import Footer from '@/features/smarcomm/Footer';
import GaugeChart from '@/features/smarcomm/GaugeChart';
import RadarChart from '@/features/smarcomm/RadarChart';
import { useAuth } from '@/lib/auth-context';
import { analyzeBrandPersonality } from '@/lib/smarcomm/brand-personality';
import { GRADE_META, type IndexBreakdown, type Grade } from '@/lib/smarcomm/index-calculator';

const GRADE_MAP = {
  excellent: { color: '#059669', label: 'Excellent', message: 'AI 시대 검색 준비 완료' },
  good: { color: '#D97706', label: 'Good', message: '기본은 갖췄지만 개선 여지 있음' },
  needs_work: { color: '#EA580C', label: 'Needs Work', message: '놓치고 있는 기회가 많음' },
  critical: { color: '#DC2626', label: 'Critical', message: '지금 고객을 잃고 있을 가능성 높음' },
} as const;

type Status = 'pass' | 'warning' | 'fail';

function StatusIcon({ status }: { status: Status }) {
  if (status === 'pass') return <CheckCircle2 size={15} className="text-success" />;
  if (status === 'warning') return <AlertTriangle size={15} className="text-warning" />;
  return <XCircle size={15} className="text-danger" />;
}

/** 자연스러운 페이드아웃: freeCount개 이후 서서히 투명해짐 */
function FadeList({ children, freeCount = 3 }: { children: React.ReactNode[]; freeCount?: number }) {
  return (
    <div className="space-y-2">
      {children.map((child, i) => {
        if (i < freeCount) return <div key={i}>{child}</div>;
        // freeCount 이후 점점 투명해짐
        const fadeStep = i - freeCount;
        const opacity = Math.max(0.08, 0.6 - fadeStep * 0.2);
        return (
          <div key={i} style={{ opacity, pointerEvents: 'none', userSelect: 'none' }}>
            {child}
          </div>
        );
      })}
    </div>
  );
}

interface ScanData {
  url: string;
  faviconUrl?: string;
  fetchTime: number;
  statusCode: number;
  totalScore: number;
  seoScore: number;
  geoScore: number;
  grade: keyof typeof GRADE_MAP;
  techSeo: { name: string; score: number; maxScore: number; status: Status; description: string; action: string }[];
  contentSeo: { name: string; score: number; maxScore: number; status: Status; description: string; action: string }[];
  geoChecks: { platform: string; mentioned: boolean; details: string }[];
  geoReadiness: { name: string; score: number; maxScore: number; status: Status; description: string; action: string }[];
  performanceScore?: number;
  performance?: { score: number; lcp: number; cls: number; tbt: number; fcp: number; si: number };
  topIssues: { severity: string; title: string; description: string; action: string }[];
  pageSpeedData?: boolean;
  subPages?: { url: string; title: string; issues: { title: string; severity: string }[] }[];
  pagesAnalyzed?: number;
  deep?: {
    keywords: { keyword: string; relevance: string; found: boolean; suggestion: string }[];
    contentGaps: { topic: string; reason: string; priority: string; suggestedFormat: string }[];
    competitorHints: string[];
    actionPlan: { priority: number; category: string; action: string; impact: string; effort: string }[];
    pageDetails: {
      title: string; metaDescription: string; h1List: string[];
      ogTitle: string; ogDescription: string; ogImage: string;
      canonical: string; lang: string;
      imgCount: number; imgWithAlt: number; linkCount: number; textLength: number;
    };
  };
  // SmarComm Index breakdown (Phase 1 신규)
  breakdown?: IndexBreakdown;
  // 메타데이터 (DB 기반)
  createdAt?: string;
  domain?: string;
  shortId?: string;
  // AI Probe 실측 결과 (Phase 2)
  aiProbes?: AIProbeRow[];
}

interface AIProbeRow {
  platform: 'claude' | 'chatgpt' | 'perplexity' | 'naver-cue' | 'google-aio';
  category: string;
  query: string;
  raw_response: string;
  citations: Array<{ url: string; title?: string }> | null;
  mentioned: boolean;
  position: number | null;
  accuracy: 'exact' | 'partial' | 'wrong' | 'absent';
  measured_at: string;
  // Phase 2.5 — fact comparison
  extracted_facts?: Record<string, unknown>;
  fact_comparison?: Array<{ field: string; match: 'exact' | 'partial' | 'wrong' | 'missing'; siteValue?: string; aiValue?: string }>;
}

const ACCURACY_META: Record<AIProbeRow['accuracy'], { label: string; color: string; emoji: string }> = {
  exact:   { label: '정확',  color: '#22C55E', emoji: '✓' },
  partial: { label: '부분',  color: '#F59E0B', emoji: '△' },
  wrong:   { label: '오답',  color: '#DC2626', emoji: '✗' },
  absent:  { label: '미언급', color: '#9CA3AF', emoji: '—' },
};

const AI_PLATFORM_LABELS: Record<AIProbeRow['platform'], { label: string; provider: string }> = {
  'claude':      { label: 'Claude',              provider: 'Anthropic' },
  'chatgpt':     { label: 'ChatGPT',             provider: 'OpenAI' },
  'perplexity':  { label: 'Perplexity',          provider: 'Perplexity' },
  'naver-cue':   { label: '네이버 Cue',          provider: 'Naver' },
  'google-aio':  { label: 'Google AI Overview',  provider: 'Google' },
};

const CATEGORY_LABELS: Record<string, string> = {
  'brand_direct': '브랜드 직접',
  'product_generic': '제품군',
  'use_case': '사용 사례',
  'competitor': '경쟁사 비교',
  'pricing': '가격·플랜',
  'howto': '방법·가이드',
  'local': '지역·시장',
};

function getScoreComment(score: number, maxScore: number): string {
  const pct = score / maxScore;
  if (pct >= 0.9) return '최적 상태입니다';
  if (pct >= 0.7) return '양호하지만 개선 여지가 있습니다';
  if (pct >= 0.4) return '보통 수준 — 개선이 필요합니다';
  return '미흡 — 우선 개선이 필요합니다';
}

function QuestionCard({
  icon, color, question, score, sub, borderLeft,
}: {
  icon: React.ReactNode;
  color: string;
  question: string;
  score: number;
  sub: string;
  borderLeft?: boolean;
}) {
  // 점수에 따라 신호등 색상
  const indicator = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
  return (
    <div className={`flex flex-col gap-2 px-5 py-4 ${borderLeft ? 'md:border-l md:border-border' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${color}15`, color }}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{sub}</p>
        </div>
      </div>
      <p className="text-sm font-medium text-text leading-snug">{question}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-xs text-text-muted">/ 100</span>
        <span className="ml-auto text-base">{indicator}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

// Phase 3 — UI 타입
interface SchemaSuggestionUI {
  type: string;
  label: string;
  description: string;
  alreadyApplied: boolean;
  priority: 'critical' | 'high' | 'recommended';
  snippet: string;
  placeholders: string[];
}

interface ActionItemUI {
  title: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  quadrant: 'quick-win' | 'major' | 'fill-in' | 'avoid';
  role: 'marketer' | 'dev' | 'writer' | 'designer';
  estimatedPoints: number;
  action: string;
  description: string;
}

const ROLE_META: Record<ActionItemUI['role'], { label: string; emoji: string; color: string }> = {
  marketer: { label: '마케팅', emoji: '🎯', color: '#3B82F6' },
  dev:      { label: '개발팀', emoji: '💻', color: '#A855F7' },
  writer:   { label: '콘텐츠', emoji: '✍️', color: '#10B981' },
  designer: { label: '디자이너', emoji: '🎨', color: '#F59E0B' },
};

const QUADRANT_META: Record<ActionItemUI['quadrant'], { label: string; color: string; description: string }> = {
  'quick-win': { label: '퀵윈', color: '#22C55E', description: '높은 임팩트 · 낮은 노력 — 즉시 실행' },
  'major':     { label: '핵심 투자', color: '#3B82F6', description: '높은 임팩트 · 노력 큼 — 중장기' },
  'fill-in':   { label: '채우기', color: '#F59E0B', description: '낮은 임팩트 · 낮은 노력 — 여유 시' },
  'avoid':     { label: '후순위', color: '#9CA3AF', description: '낮은 임팩트 · 노력 큼 — 보류' },
};

/** Action Plan Impact×Effort 2×2 매트릭스 — Phase 3.3 */
function ActionMatrix({ actions }: { actions: ActionItemUI[] }) {
  const byQuadrant: Record<ActionItemUI['quadrant'], ActionItemUI[]> = {
    'quick-win': [], 'major': [], 'fill-in': [], 'avoid': [],
  };
  for (const a of actions) byQuadrant[a.quadrant].push(a);

  const totalPotential = actions.reduce((s, a) => s + a.estimatedPoints, 0);

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[15px] font-bold text-text">Action Plan</h2>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Impact × Effort</span>
        <span className="ml-auto text-[10px] text-text-muted">모두 적용 시 예상 +{totalPotential}점</span>
      </div>
      <p className="mb-4 text-xs text-text-muted">
        진단에서 발견된 개선 항목을 임팩트와 노력으로 분류 + 누구에게 부탁할지 + 예상 점수 변화 (출처: 자체 SSOT)
      </p>

      <div className="grid grid-cols-2 gap-3">
        {(['quick-win', 'major', 'fill-in', 'avoid'] as ActionItemUI['quadrant'][]).map(q => {
          const items = byQuadrant[q];
          const meta = QUADRANT_META[q];
          return (
            <div key={q} className="rounded-xl border-2 bg-white p-3" style={{ borderColor: `${meta.color}30` }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: meta.color }}>
                  {meta.label}
                </span>
                <span className="text-[10px] text-text-muted">{meta.description}</span>
                <span className="ml-auto text-[10px] tabular-nums text-text-sub">{items.length}건</span>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-text-muted py-2">해당 없음 — 모두 통과</p>
              ) : (
                <div className="space-y-2">
                  {items.slice(0, 5).map((a, i) => {
                    const role = ROLE_META[a.role];
                    return (
                      <div key={i} className="rounded-lg bg-surface/30 p-2 text-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-medium text-text truncate flex-1">{a.title}</span>
                          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: `${role.color}15`, color: role.color }}>
                            {role.emoji} {role.label}
                          </span>
                          <span className="text-[9px] font-bold text-success tabular-nums">+{a.estimatedPoints}</span>
                        </div>
                        <p className="text-[10px] text-text-muted line-clamp-2">{a.action}</p>
                      </div>
                    );
                  })}
                  {items.length > 5 && <p className="text-[10px] text-text-muted">+{items.length - 5}건 더</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Schema 자동 생성기 — Phase 3.1 */
function SchemaGenerator({ suggestions }: { suggestions: SchemaSuggestionUI[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (snippet: string, type: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* silent */ }
  };

  const missing = suggestions.filter(s => !s.alreadyApplied);
  const applied = suggestions.filter(s => s.alreadyApplied);

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[15px] font-bold text-text">Schema 자동 생성기</h2>
        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">바로 복사</span>
        <span className="ml-auto text-[10px] text-text-muted">{applied.length}/{suggestions.length} 적용 · {missing.length} 신규 추천</span>
      </div>
      <p className="mb-4 text-xs text-text-muted">
        분석 결과 기반으로 권장 JSON-LD를 자동 생성. <b>__필드명__</b> placeholder만 실제 값으로 교체 후 &lt;head&gt;에 삽입 (출처: Schema.org + Google Rich Results 요건)
      </p>

      <div className="space-y-2">
        {suggestions.map(s => {
          const isExpanded = expanded === s.type;
          const isCopied = copied === s.type;
          const priorityColor = s.priority === 'critical' ? '#DC2626' : s.priority === 'high' ? '#F59E0B' : '#9CA3AF';
          return (
            <div key={s.type} className="rounded-xl border border-border bg-white p-3">
              <div className="flex items-center gap-2">
                {s.alreadyApplied ? <CheckCircle2 size={14} className="text-success" /> : <AlertTriangle size={14} style={{ color: priorityColor }} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-text">{s.label}</span>
                    {!s.alreadyApplied && (
                      <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ background: `${priorityColor}15`, color: priorityColor }}>
                        {s.priority === 'critical' ? '필수' : s.priority === 'high' ? '권장' : '추천'}
                      </span>
                    )}
                    {s.alreadyApplied && <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[9px] font-bold text-success uppercase">적용됨</span>}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{s.description}</p>
                </div>
                <button
                  onClick={() => handleCopy(s.snippet, s.type)}
                  className="px-2 py-1 rounded-md border border-border text-[10px] font-medium hover:bg-surface text-text-sub"
                >
                  {isCopied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button
                  onClick={() => setExpanded(isExpanded ? null : s.type)}
                  className="text-[10px] text-text-muted hover:text-text"
                >
                  {isExpanded ? '▾' : '▸'}
                </button>
              </div>
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {s.placeholders.length > 0 && (
                    <div className="rounded bg-warning/5 border border-warning/20 p-2 text-[10px]">
                      <span className="font-bold text-warning">교체 필요: </span>
                      <span className="text-text-sub">{s.placeholders.join(' · ')}</span>
                    </div>
                  )}
                  <pre className="rounded bg-surface p-2 text-[10px] overflow-x-auto">
                    <code className="text-text">{s.snippet}</code>
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Trend 차트 — Phase 3.2 (도메인 시계열) */
function TrendChart({ shortId }: { shortId: string }) {
  const [scans, setScans] = useState<Array<{ short_id: string; smarcomm_index: number; findability_score: number; trust_score: number; citability_score: number; grade: string; created_at: string }> | null>(null);

  useEffect(() => {
    fetch(`/api/smarcomm/report/${shortId}/trend`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => setScans(d?.scans ?? []))
      .catch(() => setScans([]));
  }, [shortId]);

  if (!scans || scans.length < 2) return null;  // 1회만 진단한 도메인은 차트 표시 안 함

  const max = 100;
  const W = 600, H = 160;
  const points = scans.map((s, i) => ({
    x: (i / Math.max(1, scans.length - 1)) * W,
    y: H - (s.smarcomm_index / max) * H,
    s,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const current = scans[scans.length - 1];
  const previous = scans[scans.length - 2];
  const delta = current.smarcomm_index - previous.smarcomm_index;

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[15px] font-bold text-text">Trend (시계열 추이)</h2>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">{scans.length}회 진단</span>
        {delta !== 0 && (
          <span className={`text-xs font-bold tabular-nums ${delta > 0 ? 'text-success' : 'text-danger'}`}>
            {delta > 0 ? '↑' : '↓'} {Math.abs(delta)} 점
          </span>
        )}
      </div>
      <div className="rounded-xl border border-border bg-white p-4">
        <svg viewBox={`0 0 ${W + 40} ${H + 40}`} className="w-full h-40">
          {[0, 25, 50, 75, 100].map(v => (
            <g key={v}>
              <line x1={20} x2={W + 20} y1={H - (v / max) * H + 10} y2={H - (v / max) * H + 10} stroke="#E5E7EB" strokeDasharray="2 2" />
              <text x={0} y={H - (v / max) * H + 13} fontSize="9" fill="#9CA3AF">{v}</text>
            </g>
          ))}
          <path d={pathD} transform="translate(20 10)" stroke="#3B82F6" strokeWidth="2" fill="none" />
          {points.map((p, i) => (
            <g key={i} transform={`translate(${20 + p.x} ${10 + p.y})`}>
              <circle r="4" fill="#3B82F6" />
              <text x={0} y={-8} fontSize="9" fill="#374151" textAnchor="middle">{p.s.smarcomm_index}</text>
            </g>
          ))}
          <g>
            {points.map((p, i) => (
              <text key={i} x={20 + p.x} y={H + 25} fontSize="9" fill="#9CA3AF" textAnchor="middle">
                {new Date(p.s.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

/** AI Visibility Map — Phase 2 핵심 차별점.
 *  5 AI 플랫폼 × 카테고리별 노출 매트릭스 + 실제 응답 expandable */
function AIVisibilityMap({ aiProbes }: { aiProbes: AIProbeRow[] }) {
  // 1) 플랫폼별 그룹핑
  const byPlatform: Record<string, AIProbeRow[]> = {};
  for (const a of aiProbes) {
    (byPlatform[a.platform] ||= []).push(a);
  }
  const platforms = Object.keys(byPlatform) as AIProbeRow['platform'][];

  // 2) 카테고리 셋
  const categories = Array.from(new Set(aiProbes.map(a => a.category)));

  // 3) 카테고리별 노출률 (across all platforms)
  const categoryStats = categories.map(cat => {
    const inCat = aiProbes.filter(a => a.category === cat);
    const mentioned = inCat.filter(a => a.mentioned);
    const platformsHere = Array.from(new Set(mentioned.map(a => a.platform)));
    return {
      category: cat,
      total: inCat.length,
      mentioned: mentioned.length,
      rate: inCat.length > 0 ? mentioned.length / inCat.length : 0,
      platforms: platformsHere,
    };
  }).sort((a, b) => b.rate - a.rate);

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[15px] font-bold text-text">AI Visibility Map</h2>
        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">실측</span>
        <span className="ml-auto text-[10px] text-text-muted">총 {aiProbes.length}개 질문 · {platforms.length} 플랫폼</span>
      </div>
      <p className="mb-4 text-xs text-text-muted">
        5 AI 플랫폼에 실제 카테고리별 질문을 던져 우리 브랜드 언급 여부를 측정 — 추정 0%, 실측 100% (출처: 각 AI Provider API)
      </p>

      {/* 답변 일관성 요약 — Phase 2.5 */}
      {(() => {
        const mentionedProbes = aiProbes.filter(p => p.mentioned);
        if (mentionedProbes.length === 0) return null;
        const accCounts = { exact: 0, partial: 0, wrong: 0, absent: 0 };
        for (const p of mentionedProbes) accCounts[p.accuracy] = (accCounts[p.accuracy] || 0) + 1;
        const consistencyScore = mentionedProbes.length > 0
          ? Math.round(((accCounts.exact * 1.0 + accCounts.partial * 0.5 + accCounts.wrong * -0.5) / mentionedProbes.length) * 100)
          : 0;
        const cColor = consistencyScore >= 70 ? '#22C55E' : consistencyScore >= 40 ? '#F59E0B' : '#DC2626';
        return (
          <div className="mb-5 rounded-xl border-2 bg-white p-4" style={{ borderColor: `${cColor}40` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">답변 일관성</span>
              <span className="text-[10px] text-text-muted opacity-70">AI가 우리 사실을 정확히 말하는가</span>
              <span
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted"
                title="자사 사이트의 가격·강점 사실을 AI가 정확히 인용하는지 측정"
              >
                🔬 출처: 자사 schema/meta vs AI 응답 NLP 추출
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tabular-nums" style={{ color: cColor }}>{consistencyScore}</span>
              <span className="text-xs text-text-muted">/ 100</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-[10px]">
              <div className="rounded bg-success/10 px-2 py-1">
                <span className="font-bold text-success">{accCounts.exact}</span>
                <span className="ml-1 text-text-muted">정확</span>
              </div>
              <div className="rounded bg-warning/10 px-2 py-1">
                <span className="font-bold text-warning">{accCounts.partial}</span>
                <span className="ml-1 text-text-muted">부분</span>
              </div>
              <div className="rounded bg-danger/10 px-2 py-1">
                <span className="font-bold text-danger">{accCounts.wrong}</span>
                <span className="ml-1 text-text-muted">오답</span>
              </div>
              <div className="rounded bg-surface px-2 py-1">
                <span className="font-bold text-text-muted">{accCounts.absent}</span>
                <span className="ml-1 text-text-muted">미언급</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 카테고리별 노출률 바 차트 */}
      <div className="mb-5 rounded-xl border border-border bg-white p-5">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-text-muted">
          카테고리별 노출 비율
        </div>
        <div className="space-y-2">
          {categoryStats.map(s => {
            const color = s.rate >= 0.6 ? '#22C55E' : s.rate >= 0.3 ? '#F59E0B' : '#DC2626';
            return (
              <div key={s.category} className="flex items-center gap-3">
                <div className="w-24 text-xs font-medium text-text">{CATEGORY_LABELS[s.category] || s.category}</div>
                <div className="flex-1 h-3 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(s.rate * 100, 4)}%`, background: color }} />
                </div>
                <div className="text-xs tabular-nums text-text-sub w-16 text-right">{s.mentioned}/{s.total}</div>
                <div className="text-xs text-text-muted w-12 text-right">{Math.round(s.rate * 100)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 플랫폼별 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {platforms.map(pf => {
          const probes = byPlatform[pf];
          const meta = AI_PLATFORM_LABELS[pf];
          const mentioned = probes.filter(p => p.mentioned).length;
          const rate = probes.length > 0 ? mentioned / probes.length : 0;
          const isExpanded = expanded === pf;
          return (
            <div key={pf} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text">{meta.label}</span>
                <span className="text-[10px] text-text-muted">{meta.provider}</span>
                <span className="ml-auto text-xs tabular-nums text-text-sub">
                  {mentioned}/{probes.length} 언급 · {Math.round(rate * 100)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(rate * 100, 4)}%`,
                    background: rate >= 0.6 ? '#22C55E' : rate >= 0.3 ? '#F59E0B' : '#DC2626',
                  }}
                />
              </div>
              <button
                onClick={() => setExpanded(isExpanded ? null : pf)}
                className="mt-3 text-[11px] text-text-sub hover:text-text"
              >
                {isExpanded ? '▾ 응답 숨기기' : `▸ ${probes.length}개 응답 펼치기`}
              </button>
              {isExpanded && (
                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                  {probes.map((p, i) => {
                    const acc = ACCURACY_META[p.accuracy];
                    const ef = p.extracted_facts as { facts?: unknown; comparison?: Array<{ field: string; match: string; siteValue?: string; aiValue?: string }> } | null;
                    return (
                    <div key={i} className="rounded-lg border border-border bg-surface/30 p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted">
                          {CATEGORY_LABELS[p.category] || p.category}
                        </span>
                        {p.mentioned ? (
                          <span className="text-[9px] text-success">✓ 언급{p.position ? ` (순위 ${p.position})` : ''}</span>
                        ) : (
                          <span className="text-[9px] text-text-muted">⛔ 미언급</span>
                        )}
                        {p.mentioned && (
                          <span
                            className="ml-auto inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                            style={{ background: `${acc.color}15`, color: acc.color }}
                            title={`사실 정확도: ${acc.label}`}
                          >
                            <span>{acc.emoji}</span>
                            <span>{acc.label}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-text mb-1">"{p.query}"</p>
                      <p className="text-[10px] text-text-muted leading-relaxed line-clamp-5">{p.raw_response}</p>
                      {ef?.comparison && ef.comparison.length > 0 && (
                        <div className="mt-1.5 rounded border border-border bg-white p-1.5 space-y-0.5">
                          <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">사실 비교</div>
                          {ef.comparison.map((c, j) => {
                            const mColor = c.match === 'exact' ? '#22C55E' : c.match === 'partial' ? '#F59E0B' : c.match === 'wrong' ? '#DC2626' : '#9CA3AF';
                            const mLabel = c.match === 'exact' ? '✓' : c.match === 'partial' ? '△' : c.match === 'wrong' ? '✗' : '○';
                            return (
                              <div key={j} className="flex items-center gap-1.5 text-[9px]">
                                <span style={{ color: mColor }} className="font-bold">{mLabel}</span>
                                <span className="text-text-muted">{c.field}:</span>
                                {c.siteValue && <span className="text-text">우리 "{c.siteValue}"</span>}
                                {c.aiValue && <span className="text-text-muted">vs AI "{c.aiValue}"</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {p.citations && p.citations.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.citations.slice(0, 3).map((c, j) => (
                            <a key={j} href={c.url} target="_blank" rel="noopener" className="text-[9px] text-accent underline truncate max-w-[200px]">
                              🔗 {c.title || new URL(c.url).hostname}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EEATCell({ label, sub, value }: { label: string; sub: string; value: number | null }) {
  const isNA = value == null;
  const color = isNA ? '#9CA3AF' : value >= 80 ? '#22C55E' : value >= 60 ? '#3B82F6' : value >= 40 ? '#F59E0B' : '#DC2626';
  return (
    <div className="rounded-lg border border-border bg-surface/30 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{label}</div>
      <div className="text-[9px] text-text-muted opacity-70">{sub}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-base font-bold tabular-nums" style={{ color }}>{isNA ? 'N/A' : value}</span>
        {!isNA && <span className="text-[10px] text-text-muted">/100</span>}
      </div>
      {!isNA && (
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

/** description에서 "(출처: ___)" 패턴을 추출 — 본문과 분리 표시 */
function splitSource(description: string): { body: string; source: string | null } {
  const match = description.match(/\s*\(출처:\s*([^)]+)\)\s*$/);
  if (!match) return { body: description, source: null };
  return { body: description.slice(0, match.index).trim(), source: match[1].trim() };
}

function SeoItemRow({ item }: { item: { name: string; score: number; maxScore: number; status: Status; description: string; action: string } }) {
  // T4_UNKNOWN — maxScore 0 → N/A 표시
  const isNA = item.maxScore === 0;
  const { body, source } = splitSource(item.description);
  return (
    <div className="rounded-xl border border-border bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        {isNA
          ? <span className="text-text-muted text-xs font-bold" title="측정 불가">N/A</span>
          : <StatusIcon status={item.status} />
        }
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text">{item.name}</div>
          <div className="text-xs text-text-muted">{body}</div>
          {source && (
            <div
              className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-muted"
              title={`이 측정의 권위 출처: ${source}`}
            >
              <span className="opacity-60">🔬</span>
              <span>출처: {source}</span>
            </div>
          )}
        </div>
        <div className="text-sm font-semibold text-text-sub whitespace-nowrap">
          {isNA ? '측정 불가' : `${item.score}/${item.maxScore}`}
        </div>
      </div>
      {!isNA && (
        <div className="mt-2 ml-8 text-xs text-text-muted">
          {getScoreComment(item.score, item.maxScore)}
          {item.status !== 'pass' && <span className="text-text-sub"> → {item.action}</span>}
        </div>
      )}
      {isNA && (
        <div className="mt-2 ml-8 text-xs text-text-muted">
          {item.action}
        </div>
      )}
    </div>
  );
}

function ReportContent({ scanId }: { scanId: string }) {
  const router = useRouter();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFloating, setShowFloating] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const { isAuthenticated: isLoggedIn } = useAuth();
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const handleGenerateCampaignPlan = async () => {
    const stored = sessionStorage.getItem(`scan_${scanId}`);
    if (!stored) return;
    setGeneratingPlan(true);
    try {
      const res = await fetch('/api/advisor/campaign-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult: JSON.parse(stored) }),
      });
      if (res.ok) {
        const plan = await res.json();
        sessionStorage.setItem('campaignPlan', JSON.stringify(plan));
        router.push('/dashboard/advisor');
      }
    } catch (e) {
      console.error('Campaign plan generation failed:', e);
    }
    setGeneratingPlan(false);
  };

  useEffect(() => {
    // 1) DB에서 short_id로 조회 (영구 저장된 보고서)
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/smarcomm/report/${scanId}`, { cache: 'no-store' });
        if (aborted) return;
        if (res.ok) {
          const { scan: dbScan, aiProbes } = await res.json();
          if (dbScan?.analysis) {
            // analysis JSONB = AnalysisResult 전체 + breakdown 별도
            setScan({
              ...dbScan.analysis,
              breakdown: dbScan.breakdown,
              createdAt: dbScan.created_at,
              domain: dbScan.domain,
              shortId: dbScan.short_id,
              aiProbes: aiProbes ?? [],
            });
            setLoading(false);
            return;
          }
        }
      } catch {
        /* fall through to sessionStorage */
      }
      // 2) Fallback — 옛 세션 스토리지 기반 (구버전 호환)
      const stored = sessionStorage.getItem(`scan_${scanId}`);
      if (!aborted && stored) setScan(JSON.parse(stored));
      if (!aborted) setLoading(false);
    })();
    return () => { aborted = true; };
  }, [scanId]);

  useEffect(() => {
    const handler = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setShowFloating(pct > 0.15);
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-text-muted">리포트 로딩 중...</div>;

  if (!scan) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center px-5 pt-14">
          <h1 className="mb-2 text-xl font-bold text-text">리포트를 찾을 수 없습니다</h1>
          <p className="mb-6 text-sm text-text-sub">스캔 결과가 만료되었거나 존재하지 않습니다.</p>
          <Link href="/" className="rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-white">새 점검 시작</Link>
        </main>
      </>
    );
  }

  const grade = GRADE_MAP[scan.grade];
  const techSeoTotal = scan.techSeo.reduce((s, i) => s + i.score, 0);
  const techSeoMax = scan.techSeo.reduce((s, i) => s + i.maxScore, 0);
  const contentSeoTotal = scan.contentSeo.reduce((s, i) => s + i.score, 0);
  const contentSeoMax = scan.contentSeo.reduce((s, i) => s + i.maxScore, 0);
  const displayDomain = scan.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-24 pt-20">
        <div className="mx-auto max-w-3xl">
          {/* Top Nav */}
          <div className="mb-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text">
              <ArrowLeft size={15} /> 새 점검
            </Link>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Clock size={11} /> {scan.fetchTime}ms</span>
              <span>HTTP {scan.statusCode}</span>
            </div>
          </div>

          {/* Report Header — 로고 왼쪽 + 타이틀 + 액션 */}
          <div className="mb-6 flex items-center gap-5 rounded-2xl border border-border bg-white px-6 py-5">
            {/* 왼쪽: 로고 + 도메인 */}
            <div className="flex flex-col items-center">
              {scan.faviconUrl && !faviconError ? (
                <img src={scan.faviconUrl} alt="" width={48} height={48} className="rounded-xl" onError={() => setFaviconError(true)} />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-base font-bold text-text-sub">
                  {displayDomain.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="mt-1.5 text-xs font-medium text-text-sub">{displayDomain}</div>
            </div>

            {/* 가운데: SmarComm. Index */}
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold tracking-tight text-text md:text-3xl">
                <span className="font-light">Smar</span>Comm<span className="text-text-sub">.</span> Index
              </div>
              <p className="mt-0.5 text-xs text-text-muted">스마트한 마케팅 커뮤니케이션은 진단에서 시작됩니다</p>
            </div>

            {/* 오른쪽: 액션 */}
            <div className="flex items-center gap-1.5">
              <button onClick={() => window.print()} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface" title="프린트 / PDF 저장">
                <Printer size={14} />
              </button>
              <button onClick={() => {
                const text = `${displayDomain} SmarComm. Index: ${scan.totalScore}점 (${grade.label})`;
                if (navigator.share) { navigator.share({ title: 'SmarComm. Index', text, url: window.location.href }); }
                else { navigator.clipboard.writeText(`${text}\n${window.location.href}`); alert('링크가 복사되었습니다'); }
              }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface" title="공유">
                <Share2 size={14} />
              </button>
              <button onClick={() => window.print()} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface" title="PDF 저장">
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* SmarComm Index Hero — Phase 1 (CLAUDE.md § 3-A SSOT) */}
          {scan.breakdown ? (
            <>
            <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-white">
              {/* 점수 + 등급 */}
              <div className="flex flex-col items-center bg-gradient-to-b from-surface/40 to-white px-6 py-8">
                <div className="relative">
                  <GaugeChart
                    score={scan.breakdown.index}
                    label="SmarComm Index"
                    color={GRADE_META[scan.breakdown.grade as Grade].color}
                    size={180}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: GRADE_META[scan.breakdown.grade as Grade].color }}
                  >
                    {scan.breakdown.grade}
                  </span>
                  <span className="text-sm font-medium text-text">{GRADE_META[scan.breakdown.grade as Grade].description}</span>
                </div>
              </div>

              {/* 마케터 4 질문 */}
              <div className="border-t border-border bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <QuestionCard
                    icon={<Search size={16} />}
                    color="#3B82F6"
                    question="고객이 우리를 찾을 수 있나?"
                    score={scan.breakdown.findability}
                    sub="Findability"
                  />
                  <QuestionCard
                    icon={<ShieldCheck size={16} />}
                    color="#A855F7"
                    question="고객이 신뢰할 만한가?"
                    score={scan.breakdown.trust}
                    sub="Trust"
                    borderLeft
                  />
                  <QuestionCard
                    icon={<Bot size={16} />}
                    color="#10B981"
                    question="AI가 우리를 추천하는가?"
                    score={scan.breakdown.citability}
                    sub="Citability · 가중치 40%"
                    borderLeft
                  />
                </div>
              </div>

              {/* E-E-A-T 4 sub-score — Google QRG § 3 SSOT */}
              {scan.breakdown.eeat && (
                <div className="border-t border-border bg-white px-6 py-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">E-E-A-T 분해</span>
                    <span className="text-[10px] text-text-muted opacity-60">(Trust 내부 4축)</span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted ml-auto"
                      title="Google Search Quality Rater Guidelines § 3.1~3.4 (2024) — Experience·Expertise·Authoritativeness·Trustworthiness"
                    >
                      🔬 출처: Google QRG 2024
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <EEATCell label="Experience" sub="직접 경험" value={scan.breakdown.eeat.experience} />
                    <EEATCell label="Expertise" sub="전문성" value={scan.breakdown.eeat.expertise} />
                    <EEATCell label="Authoritativeness" sub="권위 (Phase 4)" value={scan.breakdown.eeat.authoritativeness} />
                    <EEATCell label="Trustworthiness" sub="신뢰" value={scan.breakdown.eeat.trustworthiness} />
                  </div>
                </div>
              )}

              {/* 산출 근거 */}
              <div className="border-t border-border bg-surface/30 px-6 py-3 text-center">
                <p className="text-[11px] text-text-muted">
                  Index = Findability × 30% + Trust × 30% + Citability × 40%
                  {scan.performanceScore !== undefined && ` · PageSpeed ${scan.performanceScore}점 (참고)`}
                </p>
              </div>
            </div>

            {/* Phase 3.4 — Executive Summary (30초 요약) */}
            {scan.breakdown.execSummary && (
              <div className="mb-6 rounded-2xl border border-border bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">30초 요약</span>
                  <span
                    className="ml-auto inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted"
                    title="Claude Haiku 4.5로 진단 결과 자동 요약"
                  >
                    🔬 AI 자동 요약 (Claude Haiku)
                  </span>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex gap-2">
                    <span className="text-success text-base shrink-0">✅</span>
                    <span className="text-text"><b className="text-success">잘된 것:</b> {scan.breakdown.execSummary.winning}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-danger text-base shrink-0">⚠</span>
                    <span className="text-text"><b className="text-danger">문제:</b> {scan.breakdown.execSummary.problem}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-accent text-base shrink-0">🎯</span>
                    <span className="text-text"><b className="text-accent">다음 행동:</b> {scan.breakdown.execSummary.nextAction}</span>
                  </div>
                </div>
              </div>
            )}
            </>
          ) : (
            // Fallback — 옛 보고서 (breakdown 없음)
            <div className="mb-8 rounded-2xl border border-border bg-white p-6">
              <div className="flex flex-wrap items-center justify-center gap-8">
                <GaugeChart score={scan.seoScore} label="SEO" color="#6B7280" size={100} />
                <GaugeChart score={scan.geoScore} label="GEO" color="#6B7280" size={100} />
                {scan.performanceScore !== undefined && (
                  <GaugeChart score={scan.performanceScore} label="Performance" color={scan.performanceScore >= 90 ? '#059669' : scan.performanceScore >= 50 ? '#D97706' : '#DC2626'} size={100} />
                )}
                <GaugeChart score={scan.totalScore} label="종합" color={grade.color} size={130} />
              </div>
              <div className="mt-4 text-center">
                <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${grade.color}12`, color: grade.color, border: `1px solid ${grade.color}30` }}>
                  {grade.label}
                </span>
                <p className="mt-2 text-sm text-text-sub">{grade.message}</p>
              </div>
            </div>
          )}

          {/* Phase 3.3 — Action Plan (Impact × Effort) */}
          {scan.breakdown?.actionPlan && scan.breakdown.actionPlan.length > 0 && (
            <ActionMatrix actions={scan.breakdown.actionPlan} />
          )}

          {/* Phase 3.1 — Schema 자동 생성기 */}
          {scan.breakdown && Array.isArray(scan.breakdown.schemaSuggestions) && scan.breakdown.schemaSuggestions.length > 0 && (
            <SchemaGenerator suggestions={scan.breakdown.schemaSuggestions as SchemaSuggestionUI[]} />
          )}

          {/* Phase 3.2 — Trend (도메인 시계열) */}
          {scan.shortId && <TrendChart shortId={scan.shortId} />}

          {/* Top Issues */}
          <div className="mb-8">
            <h2 className="mb-3 text-[15px] font-bold text-text">상위 이슈</h2>
            <div className="space-y-2">
              {scan.topIssues.map((issue, i) => {
                const sc = issue.severity === 'high' ? '#DC2626' : issue.severity === 'medium' ? '#EA580C' : '#D97706';
                return (
                  <div key={i} className="rounded-xl border border-border bg-white p-4" style={{ borderLeftWidth: 3, borderLeftColor: sc }}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-text">{issue.title}</span>
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase" style={{ color: sc }}>{issue.severity}</span>
                    </div>
                    <p className="text-xs text-text-sub">{issue.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 서브페이지 분석 결과 */}
          {scan.subPages && scan.subPages.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-1 text-[15px] font-bold text-text">사이트 전체 페이지 분석</h2>
              <p className="mb-3 text-xs text-text-muted">홈페이지 포함 총 {scan.pagesAnalyzed || 1}개 페이지 분석</p>
              <div className="rounded-2xl border border-border bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-xs text-text-muted">
                      <th className="px-4 py-2 text-left font-medium">페이지</th>
                      <th className="w-20 px-3 py-2 text-center font-medium">상태</th>
                      <th className="px-4 py-2 text-left font-medium">이슈</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scan.subPages.map((page: any, i: number) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5">
                          <div className="text-xs font-medium text-text truncate max-w-[200px]">{page.title || '(제목 없음)'}</div>
                          <div className="text-[10px] text-text-muted truncate max-w-[200px]">{page.url.replace(/^https?:\/\/[^/]+/, '')}</div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {page.issues.length === 0
                            ? <span className="text-[10px] font-semibold text-success">양호</span>
                            : <span className="text-[10px] font-semibold text-warning">{page.issues.length}건</span>}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-text-sub break-words">{page.issues.join(', ') || '이슈 없음'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Radar + 분석 요약 (나란히) + 브랜드 성격 */}
          {scan.deep && (() => {
            const techPct = Math.round(techSeoTotal / techSeoMax * 100);
            const contentPct = Math.round(contentSeoTotal / contentSeoMax * 100);
            const geoExposurePct = Math.round(scan.geoChecks.filter(c => c.mentioned).length / scan.geoChecks.length * 100);
            const geoReadinessPct = Math.round(scan.geoReadiness.reduce((s, i) => s + i.score, 0) / scan.geoReadiness.reduce((s, i) => s + i.maxScore, 0) * 100);
            const keywordPct = scan.deep!.keywords.length > 0 ? Math.round(scan.deep!.keywords.filter(k => k.relevance === 'high' || k.relevance === 'medium').length / scan.deep!.keywords.length * 100) : 0;
            const contentGapPct = Math.max(0, 100 - scan.deep!.contentGaps.length * 20);

            const radarLabels = ['기술 SEO', '콘텐츠 SEO', 'AI 검색 노출', 'AI 최적화', '키워드', '콘텐츠 갭'];
            const radarValues = [techPct, contentPct, geoExposurePct, geoReadinessPct, keywordPct, contentGapPct];

            const personality = analyzeBrandPersonality({ techSeo: techPct, contentSeo: contentPct, geoExposure: geoExposurePct, geoReadiness: geoReadinessPct, keywords: keywordPct, contentGap: contentGapPct });

            const avgScore = Math.round(radarValues.reduce((s, v) => s + v, 0) / radarValues.length);
            const strongAreas = radarLabels.filter((_, i) => radarValues[i] >= 70);
            const weakAreas = radarLabels.filter((_, i) => radarValues[i] < 40);

            return (
              <>
                {/* 레이더 + 분석 요약 나란히 */}
                <div className="mb-10 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-white p-6">
                    <h2 className="mb-2 text-[15px] font-bold text-text">종합 분석 레이더</h2>
                    <RadarChart labels={radarLabels} values={radarValues} size={360} />
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-6">
                    <h2 className="mb-3 text-[15px] font-bold text-text">분석 요약</h2>
                    <p className="mb-5 text-sm leading-relaxed text-text-sub">
                      {displayDomain}의 평균 점수는 <strong className="text-text">{avgScore}점</strong>입니다.
                      {strongAreas.length > 0 && ` ${strongAreas.join(', ')} 영역이 우수하며,`}
                      {weakAreas.length > 0 && ` ${weakAreas.join(', ')} 영역의 개선이 시급합니다.`}
                      {weakAreas.length === 0 && ' 전반적으로 양호합니다.'}
                    </p>

                    <h3 className="mb-2 text-sm font-semibold text-text">개선 대안</h3>
                    <div className="space-y-2">
                      {weakAreas.length > 0 ? weakAreas.map((area, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 text-warning">●</span>
                          <div className="text-text-sub">
                            <strong className="text-text">{area}</strong> —{' '}
                            {area === '기술 SEO' && '페이지 속도, 크롤링, 구조화 데이터 등 기술 기반 보강'}
                            {area === '콘텐츠 SEO' && '타이틀, 메타, H구조, ALT 등 콘텐츠 최적화 필요'}
                            {area === 'AI 검색 노출' && 'FAQ, HowTo 콘텐츠로 AI 인용 가능성 향상'}
                            {area === 'AI 최적화' && '구조화 데이터(JSON-LD) 추가 필요'}
                            {area === '키워드' && '핵심 키워드 기반 콘텐츠 체계적 생산'}
                            {area === '콘텐츠 갭' && 'FAQ, How-To 등 누락 콘텐츠 우선 제작'}
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-success">전체적으로 양호합니다. 세부 미세 조정으로 완성도를 높이세요.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 브랜드 커뮤니케이션 성격 제안 — 좌우 분리 */}
                <div className="mb-10 rounded-2xl border border-border bg-white p-6">
                  <h2 className="mb-1 text-[15px] font-bold text-text">브랜드 커뮤니케이션 성격 제안</h2>
                  <p className="mb-5 text-xs text-text-muted">SEO/GEO 분석을 기반으로 브랜드의 디지털 성격을 진단합니다</p>

                  <div className="grid gap-6 lg:grid-cols-5">
                    {/* 왼쪽: 타이틀 */}
                    <div className="lg:col-span-2">
                      <div className="text-5xl mb-3">{personality.emoji}</div>
                      <div className="text-2xl font-bold text-text mb-1">{personality.name}</div>
                      {'subtitle' in personality && <div className="text-sm text-text-sub mb-2">{(personality as any).subtitle}</div>}
                      <div className="text-[10px] font-mono text-text-muted tracking-widest mb-3">{personality.type}</div>
                      <p className="text-sm leading-relaxed text-text-sub">{personality.description}</p>
                    </div>

                    {/* 오른쪽: 상세 */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="mb-2 text-xs font-semibold text-success">강점</h4>
                          <div className="space-y-1.5">
                            {personality.strengths.map((s, i) => (
                              <div key={i} className="text-sm text-text-sub flex items-center gap-1.5">
                                <span className="text-success">+</span> {s}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-2 text-xs font-semibold text-warning">개선점</h4>
                          <div className="space-y-1.5">
                            {personality.weaknesses.map((w, i) => (
                              <div key={i} className="text-sm text-text-sub flex items-center gap-1.5">
                                <span className="text-warning">-</span> {w}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border pt-4">
                        <h4 className="text-xs font-semibold text-text mb-1">추천 개선 방향</h4>
                        <p className="text-sm text-text-sub">{personality.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          {/* === 구분선: 써머리 ↔ 상세 === */}
          <div className="mb-10 flex items-center gap-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs font-medium text-text-muted tracking-wider">상세 분석 결과</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Tech SEO */}
          <div className="mb-10">
            <h2 className="mb-4 text-[15px] font-bold text-text">기술 SEO <span className="font-normal text-text-muted text-sm">{techSeoTotal}/{techSeoMax}</span></h2>
            <div className="space-y-3">
              {scan.techSeo.map((item, i) => <SeoItemRow key={i} item={item} />)}
            </div>
          </div>

          {/* Content SEO */}
          <div className="mb-10">
            <h2 className="mb-4 text-[15px] font-bold text-text">콘텐츠 SEO <span className="font-normal text-text-muted text-sm">{contentSeoTotal}/{contentSeoMax}</span></h2>
            <div className="space-y-3">
              {scan.contentSeo.map((item, i) => <SeoItemRow key={i} item={item} />)}
            </div>
          </div>

          {/* GEO */}
          <div className="mb-10">
            <h2 className="mb-4 text-[15px] font-bold text-text">AI 검색 노출 (실측)</h2>
            <div className="space-y-3">
              {scan.geoChecks.map((check, i) => (
                <div key={i} className="rounded-xl border border-border bg-white px-5 py-4">
                  <div className="flex items-start gap-3">
                    {check.mentioned ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" /> : <XCircle size={15} className="mt-0.5 shrink-0 text-danger" />}
                    <div>
                      <div className="text-sm font-medium text-text">{check.platform}</div>
                      <div className="text-xs text-text-muted">{check.details}</div>
                    </div>
                  </div>
                  <div className="mt-2 ml-6 text-xs text-text-muted">
                    {check.mentioned ? '노출 가능성이 있습니다. 지속적인 콘텐츠 관리로 유지하세요.' : '노출되지 않고 있습니다. 구조화 데이터와 FAQ 콘텐츠를 추가하세요.'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Visibility Map — Phase 2 신규 (실제 AI 응답 캡처) */}
          {scan.aiProbes && scan.aiProbes.length > 0 && (
            <AIVisibilityMap aiProbes={scan.aiProbes} />
          )}

          {/* GEO Readiness */}
          <div className="mb-10">
            <h2 className="mb-4 text-[15px] font-bold text-text">AI 최적화 준비도</h2>
            <div className="space-y-3">
              {scan.geoReadiness.map((item, i) => <SeoItemRow key={i} item={item} />)}
            </div>
          </div>

          {/* 성능 (Core Web Vitals) */}
          {scan.performance && (
            <div className="mb-10">
              <h2 className="mb-4 text-[15px] font-bold text-text flex items-center gap-1.5"><Gauge size={15} /> 성능 (Core Web Vitals)</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {(() => {
                  const perf = scan.performance;
                  const lcpColor = perf.lcp < 2500 ? '#059669' : perf.lcp < 4000 ? '#D97706' : '#DC2626';
                  const clsColor = perf.cls < 0.1 ? '#059669' : perf.cls < 0.25 ? '#D97706' : '#DC2626';
                  const tbtColor = perf.tbt < 200 ? '#059669' : perf.tbt < 600 ? '#D97706' : '#DC2626';
                  return (
                    <>
                      <div className="rounded-xl border border-border bg-white px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-text-muted mb-2"><Zap size={12} /> LCP</div>
                        <div className="text-2xl font-bold" style={{ color: lcpColor }}>{(perf.lcp / 1000).toFixed(1)}s</div>
                        <div className="mt-1 text-[10px] text-text-muted">Largest Contentful Paint</div>
                        <div className="mt-1 text-[10px] font-medium" style={{ color: lcpColor }}>{perf.lcp < 2500 ? '양호' : perf.lcp < 4000 ? '개선 필요' : '나쁨'}</div>
                      </div>
                      <div className="rounded-xl border border-border bg-white px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-text-muted mb-2"><Gauge size={12} /> CLS</div>
                        <div className="text-2xl font-bold" style={{ color: clsColor }}>{perf.cls.toFixed(3)}</div>
                        <div className="mt-1 text-[10px] text-text-muted">Cumulative Layout Shift</div>
                        <div className="mt-1 text-[10px] font-medium" style={{ color: clsColor }}>{perf.cls < 0.1 ? '양호' : perf.cls < 0.25 ? '개선 필요' : '나쁨'}</div>
                      </div>
                      <div className="rounded-xl border border-border bg-white px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-text-muted mb-2"><Timer size={12} /> TBT</div>
                        <div className="text-2xl font-bold" style={{ color: tbtColor }}>{perf.tbt}ms</div>
                        <div className="mt-1 text-[10px] text-text-muted">Total Blocking Time</div>
                        <div className="mt-1 text-[10px] font-medium" style={{ color: tbtColor }}>{perf.tbt < 200 ? '양호' : perf.tbt < 600 ? '개선 필요' : '나쁨'}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Deep Analysis */}
          {scan.deep && (
            <div className="mb-8">
              <h2 className="mb-4 text-[15px] font-bold text-text">심화 분석</h2>

              {isLoggedIn ? (
                /* === 로그인 사용자: 전체 공개 === */
                <>
                  {/* Page Details */}
                  <div className="mb-5">
                    <h3 className="mb-2 text-sm font-semibold text-text-sub">페이지 상세 정보</h3>
                    <div className="rounded-xl border border-border bg-white p-4 space-y-2">
                      {[
                        { l: '타이틀', v: scan.deep.pageDetails.title || '없음' },
                        { l: '메타 설명', v: scan.deep.pageDetails.metaDescription || '없음' },
                        { l: 'H1', v: scan.deep.pageDetails.h1List.length > 0 ? scan.deep.pageDetails.h1List.join(', ') : '없음' },
                        { l: 'OG Title', v: scan.deep.pageDetails.ogTitle || '없음' },
                        { l: 'OG Image', v: scan.deep.pageDetails.ogImage ? '설정됨' : '없음' },
                        { l: 'Canonical', v: scan.deep.pageDetails.canonical || '없음' },
                        { l: '언어', v: scan.deep.pageDetails.lang || '미설정' },
                        { l: '이미지', v: `${scan.deep.pageDetails.imgCount}개 (ALT: ${scan.deep.pageDetails.imgWithAlt})` },
                        { l: '링크', v: `${scan.deep.pageDetails.linkCount}개` },
                        { l: '텍스트', v: `약 ${scan.deep.pageDetails.textLength.toLocaleString()}자` },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="w-20 shrink-0 text-text-sub font-medium">{item.l}</span>
                          <span className="text-text-muted break-all">{item.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  {scan.deep.keywords.length > 0 && (
                    <div className="mb-5">
                      <h3 className="mb-2 text-sm font-semibold text-text-sub">키워드 분석</h3>
                      <div className="space-y-2">
                        {scan.deep.keywords.map((kw, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${kw.relevance === 'high' ? 'text-success' : kw.relevance === 'medium' ? 'text-warning' : 'text-text-muted'}`}>{kw.relevance}</span>
                            <span className="font-medium text-text">{kw.keyword}</span>
                            <span className="flex-1 text-xs text-text-muted text-right">{kw.suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content Gap */}
                  {scan.deep.contentGaps.length > 0 && (
                    <div className="mb-5">
                      <h3 className="mb-2 text-sm font-semibold text-text-sub">콘텐츠 갭 분석</h3>
                      <div className="space-y-2">
                        {scan.deep.contentGaps.map((gap, i) => {
                          const pColor = gap.priority === 'high' ? '#DC2626' : '#EA580C';
                          return (
                            <div key={i} className="rounded-xl border border-border bg-white p-4" style={{ borderLeftWidth: 3, borderLeftColor: pColor }}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-text">{gap.topic}</span>
                                <span className="text-[10px] font-semibold uppercase" style={{ color: pColor }}>{gap.priority}</span>
                              </div>
                              <p className="text-xs text-text-sub">{gap.reason}</p>
                              <p className="mt-1 text-xs font-medium text-text-muted">📝 {gap.suggestedFormat}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Competitor Hints */}
                  <div className="mb-5">
                    <h3 className="mb-2 text-sm font-semibold text-text-sub">경쟁사 인사이트</h3>
                    <div className="space-y-2">
                      {scan.deep.competitorHints.map((hint, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-xl border border-border bg-white px-4 py-3">
                          <Target size={14} className="mt-0.5 shrink-0 text-text-sub" />
                          <span className="text-sm text-text-sub">{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Plan */}
                  {scan.deep.actionPlan.length > 0 && (
                    <div className="mb-5">
                      <h3 className="mb-2 text-sm font-semibold text-text-sub">개선 액션 플랜</h3>
                      <div className="rounded-xl border border-border bg-white overflow-hidden">
                        <table className="w-full text-sm table-fixed">
                          <thead>
                            <tr className="border-b border-border bg-surface text-xs text-text-muted">
                              <th className="w-10 px-4 py-2 text-left font-medium">#</th>
                              <th className="w-24 px-4 py-2 text-left font-medium">카테고리</th>
                              <th className="px-4 py-2 text-left font-medium">액션</th>
                              <th className="w-16 px-4 py-2 text-center font-medium">영향도</th>
                              <th className="w-16 px-4 py-2 text-center font-medium">난이도</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scan.deep.actionPlan.map((item, i) => (
                              <tr key={i} className="border-b border-border last:border-0">
                                <td className="px-4 py-2.5 text-text-muted">{item.priority}</td>
                                <td className="px-4 py-2.5"><span className="rounded bg-surface px-1.5 py-0.5 text-xs text-text-sub">{item.category}</span></td>
                                <td className="px-4 py-2.5 text-text-sub break-words">{item.action}</td>
                                <td className="px-4 py-2.5 text-center"><span className={`text-xs font-semibold ${item.impact === '높음' ? 'text-danger' : 'text-warning'}`}>{item.impact}</span></td>
                                <td className="px-4 py-2.5 text-center text-xs text-text-muted">{item.effort}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* === 비로그인: 제목만 보여주기 === */
                <div className="space-y-2">
                  {[
                    { title: '페이지 상세 정보', desc: '타이틀, 메타, OG태그, 이미지, 링크 등 10개 항목 상세' },
                    { title: '키워드 분석', desc: `${scan.deep.keywords.length}개 키워드 추출 + 관련도 + 개선 제안` },
                    { title: '콘텐츠 갭 분석', desc: `${scan.deep.contentGaps.length}개 누락 콘텐츠 발견 + 제작 가이드` },
                    { title: '경쟁사 인사이트', desc: '동일 업종 경쟁사 대비 포지션 분석' },
                    { title: '개선 액션 플랜', desc: `${scan.deep.actionPlan.length}개 액션 우선순위 + 영향도 + 난이도` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4">
                      <div>
                        <div className="text-sm font-semibold text-text">{item.title}</div>
                        <div className="text-xs text-text-muted">{item.desc}</div>
                      </div>
                      <Lock size={14} className="shrink-0 text-text-muted" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI 캠페인 기획서 생성 */}
          <div className="mb-6 text-center">
            <button
              onClick={handleGenerateCampaignPlan}
              disabled={generatingPlan}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-60"
            >
              {generatingPlan ? (
                <><Loader2 size={16} className="animate-spin" /> 기획서 생성 중...</>
              ) : (
                <><Lightbulb size={16} /> AI 캠페인 기획서 생성</>
              )}
            </button>
          </div>

          {/* Bottom CTA — 비로그인만 */}
          {!isLoggedIn && (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <h3 className="mb-2 text-lg font-bold text-text">심화 분석과 개선 가이드가 필요하신가요?</h3>
              <p className="mb-5 text-sm text-text-sub">무료 회원가입으로 정식 보고서와 맞춤 액션 플랜을 확인하세요</p>
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-text px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-sub">
                정식 보고서 확인
                <ChevronRight size={15} />
              </Link>
            </div>
          )}

          {/* 신뢰 푸터 — Phase 1.6 (분석 소스 명시) */}
          <div className="mt-10 rounded-xl border border-border bg-white px-6 py-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-text-muted">
              이 보고서가 사용한 데이터 소스
            </div>
            <ul className="space-y-1.5 text-xs text-text-sub">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-sub" />
                <span><b>실제 HTML 파싱</b> — 페이지 메타·구조·이미지·링크 직접 추출 ({scan.fetchTime}ms)</span>
              </li>
              {scan.pageSpeedData && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-sub" />
                  <span><b>Google PageSpeed Insights API</b> — 실측 LCP·CLS·TBT·FCP·SI</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-sub" />
                <span><b>Claude Sonnet 4.6</b> — AI 검색 노출 실측 테스트</span>
              </li>
              {scan.pagesAnalyzed && scan.pagesAnalyzed > 1 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-sub" />
                  <span><b>자체 크롤러</b> — 메인 + 서브페이지 {(scan.pagesAnalyzed - 1)}개 동시 분석 (총 {scan.pagesAnalyzed}페이지)</span>
                </li>
              )}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-[11px] text-text-muted">
              <div>
                {scan.createdAt && <span>진단 일시: {new Date(scan.createdAt).toLocaleString('ko-KR')}</span>}
                {scan.shortId && <span className="ml-3">ID: {scan.shortId}</span>}
              </div>
              <div>
                Phase 1 보고서 · Phase 2(ChatGPT·Perplexity 실측) 곧 추가
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 우하단 플로팅 — 비로그인만 */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${showFloating && !isLoggedIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <Link href="/signup" className="flex items-center gap-2 rounded-full bg-text px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-sub hover:shadow-xl">
          정식 보고서 확인
          <ChevronRight size={15} />
        </Link>
      </div>

      <Footer />
    </>
  );
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-text-muted">리포트 로딩 중...</div>}>
      <ReportContent scanId={id} />
    </Suspense>
  );
}
