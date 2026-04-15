import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchMadClubs } from '@/lib/supabase/madleague';
import { CommunityFeed } from './CommunityFeed';

export const metadata = { title: '커뮤니티', description: '매드리거 커뮤니티' };

interface PageProps {
  searchParams: Promise<{ category?: string; club?: string }>;
}

const CATEGORIES = [
  { slug: 'all',     label: '전체' },
  { slug: 'free',    label: '자유' },
  { slug: 'question', label: '질문' },
  { slug: 'share',   label: '공유' },
  { slug: 'insight', label: '인사이트' },
  { slug: 'pinboard', label: '핀보드' },
  { slug: 'notice',  label: '공지' },
];

export default async function CommunityPage({ searchParams }: PageProps) {
  const { category = 'all', club } = await searchParams;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">COMMUNITY</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black">매드리거만 접근 가능합니다</h1>
          <p className="mt-6 text-neutral-400">로그인 후 매드리거 연동을 완료하면 커뮤니티에 참여할 수 있습니다.</p>
          <Link href="/login?redirect=/madleague/community" className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">로그인</Link>
        </div>
      </div>
    );
  }

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) redirect('/madleague/member');

  const clubs = await fetchMadClubs();

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">COMMUNITY</div>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">매드리거 커뮤니티</h1>
          <p className="mt-4 text-sm text-neutral-400">매드리거 간 자유 소통 공간. 글은 승인된 매드리거만 볼 수 있습니다.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-6 border-b border-neutral-900">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={buildQS({ category: cat.slug === 'all' ? undefined : cat.slug, club })}
              className={`text-xs font-bold px-3 py-2 border transition ${
                category === cat.slug
                  ? 'bg-[#EC1D25] border-[#EC1D25] text-white'
                  : 'bg-black border-neutral-800 text-neutral-400 hover:border-white hover:text-white'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={buildQS({ category: category === 'all' ? undefined : category })}
            className={`text-xs font-bold px-3 py-2 border transition ${
              !club ? 'bg-white border-white text-black' : 'bg-black border-neutral-800 text-neutral-400 hover:border-white'
            }`}
          >
            전 동아리
          </Link>
          {clubs.map((c) => (
            <Link
              key={c.slug}
              href={buildQS({ category: category === 'all' ? undefined : category, club: c.slug })}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 border transition ${
                club === c.slug ? 'bg-white border-white text-black' : 'bg-black border-neutral-800 text-neutral-400 hover:border-white'
              }`}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c.color ?? '#EC1D25' }} />
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <CommunityFeed initialCategory={category} initialClub={club} clubs={clubs} />
      </section>
    </div>
  );
}

function buildQS(p: { category?: string; club?: string }) {
  const qs = new URLSearchParams();
  if (p.category) qs.set('category', p.category);
  if (p.club) qs.set('club', p.club);
  const s = qs.toString();
  return s ? `/madleague/community?${s}` : '/madleague/community';
}
