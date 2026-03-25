'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Globe, Clock, RefreshCw, ExternalLink, Plus, FileBarChart, ArrowRight, AlertTriangle, CheckCircle2, XCircle, X, Gauge, Zap, Timer, Lightbulb, Loader2 } from 'lucide-react';
import { getScanLog } from '@/lib/smarcomm/auth';
import GaugeChart from '@/components/smarcomm/GaugeChart';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';
import RadarChart from '@/components/smarcomm/RadarChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

type ViewMode = 'list' | 'result' | 'compare';
type Status = 'pass' | 'warning' | 'fail';

interface ScanResult {
  url: string;
  faviconUrl?: string;
  totalScore: number;
  seoScore: number;
  geoScore: number;
  grade: string;
  techSeo: { name: string; score: number; maxScore: number; status: Status; description: string; action: string }[];
  contentSeo: { name: string; score: number; maxScore: number; status: Status; description: string; action: string }[];
  geoChecks: { platform: string; mentioned: boolean; details: string }[];
  geoReadiness: { name: string; score: number; maxScore: number; status: Status; description: string; action: string }[];
  performanceScore?: number;
  performance?: { score: number; lcp: number; cls: number; tbt: number; fcp: number; si: number };
  topIssues: { severity: string; title: string; description: string; action: string }[];
  deep?: any;
}

const GRADE_MAP: Record<string, { color: string; label: string; message: string }> = {
  excellent: { color: '#059669', label: 'Excellent', message: 'AI 시대 검색 준비 완료' },
  good: { color: '#D97706', label: 'Good', message: '기본은 갖췄지만 개선 여지 있음' },
  needs_work: { color: '#EA580C', label: 'Needs Work', message: '놓치고 있는 기회가 많음' },
  critical: { color: '#DC2626', label: 'Critical', message: '지금 고객을 잃고 있을 가능성 높음' },
};

function StatusIcon({ status }: { status: Status }) {
  if (status === 'pass') return <CheckCircle2 size={14} className="text-success" />;
  if (status === 'warning') return <AlertTriangle size={14} className="text-warning" />;
  return <XCircle size={14} className="text-danger" />;
}

export default function ScanPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [compareUrl, setCompareUrl] = useState('');
  const [view, setView] = useState<ViewMode>('list');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [compareResult, setCompareResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [compHistoryPage, setCompHistoryPage] = useState(1);
  const [compareHistory, setCompareHistory] = useState<{ url: string; score: number; seo: number; geo: number; date: string }[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('smarcomm_compare_log') || '[]'); } catch { return []; }
  });
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const scanLog = getScanLog().reverse();
  const HISTORY_PAGE_SIZE = 5;

  const handleGenerateCampaignPlan = async () => {
    const scanData = result;
    if (!scanData) return;
    setGeneratingPlan(true);
    try {
      const res = await fetch('/api/advisor/campaign-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult: scanData }),
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

  // 경쟁사 목록 localStorage 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smarcomm_competitors');
      if (saved) setCompetitors(JSON.parse(saved));
    } catch {}
  }, []);

  const saveCompetitors = (list: string[]) => {
    setCompetitors(list);
    localStorage.setItem('smarcomm_competitors', JSON.stringify(list));
  };

  const addCompetitor = () => {
    const trimmed = newCompetitor.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!trimmed) return;
    if (!competitors.includes(trimmed)) saveCompetitors([...competitors, trimmed]);
    setNewCompetitor('');
  };

  const removeCompetitor = (domain: string) => {
    saveCompetitors(competitors.filter(c => c !== domain));
  };

  // 내 사이트 (설정에서 가져오기)
  const [mySiteUrl, setMySiteUrl] = useState('');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smarcomm_company');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.siteUrl) setMySiteUrl(parsed.siteUrl);
      }
    } catch {}
  }, []);

  const handleScan = async (targetUrl: string) => {
    if (!targetUrl.trim()) { setError('URL을 입력해주세요'); return; }
    const normalized = targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl;
    // 도메인에 . 이 없으면 유효하지 않음
    const domainPart = normalized.replace(/^https?:\/\//, '').split('/')[0];
    if (!domainPart.includes('.')) { setError('유효하지 않은 URL입니다. 예: tenone.biz'); return; }

    setScanning(true);
    setError('');
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '분석에 실패했습니다'); setScanning(false); return; }
      setResult(data);
      setView('result');

      const { saveScanUrl } = await import('@/lib/smarcomm/auth');
      saveScanUrl(data.url, data.totalScore, data.seoScore, data.geoScore);

      // 경쟁사 URL이면 경쟁사 이력에도 저장
      const scanDomain = data.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const myDomain = mySiteUrl ? mySiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
      if (scanDomain !== myDomain && competitors.includes(scanDomain)) {
        const newEntry = { url: data.url, score: data.totalScore, seo: data.seoScore, geo: data.geoScore, date: new Date().toISOString() };
        setCompareHistory(prev => {
          const updated = [newEntry, ...prev.filter(h => h.url !== data.url)];
          localStorage.setItem('smarcomm_compare_log', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (e) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
    setScanning(false);
  };

  const handleCompare = async () => {
    if (!compareUrl.trim()) return;
    const normalized = compareUrl.startsWith('http') ? compareUrl : 'https://' + compareUrl;
    setScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompareResult(data);
        setView('compare');
        // 경쟁사 이력 저장 (localStorage 영속)
        const newEntry = { url: data.url, score: data.totalScore, seo: data.seoScore, geo: data.geoScore, date: new Date().toISOString() };
        setCompareHistory(prev => {
          const updated = [newEntry, ...prev.filter(h => h.url !== data.url)];
          localStorage.setItem('smarcomm_compare_log', JSON.stringify(updated));
          return updated;
        });
      }
    } catch { }
    setScanning(false);
  };

  // 중복 제거
  const uniqueScans = Object.values(
    scanLog.reduce((acc: Record<string, typeof scanLog[0]>, scan) => {
      const domain = scan.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (!acc[domain]) acc[domain] = scan;
      return acc;
    }, {})
  );

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">GEO & SEO 진단</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">AI 검색 + 전통 검색 통합 진단 · 경쟁사 비교 · 풀 리포트</p>
        </div>
        {view !== 'list' && (
          <button onClick={() => { setView('list'); setCompareResult(null); }} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-surface hover:text-text transition-colors">
            ← 목록으로
          </button>
        )}
      </div>

      {/* URL 입력 (1개) */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan(url)}
              placeholder="분석할 사이트 URL"
              className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
          </div>
          <button onClick={() => handleScan(url)} disabled={scanning}
            className="flex items-center gap-1.5 rounded-xl bg-text px-6 py-3 text-sm font-semibold text-white hover:bg-accent-sub disabled:opacity-50">
            <Search size={15} /> {scanning ? '분석 중...' : '진단'}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        {scanning && <p className="mt-2 text-xs text-text-muted">사이트를 분석하고 있습니다... (30초~2분 소요)</p>}

        {/* 내 사이트 + 경쟁사 바로 진단 */}
        {!scanning && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {mySiteUrl && (
              <>
                <span className="text-[10px] font-semibold text-text-muted">내 사이트</span>
                <button onClick={() => { setUrl(mySiteUrl); handleScan(mySiteUrl); }}
                  className="rounded-full bg-text/5 border border-text/10 px-3 py-1 text-xs font-medium text-text hover:bg-text hover:text-white transition-colors">
                  {mySiteUrl.replace(/^https?:\/\//, '')}
                </button>
              </>
            )}
            {competitors.length > 0 && (
              <>
                <span className="text-[10px] font-semibold text-text-muted ml-1">경쟁사</span>
                {competitors.map(comp => (
                  <div key={comp} className="flex items-center gap-0.5">
                    <button onClick={() => { setUrl('https://' + comp); handleScan('https://' + comp); }}
                      className="rounded-l-full border border-border px-3 py-1 text-xs text-text-sub hover:bg-surface hover:text-text transition-colors">
                      {comp}
                    </button>
                    <button onClick={() => removeCompetitor(comp)}
                      className="rounded-r-full border border-l-0 border-border px-1.5 py-1 text-text-muted hover:text-danger hover:bg-red-50 transition-colors">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </>
            )}
            {/* 경쟁사 추가 (최대 4개) */}
            {competitors.length < 4 && (
              <div className="flex items-center gap-1">
                <input type="text" value={newCompetitor} onChange={e => setNewCompetitor(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCompetitor()}
                  placeholder="경쟁사 도메인"
                  className="w-28 rounded-l-full border border-dashed border-text-muted/30 px-3 py-1 text-[10px] text-text-muted placeholder:text-text-muted/50 focus:border-text focus:outline-none focus:w-36 transition-all" />
                <button onClick={addCompetitor}
                  className="rounded-r-full border border-l-0 border-dashed border-text-muted/30 px-2 py-1 text-[10px] font-bold text-text-muted hover:bg-text hover:text-white hover:border-text transition-colors">
                  +
                </button>
              </div>
            )}
            {competitors.length >= 4 && (
              <span className="text-[9px] text-text-muted/50">최대 4개</span>
            )}
          </div>
        )}
      </div>

      {/* 결과 뷰 */}
      {view === 'result' && result && (
        <div>
          {/* 점수 요약 */}
          <div className="mb-6 rounded-2xl border border-border bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {result.faviconUrl && <img src={result.faviconUrl} alt="" width={40} height={40} className="rounded-xl" />}
                <div>
                  <div className="text-base font-semibold text-text">{result.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
                  <div className="text-xs text-text-muted">GEO & SEO 진단</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <GaugeChart score={result.seoScore} label="SEO" color={getChartColors()[2]} size={80} />
                <GaugeChart score={result.geoScore} label="GEO" color={getChartColors()[2]} size={80} />
                {result.performanceScore !== undefined && (
                  <GaugeChart score={result.performanceScore} label="Performance" color={result.performanceScore >= 90 ? '#059669' : result.performanceScore >= 50 ? '#D97706' : '#DC2626'} size={80} />
                )}
                <GaugeChart score={result.totalScore} label="종합" color={GRADE_MAP[result.grade]?.color || '#6B7280'} size={100} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: GRADE_MAP[result.grade]?.color, background: `${GRADE_MAP[result.grade]?.color}15` }}>
                {GRADE_MAP[result.grade]?.label} — {GRADE_MAP[result.grade]?.message}
              </span>
              <div className="flex gap-2">
              </div>
            </div>
          </div>


          {/* 상위 이슈 */}
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-bold text-text">상위 이슈</h2>
            <div className="space-y-2">
              {result.topIssues.map((issue, i) => {
                const sc = issue.severity === 'high' ? '#DC2626' : '#EA580C';
                return (
                  <div key={i} className="rounded-xl border border-border bg-white p-4" style={{ borderLeftWidth: 3, borderLeftColor: sc }}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-text">{issue.title}</span>
                      <span className="text-xs font-semibold" style={{ color: sc }}>{issue.severity === 'high' ? '위험' : issue.severity === 'medium' ? '주의' : '참고'}</span>
                    </div>
                    <p className="text-xs text-text-sub">{issue.description}</p>
                    <p className="mt-1 text-xs text-text-muted">→ {issue.action}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEO/GEO 상세 */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="mb-3 text-sm font-bold text-text">기술 SEO</h2>
              <div className="space-y-2">
                {result.techSeo.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <StatusIcon status={item.status} />
                    <span className="flex-1 text-text-sub">{item.name}</span>
                    <span className="font-semibold text-text">{item.score}/{item.maxScore}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="mb-3 text-sm font-bold text-text">콘텐츠 SEO</h2>
              <div className="space-y-2">
                {result.contentSeo.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <StatusIcon status={item.status} />
                    <span className="flex-1 text-text-sub">{item.name}</span>
                    <span className="font-semibold text-text">{item.score}/{item.maxScore}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 성능 (Core Web Vitals) */}
          {result.performance && (
            <div className="mt-4 rounded-2xl border border-border bg-white p-5">
              <h2 className="mb-3 text-sm font-bold text-text flex items-center gap-1.5"><Gauge size={14} /> 성능 (Core Web Vitals)</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {(() => {
                  const perf = result.performance;
                  const lcpColor = perf.lcp < 2500 ? '#059669' : perf.lcp < 4000 ? '#D97706' : '#DC2626';
                  const clsColor = perf.cls < 0.1 ? '#059669' : perf.cls < 0.25 ? '#D97706' : '#DC2626';
                  const tbtColor = perf.tbt < 200 ? '#059669' : perf.tbt < 600 ? '#D97706' : '#DC2626';
                  return (
                    <>
                      <div className="rounded-xl border border-border p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-text-muted mb-2"><Zap size={12} /> LCP</div>
                        <div className="text-2xl font-bold" style={{ color: lcpColor }}>{(perf.lcp / 1000).toFixed(1)}s</div>
                        <div className="mt-1 text-[10px] text-text-muted">Largest Contentful Paint</div>
                        <div className="mt-1 text-[10px] font-medium" style={{ color: lcpColor }}>{perf.lcp < 2500 ? '양호' : perf.lcp < 4000 ? '개선 필요' : '나쁨'}</div>
                      </div>
                      <div className="rounded-xl border border-border p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-text-muted mb-2"><Gauge size={12} /> CLS</div>
                        <div className="text-2xl font-bold" style={{ color: clsColor }}>{perf.cls.toFixed(3)}</div>
                        <div className="mt-1 text-[10px] text-text-muted">Cumulative Layout Shift</div>
                        <div className="mt-1 text-[10px] font-medium" style={{ color: clsColor }}>{perf.cls < 0.1 ? '양호' : perf.cls < 0.25 ? '개선 필요' : '나쁨'}</div>
                      </div>
                      <div className="rounded-xl border border-border p-4 text-center">
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

          {/* GEO Readiness */}
          {result.geoReadiness && result.geoReadiness.length > 0 && (
            <div className="mt-4 rounded-2xl border border-border bg-white p-5">
              <h2 className="mb-3 text-sm font-bold text-text">AI 검색 최적화 (GEO Readiness)</h2>
              <div className="space-y-2">
                {result.geoReadiness.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <StatusIcon status={item.status} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-text-sub">{item.name}</span>
                        <span className="font-semibold text-text">{item.score}/{item.maxScore}</span>
                      </div>
                      {item.status !== 'pass' && <p className="mt-0.5 text-xs text-text-muted">→ {item.action}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI 검색 노출 */}
          <div className="mt-4 rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-text">AI 검색 노출 추정</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {result.geoChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  {check.mentioned ? <CheckCircle2 size={14} className="text-success" /> : <XCircle size={14} className="text-danger" />}
                  <span className="text-text">{check.platform}</span>
                  <span className="flex-1 text-right text-xs text-text-muted">{check.mentioned ? '노출' : '미노출'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 레이더 차트 */}
          <div className="mt-4 rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-text">GEO & SEO 종합 분석</h2>
            <div className="flex justify-center">
              <RadarChart
                labels={['기술 SEO', '콘텐츠 SEO', 'AI 가시성', 'AI 최적화', '키워드', '콘텐츠 갭']}
                values={[
                  (() => {
                    const techPct = result.techSeo.length > 0 ? Math.round(result.techSeo.reduce((s, x) => s + x.score, 0) / result.techSeo.reduce((s, x) => s + x.maxScore, 0) * 100) : 0;
                    return result.performance?.score !== undefined ? Math.round((techPct + result.performance.score) / 2) : techPct;
                  })(),
                  result.contentSeo.length > 0 ? Math.round(result.contentSeo.reduce((s, x) => s + x.score, 0) / result.contentSeo.reduce((s, x) => s + x.maxScore, 0) * 100) : 0,
                  result.geoChecks.length > 0 ? Math.round(result.geoChecks.filter(c => c.mentioned).length / result.geoChecks.length * 100) : 0,
                  result.geoReadiness && result.geoReadiness.length > 0 ? Math.round(result.geoReadiness.reduce((s, x) => s + x.score, 0) / result.geoReadiness.reduce((s, x) => s + x.maxScore, 0) * 100) : 0,
                  result.deep?.keywords ? Math.min(100, result.deep.keywords.length * 10) : 50,
                  result.deep?.contentGaps ? Math.max(0, 100 - result.deep.contentGaps.length * 15) : 60,
                ]}
                size={360}
              />
            </div>
          </div>

          {/* 심화 분석 (deep) */}
          {result.deep && (
            <div className="mt-4 space-y-4">
              {/* 키워드 분석 */}
              {result.deep.keywords && result.deep.keywords.length > 0 && (
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h2 className="mb-3 text-sm font-bold text-text">키워드 분석</h2>
                  <div className="flex flex-wrap gap-2">
                    {result.deep.keywords.map((kw: any, i: number) => (
                      <span key={i} className="rounded-full bg-surface px-3 py-1 text-xs text-text-sub">{typeof kw === 'string' ? kw : kw.keyword || JSON.stringify(kw)}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 콘텐츠 갭 */}
              {result.deep.contentGaps && result.deep.contentGaps.length > 0 && (
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h2 className="mb-3 text-sm font-bold text-text">콘텐츠 갭 분석</h2>
                  <p className="mb-2 text-xs text-text-muted">경쟁사 대비 부족한 콘텐츠 영역</p>
                  <div className="space-y-2">
                    {result.deep.contentGaps.map((gap: any, i: number) => {
                      const pColor = (gap.priority === 'high') ? '#DC2626' : '#EA580C';
                      return (
                        <div key={i} className="rounded-xl border border-border bg-white p-3" style={{ borderLeftWidth: 3, borderLeftColor: pColor }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-text">{gap.topic || gap.title || gap.gap || '항목'}</span>
                            <span className="text-[9px] font-semibold uppercase" style={{ color: pColor }}>{gap.priority}</span>
                          </div>
                          <p className="text-[11px] text-text-sub">{gap.reason}</p>
                          {gap.suggestedFormat && <p className="mt-1 text-[11px] text-text-muted">📝 {gap.suggestedFormat}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 개선 액션 플랜 */}
              {result.deep.actionPlan && result.deep.actionPlan.length > 0 && (
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h2 className="mb-3 text-sm font-bold text-text">개선 액션 플랜</h2>
                  <div className="space-y-2">
                    {result.deep.actionPlan.map((item: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-3">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${item.impact === '높음' ? 'bg-danger' : 'bg-warning'}`}>{item.priority || i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-text-sub">{item.category}</span>
                            <span className={`text-[10px] font-semibold ${item.impact === '높음' ? 'text-danger' : 'text-warning'}`}>{item.impact}</span>
                          </div>
                          <div className="text-xs text-text break-words">{item.action}</div>
                          {item.effort && <div className="mt-0.5 text-[10px] text-text-muted">난이도: {item.effort}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 비교 뷰 */}
      {view === 'compare' && result && compareResult && (
        <div>
          <div className="mb-6 rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-4 text-sm font-bold text-text">경쟁사 비교</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {[result, compareResult].map((r, i) => {
                const grade = GRADE_MAP[r.grade] || GRADE_MAP['critical'];
                return (
                  <div key={i} className={`rounded-xl border p-5 ${i === 0 ? 'border-text/20 bg-surface' : 'border-border'}`}>
                    <div className="mb-3 flex items-center gap-2">
                      {r.faviconUrl && <img src={r.faviconUrl} alt="" width={24} height={24} className="rounded" />}
                      <span className="text-sm font-semibold text-text">{r.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                      {i === 0 && <span className="rounded bg-text/10 px-1.5 py-0.5 text-[9px] font-bold text-text">내 사이트</span>}
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <GaugeChart score={r.seoScore} label="SEO" color={getChartColors()[2]} size={70} />
                      <GaugeChart score={r.geoScore} label="GEO" color={getChartColors()[2]} size={70} />
                      <GaugeChart score={r.totalScore} label="종합" color={grade.color} size={85} />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: grade.color }}>{grade.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 항목별 비교 */}
            <div className="mt-6">
              <h3 className="mb-2 text-xs font-semibold text-text-sub">항목별 비교</h3>
              <div className="space-y-1.5">
                {['기술 SEO', '콘텐츠 SEO', 'GEO 노출', 'AI 최적화'].map((label, i) => {
                  const scores = [
                    [result.techSeo, compareResult.techSeo],
                    [result.contentSeo, compareResult.contentSeo],
                    [result.geoChecks, compareResult.geoChecks],
                    [result.geoReadiness, compareResult.geoReadiness],
                  ];
                  const getScore = (arr: any[]) => {
                    if (!arr || arr.length === 0) return 0;
                    if ('score' in arr[0]) return Math.round(arr.reduce((s: number, x: any) => s + x.score, 0) / arr.reduce((s: number, x: any) => s + x.maxScore, 0) * 100);
                    if ('mentioned' in arr[0]) return Math.round(arr.filter((x: any) => x.mentioned).length / arr.length * 100);
                    return 0;
                  };
                  const a = getScore(scores[i][0]);
                  const b = getScore(scores[i][1]);
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-20 text-xs text-text-sub">{label}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-4 rounded bg-surface overflow-hidden"><div className="h-full rounded bg-text/70" style={{ width: `${a}%` }} /></div>
                        <span className="w-10 text-right text-xs font-semibold text-text">{a}%</span>
                      </div>
                      <span className="text-xs text-text-muted">vs</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-4 rounded bg-surface overflow-hidden"><div className="h-full rounded bg-text-muted/50" style={{ width: `${b}%` }} /></div>
                        <span className="w-10 text-right text-xs font-semibold text-text-sub">{b}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 목록 뷰 */}
      {view === 'list' && (
        <>
          {/* ── 자사 진단 이력 ── */}
          {(() => {
            const mySiteDomain = mySiteUrl ? mySiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
            const myScans = mySiteDomain ? scanLog.filter(s => s.url.replace(/^https?:\/\//, '').replace(/\/$/, '') === mySiteDomain) : scanLog;
            const totalPages = Math.ceil(myScans.length / HISTORY_PAGE_SIZE);
            const paged = myScans.slice((historyPage - 1) * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE);
            return myScans.length > 0 ? (
              <div className="mb-6 rounded-2xl border border-border bg-white">
                <div className="border-b border-border px-5 py-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text">자사 진단 이력</h2>
                  <span className="text-xs text-text-muted">{mySiteDomain || '전체'} · {myScans.length}건</span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-text-muted bg-surface">
                      <th className="px-4 py-3 text-left font-medium">URL</th>
                      <th className="px-3 py-3 text-center font-medium">GEO</th>
                      <th className="px-3 py-3 text-center font-medium">SEO</th>
                      <th className="px-3 py-3 text-center font-medium">평균</th>
                      <th className="px-3 py-3 text-center font-medium">변화</th>
                      <th className="px-3 py-3 text-center font-medium">차트</th>
                      <th className="px-4 py-3 text-right font-medium">일시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((scan, i) => {
                      const domain = scan.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
                      const scoreColor = scan.score >= 80 ? '#059669' : scan.score >= 60 ? '#D97706' : scan.score >= 40 ? '#EA580C' : '#DC2626';
                      const geo = scan.geoScore ?? Math.round(scan.score * 0.48);
                      const seo = scan.seoScore ?? (scan.score - (scan.geoScore ?? Math.round(scan.score * 0.48)));
                      const globalIdx = (historyPage - 1) * HISTORY_PAGE_SIZE + i;
                      const prev = myScans[globalIdx + 1];
                      const diff = prev ? scan.score - prev.score : 0;
                      const rv = [geo * 2, seo * 2, Math.min(100, scan.score + 10), Math.min(100, geo * 1.8), Math.min(100, seo * 1.5), Math.max(0, 100 - scan.score)];
                      return (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer" onClick={() => { setUrl(scan.url); handleScan(scan.url); }}>
                          <td className="px-4 py-3 font-medium text-text text-sm">{domain}</td>
                          <td className="px-3 py-3 text-center text-sm text-text-sub">{geo}</td>
                          <td className="px-3 py-3 text-center text-sm text-text-sub">{seo}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="inline-block rounded-md px-2.5 py-1 text-xs font-bold text-white" style={{ background: scoreColor }}>{scan.score}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {globalIdx < myScans.length - 1 ? (
                              <span className={`text-sm font-bold ${diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-text-muted'}`}>
                                {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
                              </span>
                            ) : <span className="text-xs text-text-muted">—</span>}
                          </td>
                          <td className="px-3 py-1 text-center">
                            <div className="inline-block"><RadarChart labels={['기술','콘텐츠','AI','최적화','KW','갭']} values={rv} size={72} hideLabels /></div>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-text-muted">{new Date(scan.date).toLocaleDateString('ko-KR')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border px-5 py-2.5">
                    <span className="text-xs text-text-muted">{historyPage} / {totalPages} 페이지</span>
                    <div className="flex gap-1">
                      <button onClick={() => setHistoryPage(Math.max(1, historyPage - 1))} disabled={historyPage === 1}
                        className="rounded border border-border px-2 py-1 text-[10px] text-text-muted hover:bg-surface disabled:opacity-30">이전</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(p => (
                        <button key={p} onClick={() => setHistoryPage(p)}
                          className={`rounded px-2 py-1 text-[10px] font-medium ${historyPage === p ? 'bg-text text-white' : 'border border-border text-text-sub hover:bg-surface'}`}>{p}</button>
                      ))}
                      <button onClick={() => setHistoryPage(Math.min(totalPages, historyPage + 1))} disabled={historyPage === totalPages}
                        className="rounded border border-border px-2 py-1 text-[10px] text-text-muted hover:bg-surface disabled:opacity-30">다음</button>
                    </div>
                  </div>
                )}
              </div>
            ) : null;
          })()}

          {/* ── 경쟁사 진단 이력 ── */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">경쟁사 진단 이력</h2>
              <span className="text-xs text-text-muted">상단 검색창에서 경쟁사 URL을 진단하면 자동으로 기록됩니다</span>
            </div>

            {compareHistory.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-white py-10 text-center">
                <p className="text-sm text-text-muted">경쟁사 진단 이력이 없습니다</p>
                <p className="mt-1 text-xs text-text-muted/60">상단에 경쟁사를 등록하고 진단 버튼을 클릭하세요</p>
              </div>
            )}
            {compareHistory.length > 0 && (() => {
              const compTotal = Math.ceil(compareHistory.length / HISTORY_PAGE_SIZE);
              const compPaged = compareHistory.slice((compHistoryPage - 1) * HISTORY_PAGE_SIZE, compHistoryPage * HISTORY_PAGE_SIZE);
              return (
                <div className="rounded-2xl border border-border bg-white">
                  <div className="border-b border-border px-5 py-3 flex items-center justify-between">
                    <span className="text-xs text-text-muted">경쟁사 {compareHistory.length}건</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-text-muted bg-surface">
                        <th className="px-4 py-3 text-left font-medium">URL</th>
                        <th className="px-3 py-3 text-center font-medium">GEO</th>
                        <th className="px-3 py-3 text-center font-medium">SEO</th>
                        <th className="px-3 py-3 text-center font-medium">평균</th>
                        <th className="px-3 py-3 text-center font-medium">차트</th>
                        <th className="px-4 py-3 text-right font-medium">일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compPaged.map((ch, i) => {
                        const domain = ch.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
                        const scoreColor = ch.score >= 80 ? '#059669' : ch.score >= 60 ? '#D97706' : ch.score >= 40 ? '#EA580C' : '#DC2626';
                        const rv = [ch.geo * 2, ch.seo * 2, Math.min(100, ch.score + 10), Math.min(100, ch.geo * 1.8), Math.min(100, ch.seo * 1.5), Math.max(0, 100 - ch.score)];
                        return (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer"
                            onClick={() => { setUrl(ch.url); handleScan(ch.url); }}>
                            <td className="px-4 py-3 font-medium text-text text-sm">{domain}</td>
                            <td className="px-3 py-3 text-center text-sm text-text-sub">{ch.geo}</td>
                            <td className="px-3 py-3 text-center text-sm text-text-sub">{ch.seo}</td>
                            <td className="px-3 py-3 text-center">
                              <span className="inline-block rounded-md px-2.5 py-1 text-xs font-bold text-white" style={{ background: scoreColor }}>{ch.score}</span>
                            </td>
                            <td className="px-3 py-1 text-center">
                              <div className="inline-block"><RadarChart labels={['기술','콘텐츠','AI','최적화','KW','갭']} values={rv} size={72} hideLabels /></div>
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-text-muted">{new Date(ch.date).toLocaleDateString('ko-KR')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {compTotal > 1 && (
                    <div className="flex items-center justify-between border-t border-border px-5 py-2.5">
                      <span className="text-xs text-text-muted">{compHistoryPage} / {compTotal}</span>
                      <div className="flex gap-1">
                        <button onClick={() => setCompHistoryPage(Math.max(1, compHistoryPage - 1))} disabled={compHistoryPage === 1}
                          className="rounded border border-border px-2 py-1 text-[10px] text-text-muted hover:bg-surface disabled:opacity-30">이전</button>
                        <button onClick={() => setCompHistoryPage(Math.min(compTotal, compHistoryPage + 1))} disabled={compHistoryPage === compTotal}
                          className="rounded border border-border px-2 py-1 text-[10px] text-text-muted hover:bg-surface disabled:opacity-30">다음</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* AI 캠페인 기획서 생성 */}
      {result && view === 'result' && (
        <div className="mb-4 text-center">
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
      )}

      <NextStepCTA stage="진단 → 기획" title="진단 결과로 개선 프로젝트 시작" description="발견된 개선 포인트를 프로젝트와 태스크로 전환하여 체계적으로 관리하세요" actionLabel="프로젝트 생성" href="/dashboard/workflow/projects" />
    </div>
  );
}
