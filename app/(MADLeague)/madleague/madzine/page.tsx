import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchMadClubs } from '@/lib/supabase/madleague';
import { MADZINE_CATEGORIES, madzineCategoryLabel } from '@/lib/madzine-categories';
import { MadzineCard, MZ_DISPLAY, MZ_KICKER, MZ_RULE, MZ_SERIF, formatMzDate } from '@/features/madleague/MadzineUI';

export const revalidate = 300;

export const metadata = {
  title: 'MADzine',
  description: 'MADLeague의 인터뷰·케이스·리포트·매거진',
};

const CATEGORIES = [{ slug: 'all', label: '전체' }, ...MADZINE_CATEGORIES] as const;

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
    year: number | null; published_at: string; is_featured: boolean; views_count?: number; excerpt: string | null;
  }>;
  const clubById = new Map(clubs.map((c) => [c.id, c]));

  const { data: allYears } = await sb.from('mad_articles').select('year').eq('is_published', true);
  const yearOptions = Array.from(new Set((allYears ?? []).map((r: { year: number | null }) => r.year).filter(Boolean) as number[])).sort((a, b) => b - a);

  const cover = articles[0] ?? null;
  const picks = articles.slice(1, 7);
  const archive = articles.slice(7);
  const issueYear = yearOptions[0] ?? new Date().getFullYear();

  return (
    <div>
      {/* ─── Masthead ─────────────────────────────── */}
      <header className={`border-b ${MZ_RULE}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className={`flex items-center justify-between border-b ${MZ_RULE} py-4 ${MZ_KICKER} text-neutral-500`}>
            <span>MAD League Magazine</span>
            <span className="hidden sm:inline">Vol. {issueYear} · {articles.length} Stories</span>
          </div>
          <div className="py-14 sm:py-20 text-center">
            <h1 className={`text-7xl sm:text-9xl italic font-black tracking-tight text-white ${MZ_DISPLAY}`}>
              MAD<span className="text-[#EC1D25]">zine</span>
            </h1>
            <p className={`mt-6 text-lg sm:text-xl text-neutral-300 ${MZ_SERIF}`}>진짜들이 쓰는 기록</p>
            {tag && <p className={`mt-4 ${MZ_KICKER} text-neutral-400`}>Tag · <span className="text-[#EC1D25]">#{tag}</span></p>}
            {isMember && (
              <Link href="/madleague/madzine/write"
                className={`mt-8 inline-block border border-white/30 px-6 py-3 ${MZ_KICKER} text-white hover:border-[#EC1D25] hover:text-[#EC1D25] transition`}>
                + 투고하기
              </Link>
            )}
          </div>
        </div>

        {/* 카테고리 · 연도 */}
        <nav className={`border-t ${MZ_RULE}`}>
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {CATEGORIES.map((cat) => {
              const active = category === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={buildQS({ category: cat.slug === 'all' ? undefined : cat.slug, club, year })}
                  className={`${MZ_KICKER} pb-1 border-b transition ${active ? 'text-white border-[#EC1D25]' : 'text-neutral-500 border-transparent hover:text-white'}`}
                >
                  {cat.label}
                </Link>
              );
            })}
            {yearOptions.length > 0 && <span className="h-3 w-px bg-white/20" />}
            {yearOptions.map((y) => (
              <Link
                key={y}
                href={buildQS({ category: category === 'all' ? undefined : category, club, year: year === String(y) ? undefined : String(y) })}
                className={`text-sm italic transition ${MZ_DISPLAY} ${year === String(y) ? 'text-[#EC1D25]' : 'text-neutral-500 hover:text-white'}`}
              >
                {y}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {articles.length === 0 ? (
        <div className="py-40 text-center">
          <p className={`text-3xl italic text-neutral-600 ${MZ_DISPLAY}`}>Next issue</p>
          <p className="mt-3 text-sm text-neutral-500">조건에 맞는 글이 아직 없습니다.</p>
        </div>
      ) : (
        <>
          {/* ─── Cover Story ─────────────────────── */}
          {cover && (
            <section className="mx-auto max-w-7xl px-6 pt-12">
              <Link href={`/madleague/madzine/${cover.slug}`} className="group relative block overflow-hidden bg-neutral-900">
                <div className="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
                  {cover.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.thumbnail_url} alt={cover.title}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-1000" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12 max-w-3xl">
                  <div className={`${MZ_KICKER} text-[#EC1D25]`}>Cover Story · {madzineCategoryLabel(cover.category)}</div>
                  <h2 className={`mt-4 text-3xl sm:text-5xl font-black leading-tight text-white ${MZ_SERIF}`}>{cover.title}</h2>
                  {(cover.subtitle ?? cover.excerpt) && (
                    <p className="mt-4 text-sm sm:text-base leading-relaxed text-neutral-300 line-clamp-2">{cover.subtitle ?? cover.excerpt}</p>
                  )}
                  <div className="mt-5 text-[11px] tracking-[0.2em] text-neutral-400">
                    {cover.author_name && <span>{cover.author_name} · </span>}{formatMzDate(cover.published_at)}
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* ─── In This Issue ───────────────────── */}
          {picks.length > 0 && (
            <section className="mx-auto max-w-7xl px-6 pt-20">
              <SectionTitle eyebrow="In This Issue" title="이번 호의 이야기" />
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {picks.map((a, i) => <MadzineCard key={a.id} article={a} index={i + 1} />)}
              </div>
            </section>
          )}

          {/* ─── Archive Index ───────────────────── */}
          {archive.length > 0 && (
            <section className="mx-auto max-w-7xl px-6 pt-24">
              <SectionTitle eyebrow="Archive" title="지난 이야기" />
              <ol className={`mt-10 border-t ${MZ_RULE}`}>
                {archive.map((a, i) => {
                  const articleClub = a.club_id ? clubById.get(a.club_id) : null;
                  return (
                    <li key={a.id} className={`border-b ${MZ_RULE}`}>
                      <Link href={`/madleague/madzine/${a.slug}`} className="group grid grid-cols-12 items-baseline gap-4 py-6">
                        <span className={`col-span-2 sm:col-span-1 text-2xl italic text-neutral-600 group-hover:text-[#EC1D25] transition ${MZ_DISPLAY}`}>
                          {String(picks.length + i + 1).padStart(2, '0')}
                        </span>
                        <span className={`hidden sm:block col-span-2 ${MZ_KICKER} text-[#EC1D25]`}>{madzineCategoryLabel(a.category)}</span>
                        <span className={`col-span-10 sm:col-span-6 text-lg leading-snug text-white group-hover:text-[#EC1D25] transition ${MZ_SERIF}`}>
                          {a.title}
                        </span>
                        <span className="hidden sm:block col-span-1 text-xs text-neutral-500">{articleClub?.name ?? ''}</span>
                        <span className="hidden sm:block col-span-2 text-right text-[11px] tracking-[0.2em] text-neutral-500">{formatMzDate(a.published_at)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
          <div className="pb-24" />
        </>
      )}
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className={`flex items-end justify-between gap-6 border-b ${MZ_RULE} pb-4`}>
      <h2 className={`text-3xl sm:text-4xl text-white ${MZ_SERIF}`}>{title}</h2>
      <span className={`text-lg italic text-neutral-500 ${MZ_DISPLAY}`}>{eyebrow}</span>
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
