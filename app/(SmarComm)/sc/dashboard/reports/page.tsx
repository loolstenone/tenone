'use client';

import { useState } from 'react';
import { Download, Calendar, BarChart3, TrendingUp, Globe, Plus, Search, Star } from 'lucide-react';
import { MOCK_CAMPAIGNS, MOCK_SALES, formatCurrency, getStatusLabel, getStatusColor } from '@/lib/smarcomm/dashboard-data';
import { INSIGHT_REPORTS, SAVED_REPORTS, AVAILABLE_CHARTS, CHART_TYPE_MAP, REPORT_TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/smarcomm/report-data';
import LineChart from '@/components/smarcomm/charts/LineChart';
import BarChart from '@/components/smarcomm/charts/BarChart';
import DonutChart from '@/components/smarcomm/charts/DonutChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

type MainTab = 'sales' | 'campaigns' | 'data';
type DataSubTab = 'reports' | 'templates' | 'charts';

export default function ReportsPage() {
  const [mainTab, setMainTab] = useState<MainTab>('sales');

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6">
        <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">리포트</h1><GuideHelpButton /></div>
        <p className="mt-1 text-xs text-text-muted">매출, 캠페인, 데이터 리포트를 통합 관리합니다</p>
      </div>

      {/* 메인 탭 */}
      <div className="mb-6 flex gap-1">
        {([
          { id: 'sales' as MainTab, label: '매출 분석' },
          { id: 'campaigns' as MainTab, label: '캠페인 성과' },
          { id: 'data' as MainTab, label: '데이터 리포트' },
        ]).map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${mainTab === t.id ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {mainTab === 'sales' && <SalesTab />}
      {mainTab === 'campaigns' && <CampaignsTab />}
      {mainTab === 'data' && <DataReportsTab />}

      <NextStepCTA stage="결과 → 진단" title="사이트를 재진단하여 개선 효과 측정" description="캠페인 집행 후 GEO/SEO 점수 변화를 확인하고 다음 사이클을 시작하세요" actionLabel="사이트 재진단" href="/sc/dashboard/scan" />
    </div>
  );
}

/* ── 매출 분석 탭 ── */
function SalesTab() {
  const [sales, setSales] = useState(MOCK_SALES);
  const [newMonth, setNewMonth] = useState('');
  const [newRevenue, setNewRevenue] = useState('');
  const [newAdSpend, setNewAdSpend] = useState('');
  const [newConversions, setNewConversions] = useState('');

  const handleAdd = () => {
    if (!newMonth || !newRevenue) return;
    setSales([...sales, {
      month: newMonth,
      revenue: parseInt(newRevenue) || 0,
      adSpend: parseInt(newAdSpend) || 0,
      conversions: parseInt(newConversions) || 0,
    }]);
    setNewMonth(''); setNewRevenue(''); setNewAdSpend(''); setNewConversions('');
  };

  const totalRevenue = sales.reduce((s, e) => s + e.revenue, 0);
  const totalAdSpend = sales.reduce((s, e) => s + e.adSpend, 0);
  const avgRoas = totalAdSpend > 0 ? (totalRevenue / totalAdSpend * 100).toFixed(0) : '-';

  return (
    <div>
      {/* Summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">총 매출</div>
          <div className="text-xl font-bold text-text">{formatCurrency(totalRevenue)}원</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">총 광고비</div>
          <div className="text-xl font-bold text-text">{formatCurrency(totalAdSpend)}원</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">평균 ROAS</div>
          <div className="text-xl font-bold text-text">{avgRoas}%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">매출 추이</h2>
          <LineChart
            data={sales.map(s => ({ label: s.month.replace('2025-', '').replace('2026-', ''), value: s.revenue }))}
            height={220}
            color={getChartColors()[0]}
          />
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">광고비 추이</h2>
          <LineChart
            data={sales.map(s => ({ label: s.month.replace('2025-', '').replace('2026-', ''), value: s.adSpend }))}
            height={220}
            color={getChartColors()[1]}
          />
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-text">월별 ROAS</h2>
        <BarChart
          data={sales.map(s => ({
            label: s.month.replace('2025-', '').replace('2026-', ''),
            value: s.adSpend > 0 ? Math.round(s.revenue / s.adSpend * 100) : 0,
            color: s.revenue / s.adSpend >= 4 ? getChartColors()[0] : s.revenue / s.adSpend >= 3 ? getChartColors()[2] : getChartColors()[4],
          }))}
          height={180}
        />
      </div>

      {/* Manual Input */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-text">매출 데이터 입력</h2>
        <div className="grid gap-3 sm:grid-cols-5">
          <input type="month" value={newMonth} onChange={e => setNewMonth(e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-text focus:outline-none" />
          <input type="number" value={newRevenue} onChange={e => setNewRevenue(e.target.value)} placeholder="매출 (원)" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
          <input type="number" value={newAdSpend} onChange={e => setNewAdSpend(e.target.value)} placeholder="광고비 (원)" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
          <input type="number" value={newConversions} onChange={e => setNewConversions(e.target.value)} placeholder="전환 수" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
          <button onClick={handleAdd} className="flex items-center justify-center gap-1 rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub">
            <Plus size={15} /> 추가
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 캠페인 성과 탭 ── */
function CampaignsTab() {
  const [period, setPeriod] = useState('2026-03');
  const currentSales = MOCK_SALES.find(s => s.month === period) || MOCK_SALES[MOCK_SALES.length - 1];
  const roas = currentSales.adSpend > 0 ? (currentSales.revenue / currentSales.adSpend * 100).toFixed(0) : '-';
  const cpa = currentSales.conversions > 0 ? Math.round(currentSales.adSpend / currentSales.conversions) : 0;

  return (
    <div>
      {/* 기간 선택 */}
      <div className="mb-6 flex justify-end">
        <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text focus:border-text focus:outline-none" />
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

      {/* 채널별 성과 테이블 */}
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
            data={MOCK_SALES.map(s => ({ label: s.month.replace('2025-', '').replace('2026-', ''), value: s.revenue }))}
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
    </div>
  );
}

/* ── 데이터 리포트 탭 ── */
function DataReportsTab() {
  const [subTab, setSubTab] = useState<DataSubTab>('reports');
  const [search, setSearch] = useState('');
  const [chartSearch, setChartSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('모든 유형');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);

  const filteredCharts = AVAILABLE_CHARTS.filter(c => {
    const matchSearch = !chartSearch || c.title.includes(chartSearch);
    const matchType = typeFilter === '모든 유형' || CHART_TYPE_MAP[c.type].label === typeFilter;
    return matchSearch && matchType;
  });

  const filteredReports = SAVED_REPORTS.filter(r => !search || r.name.includes(search) || r.category.includes(search));

  const toggleChart = (id: string) => {
    setSelectedCharts(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  return (
    <div>
      {/* 빠르게 시작하기 */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold text-point">빠르게 시작하기</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {INSIGHT_REPORTS.map(report => (
            <div key={report.id} className="group cursor-pointer rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-md">
              <div className="mb-1 flex items-center gap-1">
                <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-text-sub">{report.category}</span>
              </div>
              <h3 className="mb-1 text-sm font-bold text-text">{report.name}</h3>
              <p className="text-xs text-text-sub leading-relaxed">{report.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 서브 탭 */}
      <div className="mb-4 flex items-center justify-between border-b border-border">
        <div className="flex">
          {([
            { id: 'reports' as DataSubTab, label: '데이터 리포트' },
            { id: 'templates' as DataSubTab, label: '템플릿 갤러리' },
            { id: 'charts' as DataSubTab, label: '데이터 분석 차트' },
          ]).map(t => (
            <button key={t.id} onClick={() => setSubTab(t.id)} className={`border-b-2 px-4 py-2.5 text-sm font-medium ${subTab === t.id ? 'border-text text-text' : 'border-transparent text-text-muted hover:text-text-sub'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> {subTab === 'reports' ? '리포트 만들기' : '데이터 분석하기'}
        </button>
      </div>

      {/* 데이터 리포트 */}
      {subTab === 'reports' && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="검색"
                className="w-full rounded-xl border border-border bg-white py-2 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
            </div>
            <span className="text-xs text-text-muted">총 {filteredReports.length}개</span>
          </div>
          <div className="rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-xs text-text-muted">
                <th className="px-5 py-3 text-left font-medium">이름</th>
                <th className="px-5 py-3 text-right font-medium">즐겨찾기</th>
              </tr></thead>
              <tbody>
                <tr><td colSpan={2} className="bg-surface px-5 py-2 text-xs text-text-muted">즐겨찾는 리포트</td></tr>
                {filteredReports.filter(r => r.starred).map(report => (
                  <tr key={report.id} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="font-medium text-point">{report.name}</div>
                      <div className="text-xs text-text-muted">{report.description}</div>
                    </td>
                    <td className="px-5 py-3 text-right"><Star size={14} className="inline text-warning fill-warning" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 템플릿 갤러리 */}
      {subTab === 'templates' && (
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button key={cat.key} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-sub hover:bg-surface hover:text-text transition-colors">
                {cat.label} <span className="text-text-muted ml-1">{cat.count}</span>
              </button>
            ))}
          </div>
          {TEMPLATE_CATEGORIES.map(cat => {
            const templates = REPORT_TEMPLATES.filter(t => t.category === cat.key);
            return (
              <div key={cat.key} className="mb-8">
                <h3 className="mb-3 text-sm font-bold text-text">{cat.label}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.map(tmpl => (
                    <div key={tmpl.id} className="group cursor-pointer rounded-2xl border border-border bg-white p-4 transition-all hover:shadow-md hover:border-text-muted/40">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {tmpl.isNew && <span className="rounded bg-point/10 px-1.5 py-0.5 text-[8px] font-bold text-point">NEW</span>}
                        {tmpl.isRecommended && <span className="rounded bg-success/10 px-1.5 py-0.5 text-[8px] font-bold text-success">추천</span>}
                      </div>
                      <div className="text-xs font-bold text-text">{tmpl.name}</div>
                      <p className="mt-1 text-[10px] text-text-muted line-clamp-2">{tmpl.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tmpl.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="rounded bg-surface px-1.5 py-0.5 text-[8px] text-text-muted">{tag}</span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[9px] text-text-muted">
                        <span>{tmpl.dataSources.join(' + ')}</span>
                        <span className="font-semibold group-hover:text-text">사용하기 →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 데이터 분석 차트 */}
      {subTab === 'charts' && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={chartSearch} onChange={e => setChartSearch(e.target.value)} placeholder="검색"
                className="w-full rounded-xl border border-border bg-white py-2 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text focus:border-text focus:outline-none">
              <option>모든 유형</option>
              {Object.values(CHART_TYPE_MAP).map(t => <option key={t.label}>{t.label}</option>)}
            </select>
            <span className="text-xs text-text-muted">총 {filteredCharts.length}개</span>
          </div>
          <div className="rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-xs text-text-muted">
                <th className="px-5 py-3 text-left font-medium">유형</th>
                <th className="px-5 py-3 text-left font-medium">이름</th>
                <th className="px-5 py-3 text-right font-medium">조회 기간</th>
                <th className="px-5 py-3 text-right font-medium">최근 수정일</th>
              </tr></thead>
              <tbody>
                {filteredCharts.map(chart => {
                  const ct = CHART_TYPE_MAP[chart.type];
                  return (
                    <tr key={chart.id} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer">
                      <td className="px-5 py-3">
                        <span className="rounded px-2 py-0.5 text-[10px] font-bold" style={{ color: ct.color, background: ct.bg }}>{ct.label}</span>
                      </td>
                      <td className="px-5 py-3 font-medium text-point">{chart.title}</td>
                      <td className="px-5 py-3 text-right text-text-muted">{chart.period}</td>
                      <td className="px-5 py-3 text-right text-text-muted">2026.03.21</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 리포트 만들기 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-text">리포트 만들기</h2>
            <p className="mb-4 text-xs text-text-sub">해당 리포트에서 확인할 차트들을 선택하세요. <strong>최대 30개</strong>까지 선택할 수 있습니다.</p>
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-text-sub">리포트 이름</label>
              <input value={newReportName} onChange={e => setNewReportName(e.target.value)} placeholder="리포트 10"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-text-sub">리포트 설명 (선택)</label>
              <input value={newReportDesc} onChange={e => setNewReportDesc(e.target.value)} placeholder="리포트에 대한 설명을 입력하세요"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-text-sub">차트 선택</label>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input placeholder="검색" className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
                {AVAILABLE_CHARTS.slice(0, 10).map(chart => {
                  const ct = CHART_TYPE_MAP[chart.type];
                  const selected = selectedCharts.includes(chart.id);
                  return (
                    <div key={chart.id} className={`flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0 cursor-pointer hover:bg-surface ${selected ? 'bg-surface' : ''}`} onClick={() => toggleChart(chart.id)}>
                      <input type="checkbox" checked={selected} readOnly className="rounded" />
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ color: ct.color, background: ct.bg }}>{ct.label}</span>
                      <span className="text-sm text-text">{chart.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">선택한 차트 : {selectedCharts.length} / 30</span>
              <div className="flex gap-2">
                <button onClick={() => setShowCreateModal(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-sub hover:text-text">취소</button>
                <button onClick={() => { setShowCreateModal(false); }} className="rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub">저장하기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
