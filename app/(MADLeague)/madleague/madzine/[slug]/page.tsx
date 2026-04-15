import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { fetchMadClubBySlug } from '@/lib/supabase/madleague';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const sb = await createClient();
  const { data } = await sb.from('mad_articles').select('title, subtitle').eq('slug', slug).eq('is_published', true).maybeSingle();
  return { title: data?.title ?? '아티클', description: data?.subtitle ?? undefined };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const sb = await createClient();
  const { data } = await sb.from('mad_articles').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
  if (!data) notFound();
  const article = data as {
    id: string; slug: string; title: string; subtitle: string | null; content: string; category: string;
    club_id: string | null; author_name: string | null; thumbnail_url: string | null;
    tags: string[] | null; year: number | null; published_at: string; likes_count: number; views_count: number;
  };
  const articleClub = article.club_id
    ? (await sb.from('mad_clubs').select('*').eq('id', article.club_id).maybeSingle()).data
    : null;
  const club = articleClub as { slug: string; name: string; color: string | null } | null;

  return (
    <article className="bg-white text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 pt-12">
        <Link href="/madleague/madzine" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black transition">
          <ChevronLeft className="h-4 w-4" /> MADzine
        </Link>
      </div>

      <header className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
          <span className="text-[#EC1D25]">{article.category}</span>
          {club && (<><span className="text-neutral-300">·</span><span className="text-neutral-500">{club.name}</span></>)}
          {article.year && (<><span className="text-neutral-300">·</span><span className="text-neutral-500">{article.year}</span></>)}
        </div>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-tight">{article.title}</h1>
        {article.subtitle && <p className="mt-4 text-lg text-neutral-600 leading-relaxed">{article.subtitle}</p>}
        {article.author_name && (
          <div className="mt-6 text-sm text-neutral-500">
            {article.author_name} · {new Date(article.published_at).toLocaleDateString('ko-KR')}
          </div>
        )}
      </header>

      {article.thumbnail_url && (
        <div className="mx-auto max-w-5xl px-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.thumbnail_url} alt={article.title} className="w-full h-auto" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="prose prose-neutral max-w-none whitespace-pre-wrap leading-relaxed text-neutral-800">
          {article.content}
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
