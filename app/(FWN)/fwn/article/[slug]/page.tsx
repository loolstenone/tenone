"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Clock, User } from "lucide-react";
import DOMPurify from 'isomorphic-dompurify';
import {
  fetchFWNArticle,
  fetchFWNArticles,
  incrementViewCount,
  formatDateKorean,
  getPrimaryCategory,
  categoryNameMap,
  type FWNArticle,
} from "@/lib/supabase/fwn";

export default function FWNArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<FWNArticle | null>(null);
  const [related, setRelated] = useState<FWNArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      setLoading(true);
      const art = await fetchFWNArticle(slug);
      setArticle(art);

      if (art) {
        // 조회수 증가
        incrementViewCount(art.id);

        // 관련 기사 (같은 카테고리)
        const primaryCat = getPrimaryCategory(art.tags);
        if (primaryCat) {
          const relatedArticles = await fetchFWNArticles({
            category: primaryCat,
            limit: 4,
          });
          setRelated(relatedArticles.filter((r) => r.id !== art.id).slice(0, 3));
        }
      }

      setLoading(false);
    }

    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-400">기사를 찾을 수 없습니다.</p>
        <Link
          href="/fwn"
          className="text-sm text-[#00C853] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> 홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const primaryCat = getPrimaryCategory(article.tags);
  const catName = categoryNameMap[primaryCat] ?? primaryCat;

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen">
      {/* 상단 네비 */}
      <div className="px-6 py-4 border-b border-neutral-800/30">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          <Link
            href={primaryCat ? `/fwn/category/${primaryCat}` : "/fwn"}
            className="text-sm text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {catName || "FWN"}
          </Link>
        </div>
      </div>

      {/* 히어로 이미지 */}
      {article.image && (
        <div className="w-full max-h-[500px] overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 기사 본문 */}
      <article className="px-6 py-10">
        <div className="mx-auto max-w-4xl">
          {/* 카테고리 태그 */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/fwn/category/${tag}`}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/10 text-neutral-300 hover:text-[#00C853] transition-colors"
              >
                {categoryNameMap[tag] ?? tag}
              </Link>
            ))}
            {article.is_pinned && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#00C853]/20 text-[#00C853]">
                Main Story
              </span>
            )}
            {article.is_recommended && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#00C853]/20 text-[#00C853]">
                Editor&apos;s Pick
              </span>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            {article.title}
          </h1>

          {/* 메타 정보 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-8 pb-8 border-b border-neutral-800/50">
            {article.author_name && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {article.author_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDateKorean(article.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {(article.view_count ?? 0).toLocaleString()}
            </span>
          </div>

          {/* 요약 */}
          {article.summary && (
            <p className="text-lg text-neutral-300 leading-relaxed mb-8 pl-4 border-l-2 border-[#00C853]/50">
              {article.summary}
            </p>
          )}

          {/* 본문 HTML */}
          <div
            className="fwn-article-body"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.body) }}
          />
        </div>
      </article>

      {/* 관련 기사 */}
      {related.length > 0 && (
        <section className="px-6 py-12 border-t border-neutral-800/30">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/fwn/article/${r.slug}`}
                  className="group bg-[#1a1a1a] rounded-lg overflow-hidden hover:ring-1 hover:ring-[#00C853] transition-all"
                >
                  {r.image ? (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={r.image}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-neutral-800 flex items-center justify-center">
                      <span className="text-neutral-600 text-sm">FWN</span>
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-[10px] text-[#00C853] uppercase tracking-wider">
                      {categoryNameMap[getPrimaryCategory(r.tags)] ?? ""}
                    </span>
                    <h3 className="font-medium text-white group-hover:text-[#00C853] transition-colors mt-1 line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-2">
                      {formatDateKorean(r.published_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WordPress HTML 다크 테마 스타일 */}
      <style jsx global>{`
        .fwn-article-body {
          color: #d4d4d4;
          font-size: 1rem;
          line-height: 1.8;
        }
        .fwn-article-body a {
          color: #00c853;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .fwn-article-body a:hover {
          color: #00e676;
        }
        .fwn-article-body img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        .fwn-article-body h1,
        .fwn-article-body h2,
        .fwn-article-body h3,
        .fwn-article-body h4 {
          color: white;
          margin-top: 24px;
          margin-bottom: 12px;
          font-weight: 700;
        }
        .fwn-article-body h2 {
          font-size: 1.5rem;
        }
        .fwn-article-body h3 {
          font-size: 1.25rem;
        }
        .fwn-article-body p {
          margin-bottom: 16px;
          line-height: 1.8;
        }
        .fwn-article-body ul,
        .fwn-article-body ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }
        .fwn-article-body li {
          margin-bottom: 8px;
        }
        .fwn-article-body blockquote {
          border-left: 3px solid #00c853;
          padding-left: 16px;
          margin: 16px 0;
          color: #a3a3a3;
          font-style: italic;
        }
        .fwn-article-body figure {
          margin: 24px 0;
        }
        .fwn-article-body figcaption {
          text-align: center;
          color: #737373;
          font-size: 0.875rem;
          margin-top: 8px;
        }
        .fwn-article-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .fwn-article-body th,
        .fwn-article-body td {
          border: 1px solid #333;
          padding: 8px 12px;
          text-align: left;
        }
        .fwn-article-body th {
          background: #1a1a1a;
          color: white;
          font-weight: 600;
        }
        .fwn-article-body pre {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 16px;
          overflow-x: auto;
          margin: 16px 0;
        }
        .fwn-article-body code {
          background: #1a1a1a;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .fwn-article-body iframe {
          max-width: 100%;
          margin: 16px 0;
        }
        .fwn-article-body .wp-block-image,
        .fwn-article-body .wp-block-embed {
          margin: 24px 0;
        }
      `}</style>
    </div>
  );
}
