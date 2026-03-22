'use client';

import { useState } from 'react';
import { Download, Calendar, BarChart3, TrendingUp, Globe, Palette, Megaphone } from 'lucide-react';
import { MOCK_CAMPAIGNS, MOCK_SALES, formatCurrency } from '@/lib/smarcomm/dashboard-data';
import BarChart from '@/components/smarcomm/charts/BarChart';
import DonutChart from '@/components/smarcomm/charts/DonutChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';

export default function ReportsPage() {
  const [period, setPeriod] = useState('2026-03');

  const currentSales = MOCK_SALES.find(s => s.month === period) || MOCK_SALES[MOCK_SALES.length - 1];
  const roas = currentSales.adSpend > 0 ? (currentSales.revenue / currentSales.adSpend * 100).toFixed(0) : '-';
  const cpa = currentSales.conversions > 0 ? Math.round(currentSales.adSpend / currentSales.conversions) : 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">캠페인 보고서</h1>
          <p className="mt-1 text-xs text-text-muted">채널별 성과를 통합 리포트로 확인하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text focus:border-text focus:outline-none" />
          <button className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
            <Download size={15} /> 내보내기
          </button>
        </div>
      </div>

      {/* 월간 KPI */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: '매출', value: formatCurrency(currentSales.revenue) + '원', icon: TrendingUp },
          { label: '광고비', value: formatCurrency(currentSales.adSpend) + '원', icon: BarChart3 },
          { label: 'ROAS', value: roas + '%', icon: TrendingUp },
          { label: 'CPA', value: formatCurrency(cpa) + '원', icon: BarChart3 },
        ].map((kpi, i) => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5">
            <kpi.icon size={16} className="mb-2 text-text-muted" />
            <div className="text-2xl font-bold text-text">{kpi.value}</div>
            <div className="text-xs text-text-muted">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* 채널별 성과 */}
      <div className="mb-6 rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">채널별 성과</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="px-5 py-2.5 text-left font-medium">채널</th>
              <th className="px-5 py-2.5 text-right font-medium">집행액</th>
              <th className="px-5 py-2.5 text-right font-medium">노출</th>
              <th className="px-5 py-2.5 text-right font-medium">클릭</th>
              <th className="px-5 py-2.5 text-right font-medium">CTR</th>
              <th className="px-5 py-2.5 text-right font-medium">전환</th>
              <th className="px-5 py-2.5 text-right font-medium">CPA</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CAMPAIGNS.map(c => {
              const ctr = c.impressions > 0 ? (c.clicks / c.impressions * 100).toFixed(2) : '-';
              const campaignCpa = c.conversions > 0 ? formatCurrency(Math.round(c.spent / c.conversions)) : '-';
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3">
                    <div className="font-medium text-text">{c.channel}</div>
                    <div className="text-xs text-text-muted">{c.name}</div>
                  </td>
                  <td className="px-5 py-3 text-right text-text-sub">{formatCurrency(c.spent)}원</td>
                  <td className="px-5 py-3 text-right text-text-sub">{c.impressions.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-text-sub">{c.clicks.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-text-sub">{ctr}%</td>
                  <td className="px-5 py-3 text-right font-medium text-text">{c.conversions}</td>
                  <td className="px-5 py-3 text-right text-text-sub">{campaignCpa}원</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 차트 */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-text">월별 매출 추이</h2>
          <BarChart
            data={MOCK_SALES.map(s => ({
              label: s.month.replace('2025-', '').replace('2026-', ''),
              value: s.revenue,
            }))}
            height={200}
            color={getChartColors()[0]}
          />
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-text">채널별 전환 비중</h2>
          <DonutChart
            data={MOCK_CAMPAIGNS.filter(c => c.conversions > 0).map((c, i) => ({
              label: c.channel.split(' ')[0],
              value: c.conversions,
              color: getChartColors()[i] || getChartColors()[3],
            }))}
            size={150}
            centerLabel="총 전환"
            centerValue={String(MOCK_CAMPAIGNS.reduce((s, c) => s + c.conversions, 0))}
          />
        </div>
      </div>

      <NextStepCTA stage="결과 → 진단" title="사이트를 재진단하여 개선 효과 측정" description="캠페인 집행 후 GEO/SEO 점수 변화를 확인하고 다음 사이클을 시작하세요" actionLabel="사이트 재진단" href="/sc/dashboard/scan" />
    </div>
  );
}
