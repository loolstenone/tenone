'use client';

import { useState } from 'react';
import {
  BarChart3, Search, GitBranch, TrendingUp, Lightbulb, FileText,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── 4단계 분석 프레임워크 ── */
type AnalysisTab = 'descriptive' | 'diagnostic' | 'predictive' | 'prescriptive';
const TABS: { key: AnalysisTab; label: string; icon: any; desc: string }[] = [
  { key: 'descriptive', label: '기술 분석', icon: BarChart3, desc: '무엇이 일어났는가' },
  { key: 'diagnostic', label: '진단 분석', icon: Search, desc: '왜 일어났는가' },
  { key: 'predictive', label: '예측 분석', icon: TrendingUp, desc: '앞으로 무엇이' },
  { key: 'prescriptive', label: '처방 분석', icon: Lightbulb, desc: '무엇을 해야 하는가' },
];

/* ── 기술 분석: KPI 테이블 ── */
const DESC_KPIS = [
  { metric: '월 매출', current: '12.4억', prev: '11.4억', change: 8.8, yoy: 22.5 },
  { metric: '신규 고객', current: '47명', prev: '52명', change: -9.6, yoy: 15.3 },
  { metric: '고객 이탈률', current: '3.2%', prev: '3.8%', change: -15.8, yoy: -28.9 },
  { metric: '평균 거래 금액', current: '2,840만', prev: '2,650만', change: 7.2, yoy: 18.1 },
  { metric: 'CAC', current: '48만', prev: '52만', change: -7.7, yoy: -12.5 },
  { metric: 'LTV', current: '1,920만', prev: '1,750만', change: 9.7, yoy: 25.8 },
  { metric: 'LTV/CAC 비율', current: '40.0', prev: '33.7', change: 18.7, yoy: 43.6 },
];

/* ── 진단 분석: 원인 요인 분해 (Waterfall) ── */
const WATERFALL = [
  { label: '전월 매출', value: 11.4, type: 'base' as const },
  { label: '기존 고객 성장', value: 0.8, type: 'positive' as const },
  { label: '신규 고객', value: 0.5, type: 'positive' as const },
  { label: '업셀링', value: 0.3, type: 'positive' as const },
  { label: '고객 이탈', value: -0.4, type: 'negative' as const },
  { label: '가격 할인', value: -0.2, type: 'negative' as const },
  { label: '이번 달 매출', value: 12.4, type: 'total' as const },
];

/* ── 예측 분석: 시나리오 3개 ── */
const SCENARIOS = [
  { name: '낙관', q2: 14.5, q3: 16.2, q4: 18.0, color: 'text-emerald-400', barColor: 'bg-emerald-500' },
  { name: '기본', q2: 13.8, q3: 14.9, q4: 15.8, color: 'text-blue-400', barColor: 'bg-blue-500' },
  { name: '비관', q2: 12.1, q3: 12.5, q4: 12.8, color: 'text-red-400', barColor: 'bg-red-500' },
];
const SCENARIO_MAX = 20;

/* ── 처방 분석: AI 권고안 ── */
const RECOMMENDATIONS = [
  {
    priority: '긴급',
    title: '리드 전환율 회복 프로그램',
    desc: '3월 리드 전환율이 18% → 7%로 급락했습니다. 영업팀 교육 강화 + CRM 자동 팔로업 시퀀스를 즉시 구축하세요.',
    impact: '전환율 15%p 회복 시 월 매출 +1.2억 기대',
    color: 'border-red-500/30 bg-red-500/5',
    badgeColor: 'text-red-400 bg-red-500/10',
  },
  {
    priority: '높음',
    title: '콘텐츠 마케팅 예산 증액',
    desc: 'ROI 324%로 채널 중 최고 효율입니다. 예산을 20% 증액하면 다음 분기 리드 40% 증가가 예상됩니다.',
    impact: '예산 대비 ROI 3.2배 → 신규 고객 월 15명 추가',
    color: 'border-amber-500/30 bg-amber-500/5',
    badgeColor: 'text-amber-400 bg-amber-500/10',
  },
  {
    priority: '중간',
    title: '개발팀 야근 관리',
    desc: '개발팀 야근 시간이 전월 대비 45% 증가했습니다. 지속 시 이직률 상승 위험. 프로젝트 우선순위 재조정을 권장합니다.',
    impact: '이직률 2%p 하락 시 채용비용 연간 8,000만원 절감',
    color: 'border-blue-500/30 bg-blue-500/5',
    badgeColor: 'text-blue-400 bg-blue-500/10',
  },
];

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) return <span className="flex items-center gap-0.5 text-emerald-400"><ArrowUpRight size={11} />+{value}%</span>;
  if (value < 0) return <span className="flex items-center gap-0.5 text-red-400"><ArrowDownRight size={11} />{value}%</span>;
  return <span className="flex items-center gap-0.5 text-slate-500"><Minus size={11} />0%</span>;
}

export default function AnalyticsPage() {
  const { tenant, isDemo } = useWIO();
  const [tab, setTab] = useState<AnalysisTab>('descriptive');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">전략 분석</h1>
          <p className="text-sm text-slate-500 mt-0.5">4단계 분석 프레임워크</p>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && <span className="text-xs text-amber-400/60 bg-amber-500/10 px-2.5 py-1 rounded-full">데모 데이터</span>}
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <FileText size={14} /> 리포트 생성
          </button>
        </div>
      </div>

      {/* 4단계 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm whitespace-nowrap transition-all ${tab === t.key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 현재 탭 설명 */}
      <div className="rounded-lg bg-white/[0.02] border border-white/5 px-4 py-2.5 mb-6 flex items-center gap-2">
        <AlertCircle size={14} className="text-indigo-400 shrink-0" />
        <span className="text-xs text-slate-400">{TABS.find(t => t.key === tab)?.desc}</span>
      </div>

      {/* ── 기술 분석 ── */}
      {tab === 'descriptive' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4">핵심 KPI 비교</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">지표</th>
                  <th className="text-right py-2 text-xs text-slate-500 font-medium">이번 달</th>
                  <th className="text-right py-2 text-xs text-slate-500 font-medium">전월</th>
                  <th className="text-right py-2 text-xs text-slate-500 font-medium">MoM</th>
                  <th className="text-right py-2 text-xs text-slate-500 font-medium">YoY</th>
                </tr>
              </thead>
              <tbody>
                {DESC_KPIS.map((k, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 text-slate-300">{k.metric}</td>
                    <td className="py-2.5 text-right font-semibold">{k.current}</td>
                    <td className="py-2.5 text-right text-slate-500">{k.prev}</td>
                    <td className="py-2.5 text-right text-xs"><ChangeIndicator value={k.change} /></td>
                    <td className="py-2.5 text-right text-xs"><ChangeIndicator value={k.yoy} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 진단 분석 ── */}
      {tab === 'diagnostic' && (
        <div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-6">
            <h2 className="text-sm font-semibold mb-4">매출 변동 요인 분해 (Waterfall)</h2>
            <div className="space-y-2">
              {WATERFALL.map((w, i) => {
                const maxVal = 15;
                const barLeft = w.type === 'base' || w.type === 'total' ? 0 : (w.value > 0 ? (WATERFALL[0].value / maxVal) * 100 : ((WATERFALL[0].value - Math.abs(w.value)) / maxVal) * 100);
                const barWidth = (Math.abs(w.value) / maxVal) * 100;
                const barColor = w.type === 'base' ? 'bg-slate-500' : w.type === 'total' ? 'bg-indigo-500' : w.type === 'positive' ? 'bg-emerald-500' : 'bg-red-500';
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-28 shrink-0 text-right">{w.label}</span>
                    <div className="flex-1 h-5 relative rounded bg-white/[0.03]">
                      <div className={`absolute top-0 h-full rounded ${barColor} transition-all`}
                        style={{ left: `${Math.max(barLeft, 0)}%`, width: `${barWidth}%` }} />
                    </div>
                    <span className={`text-xs font-semibold w-14 text-right ${w.type === 'negative' ? 'text-red-400' : w.type === 'positive' ? 'text-emerald-400' : ''}`}>
                      {w.type === 'positive' ? '+' : ''}{w.value}억
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4">주요 원인 분석</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">기존 고객 성장 (+0.8억)</p>
                  <p className="text-xs text-slate-400 mt-0.5">대형 고객 3사 업셀링 성공. SmarComm 연간 계약 갱신 시 30% 증액.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">고객 이탈 (-0.4억)</p>
                  <p className="text-xs text-slate-400 mt-0.5">중소 고객 5사 이탈. 주요 원인: 경쟁사 가격 공세, 기술 지원 불만.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 예측 분석 ── */}
      {tab === 'predictive' && (
        <div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-6">
            <h2 className="text-sm font-semibold mb-4">분기별 매출 예측 (시나리오)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 text-xs text-slate-500 font-medium">시나리오</th>
                    <th className="text-right py-2 text-xs text-slate-500 font-medium">Q2</th>
                    <th className="text-right py-2 text-xs text-slate-500 font-medium">Q3</th>
                    <th className="text-right py-2 text-xs text-slate-500 font-medium">Q4</th>
                  </tr>
                </thead>
                <tbody>
                  {SCENARIOS.map((s, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className={`py-2.5 font-semibold ${s.color}`}>{s.name}</td>
                      <td className="py-2.5 text-right">{s.q2}억</td>
                      <td className="py-2.5 text-right">{s.q3}억</td>
                      <td className="py-2.5 text-right">{s.q4}억</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 시각화 바 차트 */}
            <div className="space-y-3">
              {['Q2', 'Q3', 'Q4'].map((quarter, qi) => (
                <div key={quarter}>
                  <span className="text-xs text-slate-500 mb-1 block">{quarter}</span>
                  <div className="space-y-1">
                    {SCENARIOS.map((s, si) => {
                      const val = qi === 0 ? s.q2 : qi === 1 ? s.q3 : s.q4;
                      return (
                        <div key={si} className="flex items-center gap-2">
                          <span className={`text-[10px] w-8 ${s.color}`}>{s.name}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                            <div className={`h-full rounded-full ${s.barColor} transition-all`} style={{ width: `${(val / SCENARIO_MAX) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 w-10 text-right">{val}억</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 처방 분석 ── */}
      {tab === 'prescriptive' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">AI 권고안</h2>
          {RECOMMENDATIONS.map((r, i) => (
            <div key={i} className={`rounded-xl border p-5 ${r.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${r.badgeColor}`}>{r.priority}</span>
                <h3 className="text-sm font-semibold">{r.title}</h3>
              </div>
              <p className="text-sm text-slate-400 mb-3">{r.desc}</p>
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                <TrendingUp size={12} className="text-indigo-400 shrink-0" />
                <span className="text-xs text-slate-300">{r.impact}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
