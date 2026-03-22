'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { getPostBySlug, getPublishedPosts } from '@/lib/smarcomm/blog-data';
import SmarCommHeader from '@/components/SmarCommHeader';
import SmarCommFooter from '@/components/SmarCommFooter';

export default function SCBlogPostPage() {
  const params = useParams();
  const post = getPostBySlug(params.slug as string);
  const allPosts = getPublishedPosts().filter(p => p.slug !== params.slug);

  const relatedPosts = post ? (() => {
    const scored = allPosts.map(p => {
      let score = 0;
      if (p.category === post.category) score += 3;
      post.tags.forEach(tag => { if (p.tags.includes(tag)) score += 2; });
      return { ...p, score };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  })() : [];

  if (!post) {
    return (
      <>
        <SmarCommHeader />
        <main className="min-h-screen bg-white pt-20">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h1 className="text-2xl font-bold text-text">글을 찾을 수 없습니다</h1>
            <Link href="/sc/blog" className="mt-4 inline-block text-sm text-text-muted hover:text-text">← 블로그로 돌아가기</Link>
          </div>
        </main>
        <SmarCommFooter />
      </>
    );
  }

  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, i) => {
      if (block.startsWith('## ')) return <h2 key={i} className="mt-8 mb-3 text-xl font-bold text-text">{block.replace('## ', '')}</h2>;
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
      <SmarCommHeader />
      <main className="min-h-screen bg-white pt-20">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <Link href="/sc/blog" className="mb-6 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text">
            <ArrowLeft size={12} /> 블로그
          </Link>
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-text-sub">{post.category}</span>
            <span className="flex items-center gap-1 text-xs text-text-muted"><Clock size={12} />{post.readTime}분 읽기</span>
            <span className="text-xs text-text-muted">{post.publishedAt}</span>
          </div>
          <h1 className="mb-4 text-3xl font-extrabold text-text tracking-tight leading-tight">{post.title}</h1>
          <p className="mb-8 text-base text-text-sub leading-relaxed">{post.summary}</p>
          <div className="mb-8 h-px bg-border" />
          <div className="prose-sm">{renderContent(post.content)}</div>
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs text-text-muted">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-4 text-sm font-bold text-text">관련글 더보기</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {relatedPosts.map(rp => (
                  <Link key={rp.id} href={`/sc/blog/${rp.slug}`} className="group rounded-xl border border-border p-4 transition-all hover:shadow-md">
                    <span className="rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-text-sub">{rp.category}</span>
                    <p className="mt-1.5 text-xs font-semibold text-text line-clamp-2 group-hover:text-point">{rp.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <SmarCommFooter />
    </>
  );
}
