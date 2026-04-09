"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink, FileText, Eye, Tag, TrendingUp,
  Loader2, Calendar, BarChart3,
} from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

const FWN_SITE_ID = "070136ca-9edd-40f9-906b-762aeceb30c2";

/* ── 타입 ── */
interface PostRow {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  view_count: number;
  published_at: string;
  created_at: string;
  author_name: string | null;
  is_pinned: boolean;
}

/* ── 카테고리 한글 매핑 ── */
const categoryLabel: Record<string, string> = {
  seoul: "서울",
  paris: "파리",
  newyork: "뉴욕",
  london: "런던",
  milan: "밀라노",
  world: "월드",
  models: "모델",
  brands: "브랜드",
  street: "스트리트",
  "editors-pick": "Editor's Pick",
};

export default function FWNPage() {
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [categoryStats, setCategoryStats] = useState<{ tag: string; count: number }[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostRow[]>([]);
  const [topPosts, setTopPosts] = useState<PostRow[]>([]);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const supabase = createClient();

      // 총 기사 수
      const { count } = await supabase
        .from("ums_posts")
        .select("*", { count: "exact", head: true })
        .eq("site_id", FWN_SITE_ID);
      setTotalPosts(count ?? 0);

      // 전체 기사 (카테고리 분석 + 총 조회수)
      const { data: allPosts } = await supabase
        .from("ums_posts")
        .select("tags, view_count")
        .eq("site_id", FWN_SITE_ID);

      if (allPosts) {
        // 총 조회수
        const views = (allPosts as { tags: string[]; view_count: number | null }[]).reduce((s: number, p) => s + (p.view_count ?? 0), 0);
        setTotalViews(views);

        // 카테고리별 집계
        const tagCount: Record<string, number> = {};
        for (const post of allPosts) {
          const tags = (post.tags as string[]) ?? [];
          for (const tag of tags) {
            tagCount[tag] = (tagCount[tag] ?? 0) + 1;
          }
        }
        const sorted = Object.entries(tagCount)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);
        setCategoryStats(sorted);
      }

      // 최근 발행 5건
      const { data: recent } = await supabase
        .from("ums_posts")
        .select("id, title, slug, tags, view_count, published_at, created_at, author_name, is_pinned")
        .eq("site_id", FWN_SITE_ID)
        .order("published_at", { ascending: false })
        .limit(5);
      setRecentPosts((recent as PostRow[]) ?? []);

      // 조회수 상위 5건
      const { data: top } = await supabase
        .from("ums_posts")
        .select("id, title, slug, tags, view_count, published_at, created_at, author_name, is_pinned")
        .eq("site_id", FWN_SITE_ID)
        .order("view_count", { ascending: false })
        .limit(5);
      setTopPosts((top as PostRow[]) ?? []);
    } catch (err) {
      console.error("FWN data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(d: string) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  }

  const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="FWN 관리" description="Fashion Week News 콘텐츠 관리">
        <Link
          href="/fwn"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          사이트 바로가기
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="총 기사"
          value={totalPosts.toLocaleString() + "건"}
          sub="ums_posts 기준"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="카테고리"
          value={categoryStats.length + "개"}
          sub="태그 기준"
          icon={<Tag className="h-4 w-4" />}
        />
        <StatCard
          label="총 조회수"
          value={totalViews.toLocaleString()}
          sub={`평균 ${avgViews}회/건`}
          icon={<Eye className="h-4 w-4" />}
        />
        <StatCard
          label="핀 고정"
          value={recentPosts.filter((p) => p.is_pinned).length + "건"}
          sub="상단 고정 기사"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리별 기사 수 */}
        <Card>
          <SectionTitle title="카테고리별 기사 수" />
          {categoryStats.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4 text-center">카테고리 데이터 없음</p>
          ) : (
            <div className="space-y-2.5">
              {categoryStats.slice(0, 12).map((cat) => {
                const maxCount = categoryStats[0]?.count ?? 1;
                return (
                  <div key={cat.tag} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-600 w-24 truncate">
                      {categoryLabel[cat.tag] || cat.tag}
                    </span>
                    <div className="flex-1 h-5 bg-neutral-50 rounded-sm overflow-hidden relative">
                      <div
                        className="h-full bg-neutral-800 opacity-80 rounded-sm transition-all"
                        style={{ width: `${(cat.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 w-10 text-right">{cat.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 우측 패널 */}
        <div className="space-y-6">
          {/* 최근 발행 기사 */}
          <Card>
            <SectionTitle title="최근 발행" action="콘텐츠 관리" actionHref="/intra/ums/sites/content" />
            {recentPosts.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">기사 데이터 없음</p>
            ) : (
              <div className="space-y-0">
                {recentPosts.map((post, i) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 py-2.5 border-b border-neutral-50 last:border-0"
                  >
                    <span className="text-[10px] text-neutral-300 mt-0.5 w-4 shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-700 truncate leading-snug">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(post.published_at)}
                        </span>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                          <Eye className="h-2.5 w-2.5" />
                          {post.view_count}
                        </span>
                        {post.tags?.[0] && (
                          <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                            {categoryLabel[post.tags[0]] || post.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 조회수 상위 5건 */}
          <Card>
            <SectionTitle title="조회수 TOP 5" />
            {topPosts.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">기사 데이터 없음</p>
            ) : (
              <div className="space-y-0">
                {topPosts.map((post, i) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 py-2.5 border-b border-neutral-50 last:border-0"
                  >
                    <span className={`text-xs font-semibold mt-0.5 w-5 shrink-0 ${i < 3 ? "text-neutral-800" : "text-neutral-400"}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-700 truncate leading-snug">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                          <Eye className="h-2.5 w-2.5" />
                          {post.view_count.toLocaleString()}회
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
