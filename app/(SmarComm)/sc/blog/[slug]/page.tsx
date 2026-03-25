'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { getPostBySlug, getPublishedPosts } from '@/lib/smarcomm/blog-data';
import Header from '@/components/smarcomm/Header';
import Footer from '@/components/smarcomm/Footer';

export default function BlogPostPage() {
  const params = useParams();
  const post = getPostBySlug(params.slug as string);
  const allPosts = getPublishedPosts().filter(p => p.slug !== params.slug);

  // 키워드 관련성 기반 추천 (태그/카테고리 매칭)
  const relatedPosts = post ? (() => {
    const scored = allPosts.map(p => {
      let score = 0;
      if (p.category === post.category) score += 3;
      post.tags.forEach(tag => { if (p.tags.includes(tag)) score += 2; });
      return { ...p, score };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  })() : [];

  const latestPosts = allPosts.slice(0, 3);

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pt-20">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h1 className="text-2xl font-bold text-text">글을 찾을 수 없습니다</h1>
            <Link href="/blog" className="mt-4 inline-block text-sm text-text-muted hover:text-text">← 블로그로 돌아가기</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // 마크다운 스타일 렌더링 (간단 파싱)
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, i) => {
      if (block.startsWith('## ')) {
        return <h2 key={i} className="mt-8 mb-3 text-xl font-bold text-text">{block.replace('## ', '')}</h2>;
      }
      if (block.startsWith('**') || block.includes('\n')) {
        const lines = block.split('\n');
        return (
          <div key={i} className="mb-4">
            {lines.map((line, j) => {
              if (line.match(/^\d+\.\s\*\*/)) {
                const text = line.replace(/^\d+\.\s/, '').replace(/\*\*/g, '');
                const num = line.match(/^(\d+)\./)?.[1];
                return <p key={j} className="mb-2 text-sm text-text-sub leading-relaxed"><span className="font-bold text-text">{num}. </span>{text}</p>;
              }
              return <p key={j} className="text-sm text-text-sub leading-relaxed">{line}</p>;
            })}
          </div>
        );
      }
      return <p key={i} className="mb-4 text-sm text-text-sub leading-relaxed">{block}</p>;
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20">
        <article className="mx-auto max-w-3xl px-6 py-12">
          {/* 뒤로가기 */}
          <Link href="/blog" className="mb-6 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text">
            <ArrowLeft size={12} /> 블로그
          </Link>

          {/* 메타 */}
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-text-sub">{post.category}</span>
            <span className="flex items-center gap-1 text-xs text-text-muted"><Clock size={12} />{post.readTime}분 읽기</span>
            <span className="text-xs text-text-muted">{post.publishedAt}</span>
          </div>

          {/* 제목 */}
          <h1 className="mb-4 text-3xl font-extrabold text-text tracking-tight leading-tight">{post.title}</h1>
          <p className="mb-8 text-base text-text-sub leading-relaxed">{post.summary}</p>

          <div className="mb-8 h-px bg-border" />

          {/* 본문 */}
          <div className="prose-sm">
            {renderContent(post.content)}
          </div>

          {/* 태그 */}
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs text-text-muted">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>

          {/* 광고/이벤트 공지 영역 */}
          <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-point mb-1">EVENT</div>
                <p className="text-sm font-semibold text-text">봄 시즌 특별 프로모션</p>
                <p className="mt-0.5 text-xs text-text-muted">Lite 플랜 첫 달 30% 할인 — 3월 한정</p>
              </div>
              <Link href="/pricing" className="shrink-0 rounded-xl bg-text px-5 py-2.5 text-xs font-semibold text-white hover:bg-accent-sub">
                자세히 보기
              </Link>
            </div>
          </div>

          {/* 관련글 더보기 (키워드 관련성 기반) */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-4 text-sm font-bold text-text">관련글 더보기</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {relatedPosts.map(rp => (
                  <Link key={rp.id} href={`/blog/${rp.slug}`} className="group rounded-xl border border-border p-4 transition-all hover:shadow-md hover:border-text-muted/40">
                    <span className="rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-text-sub">{rp.category}</span>
                    <p className="mt-1.5 text-xs font-semibold text-text line-clamp-2 group-hover:text-point">{rp.title}</p>
                    <p className="mt-1 text-[10px] text-text-muted line-clamp-1">{rp.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 최신글 */}
          {latestPosts.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-text">최신글</h3>
                <Link href="/blog" className="text-[10px] text-text-muted hover:text-text">전체 보기 →</Link>
              </div>
              <div className="space-y-2">
                {latestPosts.map(lp => (
                  <Link key={lp.id} href={`/blog/${lp.slug}`} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-all hover:bg-surface">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-text truncate">{lp.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-muted">
                        <span>{lp.category}</span>
                        <span>{lp.publishedAt}</span>
                      </div>
                    </div>
                    <span className="ml-3 shrink-0 text-[10px] text-text-muted">{lp.readTime}분</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
