import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  competition: '경쟁PT',
  project: 'PJT',
  markethon: '마케톤',
  insight_touring: '인사이트 투어링',
  im: '아이디어 무브먼트',
  dam: 'DAM 파티',
};

export default async function ArchiveDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data } = await sb.from('mad_archive').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const item = data as {
    id: string; title: string; description: string | null; type: string;
    club_id: string | null; competition_id: string | null; year: number;
    thumbnail_url: string | null; award: string | null; tags: string[] | null;
  };
  const [clubRes, compRes] = await Promise.all([
    item.club_id ? sb.from('mad_clubs').select('slug, name, color').eq('id', item.club_id).maybeSingle() : Promise.resolve({ data: null }),
    item.competition_id ? sb.from('mad_competitions').select('slug, title, client_name, year').eq('id', item.competition_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const club = clubRes.data as { slug: string; name: string; color: string | null } | null;
  const comp = compRes.data as { slug: string; title: string; client_name: string | null; year: number } | null;

  return (
    <div className="bg-[var(--mad-black,#000)] text-white min-h-screen">
      <div className="mx-auto max-w-5xl px-6 pt-8">
        <Link href="/madleague/archive" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" /> 아카이브
        </Link>
      </div>

      <header className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-neutral-500">
          <span>{TYPE_LABELS[item.type] ?? item.type}</span>
          <span>·</span>
          <span>{item.year}</span>
          {club && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-white">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: club.color ?? '#EC1D25' }} />
                {club.name}
              </span>
            </>
          )}
        </div>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-tight">{item.title}</h1>
        {item.award && (
          <div className="mt-4 inline-flex items-center gap-2 bg-[#FFC000] text-black text-sm font-black px-3 py-1.5">
            <Trophy className="h-4 w-4" /> {item.award}
          </div>
        )}
        {item.description && <p className="mt-6 text-lg text-neutral-300 leading-relaxed">{item.description}</p>}
      </header>

      {item.thumbnail_url && (
        <div className="mx-auto max-w-6xl px-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-auto" />
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        {comp && (
          <div className="bg-neutral-950 border border-neutral-900 p-6">
            <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-2">COMPETITION</div>
            <div className="text-xl font-black">{comp.client_name ?? comp.title}</div>
            <div className="mt-1 text-sm text-neutral-400">{comp.year} · {comp.title}</div>
            <Link
              href={`/madleague/programs/competition?year=${comp.year}`}
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#EC1D25] hover:underline"
            >
              경쟁PT 상세 →
            </Link>
          </div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs font-bold text-neutral-400 bg-neutral-900 px-3 py-1">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
