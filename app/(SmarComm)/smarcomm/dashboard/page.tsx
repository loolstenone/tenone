'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';
import {
  Search, TrendingUp, TrendingDown, ArrowRight, ExternalLink,
  BarChart3, Megaphone, Palette, DollarSign, Globe,
  Clock, ChevronRight, Sparkles, BookOpen,
  ShieldAlert, Archive, Crosshair, Zap,
} from 'lucide-react';
import { getScanLog } from '@/lib/smarcomm/scan-data';
import { MOCK_CAMPAIGNS, MOCK_CREATIVES, MOCK_SALES, formatCurrency, getStatusLabel, getStatusColor } from '@/lib/smarcomm/dashboard-data';
import LineChart from '@/features/smarcomm/charts/LineChart';
import DonutChart from '@/features/smarcomm/charts/DonutChart';
import QuickStartModal from '@/features/smarcomm/QuickStartModal';
import { getChartColors } from '@/lib/smarcomm/chart-palette';

type Tab = 'overview' | 'scan' | 'campaigns' | 'creative' | 'sales';

export default function DashboardOverview() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [url, setUrl] = useState('');
  const [showQuickStart, setShowQuickStart] = useState(false);
  const scanLog = getScanLog().reverse();

  // Smart-Data Hub — 실측 API 데이터
  const [openFlagCount, setOpenFlagCount] = useState<number | null>(null);
  const [assetCount, setAssetCount] = useState<number | null>(null);
  const [hubLoading, setHubLoading] = useState(true);

  useEffect(() => {
    async function loadHubData() {
      try {
        const [flagsRes, assetsRes] = await Promise.all([
          fetch('/api/smarcomm/airm/flags?status=open&limit=200'),
          fetch('/api/smarcomm/assets'),
        ]);
        if (flagsRes.ok) {
          const d = await flagsRes.json();
          setOpenFlagCount((d.flags ?? []).length);
        }
        if (assetsRes.ok) {
          const d = await assetsRes.json();
          setAssetCount((d.assets ?? []).length);
        }
      } catch {
        // silently fail — show N/A
      } finally {
        setHubLoading(false);
      }
    }
    loadHubData();
  }, []);

  const handleScan = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const normalized = trimmed.startsWith('http') ? trimmed : 'https://' + trimmed;
    router.push(`/scan?url=${encodeURIComponent(normalized)}`);
  };

  // Mock KPI 데이터
  const activeCampaigns = MOCK_CAMPAIGNS.filter(c => c.status === 'active');
  const totalSpent = activeCampaigns.reduce((s, c) => s + c.spent, 0);
  const totalConversions = activeCampaigns.reduce((s, c) => s + c.conversions, 0);
  const latestSales = MOCK_SALES[MOCK_SALES.length - 1];
  const prevSales = MOCK_SALES[MOCK_SALES.length - 2];
  const revenueChange = prevSales ? ((latestSales.revenue - prevSales.revenue) / prevSales.revenue * 100).toFixed(1) : '0';

  // 최근 진단 데이터
  const latestScan = scanLog[0] ?? null;
  const latestScore = latestScan?.score ?? null;
  const scoreColor = latestScore === null ? '#9CA3AF'
    : latestScore >= 80 ? '#059669'
    : latestScore >= 60 ? '#D97706'
    : latestScore >= 40 ? '#EA580C'
    : '#DC2626';

  const TABS = [
    { id: 'overview' as Tab, label: '서비스 현황', icon: BarChart3 },
    { id: 'scan' as Tab, label: '사이트 진단', icon: Globe },
    { id: 'campaigns' as Tab, label: '캠페인 성과', icon: Megaphone },
    { id: 'creative' as Tab, label: '소재 현황', icon: Palette },
    { id: 'sales' as Tab, label: '매출 분석', icon: DollarSign },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      {/* 추천 카드 */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold text-point">추천</div>
        <h2 className="mb-4 text-lg font-bold text-text cursor-pointer hover:text-point" onClick={() => setShowQuickStart(true)}>
          빠르게 시작하기 <span className="text-xs font-normal text-text-muted">전체 보기</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: '사이트 GEO/SEO 진단', desc: 'URL 하나로 AI 검색 노출 + 검색 최적화 상태를 즉시 점검하세요.', action: '진단 시작', href: '/dashboard/scan', color: getChartColors()[0] },
            { title: 'AI 소재 제작', desc: '브랜드 가이드 기반으로 광고 카피, 배너, 영상 소재를 자동 생성합니다.', action: '소재 만들기', href: '/dashboard/creative', color: getChartColors()[1] },
            { title: '마케팅 용어 사전', desc: '500개 이상의 마케팅 용어를 한눈에. 기업 맞춤 용어도 추가하세요.', action: '용어 보기', href: '/dashboard/glossary', color: getChartColors()[2] },
          ].map((card, i) => (
            <div
              key={i}
              className="group cursor-pointer rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-md"
              onClick={() => router.push(card.href)}
            >
              <div className="mb-2 text-xs font-semibold" style={{ color: card.color }}>{card.title}</div>
              <p className="mb-3 text-sm text-text-sub leading-relaxed">{card.desc}</p>
              <span className="flex items-center gap-1 text-xs font-semibold text-text group-hover:text-point">
                {card.action} <ChevronRight size={13} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 인사이트 칩 */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {[
          { label: '서비스 현황', href: '#', active: true },
          { label: '퍼널 분석', href: '/dashboard/funnel' },
          { label: '캠페인 성과', href: '/dashboard/campaigns' },
          { label: '채널별 비교', href: '/dashboard/reports' },
          { label: '전환 추이', href: '/dashboard/analytics' },
          { label: '이상 감지', href: '/dashboard/advisor' },
          { label: '소재 현황', href: '/dashboard/creative' },
          { label: '코호트', href: '/dashboard/cohort' },
        ].map((chip, i) => (
          <a key={i} href={chip.href}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${chip.active ? 'border-text bg-text text-white' : 'border-border text-text-sub hover:border-text-muted hover:text-text'}`}>
            {chip.label}
          </a>
        ))}
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-border pb-0">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-text text-text'
                  : 'border-transparent text-text-muted hover:text-text-sub'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      {tab === 'overview' && (
        <div>
          {/* ── Smart-Data Hub — 실측 데이터 ── */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Smart-Data Hub</span>
              <span className="rounded bg-success/10 px-1.5 py-px text-[9px] font-semibold text-success">실측 데이터</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* SmarComm Index — 최근 진단 점수 */}
              <div
                className="cursor-pointer rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-sm"
                onClick={() => router.push('/dashboard/scan')}
              >
                <div className="mb-3 flex items-center gap-1.5">
                  <Crosshair size={13} className="text-text-muted" />
                  <span className="text-xs text-text-muted">SmarComm Index</span>
                </div>
                {latestScore !== null ? (
                  <>
                    <div className="mb-1 text-2xl font-bold" style={{ color: scoreColor }}>{latestScore}</div>
                    <div className="text-xs text-text-muted truncate">{latestScan!.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
                  </>
                ) : (
                  <>
                    <div className="mb-1 text-2xl font-bold text-text-muted">N/A</div>
                    <div className="text-xs text-text-muted">진단 이력 없음</div>
                  </>
                )}
                <div className="mt-2 text-[10px] text-text-muted">총 {scanLog.length}회 진단 · {new Set(scanLog.map(s => s.url)).size}개 사이트</div>
              </div>

              {/* AIRM 오픈 플래그 */}
              <div
                className="cursor-pointer rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-sm"
                onClick={() => router.push('/dashboard/airm')}
              >
                <div className="mb-3 flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-text-muted" />
                  <span className="text-xs text-text-muted">AIRM 오픈 플래그</span>
                </div>
                {hubLoading ? (
                  <div className="h-7 w-12 animate-pulse rounded-lg bg-surface" />
                ) : openFlagCount !== null ? (
                  <>
                    <div className={`mb-1 text-2xl font-bold ${openFlagCount > 0 ? 'text-danger' : 'text-success'}`}>{openFlagCount}</div>
                    <div className={`text-xs ${openFlagCount > 0 ? 'text-danger' : 'text-text-muted'}`}>{openFlagCount > 0 ? '조치 필요' : '플래그 없음'}</div>
                  </>
                ) : (
                  <>
                    <div className="mb-1 text-2xl font-bold text-text-muted">—</div>
                    <div className="text-xs text-text-muted">데이터 없음</div>
                  </>
                )}
                <div className="mt-2 text-[10px] text-text-muted">AI 평판 모니터링</div>
              </div>

              {/* Brand Assets */}
              <div
                className="cursor-pointer rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-sm"
                onClick={() => router.push('/dashboard/assets')}
              >
                <div className="mb-3 flex items-center gap-1.5">
                  <Archive size={13} className="text-text-muted" />
                  <span className="text-xs text-text-muted">Brand Assets</span>
                </div>
                {hubLoading ? (
                  <div className="h-7 w-12 animate-pulse rounded-lg bg-surface" />
                ) : assetCount !== null ? (
                  <>
                    <div className="mb-1 text-2xl font-bold text-text">{assetCount}</div>
                    <div className="text-xs text-text-muted">등록된 엔티티</div>
                  </>
                ) : (
                  <>
                    <div className="mb-1 text-2xl font-bold text-text-muted">—</div>
                    <div className="text-xs text-text-muted">데이터 없음</div>
                  </>
                )}
                <div className="mt-2 text-[10px] text-text-muted">Schema.org JSON-LD 자산화</div>
              </div>
            </div>
          </div>

          {/* ── 광고·매출 — Demo 데이터 ── */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">광고 · 매출</span>
              <span className="rounded bg-amber-100 px-1.5 py-px text-[9px] font-semibold text-amber-700">🧪 Demo 데이터</span>
              <span className="text-[9px] text-text-muted">Phase 5에서 GA4·광고 매체 실 API 연동 예정</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: '이번 달 매출', value: formatCurrency(latestSales.revenue) + '원', change: revenueChange, sub: `전월 대비 ${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}%` },
                { label: '광고 집행액', value: formatCurrency(totalSpent) + '원', change: '12.3', sub: '전월 대비 +12.3%' },
                { label: '전환 수', value: totalConversions + '건', change: '8.5', sub: '전월 대비 +8.5%' },
              ].map((kpi, i) => (
                <div key={i} className="rounded-2xl border border-border bg-white p-5 opacity-80">
                  <div className="mb-3 text-xs text-text-muted">{kpi.label}</div>
                  <div className="mb-1 text-2xl font-bold text-text">{kpi.value}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {Number(kpi.change) >= 0 ? (
                      <span className="flex items-center gap-0.5 text-success"><TrendingUp size={12} />{kpi.sub}</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-danger"><TrendingDown size={12} />{kpi.sub}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 차트 영역 — Demo 데이터 */}
          <div className="mb-6 grid gap-4 lg:grid-cols-5">
            {/* 매출 추이 라인 차트 */}
            <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text">매출 추이</h3>
                <span className="rounded bg-amber-100 px-1.5 py-px text-[9px] font-semibold text-amber-700">🧪 Demo</span>
              </div>
              <LineChart
                data={MOCK_SALES.map(s => ({ label: s.month.replace('2025-', '').replace('2026-', ''), value: s.revenue }))}
                height={200}
                color={getChartColors()[0]}
              />
            </div>

            {/* 채널별 광고비 도넛 차트 */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text">채널별 집행 비중</h3>
                <span className="rounded bg-amber-100 px-1.5 py-px text-[9px] font-semibold text-amber-700">🧪 Demo</span>
              </div>
              <DonutChart
                data={MOCK_CAMPAIGNS.filter(c => c.spent > 0).map((c, i) => ({
                  label: c.channel.split(' ')[0],
                  value: c.spent,
                  color: getChartColors()[i] || '#9CA3AF',
                }))}
                size={160}
                centerLabel="총 집행액"
                centerValue={formatCurrency(MOCK_CAMPAIGNS.reduce((s, c) => s + c.spent, 0))}
              />
            </div>
          </div>

          {/* 활성 캠페인 테이블 — Demo 데이터 */}
          <div className="mb-6 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text">캠페인</h3>
                <span className="rounded bg-amber-100 px-1.5 py-px text-[9px] font-semibold text-amber-700">🧪 Demo</span>
              </div>
              <button onClick={() => router.push('/dashboard/campaigns')} className="text-xs text-text-muted hover:text-text">전체 보기 →</button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted">
                  <th className="px-5 py-2.5 text-left font-medium">캠페인명</th>
                  <th className="px-5 py-2.5 text-left font-medium">채널</th>
                  <th className="px-5 py-2.5 text-center font-medium">상태</th>
                  <th className="px-5 py-2.5 text-right font-medium">전환</th>
                  <th className="px-5 py-2.5 text-right font-medium">집행액</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CAMPAIGNS.slice(0, 4).map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer" onClick={() => router.push('/dashboard/campaigns')}>
                    <td className="px-5 py-3 font-medium text-text">{c.name}</td>
                    <td className="px-5 py-3 text-text-sub">{c.channel}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: getStatusColor(c.status) }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: getStatusColor(c.status) }} />
                        {getStatusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-text">{c.conversions}건</td>
                    <td className="px-5 py-3 text-right text-text-sub">{formatCurrency(c.spent)}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* 최근 진단 테이블 — 실측 데이터 */}
          {scanLog.length > 0 && (
            <div className="rounded-2xl border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text">최근 사이트 진단</h3>
                  <span className="rounded bg-success/10 px-1.5 py-px text-[9px] font-semibold text-success">실측</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted">
                    <th className="px-5 py-2.5 text-left font-medium">URL</th>
                    <th className="px-5 py-2.5 text-center font-medium">점수</th>
                    <th className="px-5 py-2.5 text-right font-medium">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {scanLog.slice(0, 5).map((scan, i) => {
                    const domain = scan.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
                    const sc = scan.score >= 80 ? '#059669' : scan.score >= 60 ? '#D97706' : scan.score >= 40 ? '#EA580C' : '#DC2626';
                    return (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer" onClick={() => router.push(`/scan?url=${encodeURIComponent(scan.url)}`)}>
                        <td className="px-5 py-3 font-medium text-text">{domain}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-block rounded-md px-2 py-0.5 text-xs font-bold text-white" style={{ background: sc }}>{scan.score}</span>
                        </td>
                        <td className="px-5 py-3 text-right text-text-muted">{new Date(scan.date).toLocaleDateString('ko-KR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'scan' && (
        <div>
          <div className="mb-6 rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-3 text-sm font-semibold text-text">새 사이트 진단</h3>
            <div className="flex gap-3">
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleScan()} placeholder="https://yoursite.com"
                className="flex-1 rounded-xl border border-border bg-surface py-2.5 px-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
              <button onClick={handleScan} className="flex items-center gap-1.5 rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
                <Search size={15} /> 진단
              </button>
            </div>
          </div>
          {scanLog.length > 0 && (
            <div className="rounded-2xl border border-border bg-white">
              <div className="border-b border-border px-5 py-3">
                <h3 className="text-sm font-semibold text-text">진단 이력</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted">
                    <th className="px-5 py-2.5 text-left font-medium">URL</th>
                    <th className="px-5 py-2.5 text-center font-medium">점수</th>
                    <th className="px-5 py-2.5 text-right font-medium">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {scanLog.map((scan, i) => {
                    const domain = scan.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
                    const sc = scan.score >= 80 ? '#059669' : scan.score >= 60 ? '#D97706' : scan.score >= 40 ? '#EA580C' : '#DC2626';
                    return (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer" onClick={() => router.push(`/scan?url=${encodeURIComponent(scan.url)}`)}>
                        <td className="px-5 py-3 font-medium text-text">{domain}</td>
                        <td className="px-5 py-3 text-center"><span className="inline-block rounded-md px-2 py-0.5 text-xs font-bold text-white" style={{ background: sc }}>{scan.score}</span></td>
                        <td className="px-5 py-3 text-right text-text-muted">{new Date(scan.date).toLocaleDateString('ko-KR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'campaigns' && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-amber-100 px-1.5 py-px text-[9px] font-semibold text-amber-700">🧪 Demo 데이터</span>
            <span className="text-[9px] text-text-muted">Phase 5에서 광고 매체 실 API 연동 예정</span>
          </div>
          <div className="rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-text">전체 캠페인</h3>
              <button onClick={() => router.push('/dashboard/campaigns')} className="text-xs text-text-muted hover:text-text">상세 보기 →</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted">
                  <th className="px-5 py-2.5 text-left font-medium">캠페인명</th>
                  <th className="px-5 py-2.5 text-left font-medium">채널</th>
                  <th className="px-5 py-2.5 text-center font-medium">상태</th>
                  <th className="px-5 py-2.5 text-right font-medium">노출</th>
                  <th className="px-5 py-2.5 text-right font-medium">클릭</th>
                  <th className="px-5 py-2.5 text-right font-medium">전환</th>
                  <th className="px-5 py-2.5 text-right font-medium">집행액</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CAMPAIGNS.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface">
                    <td className="px-5 py-3 font-medium text-text">{c.name}</td>
                    <td className="px-5 py-3 text-text-sub">{c.channel}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: getStatusColor(c.status) }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: getStatusColor(c.status) }} /> {getStatusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-text-sub">{c.impressions.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-text-sub">{c.clicks.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-medium text-text">{c.conversions}</td>
                    <td className="px-5 py-3 text-right text-text-sub">{formatCurrency(c.spent)}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'creative' && (
        <div className="rounded-2xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-text">소재 현황</h3>
            <button onClick={() => router.push('/dashboard/creative')} className="text-xs text-text-muted hover:text-text">소재 제작 →</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="px-5 py-2.5 text-left font-medium">소재명</th>
                <th className="px-5 py-2.5 text-left font-medium">유형</th>
                <th className="px-5 py-2.5 text-left font-medium">채널</th>
                <th className="px-5 py-2.5 text-center font-medium">상태</th>
                <th className="px-5 py-2.5 text-right font-medium">생성일</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CREATIVES.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3 font-medium text-text">{c.title}</td>
                  <td className="px-5 py-3 text-text-sub">{c.type === 'text' ? '텍스트' : c.type === 'banner' ? '배너' : '영상'}</td>
                  <td className="px-5 py-3 text-text-sub">{c.channel}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.status === 'active' ? 'text-success' : 'text-text-muted'}`}>
                      {c.status === 'active' ? '● 사용 중' : c.status === 'draft' ? '● 초안' : '● 보관'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-text-muted">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sales' && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-amber-100 px-1.5 py-px text-[9px] font-semibold text-amber-700">🧪 Demo 데이터</span>
            <span className="text-[9px] text-text-muted">Phase 5에서 GA4·ERP 실 API 연동 예정</span>
          </div>
          <div className="rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-text">월별 매출</h3>
              <button onClick={() => router.push('/dashboard/analytics')} className="text-xs text-text-muted hover:text-text">상세 보기 →</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted">
                  <th className="px-5 py-2.5 text-left font-medium">기간</th>
                  <th className="px-5 py-2.5 text-right font-medium">매출</th>
                  <th className="px-5 py-2.5 text-right font-medium">광고비</th>
                  <th className="px-5 py-2.5 text-right font-medium">ROAS</th>
                  <th className="px-5 py-2.5 text-right font-medium">전환</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SALES.map((s, i) => {
                  const roas = s.adSpend > 0 ? (s.revenue / s.adSpend * 100).toFixed(0) : '-';
                  return (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                      <td className="px-5 py-3 font-medium text-text">{s.month}</td>
                      <td className="px-5 py-3 text-right text-text">{formatCurrency(s.revenue)}원</td>
                      <td className="px-5 py-3 text-right text-text-sub">{formatCurrency(s.adSpend)}원</td>
                      <td className="px-5 py-3 text-right font-medium text-text">{roas}%</td>
                      <td className="px-5 py-3 text-right text-text-sub">{s.conversions}건</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <QuickStartModal isOpen={showQuickStart} onClose={() => setShowQuickStart(false)} />
    </div>
  );
}
