import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { fetchMadClubs } from '@/lib/supabase/madleague';

export const revalidate = 300;

export const metadata = {
  title: '아카이브',
  description: '2023년부터 현재까지 MADLeague의 모든 활동·작품',
};

const TYPE_LABELS: Record<string, string> = {
  competition: '경쟁PT',
  project: 'PJT',
  markethon: '마케톤',
  insight_touring: '인사이트 투어링',
  im: '아이디어 무브먼트',
  dam: 'DAM 파티',
};

interface PageProps {
  searchParams: Promise<{ year?: string; club?: string; type?: string; awarded?: string }>;
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const { year, club, type, awarded } = await searchParams;
  const sb = await createClient();
  const clubs = await fetchMadClubs();

  let q = sb.from('mad_archive').select('*').order('year', { ascending: false });
  if (year) q = q.eq('year', Number(year));
  if (type) q = q.eq('type', type);
  if (awarded === '1') q = q.not('award', 'is', null);
  if (club) {
    const target = clubs.find((c) => c.slug === club);
    if (target) q = q.eq('club_id', target.id);
  }
  const { data } = await q;
  const items = (data ?? []) as Array<{
    id: string; title: string; description: string | null; type: string;
    club_id: string | null; year: number; thumbnail_url: string | null;
    award: string | null; tags: string[] | null; is_featured: boolean;
  }>;
  const clubById = new Map(clubs.map((c) => [c.id, c]));

  const { data: allYears } = await sb.from('mad_archive').select('year');
  const yearOptions = Array.from(new Set((allYears ?? []).map((r: { year: number }) => r.year))).sort((a, b) => b - a);

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">ARCHIVE</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">모든 기록</h1>
          <p className="mt-6 max-w-xl text-neutral-400 leading-relaxed">
            2023년부터 지금까지, MADLeague가 만들어낸 모든 것. 경쟁PT 수상작부터 프로그램 활동까지.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6 py-8 border-b border-neutral-900">
        <div className="flex flex-wrap gap-2">
          <FilterChip href={buildQS({})} active={!year && !type && !club && !awarded}>전체</FilterChip>
          {yearOptions.map((y) => (
            <FilterChip key={y} href={buildQS({ year: String(y), club, type, awarded })} active={year === String(y)}>
              {y}
            </FilterChip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <FilterChip key={k} href={buildQS({ type: k, year, club, awarded })} active={type === k}>
              {v}
            </FilterChip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {clubs.map((c) => (
            <FilterChip key={c.slug} href={buildQS({ club: c.slug, year, type, awarded })} active={club === c.slug} color={c.color ?? undefined}>
              {c.name}
            </FilterChip>
          ))}
          <div className="w-px bg-neutral-800 mx-2" />
          <FilterChip href={buildQS({ awarded: awarded === '1' ? undefined : '1', year, type, club })} active={awarded === '1'} gold>
            ♛ 수상작만
          </FilterChip>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 text-sm text-neutral-500">{items.length}개 기록</div>
        {items.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">조건에 맞는 기록이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const itemClub = item.club_id ? clubById.get(item.club_id) : null;
              return (
                <Link key={item.id} href={`/madleague/archive/${item.id}`} className="group bg-neutral-950 border border-neutral-900 hover:border-[#EC1D25] transition overflow-hidden">
                  <div className="aspect-[4/3] bg-neutral-900 relative">
                    {item.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-600 text-xs tracking-widest">
                        {(TYPE_LABELS[item.type] ?? item.type).toUpperCase()}
                      </div>
                    )}
                    {item.award && (
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-[#FFC000] text-black text-xs font-black px-2 py-1">
                        <Trophy className="h-3 w-3" /> {item.award}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-wider">
                      <span>{TYPE_LABELS[item.type] ?? item.type}</span>
                      <span>·</span>
                      <span>{item.year}</span>
                      {itemClub && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: itemClub.color ?? '#EC1D25' }} />
                            {itemClub.name}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 font-bold text-white line-clamp-2">{item.title}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterChip({ href, active, children, color, gold }: { href: string; active?: boolean; children: React.ReactNode; color?: string; gold?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 border transition ${
        active
          ? gold ? 'bg-[#FFC000] border-[#FFC000] text-black' : 'bg-[#EC1D25] border-[#EC1D25] text-white'
          : 'bg-black border-neutral-800 text-neutral-400 hover:border-white hover:text-white'
      }`}
    >
      {color && <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </Link>
  );
}

function buildQS(p: { year?: string; club?: string; type?: string; awarded?: string }) {
  const qs = new URLSearchParams();
  (Object.entries(p) as Array<[string, string | undefined]>).forEach(([k, v]) => { if (v) qs.set(k, v); });
  const s = qs.toString();
  return s ? `/madleague/archive?${s}` : '/madleague/archive';
}
