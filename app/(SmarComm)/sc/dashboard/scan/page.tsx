'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Globe, Clock, RefreshCw, ExternalLink, Plus, FileBarChart, ArrowRight, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { getScanLog } from '@/lib/smarcomm/auth';
import GaugeChart from '@/components/smarcomm/GaugeChart';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';
import RadarChart from '@/components/smarcomm/RadarChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';

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
  const scanLog = getScanLog().reverse();

  // 내 사이트 (설정에서 가져오기)
  const savedCompany = typeof window !== 'undefined' ? localStorage.getItem('sc_company') : null;
  const mySiteUrl = savedCompany ? JSON.parse(savedCompany).siteUrl || '' : '';

  // 메인 페이지에서 넘어온 pending scan 자동 실행
  useEffect(() => {
    const pending = sessionStorage.getItem('sc_pending_scan');
    if (pending) {
      sessionStorage.removeItem('sc_pending_scan');
      setUrl(pending);
      handleScan(pending);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async (targetUrl: string) => {
    const normalized = targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl;
    try { new URL(normalized); } catch { return; }

    setScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      });
      if (!res.ok) { setScanning(false); return; }
      const data = await res.json();
      setResult(data);
      setView('result');

      // 스캔 로그 저장
      const { saveScanUrl } = await import('@/lib/smarcomm/auth');
      saveScanUrl(data.url, data.totalScore);
    } catch { }
    setScanning(false);
  };

  const handleCompare = async () => {
    if (!compareUrl.trim()) return;
    const normalized = compareUrl.startsWith('http') ? compareUrl : 'https://' + compareUrl;
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
      }
    } catch { }
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
      <h1 className="mb-1 text-xl font-bold text-text">사이트 진단</h1>
      <p className="mb-6 text-xs text-text-muted">GEO + SEO 통합 진단 · 경쟁사 비교 · SmarComm. Index 리포트</p>

      {/* URL 입력 */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan(url)}
              placeholder="분석할 사이트 URL"
              className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
          </div>
          <button onClick={() => handleScan(url)} disabled={scanning}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-text px-6 py-3 text-sm font-semibold text-white hover:bg-accent-sub disabled:opacity-50">
            <Search size={15} /> {scanning ? '분석 중...' : '진단'}
          </button>
        </div>
        {mySiteUrl && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-text-muted">내 사이트:</span>
            <button onClick={() => { setUrl(mySiteUrl); handleScan(mySiteUrl); }}
              className="rounded-full border border-border px-3 py-1 text-xs text-text-sub hover:text-text hover:bg-surface">
              {mySiteUrl.replace(/^https?:\/\//, '')}
            </button>
          </div>
        )}
      </div>

      {/* 결과 뷰 */}
      {view === 'result' && result && (
        <div>
          {/* 점수 요약 */}
          <div className="mb-6 rounded-2xl border border-border bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {result.faviconUrl && <img src={result.faviconUrl} alt={`${result.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} 파비콘`} width={32} height={32} className="rounded-lg sm:h-10 sm:w-10 sm:rounded-xl" />}
                <div>
                  <div className="text-sm font-semibold text-text sm:text-base">{result.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
                  <div className="text-xs text-text-muted">SmarComm. Index</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <GaugeChart score={result.seoScore} label="SEO" color={getChartColors()[2]} size={64} />
                <GaugeChart score={result.geoScore} label="GEO" color={getChartColors()[2]} size={64} />
                <GaugeChart score={result.totalScore} label="종합" color={GRADE_MAP[result.grade]?.color || '#6B7280'} size={80} />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: GRADE_MAP[result.grade]?.color, background: `${GRADE_MAP[result.grade]?.color}15` }}>
                {GRADE_MAP[result.grade]?.label} — {GRADE_MAP[result.grade]?.message}
              </span>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-sub hover:text-text">PDF</button>
                <button onClick={() => { setView('list'); setCompareResult(null); }} className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-sub hover:text-text">목록</button>
              </div>
            </div>
          </div>

          {/* 경쟁사 비교 입력 */}
          <div className="mb-6 rounded-2xl border border-border bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-sm font-semibold text-text shrink-0">경쟁사 비교</span>
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <input type="url" value={compareUrl} onChange={e => setCompareUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCompare()}
                    placeholder="비교할 경쟁사 URL"
                    className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
                </div>
                <button onClick={handleCompare} className="shrink-0 rounded-lg bg-surface px-4 py-2 text-xs font-medium text-text-sub hover:bg-text hover:text-white">비교</button>
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
                      <span className="text-[10px] font-semibold uppercase" style={{ color: sc }}>{issue.severity}</span>
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

          {/* AI 검색 */}
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
                      {r.faviconUrl && <img src={r.faviconUrl} alt={`${r.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} 파비콘`} width={24} height={24} className="rounded" />}
                      <span className="text-sm font-semibold text-text">{r.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                      {i === 0 && <span className="rounded bg-text/10 px-1.5 py-0.5 text-[9px] font-bold text-text">내 사이트</span>}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                      <GaugeChart score={r.seoScore} label="SEO" color={getChartColors()[2]} size={60} />
                      <GaugeChart score={r.geoScore} label="GEO" color={getChartColors()[2]} size={60} />
                      <GaugeChart score={r.totalScore} label="종합" color={grade.color} size={72} />
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
                    <div key={i} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-3">
                      <span className="w-20 shrink-0 text-xs font-medium text-text-sub">{label}</span>
                      <div className="flex items-center gap-2 sm:flex-1">
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <button onClick={() => { setView('result'); setCompareResult(null); }} className="text-xs text-text-muted hover:text-text">← 단일 리포트로 돌아가기</button>
        </div>
      )}

      {/* 목록 뷰 */}
      {view === 'list' && (
        <>
          {uniqueScans.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold text-text">진단한 사이트</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {uniqueScans.slice(0, 6).map((scan, i) => {
                  const domain = scan.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
                  const scoreColor = scan.score >= 80 ? '#059669' : scan.score >= 60 ? '#D97706' : scan.score >= 40 ? '#EA580C' : '#DC2626';
                  return (
                    <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4 hover:bg-surface cursor-pointer"
                      onClick={() => { setUrl(scan.url); handleScan(scan.url); }}>
                      <div>
                        <div className="text-sm font-medium text-text">{domain}</div>
                        <div className="flex items-center gap-1 text-xs text-text-muted"><Clock size={10} />{new Date(scan.date).toLocaleDateString('ko-KR')}</div>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: scoreColor }}>{scan.score}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 전체 이력 */}
          {scanLog.length > 0 && (
            <div className="rounded-2xl border border-border bg-white">
              <div className="border-b border-border px-4 py-3 sm:px-5">
                <h2 className="text-sm font-semibold text-text">전체 진단 이력</h2>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-xs text-text-muted"><th className="px-4 py-2.5 text-left font-medium sm:px-5">URL</th><th className="px-4 py-2.5 text-center font-medium sm:px-5">점수</th><th className="px-4 py-2.5 text-right font-medium sm:px-5">일시</th></tr></thead>
                <tbody>
                  {scanLog.slice(0, 15).map((scan, i) => {
                    const domain = scan.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
                    const scoreColor = scan.score >= 80 ? '#059669' : scan.score >= 60 ? '#D97706' : scan.score >= 40 ? '#EA580C' : '#DC2626';
                    return (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer" onClick={() => { setUrl(scan.url); handleScan(scan.url); }}>
                        <td className="px-4 py-3 font-medium text-text sm:px-5">{domain}</td>
                        <td className="px-4 py-3 text-center sm:px-5"><span className="inline-block rounded-md px-2 py-0.5 text-xs font-bold text-white" style={{ background: scoreColor }}>{scan.score}</span></td>
                        <td className="px-4 py-3 text-right text-text-muted whitespace-nowrap sm:px-5">{new Date(scan.date).toLocaleDateString('ko-KR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </>
      )}

      <NextStepCTA stage="진단 → 기획" title="진단 결과로 개선 프로젝트 시작" description="발견된 개선 포인트를 프로젝트와 태스크로 전환하여 체계적으로 관리하세요" actionLabel="프로젝트 생성" href="/sc/dashboard/workflow/projects" />
    </div>
  );
}
