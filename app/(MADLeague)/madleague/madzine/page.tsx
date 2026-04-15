import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchMadClubs } from '@/lib/supabase/madleague';

export const revalidate = 300;

export const metadata = {
  title: 'MADzine',
  description: 'MADLeague의 인터뷰·케이스·리포트·매거진',
};

const CATEGORIES = [
  { slug: 'all',       label: '전체' },
  { slug: 'interview', label: '인터뷰' },
  { slug: 'case',      label: '케이스' },
  { slug: 'report',    label: '리포트' },
  { slug: 'cover',     label: '커버' },
  { slug: 'news',      label: '동아리 소식' },
] as const;

interface PageProps {
  searchParams: Promise<{ category?: string; club?: string; year?: string; tag?: string }>;
}

export default async function MadzinePage({ searchParams }: PageProps) {
  const { category = 'all', club, year, tag } = await searchParams;
  const sb = await createClient();
  const clubs = await fetchMadClubs();
  const { data: { user } } = await sb.auth.getUser();
  let isMember = false;
  if (user) {
    const { data: m } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
    isMember = !!m;
  }

  let q = sb.from('mad_articles').select('*').eq('is_published', true).order('published_at', { ascending: false });
  if (category !== 'all') q = q.eq('category', category);
  if (year) q = q.eq('year', Number(year));
  if (tag) q = q.contains('tags', [tag]);
  if (club) {
    const target = clubs.find((c) => c.slug === club);
    if (target) q = q.eq('club_id', target.id);
  }
  const { data } = await q;
  const articles = (data ?? []) as Array<{
    id: string; slug: string; title: string; subtitle: string | null; category: string;
    club_id: string | null; thumbnail_url: string | null; author_name: string | null;
    year: number | null; published_at: string; is_featured: boolean;
  }>;
  const clubById = new Map(clubs.map((c) => [c.id, c]));

  const { data: allYears } = await sb.from('mad_articles').select('year').eq('is_published', true);
  const yearOptions = Array.from(new Set((allYears ?? []).map((r: { year: number | null }) => r.year).filter(Boolean) as number[])).sort((a, b) => b - a);

  return (
    <div className="bg-white text-neutral-900">
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-20 flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MADZINE</div>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">진짜들이 쓰는 기록</h1>
            <p className="mt-6 max-w-xl text-neutral-600 leading-relaxed">
              수상 인터뷰부터 현장 케이스까지. MADLeague 안에서 일어난 실전을 기록한다.
              {tag && <span className="block mt-2 text-sm">태그 <strong className="text-[#EC1D25]">#{tag}</strong></span>}
            </p>
          </div>
          {isMember && (
            <Link href="/madleague/madzine/write" className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold px-6 py-3 transition">
              + 투고
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap gap-2 border-b border-neutral-200">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={buildQS({ category: cat.slug === 'all' ? undefined : cat.slug, club, year })}
            className={`text-xs font-bold px-4 py-2 border transition ${
              category === cat.slug
                ? 'bg-black border-black text-white'
                : 'bg-white border-neutral-300 text-neutral-600 hover:border-black'
            }`}
          >
            {cat.label}
          </Link>
        ))}
        {yearOptions.length > 0 && <div className="w-px bg-neutral-200 mx-2" />}
        {yearOptions.map((y) => (
          <Link
            key={y}
            href={buildQS({ category: category === 'all' ? undefined : category, club, year: String(y) })}
            className={`text-xs font-bold px-3 py-2 border transition ${
              year === String(y)
                ? 'bg-[#EC1D25] border-[#EC1D25] text-white'
                : 'bg-white border-neutral-300 text-neutral-600 hover:border-[#EC1D25]'
            }`}
          >
            {y}
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">조건에 맞는 콘텐츠가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.map((a) => {
              const articleClub = a.club_id ? clubById.get(a.club_id) : null;
              return (
                <Link key={a.id} href={`/madleague/madzine/${a.slug}`} className="group block">
                  <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                    {a.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.thumbnail_url} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-400 text-xs tracking-[0.3em] font-bold">
                        {a.category.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                    <span className="text-[#EC1D25]">{a.category}</span>
                    {articleClub && (<><span className="text-neutral-300">·</span><span className="text-neutral-500">{articleClub.name}</span></>)}
                    {a.year && (<><span className="text-neutral-300">·</span><span className="text-neutral-500">{a.year}</span></>)}
                  </div>
                  <h3 className="mt-2 text-xl font-black group-hover:text-[#EC1D25] transition leading-tight">{a.title}</h3>
                  {a.subtitle && <p className="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-2">{a.subtitle}</p>}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function buildQS(params: { category?: string; club?: string; year?: string }) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.club) qs.set('club', params.club);
  if (params.year) qs.set('year', params.year);
  const s = qs.toString();
  return s ? `/madleague/madzine?${s}` : '/madleague/madzine';
}
