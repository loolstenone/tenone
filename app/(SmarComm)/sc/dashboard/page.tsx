'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, TrendingUp, TrendingDown,
  BarChart3, Megaphone, Palette, DollarSign, Globe,
  ChevronRight
} from 'lucide-react';
import { getScanLog } from '@/lib/smarcomm/auth';
import { MOCK_CAMPAIGNS, MOCK_CREATIVES, MOCK_SALES, formatCurrency, getStatusLabel, getStatusColor } from '@/lib/smarcomm/dashboard-data';
import SCLineChart from '@/components/smarcomm/charts/LineChart';
import SCDonutChart from '@/components/smarcomm/charts/DonutChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';

type Tab = 'overview' | 'scan' | 'campaigns' | 'creative' | 'sales';

export default function SCDashboardOverview() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [url, setUrl] = useState('');
  const scanLog = getScanLog().reverse();

  const handleScan = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const normalized = trimmed.startsWith('http') ? trimmed : 'https://' + trimmed;
    router.push(`/scan?url=${encodeURIComponent(normalized)}`);
  };

  const activeCampaigns = MOCK_CAMPAIGNS.filter(c => c.status === 'active');
  const totalSpent = activeCampaigns.reduce((s, c) => s + c.spent, 0);
  const totalConversions = activeCampaigns.reduce((s, c) => s + c.conversions, 0);
  const latestSales = MOCK_SALES[MOCK_SALES.length - 1];
  const prevSales = MOCK_SALES[MOCK_SALES.length - 2];
  const revenueChange = prevSales ? ((latestSales.revenue - prevSales.revenue) / prevSales.revenue * 100).toFixed(1) : '0';

  const TABS = [
    { id: 'overview' as Tab, label: '서비스 현황', icon: BarChart3 },
    { id: 'scan' as Tab, label: '사이트 진단', icon: Globe },
    { id: 'campaigns' as Tab, label: '캠페인 성과', icon: Megaphone },
    { id: 'creative' as Tab, label: '소재 현황', icon: Palette },
    { id: 'sales' as Tab, label: '매출 분석', icon: DollarSign },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold text-point">추천</div>
        <h2 className="mb-4 text-lg font-bold text-text">빠르게 시작하기</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: '사이트 GEO/SEO 진단', desc: 'URL 하나로 AI 검색 노출 + 검색 최적화 상태를 즉시 점검하세요.', action: '진단 시작', href: '/dashboard/scan', color: getChartColors()[0] },
            { title: 'AI 소재 제작', desc: '브랜드 가이드 기반으로 광고 카피, 배너, 영상 소재를 자동 생성합니다.', action: '소재 만들기', href: '/dashboard/creative', color: getChartColors()[1] },
            { title: '마케팅 용어 사전', desc: '500개 이상의 마케팅 용어를 한눈에. 기업 맞춤 용어도 추가하세요.', action: '용어 보기', href: '/dashboard/glossary', color: getChartColors()[2] },
          ].map((card, i) => (
            <div key={i} className="group cursor-pointer rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-md" onClick={() => router.push(card.href)}>
              <div className="mb-2 text-xs font-semibold" style={{ color: card.color }}>{card.title}</div>
              <p className="mb-3 text-sm text-text-sub leading-relaxed">{card.desc}</p>
              <span className="flex items-center gap-1 text-xs font-semibold text-text group-hover:text-point">{card.action} <ChevronRight size={13} /></span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-border pb-0">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.id ? 'border-text text-text' : 'border-transparent text-text-muted hover:text-text-sub'}`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: '이번 달 매출', value: formatCurrency(latestSales.revenue) + '원', change: revenueChange, sub: `전월 대비 ${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}%` },
              { label: '광고 집행액', value: formatCurrency(totalSpent) + '원', change: '12.3', sub: '전월 대비 +12.3%' },
              { label: '전환 수', value: totalConversions + '건', change: '8.5', sub: '전월 대비 +8.5%' },
              { label: '총 진단 횟수', value: scanLog.length + '회', change: String(scanLog.length), sub: `${new Set(scanLog.map(s => s.url)).size}개 사이트` },
            ].map((kpi, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white p-5">
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

          <div className="mb-6 grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-text">매출 추이</h3>
              <SCLineChart data={MOCK_SALES.map(s => ({ label: s.month.replace('2025-', '').replace('2026-', ''), value: s.revenue }))} height={200} color={getChartColors()[0]} />
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-text">채널별 집행 비중</h3>
              <SCDonutChart data={MOCK_CAMPAIGNS.filter(c => c.spent > 0).map((c, i) => ({ label: c.channel.split(' ')[0], value: c.spent, color: getChartColors()[i] || '#9CA3AF' }))} size={160} centerLabel="총 집행액" centerValue={formatCurrency(MOCK_CAMPAIGNS.reduce((s, c) => s + c.spent, 0))} />
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-text">캠페인</h3>
              <button onClick={() => router.push('/dashboard/campaigns')} className="text-xs text-text-muted hover:text-text">전체 보기 →</button>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-xs text-text-muted">
                <th className="px-5 py-2.5 text-left font-medium">캠페인명</th>
                <th className="px-5 py-2.5 text-left font-medium">채널</th>
                <th className="px-5 py-2.5 text-center font-medium">상태</th>
                <th className="px-5 py-2.5 text-right font-medium">전환</th>
                <th className="px-5 py-2.5 text-right font-medium">집행액</th>
              </tr></thead>
              <tbody>
                {MOCK_CAMPAIGNS.slice(0, 4).map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer" onClick={() => router.push('/dashboard/campaigns')}>
                    <td className="px-5 py-3 font-medium text-text">{c.name}</td>
                    <td className="px-5 py-3 text-text-sub">{c.channel}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: getStatusColor(c.status) }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: getStatusColor(c.status) }} />{getStatusLabel(c.status)}
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
      )}

      {tab === 'scan' && (
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-text">사이트 진단</h3>
          <p className="text-sm text-text-sub">사이트 진단 페이지에서 URL을 입력하고 GEO/SEO 통합 진단을 받아보세요.</p>
          <button onClick={() => router.push('/dashboard/scan')} className="mt-4 rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">진단 페이지로 이동</button>
        </div>
      )}

      {tab === 'campaigns' && (
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-text">캠페인 상세</h3>
          <button onClick={() => router.push('/dashboard/campaigns')} className="mt-2 rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">캠페인 관리로 이동</button>
        </div>
      )}

      {tab === 'creative' && (
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-text">소재 관리</h3>
          <button onClick={() => router.push('/dashboard/creative')} className="mt-2 rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">소재 제작으로 이동</button>
        </div>
      )}

      {tab === 'sales' && (
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-text">매출 분석</h3>
          <button onClick={() => router.push('/dashboard/analytics')} className="mt-2 rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">매출 분석으로 이동</button>
        </div>
      )}
    </div>
  );
}
