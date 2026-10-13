import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Eye, Heart, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ArticleActions } from './ArticleActions';
import { ArticleComments } from './ArticleComments';
import { ArticleViewPing } from './ArticleViewPing';
import { MadzineArticleBody } from '@/features/madleague/MadzineArticleBody';
import { madzineCategoryLabel } from '@/lib/madzine-categories';
import { MadzineCard, MZ_DISPLAY, MZ_KICKER, MZ_RULE, MZ_SERIF, formatMzDate } from '@/features/madleague/MadzineUI';

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
    thumbnail_url: string | null; tags: string[] | null; year: number | null; excerpt: string | null;
    likes_count: number; views_count: number; comments_count: number;
    published_at: string; is_featured: boolean;
  };

  const [clubRes, relatedRes, likeRes, { data: { user } }] = await Promise.all([
    article.club_id ? sb.from('mad_clubs').select('slug, name, color').eq('id', article.club_id).maybeSingle() : Promise.resolve({ data: null }),
    sb.from('mad_articles')
      .select('id, slug, title, subtitle, excerpt, category, thumbnail_url, published_at')
      .eq('is_published', true)
      .eq('category', article.category)
      .neq('id', article.id)
      .order('published_at', { ascending: false })
      .limit(3),
    sb.from('mad_article_likes').select('id', { count: 'exact', head: true }).eq('article_id', article.id),
    sb.auth.getUser(),
  ]);

  const club = clubRes.data as { slug: string; name: string; color: string | null } | null;
  const related = (relatedRes.data ?? []) as Array<{ id: string; slug: string; title: string; subtitle: string | null; excerpt: string | null; category: string; thumbnail_url: string | null; published_at: string }>;

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
    <article>
      <ArticleViewPing articleId={article.id} />

      {/* 상단 러닝 헤드 */}
      <div className={`border-b ${MZ_RULE}`}>
        <div className={`mx-auto max-w-7xl px-6 py-4 flex items-center justify-between ${MZ_KICKER} text-neutral-500`}>
          <Link href="/madleague/madzine" className="inline-flex items-center gap-1 hover:text-white transition">
            <ChevronLeft className="h-3.5 w-3.5" /> <span className={`normal-case tracking-normal text-base italic ${MZ_DISPLAY}`}>MADzine</span>
          </Link>
          <span>{madzineCategoryLabel(article.category)}</span>
        </div>
      </div>

      {/* 헤드라인 */}
      <header className="mx-auto max-w-4xl px-6 pt-16 sm:pt-24 pb-12 text-center">
        <div className={`flex items-center justify-center gap-3 ${MZ_KICKER}`}>
          <span className="text-[#EC1D25]">{madzineCategoryLabel(article.category)}</span>
          {club && (<><span className="text-neutral-700">/</span><Link href={`/madleague/madzine?club=${club.slug}`} className="text-neutral-400 hover:text-white">{club.name}</Link></>)}
          {article.year && (<><span className="text-neutral-700">/</span><span className="text-neutral-400">{article.year}</span></>)}
        </div>
        <h1 className={`mt-8 text-4xl sm:text-6xl font-black leading-[1.15] tracking-tight text-white ${MZ_SERIF}`}>{article.title}</h1>
        {(article.subtitle ?? article.excerpt) && (
          <p className={`mt-8 mx-auto max-w-2xl text-lg sm:text-xl italic leading-relaxed text-neutral-400 ${MZ_SERIF}`}>
            {article.subtitle ?? article.excerpt}
          </p>
        )}
        <div className={`mt-10 mx-auto max-w-xl flex items-center justify-center gap-4 border-y ${MZ_RULE} py-4 text-[11px] tracking-[0.2em] text-neutral-500`}>
          {article.author_name && <span className="uppercase text-neutral-300">By {article.author_name}</span>}
          <span>{formatMzDate(article.published_at)}</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {article.views_count.toLocaleString()}</span>
        </div>
      </header>

      {article.thumbnail_url && (
        <figure className="mx-auto max-w-6xl px-0 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.thumbnail_url} alt={article.title} className="w-full h-auto" />
        </figure>
      )}

      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <MadzineArticleBody content={article.content} />

        {article.tags && article.tags.length > 0 && (
          <div className={`mt-16 pt-8 border-t ${MZ_RULE} flex flex-wrap gap-x-5 gap-y-2`}>
            {article.tags.map(tag => (
              <Link key={tag} href={`/madleague/madzine?tag=${encodeURIComponent(tag)}`} className={`${MZ_KICKER} text-neutral-500 hover:text-[#EC1D25] transition`}>
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className={`mt-12 pt-8 border-t ${MZ_RULE}`}>
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

      {/* Comments */}
      <section id="comments" className={`border-t ${MZ_RULE}`}>
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className={`text-2xl text-white ${MZ_SERIF}`}>댓글</h2>
            <span className={`text-lg italic text-neutral-500 ${MZ_DISPLAY}`}>
              <MessageCircle className="inline h-4 w-4 mr-1 -mt-1" />{article.comments_count}
            </span>
          </div>
          <ArticleComments articleId={article.id} canComment={!!memberId} />
        </div>
      </section>

      {/* More Stories */}
      {related.length > 0 && (
        <section className={`border-t ${MZ_RULE}`}>
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className={`flex items-end justify-between gap-6 border-b ${MZ_RULE} pb-4`}>
              <h2 className={`text-3xl sm:text-4xl text-white ${MZ_SERIF}`}>{madzineCategoryLabel(article.category)}의 다른 이야기</h2>
              <span className={`text-lg italic text-neutral-500 ${MZ_DISPLAY}`}>More Stories</span>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {related.map(r => <MadzineCard key={r.id} article={r} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
