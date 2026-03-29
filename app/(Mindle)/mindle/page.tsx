"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  Flame,
  ChevronRight,
  Search,
  BookOpen,
  BarChart3,
  Zap,
  Globe,
  Brain,
  ShoppingCart,
  Palette,
  Cpu,
  Mail,
  Sparkles,
} from "lucide-react";

/* ── 인사이트 카피 (로테이션) ── */
const insightCopies = [
  "신호에서 인사이트를 피워냅니다.",
  "트렌드는 데이터에서 시작됩니다.",
  "변화의 신호를 가장 먼저 포착합니다.",
  "숫자 뒤에 숨은 이야기를 찾습니다.",
  "보이지 않는 흐름을 읽는 눈.",
  "AI가 찾고, 사람이 의미를 부여합니다.",
  "트렌드는 예측하는 것이 아니라 발견하는 것.",
  "신호와 소음을 분리합니다.",
  "한 발 앞서 보는 것이 전략입니다.",
];

/* ── 카테고리 ── */
const categories = [
  { id: "all", label: "전체", icon: Search },
  { id: "marketing", label: "마케팅", icon: BarChart3 },
  { id: "tech", label: "테크", icon: Cpu },
  { id: "consumer", label: "소비자", icon: ShoppingCart },
  { id: "culture", label: "문화", icon: Palette },
  { id: "ai", label: "AI", icon: Brain },
];

/* ── 트렌드 카드 데이터 ── */
const trendCards = [
  {
    id: "t1",
    title: "에이전트 AI가 업무 방식을 바꾸고 있다 — 2026 생산성의 새로운 공식",
    category: "ai",
    date: "2026.03.26",
    relevance: 97,
    status: "trending" as const,
    readTime: "8분",
    views: 3420,
  },
  {
    id: "t2",
    title: "숏폼 피로감과 '슬로우 콘텐츠'의 부상",
    category: "culture",
    date: "2026.03.25",
    relevance: 91,
    status: "rising" as const,
    readTime: "6분",
    views: 2180,
  },
  {
    id: "t3",
    title: "하이퍼로컬 비즈니스가 글로벌로 확장하는 플레이북",
    category: "marketing",
    date: "2026.03.24",
    relevance: 88,
    status: "trending" as const,
    readTime: "7분",
    views: 1950,
  },
  {
    id: "t4",
    title: "Z세대 가치 소비 — 브랜드는 어떻게 적응하고 있나",
    category: "consumer",
    date: "2026.03.23",
    relevance: 85,
    status: "rising" as const,
    readTime: "5분",
    views: 1720,
  },
  {
    id: "t5",
    title: "공간 컴퓨팅: 대중화까지 남은 거리는?",
    category: "tech",
    date: "2026.03.22",
    relevance: 82,
    status: "signal" as const,
    readTime: "9분",
    views: 1340,
  },
];

/* ── 주간 인사이트 ── */
const weeklyInsight = {
  weekLabel: "2026년 3월 4주차",
  title: "AI 에이전트, '도구'에서 '동료'로 진화 중",
  summary:
    "이번 주 핵심 트렌드는 AI 에이전트의 자율성 확대입니다. 단순 챗봇을 넘어 독립적으로 작업을 수행하는 에이전트 AI가 기업 현장에 빠르게 도입되고 있으며, 마케팅 자동화와 콘텐츠 생산 분야에서 특히 두드러집니다.",
  keyPoints: [
    "에이전트 AI 검색량 전주 대비 340% 급증",
    "슬로우 콘텐츠 — 롱폼 뉴스레터 구독 23% 증가",
    "하이퍼로컬 마케팅 캠페인 ROI 평균 2.4배 상승",
  ],
  generatedBy: "Mindle AI",
};

/* ── 핫 키워드 ── */
const hotKeywords = [
  { rank: 1, keyword: "에이전트 AI", change: "+340%" },
  { rank: 2, keyword: "슬로우 콘텐츠", change: "+180%" },
  { rank: 3, keyword: "하이퍼로컬", change: "+120%" },
  { rank: 4, keyword: "디지털 디톡스", change: "+95%" },
  { rank: 5, keyword: "마이크로 SaaS", change: "+75%" },
];

/* ── 통계 ── */
const stats = [
  { label: "수집된 트렌드", value: "500+", icon: TrendingUp },
  { label: "주간 리포트", value: "52회", icon: BookOpen },
  { label: "구독자", value: "1,200+", icon: Mail },
  { label: "카테고리", value: "5개", icon: BarChart3 },
];

/* ── 상태 뱃지 ── */
const statusBadge: Record<string, { label: string; color: string }> = {
  trending: { label: "Trending", color: "bg-indigo-400/20 text-indigo-300" },
  rising: { label: "Rising", color: "bg-amber-500/20 text-amber-400" },
  signal: { label: "Signal", color: "bg-cyan-500/20 text-cyan-400" },
};

/* ── 카테고리 컬러 ── */
const categoryColor: Record<string, string> = {
  marketing: "text-pink-400",
  tech: "text-blue-400",
  consumer: "text-green-400",
  culture: "text-amber-400",
  ai: "text-violet-400",
};

export default function MindleHomePage() {
  const [copy, setCopy] = useState(insightCopies[0]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    setCopy(insightCopies[Math.floor(Math.random() * insightCopies.length)]);
    const interval = setInterval(() => {
      setCopy(insightCopies[Math.floor(Math.random() * insightCopies.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTrends =
    activeCategory === "all"
      ? trendCards
      : trendCards.filter((t) => t.category === activeCategory);

  return (
    <div className="bg-[#0C0A1D] min-h-screen">
      {/* ── HERO ── */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            Trend Intelligence by AI
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-4">
            <span className="text-indigo-400">보이기 전에,</span>
            <br />
            <span className="text-white">먼저 본다</span>
          </h1>
          <p className="text-indigo-300/70 text-lg sm:text-xl mb-3 font-medium">
            한국에서 시작해 세계로
          </p>
          <p className="text-indigo-400/50 text-sm transition-opacity duration-1000 max-w-lg mx-auto">
            {copy}
          </p>

          {/* 통계 */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/5 rounded-xl p-4 text-center"
              >
                <s.icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-indigo-300/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOT KEYWORDS ── */}
      <section className="px-6 py-3 border-y border-indigo-500/10 bg-indigo-950/30">
        <div className="mx-auto max-w-5xl flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <Flame className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          {hotKeywords.map((kw) => (
            <Link
              key={kw.rank}
              href="/mindle/data"
              className="shrink-0 flex items-center gap-1.5 text-sm hover:text-indigo-300 transition-colors"
            >
              <span
                className={`font-bold ${
                  kw.rank <= 3 ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                {kw.rank}
              </span>
              <span className="text-white">{kw.keyword}</span>
              <span className="text-[10px] text-green-400 font-mono">
                {kw.change}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 트렌드 카드 피드 ── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              최근 트렌드
            </h2>
            <Link
              href="/mindle/trends"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              전체 보기 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-indigo-500 text-white"
                    : "bg-white/5 text-indigo-300/60 hover:bg-white/10 hover:text-indigo-300"
                }`}
              >
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* 트렌드 카드 */}
          <div className="space-y-4">
            {filteredTrends.map((trend) => (
              <article
                key={trend.id}
                className="group bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          statusBadge[trend.status].color
                        }`}
                      >
                        {statusBadge[trend.status].label}
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          categoryColor[trend.category] || "text-neutral-400"
                        }`}
                      >
                        {categories.find((c) => c.id === trend.category)?.label}
                      </span>
                      <span className="text-[10px] text-indigo-500/50">
                        {trend.date}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold leading-snug group-hover:text-indigo-300 transition-colors">
                      {trend.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-indigo-400/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {trend.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {trend.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {/* 관련성 점수 */}
                  <div className="shrink-0 flex items-center gap-2 sm:flex-col sm:items-end">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-400">
                        {trend.relevance}
                      </span>
                    </div>
                    <span className="text-[9px] text-indigo-400/40 uppercase tracking-wider">
                      관련성
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주간 인사이트 ── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="bg-gradient-to-br from-indigo-950/80 to-indigo-900/30 border border-indigo-500/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Weekly Insight
              </span>
              <span className="text-xs text-indigo-500/50 ml-auto">
                {weeklyInsight.weekLabel}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              {weeklyInsight.title}
            </h3>
            <p className="text-sm text-indigo-200/60 leading-relaxed mb-5">
              {weeklyInsight.summary}
            </p>
            <div className="space-y-2 mb-5">
              {weeklyInsight.keyPoints.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-indigo-200/80"
                >
                  <span className="text-indigo-400 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                  {point}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-indigo-500/40 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Generated by {weeklyInsight.generatedBy}
              </span>
              <Link
                href="/mindle/weekly"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                전체 리포트 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 뉴스레터 구독 CTA ── */}
      <section className="px-6 py-16 border-t border-indigo-500/10">
        <div className="mx-auto max-w-2xl text-center">
          <Mail className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            매주 화요일, 트렌드 브리핑
          </h3>
          <p className="text-indigo-400/50 text-sm mb-6">
            AI가 분석한 주간 트렌드 리포트를 받아보세요.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="email@example.com"
              className="flex-1 px-4 py-2.5 bg-white/5 border border-indigo-500/20 rounded-full text-sm text-white placeholder-indigo-500/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button className="px-5 py-2.5 bg-indigo-500 text-white font-semibold rounded-full text-sm hover:bg-indigo-400 transition-colors">
              구독
            </button>
          </div>
        </div>
      </section>

      {/* ── Ten:One Universe 연결 ── */}
      <section className="px-6 py-12 border-t border-indigo-500/10">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-indigo-500/50" />
            <span className="text-xs font-semibold text-indigo-500/50 uppercase tracking-wider">
              Ten:One Universe
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                name: "SmarComm",
                desc: "Mindle 트렌드를 마케팅 캠페인에 활용",
                href: "/smarcomm",
                color: "from-rose-500/10 to-transparent",
              },
              {
                name: "MAD League",
                desc: "대학생 트렌드 리서처 네트워크",
                href: "/madleague",
                color: "from-amber-500/10 to-transparent",
              },
              {
                name: "RooK",
                desc: "AI 크리에이터의 콘텐츠 인사이트",
                href: "/rook",
                color: "from-violet-500/10 to-transparent",
              },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className={`group p-5 rounded-xl bg-gradient-to-br ${brand.color} border border-white/5 hover:border-indigo-500/20 transition-all`}
              >
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                  {brand.name}
                </h4>
                <p className="text-xs text-indigo-400/40 mt-1">{brand.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
