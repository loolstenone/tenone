"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Star,
  ChevronRight,
  Globe,
  Calendar,
  Users,
  Camera,
  Newspaper,
  Shirt,
} from "lucide-react";
import {
  fetchFWNArticles,
  formatDateKorean,
  getPrimaryCategory,
  categoryNameMap,
  type FWNArticle,
} from "@/lib/supabase/fwn";

/* ── 패션위크 캘린더 (정적) ── */
const fashionWeekCalendar = [
  { city: "New York", flag: "NY", dates: "2026.09.08 - 09.13", status: "upcoming" as const },
  { city: "London", flag: "LDN", dates: "2026.09.15 - 09.19", status: "upcoming" as const },
  { city: "Milan", flag: "MIL", dates: "2026.09.20 - 09.26", status: "upcoming" as const },
  { city: "Paris", flag: "PAR", dates: "2026.09.27 - 10.05", status: "upcoming" as const },
  { city: "Seoul", flag: "SEL", dates: "2026.10.07 - 10.12", status: "upcoming" as const },
  { city: "Tokyo", flag: "TKY", dates: "2026.10.14 - 10.18", status: "upcoming" as const },
];

/* ── 네트워크 현황 (정적) ── */
const networkStats = [
  { label: "디자이너", count: "340+", icon: Shirt },
  { label: "바이어", count: "120+", icon: Users },
  { label: "미디어", count: "85+", icon: Camera },
  { label: "브랜드", count: "210+", icon: Star },
];

export default function FWNHome() {
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null);
  const [flashNews, setFlashNews] = useState<FWNArticle[]>([]);
  const [latestNews, setLatestNews] = useState<FWNArticle[]>([]);
  const [trending, setTrending] = useState<FWNArticle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [flashData, latestData, trendingData] = await Promise.all([
        fetchFWNArticles({ limit: 5 }),
        fetchFWNArticles({ limit: 6 }),
        fetchFWNArticles({ limit: 5, orderBy: "view_count" }),
      ]);
      setFlashNews(flashData);
      setLatestNews(latestData);
      setTrending(trendingData);
      setLoaded(true);
    }
    load();
  }, []);

  /** 기사 태그 라벨 */
  function getTagLabel(article: FWNArticle): string {
    if (article.is_pinned) return "Main Story";
    if (article.is_recommended) return "Editor's Pick";
    return "News";
  }

  /** 조회수 포맷 */
  function formatViews(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return String(count);
  }

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen">
      {/* ── FLASH 뉴스 티커 ── */}
      <section className="bg-[#0A0A0A] border-b border-neutral-800/50 py-2 overflow-hidden">
        <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
          <span className="flex items-center gap-2 text-xs font-bold text-white shrink-0 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Flash
          </span>
          {(flashNews.length > 0
            ? flashNews.map((a) => a.title)
            : ["FWN - Fashion Week Network"]
          )
            .concat(flashNews.map((a) => a.title))
            .map((title, i) => (
              <span key={i} className="text-xs text-neutral-400 shrink-0">
                {title}
                <span className="text-neutral-700 mx-4">/</span>
              </span>
            ))}
        </div>
      </section>

      {/* ── Hero ── */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-4">
            <span className="text-white">FASHION</span>
            <br />
            <span className="text-white">WEEK</span>
            <br />
            <span className="text-neutral-500">NETWORK</span>
          </h1>
          <div className="w-16 h-px bg-white mx-auto my-6" />
          <p className="text-neutral-400 text-sm sm:text-base max-w-md mx-auto tracking-wide">
            전세계 패션위크 소식과 패션 종사자 네트워크
          </p>
        </div>
      </section>

      {/* ── 패션위크 캘린더 ── */}
      <section className="px-6 py-12 border-t border-neutral-800/30">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.2em]">
                2026 F/W Fashion Week Calendar
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {fashionWeekCalendar.map((week) => (
              <div
                key={week.city}
                onMouseEnter={() => setHoveredWeek(week.city)}
                onMouseLeave={() => setHoveredWeek(null)}
                className={`group border rounded-xl p-4 transition-all cursor-pointer ${
                  hoveredWeek === week.city
                    ? "border-white bg-white/5"
                    : "border-neutral-800/50 hover:border-neutral-700"
                }`}
              >
                <p className="text-2xl font-black text-white mb-1 tracking-tight">
                  {week.flag}
                </p>
                <p className="text-xs text-neutral-400 font-medium mb-2">
                  {week.city}
                </p>
                <p className="text-[10px] text-neutral-600 font-mono">
                  {week.dates}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 최근 뉴스 ── */}
      <section className="px-6 py-12 border-t border-neutral-800/30">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.2em]">
              Latest News
            </h2>
            <Link
              href="/fwn/category/world"
              className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
            >
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {!loaded ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            </div>
          ) : latestNews.length === 0 ? (
            <p className="text-neutral-600 text-sm text-center py-12">
              아직 등록된 기사가 없습니다.
            </p>
          ) : (
            <div className="space-y-0 border-t border-neutral-800/50">
              {latestNews.map((article) => (
                <Link
                  key={article.id}
                  href={`/fwn/article/${article.slug}`}
                  className="group block"
                >
                  <article className="py-6 border-b border-neutral-800/30 cursor-pointer">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* 텍스트 영역 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 uppercase tracking-wider">
                            {getTagLabel(article)}
                          </span>
                          <span className="text-[10px] text-neutral-600 uppercase tracking-wider">
                            {categoryNameMap[getPrimaryCategory(article.tags)] ?? ""}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-neutral-300 transition-colors leading-tight mb-2">
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl line-clamp-2">
                            {article.summary}
                          </p>
                        )}
                      </div>

                      {/* 이미지 + 날짜 */}
                      <div className="shrink-0 flex flex-row-reverse lg:flex-col items-end gap-3">
                        {article.image && (
                          <div className="w-24 h-16 rounded overflow-hidden">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <p className="text-[10px] text-neutral-600 font-mono lg:text-right">
                          {formatDateKorean(article.published_at)}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 네트워크 현황 + 트렌딩 ── */}
      <section className="px-6 py-12 border-t border-neutral-800/30">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 네트워크 현황 */}
            <div>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-6">
                Network
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {networkStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-neutral-800/50 rounded-xl p-5 hover:border-neutral-700 transition-colors"
                  >
                    <stat.icon className="w-5 h-5 text-neutral-600 mb-3" />
                    <p className="text-2xl font-black text-white">
                      {stat.count}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 트렌딩 */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-neutral-500" />
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.2em]">
                  Trending
                </h2>
              </div>
              {!loaded ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
                </div>
              ) : trending.length === 0 ? (
                <p className="text-neutral-600 text-sm text-center py-8">
                  트렌딩 기사가 없습니다.
                </p>
              ) : (
                <div className="space-y-0 border-t border-neutral-800/50">
                  {trending.map((article, idx) => (
                    <Link
                      key={article.id}
                      href={`/fwn/article/${article.slug}`}
                      className="group flex items-center gap-4 py-4 border-b border-neutral-800/30 hover:pl-2 transition-all"
                    >
                      <span
                        className={`text-xl font-black shrink-0 w-8 text-center ${
                          idx < 3 ? "text-white" : "text-neutral-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-300 group-hover:text-white transition-colors truncate">
                          {article.title}
                        </p>
                      </div>
                      <span className="text-[10px] text-neutral-600 shrink-0 font-mono">
                        {formatViews(article.view_count ?? 0)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 뉴스레터 CTA ── */}
      <section className="px-6 py-16 border-t border-neutral-800/30">
        <div className="mx-auto max-w-2xl text-center">
          <Newspaper className="w-6 h-6 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">FWN Weekly</h3>
          <p className="text-neutral-500 text-sm mb-6">
            매주 월요일, 전세계 패션위크 소식을 정리해 보내드립니다.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="email@example.com"
              className="flex-1 px-4 py-2.5 bg-transparent border border-neutral-800 rounded text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-600 transition-colors"
            />
            <button className="px-5 py-2.5 bg-white text-black font-semibold rounded text-sm hover:bg-neutral-200 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── Ten:One Universe 연결 ── */}
      <section className="px-6 py-12 border-t border-neutral-800/30">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-neutral-700" />
            <span className="text-[10px] font-semibold text-neutral-700 uppercase tracking-[0.2em]">
              Ten:One Universe
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Badak", desc: "패션 업계 비즈니스 네트워킹", href: "/badak" },
              { name: "SmarComm", desc: "패션 브랜드 마케팅 커뮤니케이션", href: "/smarcomm" },
              { name: "MAD League", desc: "패션 분야 대학생 프로젝트", href: "/madleague" },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className="group p-5 rounded-xl border border-neutral-800/30 hover:border-neutral-700 transition-all"
              >
                <h4 className="font-bold text-white text-sm group-hover:text-neutral-300 transition-colors">
                  {brand.name}
                </h4>
                <p className="text-[10px] text-neutral-600 mt-1">
                  {brand.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── marquee CSS ── */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
