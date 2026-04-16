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
    year: number | null; published_at: string; is_featured: boolean; views_count?: number;
  }>;
  const clubById = new Map(clubs.map((c) => [c.id, c]));

  const { data: allYears } = await sb.from('mad_articles').select('year').eq('is_published', true);
  const yearOptions = Array.from(new Set((allYears ?? []).map((r: { year: number | null }) => r.year).filter(Boolean) as number[])).sort((a, b) => b - a);

  const featured = articles[0] ?? null;
  const subFeatured = articles.slice(1, 4);
  const boardArticles = articles.slice(4);

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* ─── Header ─────────────────────────────── */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-20 flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MADZINE</div>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">진짜들이 쓰는 기록</h1>
            {tag && <p className="mt-4 text-neutral-400">태그 <span className="text-[#EC1D25] font-bold">#{tag}</span></p>}
          </div>
          {isMember && (
            <Link href="/madleague/madzine/write" className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] text-white font-bold px-6 py-3 transition">
              + 투고
            </Link>
          )}
        </div>
      </section>

      {/* ─── 카테고리 필터 ─────────────────────── */}
      <section className="border-b border-neutral-900 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap gap-2 items-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={buildQS({ category: cat.slug === 'all' ? undefined : cat.slug, club, year })}
              className={`text-xs font-bold px-4 py-2 border transition ${
                category === cat.slug
                  ? 'bg-[#EC1D25] border-[#EC1D25] text-white'
                  : 'border-neutral-700 text-neutral-400 hover:border-white hover:text-white'
              }`}
            >
              {cat.label}
            </Link>
          ))}
          {yearOptions.length > 0 && <div className="w-px h-4 bg-neutral-700 mx-2" />}
          {yearOptions.map((y) => (
            <Link
              key={y}
              href={buildQS({ category: category === 'all' ? undefined : category, club, year: String(y) })}
              className={`text-xs font-bold px-3 py-2 border transition ${
                year === String(y)
                  ? 'bg-neutral-700 border-neutral-700 text-white'
                  : 'border-neutral-700 text-neutral-500 hover:border-white hover:text-white'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      </section>

      {articles.length === 0 ? (
        <div className="text-center py-40 text-neutral-600">조건에 맞는 콘텐츠가 없습니다.</div>
      ) : (
        <>
          {/* ─── 매거진 피처 ───────────────────── */}
          {featured && (
            <section className="mx-auto max-w-7xl px-6 py-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 메인 피처 */}
                <Link href={`/madleague/madzine/${featured.slug}`} className="group lg:col-span-2 block">
                  <div className="aspect-[16/9] bg-neutral-900 overflow-hidden">
                    {featured.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featured.thumbnail_url} alt={featured.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-700 text-sm tracking-widest font-bold">
                        {featured.category.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="mt-5">
                    <span className="text-xs font-bold tracking-widest text-[#EC1D25] uppercase">{featured.category}</span>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-black leading-tight group-hover:text-[#EC1D25] transition">
                      {featured.title}
                    </h2>
                    {featured.subtitle && (
                      <p className="mt-3 text-base text-neutral-400 leading-relaxed line-clamp-2">{featured.subtitle}</p>
                    )}
                    <div className="mt-4 text-xs text-neutral-600">
                      {featured.author_name && <span>{featured.author_name} · </span>}
                      {new Date(featured.published_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </Link>

                {/* 사이드 피처 2개 */}
                <div className="flex flex-col gap-8">
                  {subFeatured.slice(0, 2).map((a) => (
                    <Link key={a.id} href={`/madleague/madzine/${a.slug}`} className="group flex gap-4">
                      <div className="w-28 h-20 bg-neutral-900 overflow-hidden shrink-0">
                        {a.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.thumbnail_url} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <div className="h-full w-full bg-neutral-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold tracking-wider text-[#EC1D25] uppercase">{a.category}</span>
                        <h3 className="mt-1 text-sm font-black leading-snug group-hover:text-[#EC1D25] transition line-clamp-3">
                          {a.title}
                        </h3>
                        <div className="mt-2 text-xs text-neutral-600">
                          {new Date(a.published_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 3번째 서브피처 */}
              {subFeatured[2] && (
                <Link href={`/madleague/madzine/${subFeatured[2].slug}`}
                  className="group mt-8 flex gap-6 border-t border-neutral-900 pt-8 items-center">
                  <div className="w-40 h-28 bg-neutral-900 overflow-hidden shrink-0">
                    {subFeatured[2].thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={subFeatured[2].thumbnail_url} alt={subFeatured[2].title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="h-full w-full bg-neutral-800" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-wider text-[#EC1D25] uppercase">{subFeatured[2].category}</span>
                    <h3 className="mt-1 text-xl font-black group-hover:text-[#EC1D25] transition">{subFeatured[2].title}</h3>
                    {subFeatured[2].subtitle && (
                      <p className="mt-2 text-sm text-neutral-400 line-clamp-1">{subFeatured[2].subtitle}</p>
                    )}
                  </div>
                </Link>
              )}
            </section>
          )}

          {/* ─── 게시판 ────────────────────────── */}
          {boardArticles.length > 0 && (
            <section className="border-t border-neutral-900">
              <div className="mx-auto max-w-7xl px-6 py-12">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 text-xs font-bold tracking-widest text-neutral-600 text-left">
                      <th className="pb-4 w-20 hidden sm:table-cell">카테고리</th>
                      <th className="pb-4">제목</th>
                      <th className="pb-4 hidden md:table-cell w-24">동아리</th>
                      <th className="pb-4 w-24 text-right">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardArticles.map((a) => {
                      const articleClub = a.club_id ? clubById.get(a.club_id) : null;
                      return (
                        <tr key={a.id} className="border-b border-neutral-900 group hover:bg-neutral-950 transition">
                          <td className="py-4 hidden sm:table-cell">
                            <span className="text-xs font-bold text-[#EC1D25] tracking-wider uppercase">
                              {a.category}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <Link href={`/madleague/madzine/${a.slug}`}
                              className="font-bold group-hover:text-[#EC1D25] transition leading-snug line-clamp-1">
                              {a.title}
                            </Link>
                            {a.subtitle && (
                              <div className="mt-0.5 text-xs text-neutral-600 line-clamp-1 hidden sm:block">
                                {a.subtitle}
                              </div>
                            )}
                          </td>
                          <td className="py-4 hidden md:table-cell text-neutral-500 text-xs">
                            {articleClub?.name ?? '—'}
                          </td>
                          <td className="py-4 text-right text-neutral-600 text-xs whitespace-nowrap">
                            {new Date(a.published_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
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
