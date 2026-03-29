'use client';

import { useState } from 'react';
import {
  TrendingUp, Search, Filter, Eye, Star, AlertTriangle,
  FileText, Sparkles, ExternalLink, Calendar, Tag, Shield,
  ChevronDown, BarChart3, Globe, Zap,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Mock: 시장 트렌드 ── */
const MOCK_TRENDS = [
  { id: 't1', title: 'AI 에이전트 기반 SaaS 시장 급성장', source: 'Gartner', relevance: 9, date: '2026-03-28', tags: ['AI', 'SaaS', 'B2B'], category: 'tech' },
  { id: 't2', title: '국내 HR Tech 투자 전년 대비 42% 증가', source: 'CB Insights', relevance: 8, date: '2026-03-26', tags: ['HR', '투자', '국내'], category: 'market' },
  { id: 't3', title: '구독 경제 피로도 상승 — 통합 플랫폼 선호', source: 'McKinsey', relevance: 7, date: '2026-03-25', tags: ['구독', '통합', 'UX'], category: 'market' },
  { id: 't4', title: 'Gen Z 인재 확보 전쟁: 대학 연계 프로그램 확대', source: 'LinkedIn', relevance: 8, date: '2026-03-24', tags: ['GenZ', '채용', '대학'], category: 'people' },
  { id: 't5', title: '노코드/로코드 플랫폼 엔터프라이즈 채택 가속', source: 'Forrester', relevance: 6, date: '2026-03-22', tags: ['노코드', '엔터프라이즈'], category: 'tech' },
  { id: 't6', title: '크리에이터 이코노미 B2B 전환 트렌드', source: 'TechCrunch', relevance: 7, date: '2026-03-20', tags: ['크리에이터', 'B2B'], category: 'market' },
  { id: 't7', title: '아시아 태평양 마케팅 자동화 시장 CAGR 18.2%', source: 'MarketsAndMarkets', relevance: 6, date: '2026-03-18', tags: ['마케팅', 'APAC', '자동화'], category: 'market' },
  { id: 't8', title: '데이터 프라이버시 규제 강화 — 1st Party Data 전략 필수', source: 'Deloitte', relevance: 8, date: '2026-03-15', tags: ['데이터', '규제', '프라이버시'], category: 'regulation' },
];

/* ── Mock: 경쟁사 ── */
const MOCK_COMPETITORS = [
  { id: 'c1', name: 'WorkOS', recentMove: 'Series C $150M 유치, 엔터프라이즈 SSO 강화', threatLevel: 'high' as const, logo: 'W', color: 'text-red-400' },
  { id: 'c2', name: 'Notion Teams', recentMove: 'AI 기반 위키 자동 생성 기능 출시', threatLevel: 'medium' as const, logo: 'N', color: 'text-amber-400' },
  { id: 'c3', name: 'ClickUp Enterprise', recentMove: '한국 시장 진출, 현지 파트너십 체결', threatLevel: 'high' as const, logo: 'C', color: 'text-violet-400' },
];

/* ── Mock: 산업 리포트 ── */
const MOCK_REPORTS = [
  { id: 'r1', title: '2026 글로벌 SaaS 시장 전망', type: '시장조사', date: '2026-03-25', pages: 48 },
  { id: 'r2', title: 'WorkOS vs Orbi 경쟁 분석', type: '경쟁분석', date: '2026-03-20', pages: 22 },
  { id: 'r3', title: 'AI Agent 기술 트렌드 리포트', type: '기술트렌드', date: '2026-03-15', pages: 35 },
  { id: 'r4', title: '국내 B2B SaaS 고객 이탈 요인 분석', type: '시장조사', date: '2026-03-10', pages: 18 },
  { id: 'r5', title: '크리에이터 이코노미 × 엔터프라이즈 융합', type: '기술트렌드', date: '2026-03-05', pages: 30 },
];

const THREAT_STYLE = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};
const THREAT_LABEL = { high: '높음', medium: '보통', low: '낮음' };

const REPORT_TYPE_COLOR: Record<string, string> = {
  '시장조사': 'bg-indigo-500/10 text-indigo-400',
  '경쟁분석': 'bg-red-500/10 text-red-400',
  '기술트렌드': 'bg-emerald-500/10 text-emerald-400',
};

const CATEGORY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'tech', label: '기술' },
  { value: 'market', label: '시장' },
  { value: 'people', label: '인재' },
  { value: 'regulation', label: '규제' },
];

export default function MarketIntelPage() {
  const { isMaster, isDemo } = useWIO();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minRelevance, setMinRelevance] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isMaster && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">지주사 전용 페이지입니다</h2>
        <p className="text-sm text-slate-500">Holding Company 권한이 필요합니다.</p>
      </div>
    );
  }

  const filtered = MOCK_TRENDS.filter(t => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (t.relevance < minRelevance) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-cyan-400" />
            <h1 className="text-xl font-bold">그룹 마케팅 인텔리전스</h1>
            <span className="text-[10px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">HLD-MKI</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">시장 트렌드, 경쟁사 동향, 산업 리포트를 한눈에</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="트렌드 검색..."
            className="pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-cyan-500 focus:outline-none w-56"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-slate-500" />
          {CATEGORY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(opt.value)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                categoryFilter === opt.value
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-500">관련성</span>
          <select
            value={minRelevance}
            onChange={e => setMinRelevance(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-2 py-1 focus:outline-none"
          >
            {[1,3,5,7,9].map(v => (
              <option key={v} value={v} className="bg-[#0F0F23]">{v}+ 이상</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI 인사이트 요약 */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-cyan-400" />
          <span className="text-sm font-semibold text-cyan-300">AI 주간 시장 인사이트</span>
          <span className="text-[10px] text-slate-500 ml-auto">2026.03.24 ~ 03.28 생성</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          이번 주 핵심 시그널: <strong className="text-white">AI 에이전트 SaaS</strong>와 <strong className="text-white">HR Tech</strong> 영역에서 투자 및 제품 출시가 집중되고 있습니다.
          ClickUp의 한국 시장 진출은 직접적 위협으로, 차별화된 에이전트 기반 자동화를 조기 강화할 필요가 있습니다.
          Gen Z 인재 확보를 위한 대학 연계 전략은 MADLeague와 시너지 포인트가 높습니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 시장 트렌드 카드 피드 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp size={15} className="text-cyan-400" /> 시장 트렌드
              </span>
              <span className="text-[10px] text-slate-500">{filtered.length}건</span>
            </div>
            <div className="divide-y divide-white/5">
              {filtered.map(trend => (
                <div key={trend.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-1">{trend.title}</h3>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><ExternalLink size={10} />{trend.source}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} />{trend.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        {trend.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/5 text-slate-400 rounded">
                            <Tag size={8} className="inline mr-0.5" />{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                        trend.relevance >= 8 ? 'bg-cyan-500/20 text-cyan-300' :
                        trend.relevance >= 6 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {trend.relevance}
                      </div>
                      <span className="text-[9px] text-slate-600">관련성</span>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-5 py-12 text-center text-sm text-slate-500">검색 결과가 없습니다</div>
              )}
            </div>
          </div>
        </div>

        {/* 우측 사이드 */}
        <div className="space-y-4">
          {/* 경쟁사 추적 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Eye size={15} className="text-red-400" /> 경쟁사 추적
              </span>
            </div>
            <div className="p-3 space-y-2">
              {MOCK_COMPETITORS.map(comp => (
                <div key={comp.id} className="rounded-lg border border-white/5 bg-white/[0.01] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold ${comp.color}`}>
                        {comp.logo}
                      </div>
                      <span className="text-sm font-semibold">{comp.name}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${THREAT_STYLE[comp.threatLevel]}`}>
                      위협 {THREAT_LABEL[comp.threatLevel]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{comp.recentMove}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 산업 리포트 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <FileText size={15} className="text-indigo-400" /> 산업 리포트
              </span>
            </div>
            <div className="p-3 space-y-1">
              {MOCK_REPORTS.map(report => (
                <div key={report.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{report.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${REPORT_TYPE_COLOR[report.type] || ''}`}>
                        {report.type}
                      </span>
                      <span className="text-[10px] text-slate-600">{report.date}</span>
                      <span className="text-[10px] text-slate-600">{report.pages}p</span>
                    </div>
                  </div>
                  <Eye size={13} className="text-slate-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
