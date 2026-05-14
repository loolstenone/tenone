'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Globe, BarChart3, ShieldCheck, Megaphone, Loader2, RefreshCw, Clock, ChevronDown, ChevronUp, Briefcase, Code2, Sparkles } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import PageActions from '@/features/smarcomm/PageActions';
import type { IndexBreakdown, Grade } from '@/lib/smarcomm/index-calculator';

type ViewMode = 'marketer' | 'exec' | 'dev';
const VIEW_MODES: { id: ViewMode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'marketer', label: '마케터', icon: Sparkles, desc: '실행 액션 중심' },
  { id: 'exec',     label: '경영진', icon: Briefcase, desc: '요약·KPI 중심' },
  { id: 'dev',      label: '개발자', icon: Code2, desc: '기술 상세' },
];

// ── 타입 ──────────────────────────────────────────────────────────────────

interface IndustryBenchmark {
  industry: string;
  percentile: number;
  avgScores: { findability: number; trust: number; citability: number; index: number };
  sampleSize: number;
}

interface ScanResult {
  url: string;
  breakdown: IndexBreakdown;
  benchmark: IndustryBenchmark | null;
}

interface HistoryRow {
  id: string;
  domain: string;
  url: string;
  industry: string;
  index_score: number;
  grade: Grade;
  scanned_at: string;
  score_delta: number | null;
}

// ── 등급 표시 ──────────────────────────────────────────────────────────────

const GRADE_CONFIG: Record<Grade, { color: string; bg: string; label: string; message: string }> = {
  S: { color: '#7C3AED', bg: '#F5F3FF', label: 'S', message: 'AI 인용 최상위권' },
  A: { color: '#059669', bg: '#ECFDF5', label: 'A', message: '탁월한 AI 가시성' },
  B: { color: '#D97706', bg: '#FFFBEB', label: 'B', message: '개선 여지 있음' },
  C: { color: '#EA580C', bg: '#FFF7ED', label: 'C', message: '중요 이슈 다수' },
  D: { color: '#DC2626', bg: '#FEF2F2', label: 'D', message: '즉각 대응 필요' },
};

// ── 점수 카드 ──────────────────────────────────────────────────────────────

function ScoreCard({
  label, score, benchmark, icon: Icon, color,
}: {
  label: string;
  score: number;
  benchmark?: number;
  icon: React.ElementType;
  color: string;
}) {
  const pct = Math.round(score);
  const diff = benchmark !== undefined ? Math.round(score - benchmark) : null;

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: color + '18' }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-sm font-medium text-text-sub">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-extrabold text-text">{pct}</span>
        <span className="mb-1 text-sm text-text-muted">/100</span>
        {diff !== null && (
          <span className={`mb-1 ml-auto text-xs font-semibold ${diff >= 0 ? 'text-success' : 'text-danger'}`}>
            {diff >= 0 ? '+' : ''}{diff} vs 업종 평균
          </span>
        )}
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── 액션플랜 아이템 ────────────────────────────────────────────────────────

function ActionItem({ item }: {
  item: {
    title: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    quadrant: string;
    role: string;
    action: string;
    description: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const impactColor = item.impact === 'high' ? 'text-danger' : item.impact === 'medium' ? 'text-warning' : 'text-text-muted';
  const effortBg = item.effort === 'low' ? 'bg-success/10 text-success' : item.effort === 'medium' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger';
  const isQuickWin = item.quadrant === 'quick-win';

  return (
    <div className={`rounded-xl border bg-white transition-all ${isQuickWin ? 'border-success/30' : 'border-border'}`}>
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => setOpen(v => !v)}
      >
        {isQuickWin && (
          <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">퀵윈</span>
        )}
        <span className="flex-1 text-sm font-medium text-text">{item.title}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold ${impactColor}`}>임팩트 {item.impact}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${effortBg}`}>
            노력 {item.effort}
          </span>
          {open ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 text-sm text-text-sub space-y-1">
          <p>{item.description}</p>
          <p className="font-medium text-text">→ {item.action}</p>
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────

export default function SmarCommIndexPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-muted">불러오는 중…</div>}>
      <SmarCommIndexInner />
    </Suspense>
  );
}

function SmarCommIndexInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view: ViewMode = (searchParams.get('view') as ViewMode) || 'marketer';

  const setView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'marketer') params.delete('view'); else params.set('view', next);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  };

  const [url, setUrl] = useState('');
  const [industry, setIndustry] = useState('general');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [savedId, setSavedId] = useState<string | undefined>();

  useEffect(() => {
    fetch('/api/smarcomm/scan/history')
      .then(r => r.ok ? r.json() : { data: [] })
      .then(j => setHistory(j.data ?? []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true);
    setError('');
    setResult(null);
    setSavedId(undefined);

    try {
      const res = await fetch('/api/smarcomm/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), industry }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '분석 실패'); return; }
      setResult({ url: data.url ?? url.trim(), breakdown: data.breakdown, benchmark: data.benchmark ?? null });
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setScanning(false);
    }
  };

  const grade = result?.breakdown?.grade;
  const gradeConf = grade ? GRADE_CONFIG[grade] : null;
  const actionPlan = result?.breakdown?.actionPlan ?? [];
  const quickWins = actionPlan.filter(a => a.quadrant === 'quick-win');
  const others = actionPlan.filter(a => a.quadrant !== 'quick-win');

  const scanDataForPDF = result ? {
    url: result.url,
    industry,
    breakdown: result.breakdown,
    benchmark: result.benchmark,
  } : undefined;

  return (
    <div className="flex-1 overflow-auto">
      <PageTopBar title="SmarComm Index" subtitle="AI 노출 지수 · 3축 종합 진단">
        {result && (
          <PageActions
            title={`smarcomm-index-${result.url}`}
            scanData={scanDataForPDF}
            scanId={savedId}
          />
        )}
      </PageTopBar>

      <div className="p-6 max-w-4xl space-y-6">
        {/* View Mode 탭 */}
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-white p-1">
          {VIEW_MODES.map(vm => {
            const Icon = vm.icon;
            const active = view === vm.id;
            return (
              <button
                key={vm.id}
                onClick={() => setView(vm.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  active ? 'bg-text text-white' : 'text-text-sub hover:bg-surface'
                }`}
              >
                <Icon size={14} />
                <span>{vm.label}</span>
                <span className={`hidden md:inline text-xs ${active ? 'text-white/70' : 'text-text-muted'}`}>· {vm.desc}</span>
              </button>
            );
          })}
        </div>

        {/* 진단 입력 */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="text-sm font-semibold text-text mb-3">사이트 진단</h2>
          <div className="flex gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
              <Globe size={15} className="shrink-0 text-text-muted" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !scanning && handleScan()}
                placeholder="https://yoursite.com"
                className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              />
            </div>
            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none"
            >
              <option value="general">전체 업종</option>
              <option value="ecommerce">이커머스</option>
              <option value="saas">SaaS</option>
              <option value="healthcare">헬스케어</option>
              <option value="finance">금융</option>
              <option value="education">교육</option>
              <option value="media">미디어</option>
              <option value="realestate">부동산</option>
            </select>
            <button
              onClick={handleScan}
              disabled={scanning || !url.trim()}
              className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {scanning ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {scanning ? '분석 중…' : '진단'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>

        {/* 결과 */}
        {result && grade && gradeConf && (
          <>
            {/* 종합 등급 */}
            <div className="rounded-2xl border-2 bg-white p-6" style={{ borderColor: gradeConf.color + '40' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1">{result.url}</p>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl font-extrabold"
                      style={{ backgroundColor: gradeConf.bg, color: gradeConf.color }}
                    >
                      {gradeConf.label}
                    </span>
                    <div>
                      <p className="text-2xl font-extrabold text-text">{Math.round(result.breakdown.index)}<span className="text-sm font-normal text-text-muted ml-1">/ 100</span></p>
                      <p className="text-sm text-text-sub">{gradeConf.message}</p>
                    </div>
                  </div>
                </div>
                {result.benchmark && (
                  <div className="text-right">
                    <p className="text-xs text-text-muted mb-1">업종 내 백분위</p>
                    <p className="text-3xl font-extrabold text-text">{result.benchmark.percentile}<span className="text-sm font-normal text-text-muted">%ile</span></p>
                    <p className="text-xs text-text-muted mt-0.5">{result.benchmark.industry} · {result.benchmark.sampleSize}개 사이트 기준</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3축 점수 — 전 view 공통 */}
            <div className="grid grid-cols-3 gap-4">
              <ScoreCard
                label="Findability"
                score={result.breakdown.findability}
                benchmark={result.benchmark?.avgScores.findability}
                icon={Search}
                color="#2563EB"
              />
              <ScoreCard
                label="Trust"
                score={result.breakdown.trust}
                benchmark={result.benchmark?.avgScores.trust}
                icon={ShieldCheck}
                color="#059669"
              />
              <ScoreCard
                label="Citability"
                score={result.breakdown.citability}
                benchmark={result.benchmark?.avgScores.citability}
                icon={Megaphone}
                color="#7C3AED"
              />
            </div>

            {/* 경영진 요약 — exec/marketer view */}
            {view !== 'dev' && result.breakdown.execSummary && (
              <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
                <h3 className="text-sm font-semibold text-text">경영진 요약</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-success mb-1">잘하고 있는 것</p>
                    <p className="text-text-sub">{result.breakdown.execSummary.winning}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-danger mb-1">핵심 문제</p>
                    <p className="text-text-sub">{result.breakdown.execSummary.problem}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] mb-1">다음 액션</p>
                    <p className="text-text-sub">{result.breakdown.execSummary.nextAction}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 액션플랜 — marketer/dev view */}
            {view !== 'exec' && actionPlan.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text mb-3">
                  개선 액션플랜
                  {view === 'dev' && <span className="ml-2 text-xs font-normal text-text-muted">({actionPlan.length}개 전체)</span>}
                </h3>
                {quickWins.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs font-bold text-success">⚡ 빠른 성과 (퀵윈)</p>
                    {quickWins.map((item, i) => <ActionItem key={i} item={item} />)}
                  </div>
                )}
                {others.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-text-muted">기타 개선 항목</p>
                    {(view === 'marketer' ? others.slice(0, 5) : others).map((item, i) => <ActionItem key={i} item={item} />)}
                    {view === 'marketer' && others.length > 5 && (
                      <button
                        onClick={() => setView('dev')}
                        className="w-full rounded-xl border border-dashed border-border py-2 text-xs text-text-muted hover:bg-surface transition-colors"
                      >
                        + {others.length - 5}개 더 보기 (개발자 view)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 개발자 view 전용 — E-E-A-T·Knowledge Graph·세부 진단 항목 */}
            {view === 'dev' && (
              <div className="space-y-4">
                {/* E-E-A-T */}
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="text-sm font-semibold text-text mb-3">E-E-A-T 분석 <span className="text-xs font-normal text-text-muted">· Google QRG § 3</span></h3>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    {([
                      ['Experience', result.breakdown.eeat.experience, '직접 경험'],
                      ['Expertise', result.breakdown.eeat.expertise, '전문성'],
                      ['Authoritativeness', result.breakdown.eeat.authoritativeness, '권위'],
                      ['Trustworthiness', result.breakdown.eeat.trustworthiness, '신뢰'],
                    ] as const).map(([label, score, sub]) => (
                      <div key={label} className="rounded-xl border border-border p-3">
                        <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
                        <p className="text-2xl font-extrabold text-text mt-1">
                          {score === null ? '—' : Math.round(score)}
                          {score !== null && <span className="text-xs font-normal text-text-muted ml-0.5">/100</span>}
                        </p>
                        <p className="text-xs text-text-sub mt-0.5">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Knowledge Graph */}
                {result.breakdown.knowledgeGraph && (
                  <div className="rounded-2xl border border-border bg-white p-5">
                    <h3 className="text-sm font-semibold text-text mb-2">Wikidata Knowledge Graph</h3>
                    {result.breakdown.knowledgeGraph.registered ? (
                      <div className="text-sm text-text-sub">
                        <span className="font-semibold text-success">등록됨</span> · 엔티티 {result.breakdown.knowledgeGraph.entityCount}개 · Citability +{result.breakdown.knowledgeGraph.bonus}점
                      </div>
                    ) : (
                      <div className="text-sm text-text-sub">
                        <span className="font-semibold text-warning">미등록</span> · Wikidata에 official website (P856)로 등록되면 AI 인용 가능성이 크게 높아집니다.
                      </div>
                    )}
                  </div>
                )}

                {/* 세부 진단 항목 (Findability + Trust raw items) */}
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="text-sm font-semibold text-text mb-3">세부 진단 항목</h3>
                  <div className="space-y-1.5">
                    {[...result.breakdown.findabilityItems, ...result.breakdown.trustItems].map((it, i) => {
                      const pct = it.maxScore > 0 ? Math.round((it.score / it.maxScore) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <span className="flex-1 text-text-sub">{it.name}</span>
                          <span className="font-mono text-text-muted">{it.score}/{it.maxScore}</span>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface">
                            <div className="h-full rounded-full bg-text" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 진단 이력 */}
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">진단 이력</h3>
          {historyLoading ? (
            <div className="flex items-center gap-2 text-sm text-text-muted py-4">
              <Loader2 size={14} className="animate-spin" /> 불러오는 중…
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-text-muted">
              아직 진단 기록이 없습니다. 위에서 첫 진단을 실행해보세요.
            </div>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-muted">도메인</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-muted">등급</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-muted">Index</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-muted">변화</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-muted">진단일</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-muted"></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(row => {
                    const gc = GRADE_CONFIG[row.grade] ?? GRADE_CONFIG.D;
                    return (
                      <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                        <td className="px-4 py-3 font-medium text-text">{row.domain}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold"
                            style={{ backgroundColor: gc.bg, color: gc.color }}
                          >
                            {row.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-text">{Math.round(row.index_score)}</td>
                        <td className="px-4 py-3 text-right">
                          {row.score_delta !== null ? (
                            <span className={`text-xs font-semibold ${row.score_delta >= 0 ? 'text-success' : 'text-danger'}`}>
                              {row.score_delta >= 0 ? '+' : ''}{Math.round(row.score_delta)}
                            </span>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-text-muted">
                          <div className="flex items-center justify-end gap-1">
                            <Clock size={11} />
                            {new Date(row.scanned_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => { setUrl(row.url); setIndustry(row.industry); }}
                            className="flex items-center gap-1 ml-auto text-xs text-text-muted hover:text-text transition-colors"
                          >
                            <RefreshCw size={11} /> 재진단
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
