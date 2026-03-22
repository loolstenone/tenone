'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getPublishedPosts, BLOG_CATEGORIES } from '@/lib/smarcomm/blog-data';
import SmarCommHeader from '@/components/SmarCommHeader';
import SmarCommFooter from '@/components/SmarCommFooter';

export default function SCBlogPage() {
  const [category, setCategory] = useState('전체');
  const [search, setSearch] = useState('');
  const posts = getPublishedPosts();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = posts.filter(p => {
    const matchCat = category === '전체' || p.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <SmarCommHeader />
      <main className="min-h-screen bg-white pt-20">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-text tracking-tight">블로그</h1>
            <p className="mt-2 text-sm text-text-muted">마케팅 인사이트, 실전 사례, AI 트렌드를 공유합니다</p>
          </div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="글 검색..."
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BLOG_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${category === cat ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_80px_80px] border-b border-border bg-surface px-5 py-2.5 text-[11px] font-semibold text-text-muted">
              <span>제목</span><span className="text-center">카테고리</span><span className="text-center">읽기</span><span className="text-right">날짜</span>
            </div>
            {paged.length > 0 ? paged.map((post) => (
              <Link key={post.id} href={`/sc/blog/${post.slug}`}
                className="grid grid-cols-[1fr_100px_80px_80px] items-center border-b border-border px-5 py-3.5 transition-colors hover:bg-surface last:border-0">
                <div className="min-w-0 pr-4">
                  <div className="text-sm font-medium text-text truncate">{post.title}</div>
                  <div className="mt-0.5 text-[11px] text-text-muted truncate">{post.summary}</div>
                </div>
                <div className="text-center"><span className="inline-block rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-text-sub">{post.category}</span></div>
                <div className="text-center text-[11px] text-text-muted">{post.readTime}분</div>
                <div className="text-right text-[11px] text-text-muted">{post.publishedAt.replace('2026-', '')}</div>
              </Link>
            )) : (
              <div className="py-16 text-center text-sm text-text-muted">검색 결과가 없습니다</div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-text-muted">총 {filtered.length}건 {totalPages > 1 && `| ${page} / ${totalPages} 페이지`}</div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded border border-border px-2 py-1 text-[10px] text-text-muted hover:bg-surface disabled:opacity-30">이전</button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded border border-border px-2 py-1 text-[10px] text-text-muted hover:bg-surface disabled:opacity-30">다음</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <SmarCommFooter />
    </>
  );
}
