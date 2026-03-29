'use client';

import { useState } from 'react';
import {
  Palette, Heart, TrendingUp, Star, Users, Eye, Megaphone,
  DollarSign, ExternalLink, Shield, BarChart3, Sliders,
  Target, Award, Share2, Search as SearchIcon, ChevronRight,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Mock: 브랜드 KPI ── */
interface BrandKPI {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  awareness: number;      // 인지도 %
  preference: number;     // 선호도 %
  sentiment: number;      // 감성 점수 (긍정 %)
  sov: number;            // SOV %
  searchTrend: number;    // 검색 트렌드 (전월 대비 %)
  // 레이더 차트 데이터 (0~100)
  radar: { awareness: number; affinity: number; loyalty: number; advocacy: number; marketShare: number };
  marketingBudget: number; // 만원
}

const MOCK_BRANDS: BrandKPI[] = [
  {
    id: 'b1', name: 'SmarComm', color: 'text-indigo-400', bgColor: 'bg-indigo-500',
    awareness: 72, preference: 58, sentiment: 81, sov: 15.2, searchTrend: 12,
    radar: { awareness: 72, affinity: 65, loyalty: 58, advocacy: 45, marketShare: 15 },
    marketingBudget: 4200,
  },
  {
    id: 'b2', name: 'MADLeague', color: 'text-emerald-400', bgColor: 'bg-emerald-500',
    awareness: 65, preference: 71, sentiment: 89, sov: 8.7, searchTrend: 28,
    radar: { awareness: 65, affinity: 78, loyalty: 72, advocacy: 68, marketShare: 9 },
    marketingBudget: 1800,
  },
  {
    id: 'b3', name: 'HeRo', color: 'text-violet-400', bgColor: 'bg-violet-500',
    awareness: 54, preference: 49, sentiment: 74, sov: 11.3, searchTrend: -3,
    radar: { awareness: 54, affinity: 52, loyalty: 48, advocacy: 35, marketShare: 11 },
    marketingBudget: 3100,
  },
  {
    id: 'b4', name: 'Mindle', color: 'text-amber-400', bgColor: 'bg-amber-500',
    awareness: 38, preference: 62, sentiment: 86, sov: 4.5, searchTrend: 45,
    radar: { awareness: 38, affinity: 70, loyalty: 55, advocacy: 42, marketShare: 5 },
    marketingBudget: 1200,
  },
  {
    id: 'b5', name: 'YouInOne', color: 'text-cyan-400', bgColor: 'bg-cyan-500',
    awareness: 48, preference: 44, sentiment: 69, sov: 6.8, searchTrend: 5,
    radar: { awareness: 48, affinity: 46, loyalty: 42, advocacy: 30, marketShare: 7 },
    marketingBudget: 2000,
  },
];

/* ── Mock: 통합 캠페인 ── */
const MOCK_CAMPAIGNS = [
  {
    id: 'c1', name: 'Universe Launch 2026',
    bus: ['SmarComm', 'MADLeague', 'HeRo'],
    budget: 8500, spent: 6200,
    impressions: '2.4M', conversions: 1840, roi: 280,
    status: '진행중',
  },
  {
    id: 'c2', name: '대학생 크리에이터 챌린지',
    bus: ['MADLeague', 'Mindle'],
    budget: 3200, spent: 3200,
    impressions: '1.8M', conversions: 920, roi: 340,
    status: '완료',
  },
  {
    id: 'c3', name: 'AI 에이전트 체험 위크',
    bus: ['SmarComm', 'YouInOne', 'Mindle'],
    budget: 5000, spent: 1800,
    impressions: '450K', conversions: 310, roi: 0,
    status: '준비중',
  },
];

const STATUS_STYLE: Record<string, string> = {
  '진행중': 'bg-emerald-500/10 text-emerald-400',
  '완료': 'bg-slate-500/10 text-slate-400',
  '준비중': 'bg-amber-500/10 text-amber-400',
};

const RADAR_LABELS = ['인지도', '호감도', '충성도', '추천도', '시장점유'];
const RADAR_KEYS: (keyof BrandKPI['radar'])[] = ['awareness', 'affinity', 'loyalty', 'advocacy', 'marketShare'];

/* ── SVG Radar helper ── */
function RadarChart({ brand }: { brand: BrandKPI }) {
  const cx = 80, cy = 80, r = 60;
  const n = 5;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function getPoint(index: number, value: number): [number, number] {
    const angle = startAngle + index * angleStep;
    const dist = (value / 100) * r;
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
  }

  const gridLevels = [20, 40, 60, 80, 100];
  const values = RADAR_KEYS.map(k => brand.radar[k]);
  const points = values.map((v, i) => getPoint(i, v));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + 'Z';

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[200px] mx-auto">
      {/* Grid */}
      {gridLevels.map(lv => {
        const gp = Array.from({ length: n }, (_, i) => getPoint(i, lv));
        const gd = gp.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + 'Z';
        return <path key={lv} d={gd} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />;
      })}
      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const [px, py] = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={px} y2={py} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />;
      })}
      {/* Data */}
      <path d={pathD} fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="rgba(99,102,241,0.8)" />
      ))}
      {/* Labels */}
      {Array.from({ length: n }, (_, i) => {
        const [lx, ly] = getPoint(i, 120);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="text-[7px] fill-slate-500">
            {RADAR_LABELS[i]}
          </text>
        );
      })}
    </svg>
  );
}

export default function BrandHubPage() {
  const { isMaster, isDemo } = useWIO();
  const [selectedBrand, setSelectedBrand] = useState<string>(MOCK_BRANDS[0].id);

  if (!isMaster && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">지주사 전용 페이지입니다</h2>
        <p className="text-sm text-slate-500">Holding Company 권한이 필요합니다.</p>
      </div>
    );
  }

  const totalBudget = MOCK_BRANDS.reduce((s, b) => s + b.marketingBudget, 0);
  const activeBrand = MOCK_BRANDS.find(b => b.id === selectedBrand) || MOCK_BRANDS[0];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Palette size={20} className="text-violet-400" />
            <h1 className="text-xl font-bold">그룹 브랜드 허브</h1>
            <span className="text-[10px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">HLD-MBH</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">브랜드 건강도, 자원 배분, 통합 캠페인 관리</p>
        </div>
      </div>

      {/* 브랜드 KPI 카드 그리드 */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5 mb-6">
        {MOCK_BRANDS.map(brand => (
          <button
            key={brand.id}
            onClick={() => setSelectedBrand(brand.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              selectedBrand === brand.id
                ? 'border-white/20 bg-white/[0.04]'
                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
            }`}
          >
            <div className={`text-sm font-semibold mb-2 ${brand.color}`}>{brand.name}</div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">인지도</span>
                <span className="text-white font-medium">{brand.awareness}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">선호도</span>
                <span className="text-white font-medium">{brand.preference}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">감성(긍정)</span>
                <span className={brand.sentiment >= 80 ? 'text-emerald-400 font-medium' : 'text-white font-medium'}>{brand.sentiment}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SOV</span>
                <span className="text-white font-medium">{brand.sov}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">검색 트렌드</span>
                <span className={brand.searchTrend >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  {brand.searchTrend >= 0 ? '+' : ''}{brand.searchTrend}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 좌측 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 브랜드 건강도 레이더 + 상세 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Target size={15} className="text-violet-400" />
                <span className={activeBrand.color}>{activeBrand.name}</span> 브랜드 건강도
              </span>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-6">
              <RadarChart brand={activeBrand} />
              <div className="space-y-3">
                {RADAR_LABELS.map((label, i) => {
                  const val = activeBrand.radar[RADAR_KEYS[i]];
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-bold text-white">{val}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            val >= 70 ? 'bg-emerald-500' : val >= 50 ? 'bg-indigo-500' : val >= 30 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 통합 캠페인 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Megaphone size={15} className="text-amber-400" /> 크로스 BU 통합 캠페인
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {MOCK_CAMPAIGNS.map(camp => (
                <div key={camp.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{camp.name}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[camp.status] || ''}`}>
                        {camp.status}
                      </span>
                    </div>
                    {camp.roi > 0 && (
                      <span className="text-[10px] text-emerald-400 font-bold">ROI {camp.roi}%</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {camp.bus.map(bu => (
                      <span key={bu} className="text-[10px] px-1.5 py-0.5 bg-white/5 text-slate-400 rounded">{bu}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">예산</span>
                      <span className="text-white font-medium">{(camp.budget / 10000).toFixed(1)}억</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">집행</span>
                      <span className="text-white font-medium">{(camp.spent / 10000).toFixed(1)}억</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">노출</span>
                      <span className="text-white font-medium">{camp.impressions}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">전환</span>
                      <span className="text-white font-medium">{camp.conversions.toLocaleString()}</span>
                    </div>
                  </div>
                  {/* Budget bar */}
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${camp.spent / camp.budget > 0.9 ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min((camp.spent / camp.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 1/3 */}
        <div className="space-y-4">
          {/* 자원 배분 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Sliders size={15} className="text-emerald-400" /> 마케팅 예산 배분
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-[10px] text-slate-500 mb-2">전체 마케팅 예산: <span className="text-white font-bold">{(totalBudget / 10000).toFixed(1)}억</span></div>
              {MOCK_BRANDS.map(brand => {
                const pct = (brand.marketingBudget / totalBudget) * 100;
                return (
                  <div key={brand.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={`text-xs ${brand.color}`}>{brand.name}</span>
                      <span className="text-[10px] text-slate-400">{(brand.marketingBudget / 10000).toFixed(1)}억 ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${brand.bgColor}/60`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {/* 전체 비율 stacked bar */}
              <div className="mt-4">
                <div className="text-[10px] text-slate-500 mb-1">배분 비율</div>
                <div className="flex h-3 rounded-full overflow-hidden">
                  {MOCK_BRANDS.map(brand => {
                    const pct = (brand.marketingBudget / totalBudget) * 100;
                    return (
                      <div
                        key={brand.id}
                        className={`${brand.bgColor}/70 first:rounded-l-full last:rounded-r-full`}
                        style={{ width: `${pct}%` }}
                        title={`${brand.name}: ${pct.toFixed(0)}%`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 브랜드 가이드라인 링크 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Award size={15} className="text-indigo-400" /> 브랜드 가이드라인
              </span>
            </div>
            <div className="p-3 space-y-1">
              {MOCK_BRANDS.map(brand => (
                <div key={brand.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${brand.bgColor}`} />
                    <span className="text-sm">{brand.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="text-[10px]">가이드라인</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
