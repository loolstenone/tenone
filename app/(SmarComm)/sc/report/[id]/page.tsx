'use client';

import { use, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, AlertTriangle, CheckCircle2, XCircle,
  ExternalLink, Clock, Target, ChevronRight, Lock,
  Download, Share2, Printer, Gauge, Zap, Timer,
  Lightbulb, Loader2
} from 'lucide-react';
import Header from '@/components/smarcomm/Header';
import Footer from '@/components/smarcomm/Footer';
import GaugeChart from '@/components/smarcomm/GaugeChart';
import RadarChart from '@/components/smarcomm/RadarChart';
import { getUser } from '@/lib/smarcomm/auth';
import { analyzeBrandPersonality } from '@/lib/smarcomm/brand-personality';

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
}

function getScoreComment(score: number, maxScore: number): string {
  const pct = score / maxScore;
  if (pct >= 0.9) return '최적 상태입니다';
  if (pct >= 0.7) return '양호하지만 개선 여지가 있습니다';
  if (pct >= 0.4) return '보통 수준 — 개선이 필요합니다';
  return '미흡 — 우선 개선이 필요합니다';
}

function SeoItemRow({ item }: { item: { name: string; score: number; maxScore: number; status: Status; description: string; action: string } }) {
  return (
    <div className="rounded-xl border border-border bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <StatusIcon status={item.status} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text">{item.name}</div>
          <div className="text-xs text-text-muted">{item.description}</div>
        </div>
        <div className="text-sm font-semibold text-text-sub whitespace-nowrap">{item.score}/{item.maxScore}</div>
      </div>
      <div className="mt-2 ml-8 text-xs text-text-muted">
        {getScoreComment(item.score, item.maxScore)}
        {item.status !== 'pass' && <span className="text-text-sub"> → {item.action}</span>}
      </div>
    </div>
  );
}

function ReportContent({ scanId }: { scanId: string }) {
  const router = useRouter();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFloating, setShowFloating] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const handleGenerateCampaignPlan = async () => {
    const stored = sessionStorage.getItem(`scan_${scanId}`);
    if (!stored) return;
    setGeneratingPlan(true);
    try {
      const res = await fetch('/api/smarcomm/advisor/campaign-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult: JSON.parse(stored) }),
      });
      if (res.ok) {
        const plan = await res.json();
        sessionStorage.setItem('campaignPlan', JSON.stringify(plan));
        router.push('/sc/dashboard/advisor');
      }
    } catch (e) {
      console.error('Campaign plan generation failed:', e);
    }
    setGeneratingPlan(false);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(`scan_${scanId}`);
    if (stored) setScan(JSON.parse(stored));
    setIsLoggedIn(!!getUser());
    setLoading(false);
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

          {/* Score */}
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
                    <RadarChart labels={radarLabels} values={radarValues} size={280} />
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
                      <div className="text-xs font-mono text-text-muted tracking-widest mb-3">{personality.type}</div>
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
                      <div className="space-y-3 border-t border-border pt-4">
                        <div>
                          <h4 className="text-xs font-semibold text-text mb-1">소비자와의 관계</h4>
                          <p className="text-sm text-text-sub">{personality.relationship}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-text mb-1">커뮤니케이션 방식</h4>
                          <p className="text-sm text-text-sub">{personality.communication}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-text mb-1">추천 개선 방향</h4>
                          <p className="text-sm text-text-sub">{personality.recommendation}</p>
                        </div>
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
            <h2 className="mb-4 text-[15px] font-bold text-text">AI 검색 노출 추정</h2>
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
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-surface text-xs text-text-muted">
                              <th className="px-4 py-2 text-left font-medium">#</th>
                              <th className="px-4 py-2 text-left font-medium">카테고리</th>
                              <th className="px-4 py-2 text-left font-medium">액션</th>
                              <th className="px-4 py-2 text-center font-medium">영향도</th>
                              <th className="px-4 py-2 text-center font-medium">난이도</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scan.deep.actionPlan.map((item, i) => (
                              <tr key={i} className="border-b border-border last:border-0">
                                <td className="px-4 py-2.5 text-text-muted">{item.priority}</td>
                                <td className="px-4 py-2.5"><span className="rounded bg-surface px-1.5 py-0.5 text-xs text-text-sub">{item.category}</span></td>
                                <td className="px-4 py-2.5 text-text-sub">{item.action}</td>
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
