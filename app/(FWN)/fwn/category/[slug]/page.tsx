"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  fetchFWNArticles,
  formatDateKorean,
  categoryNameMap,
  type FWNArticle,
} from "@/lib/supabase/fwn";

const categoryMeta: Record<string, { emoji: string; desc: string }> = {
  seoul: { emoji: "KR", desc: "서울 패션위크와 K-패션 트렌드" },
  paris: { emoji: "FR", desc: "파리 패션위크와 오트쿠튀르" },
  newyork: { emoji: "US", desc: "뉴욕 패션위크와 아메리칸 스타일" },
  london: { emoji: "UK", desc: "런던 패션위크와 브리티시 패션" },
  milan: { emoji: "IT", desc: "밀라노 패션위크와 이탈리안 크래프츠맨십" },
  world: { emoji: "GL", desc: "전 세계 패션위크 소식" },
  models: { emoji: "MD", desc: "패션 모델 뉴스와 뉴페이스" },
  brands: { emoji: "BR", desc: "주목할 패션 브랜드 소식" },
  street: { emoji: "ST", desc: "거리가 곧 런웨이 — 스트리트 패션" },
  "editors-pick": { emoji: "EP", desc: "에디터가 엄선한 기사" },
};

export default function FWNCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const catName = categoryNameMap[slug] ?? slug;
  const meta = categoryMeta[slug] ?? { emoji: "FW", desc: "" };

  const [articles, setArticles] = useState<FWNArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      setLoading(true);
      const data = await fetchFWNArticles({ category: slug, limit: 30 });
      setArticles(data);
      setLoading(false);
    }

    load();
  }, [slug]);

  return (
    <div>
      {/* Hero */}
      <section className="py-16 px-6 border-b border-neutral-800">
        <div className="mx-auto max-w-7xl text-center">
          <span className="text-5xl font-black text-neutral-700 block mb-4">
            {meta.emoji}
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            {catName}
          </h1>
          <p className="text-neutral-400">{meta.desc}</p>
        </div>
      </section>

      {/* 기사 목록 */}
      <section className="py-10 px-6">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-600 text-sm">
                이 카테고리에 등록된 기사가 없습니다.
              </p>
              <Link
                href="/fwn"
                className="text-sm text-[#00C853] hover:underline mt-4 inline-block"
              >
                홈으로 돌아가기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/fwn/article/${article.slug}`}
                  className="group bg-[#1a1a1a] rounded-lg overflow-hidden hover:ring-1 hover:ring-[#00C853] transition-all"
                >
                  {article.image ? (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-neutral-800 flex items-center justify-center">
                      <span className="text-neutral-600 text-2xl font-black">
                        {meta.emoji}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[#00C853] uppercase tracking-wider">
                        {catName}
                      </span>
                      {article.is_pinned && (
                        <span className="text-[10px] text-[#00C853] font-bold">
                          MAIN
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-white group-hover:text-[#00C853] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <p className="text-xs text-neutral-600">
                        {formatDateKorean(article.published_at)}
                      </p>
                      {article.view_count > 0 && (
                        <p className="text-xs text-neutral-700">
                          {article.view_count.toLocaleString()} views
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
