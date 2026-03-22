'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Star, Search, ChevronRight, BarChart3, FileBarChart, Sparkles } from 'lucide-react';
import { INSIGHT_REPORTS, SAVED_REPORTS, AVAILABLE_CHARTS, CHART_TYPE_MAP, type Report, type ReportChart } from '@/lib/smarcomm/report-data';
import LineChart from '@/components/smarcomm/charts/LineChart';
import BarChart from '@/components/smarcomm/charts/BarChart';

type Tab = 'reports' | 'charts';

export default function DataReportsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('reports');
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
    <div className="max-w-5xl">
      {/* 빠르게 시작하기 */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold text-point">💡 빠르게 시작하기</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {INSIGHT_REPORTS.map(report => (
            <div key={report.id} className="group cursor-pointer rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-md">
              <div className="mb-1 flex items-center gap-1">
                <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-text-sub">{report.category}</span>
                {report.category.includes('템플릿') && <span className="rounded bg-point/10 px-1.5 py-0.5 text-[10px] font-bold text-point">추천</span>}
              </div>
              <h3 className="mb-1 text-sm font-bold text-text">{report.name}</h3>
              <p className="text-xs text-text-sub leading-relaxed">{report.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className="mb-4 flex items-center justify-between border-b border-border">
        <div className="flex">
          {[
            { id: 'reports' as Tab, label: '데이터 리포트' },
            { id: 'charts' as Tab, label: '데이터 분석 차트' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`border-b-2 px-4 py-2.5 text-sm font-medium ${tab === t.id ? 'border-text text-text' : 'border-transparent text-text-muted hover:text-text-sub'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> {tab === 'reports' ? '리포트 만들기' : '데이터 분석하기'}
        </button>
      </div>

      {/* 데이터 리포트 탭 */}
      {tab === 'reports' && (
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
              <thead>
                <tr className="border-b border-border text-xs text-text-muted">
                  <th className="px-5 py-3 text-left font-medium">이름</th>
                  <th className="px-5 py-3 text-right font-medium">즐겨찾기</th>
                </tr>
              </thead>
              <tbody>
                {/* 즐겨찾는 리포트 */}
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

      {/* 데이터 분석 차트 탭 */}
      {tab === 'charts' && (
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
              <thead>
                <tr className="border-b border-border text-xs text-text-muted">
                  <th className="px-5 py-3 text-left font-medium">유형</th>
                  <th className="px-5 py-3 text-left font-medium">이름</th>
                  <th className="px-5 py-3 text-right font-medium">조회 기간</th>
                  <th className="px-5 py-3 text-right font-medium">최근 수정일</th>
                </tr>
              </thead>
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
