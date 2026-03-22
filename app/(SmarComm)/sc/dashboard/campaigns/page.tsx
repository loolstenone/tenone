'use client';

import { useState } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { MOCK_CAMPAIGNS, formatCurrency, getStatusLabel, getStatusColor } from '@/lib/smarcomm/dashboard-data';
import BarChart from '@/components/smarcomm/charts/BarChart';
import DonutChart from '@/components/smarcomm/charts/DonutChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';

export default function CampaignsPage() {
  const [filter, setFilter] = useState('전체');
  const [search, setSearch] = useState('');

  const statuses = ['전체', '진행 중', '일시정지', '종료', '준비 중'];
  const filtered = MOCK_CAMPAIGNS.filter(c => {
    const matchStatus = filter === '전체' || getStatusLabel(c.status) === filter;
    const matchSearch = !search || c.name.includes(search) || c.channel.includes(search);
    return matchStatus && matchSearch;
  });

  const totalBudget = MOCK_CAMPAIGNS.reduce((s, c) => s + c.budget, 0);
  const totalSpent = MOCK_CAMPAIGNS.reduce((s, c) => s + c.spent, 0);
  const totalConversions = MOCK_CAMPAIGNS.reduce((s, c) => s + c.conversions, 0);

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">광고 집행</h1>
          <p className="mt-1 text-xs text-text-muted">다채널 캠페인을 관리하고 성과를 추적하세요</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-text-sub hover:text-text"><Download size={12} /> 내보내기</button>
          <button className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub"><Plus size={15} /> 새 캠페인</button>
        </div>
      </div>

      {/* KPI */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">총 예산</div><div className="text-2xl font-bold text-text">{formatCurrency(totalBudget)}원</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">집행 금액</div><div className="text-2xl font-bold text-text">{formatCurrency(totalSpent)}원</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">집행률</div><div className="text-2xl font-bold text-text">{Math.round(totalSpent / totalBudget * 100)}%</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">총 전환</div><div className="text-2xl font-bold text-text">{totalConversions}건</div>
        </div>
      </div>

      {/* 차트 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">캠페인별 전환 수</h2>
          <BarChart data={MOCK_CAMPAIGNS.map(c => ({ label: c.name.substring(0, 6), value: c.conversions }))} height={180} color={getChartColors()[0]} />
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">채널별 비중</h2>
          <DonutChart data={MOCK_CAMPAIGNS.filter(c => c.spent > 0).map((c, i) => ({ label: c.channel.split(' ')[0], value: c.spent, color: getChartColors()[i] }))} size={140} centerLabel="총 집행" centerValue={formatCurrency(totalSpent)} />
        </div>
      </div>

      {/* 필터 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="캠페인 검색" className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
        </div>
        <div className="flex gap-1">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filter === s ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-xs text-text-muted">
            <th className="px-5 py-3 text-left font-medium">캠페인명</th>
            <th className="px-5 py-3 text-left font-medium">채널</th>
            <th className="px-5 py-3 text-center font-medium">상태</th>
            <th className="px-5 py-3 text-right font-medium">노출</th>
            <th className="px-5 py-3 text-right font-medium">클릭</th>
            <th className="px-5 py-3 text-right font-medium">CTR</th>
            <th className="px-5 py-3 text-right font-medium">전환</th>
            <th className="px-5 py-3 text-right font-medium">집행액</th>
            <th className="px-5 py-3 text-right font-medium">기간</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => {
              const ctr = c.impressions > 0 ? (c.clicks / c.impressions * 100).toFixed(2) : '-';
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer">
                  <td className="px-5 py-3 font-medium text-text">{c.name}</td>
                  <td className="px-5 py-3 text-text-sub">{c.channel}</td>
                  <td className="px-5 py-3 text-center"><span className="flex items-center justify-center gap-1 text-xs" style={{ color: getStatusColor(c.status) }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: getStatusColor(c.status) }} />{getStatusLabel(c.status)}</span></td>
                  <td className="px-5 py-3 text-right text-text-sub">{c.impressions.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-text-sub">{c.clicks.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-text-sub">{ctr}%</td>
                  <td className="px-5 py-3 text-right font-medium text-text">{c.conversions}</td>
                  <td className="px-5 py-3 text-right text-text-sub">{formatCurrency(c.spent)}원</td>
                  <td className="px-5 py-3 text-right text-xs text-text-muted">{c.startDate}~{c.endDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NextStepCTA stage="실행 → 결과" title="집행 결과를 보고서로 확인" description="채널별 성과를 분석하고 통합 캠페인 보고서를 생성하세요" actionLabel="보고서 보기" href="/sc/dashboard/reports" />
    </div>
  );
}
