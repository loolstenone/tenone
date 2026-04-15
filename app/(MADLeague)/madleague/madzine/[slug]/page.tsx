import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Eye, Heart, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ArticleActions } from './ArticleActions';
import { ArticleComments } from './ArticleComments';
import { ArticleViewPing } from './ArticleViewPing';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const sb = await createClient();
  const { data } = await sb.from('mad_articles')
    .select('title, subtitle, thumbnail_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (!data) return { title: '아티클' };
  const d = data as { title: string; subtitle: string | null; thumbnail_url: string | null };
  return {
    title: d.title,
    description: d.subtitle ?? undefined,
    openGraph: {
      title: d.title,
      description: d.subtitle ?? undefined,
      images: d.thumbnail_url ? [d.thumbnail_url] : [],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const sb = await createClient();

  const { data } = await sb.from('mad_articles').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
  if (!data) notFound();

  const article = data as {
    id: string; slug: string; title: string; subtitle: string | null; content: string;
    category: string; club_id: string | null; author_id: string | null; author_name: string | null;
    thumbnail_url: string | null; tags: string[] | null; year: number | null;
    likes_count: number; views_count: number; comments_count: number;
    published_at: string; is_featured: boolean;
  };

  const [clubRes, relatedRes, likeRes, { data: { user } }] = await Promise.all([
    article.club_id ? sb.from('mad_clubs').select('slug, name, color').eq('id', article.club_id).maybeSingle() : Promise.resolve({ data: null }),
    sb.from('mad_articles')
      .select('id, slug, title, subtitle, category, thumbnail_url, published_at')
      .eq('is_published', true)
      .eq('category', article.category)
      .neq('id', article.id)
      .order('published_at', { ascending: false })
      .limit(3),
    sb.from('mad_article_likes').select('id', { count: 'exact', head: true }).eq('article_id', article.id),
    sb.auth.getUser(),
  ]);

  const club = clubRes.data as { slug: string; name: string; color: string | null } | null;
  const related = (relatedRes.data ?? []) as Array<{ id: string; slug: string; title: string; subtitle: string | null; category: string; thumbnail_url: string | null; published_at: string }>;

  // 본인 좋아요 여부 조회
  let userLiked = false;
  let memberId: string | null = null;
  if (user) {
    const { data: m } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
    if (m) {
      memberId = (m as { id: string }).id;
      const { data: likeExists } = await sb.from('mad_article_likes')
        .select('id').eq('article_id', article.id).eq('member_id', memberId).maybeSingle();
      userLiked = !!likeExists;
    }
  }

  return (
    <article className="bg-white text-neutral-900">
      <ArticleViewPing articleId={article.id} />

      <div className="mx-auto max-w-3xl px-6 pt-12">
        <Link href="/madleague/madzine" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black transition">
          <ChevronLeft className="h-4 w-4" /> MADzine
        </Link>
      </div>

      <header className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
          <span className="text-[#EC1D25]">{article.category}</span>
          {club && (<><span className="text-neutral-300">·</span><Link href={`/madleague/madzine?club=${club.slug}`} className="text-neutral-500 hover:text-black">{club.name}</Link></>)}
          {article.year && (<><span className="text-neutral-300">·</span><span className="text-neutral-500">{article.year}</span></>)}
        </div>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-tight">{article.title}</h1>
        {article.subtitle && <p className="mt-4 text-lg text-neutral-600 leading-relaxed">{article.subtitle}</p>}
        <div className="mt-6 flex items-center gap-4 text-sm text-neutral-500">
          {article.author_name && <span>{article.author_name}</span>}
          <span>·</span>
          <span>{new Date(article.published_at).toLocaleDateString('ko-KR')}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {article.views_count.toLocaleString()}</span>
        </div>
      </header>

      {article.thumbnail_url && (
        <div className="mx-auto max-w-5xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.thumbnail_url} alt={article.title} className="w-full h-auto" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="prose prose-neutral max-w-none whitespace-pre-wrap leading-relaxed text-neutral-800 text-base">
          {article.content}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <Link key={tag} href={`/madleague/madzine?tag=${encodeURIComponent(tag)}`} className="text-xs font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 px-3 py-1">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Actions: likes + share */}
        <div className="mt-10">
          <ArticleActions
            articleId={article.id}
            slug={article.slug}
            title={article.title}
            initialLikesCount={article.likes_count}
            initialLiked={userLiked}
            canLike={!!memberId}
            commentsCount={article.comments_count}
          />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-neutral-50 border-y border-neutral-200">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">RELATED</div>
            <h2 className="text-2xl font-black mb-8">이 카테고리의 다른 글</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(r => (
                <Link key={r.id} href={`/madleague/madzine/${r.slug}`} className="group block">
                  <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                    {r.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.thumbnail_url} alt={r.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-400 text-xs tracking-[0.3em] font-bold">
                        {r.category.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-xs font-bold tracking-wider uppercase text-[#EC1D25]">{r.category}</div>
                  <div className="mt-1 font-bold group-hover:text-[#EC1D25] transition">{r.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comments */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-neutral-500" />
          <h2 className="text-xl font-black">댓글 <span className="text-neutral-500 font-normal">{article.comments_count}</span></h2>
        </div>
        <ArticleComments articleId={article.id} canComment={!!memberId} />
      </section>
    </article>
  );
}
