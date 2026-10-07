import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMadAccess } from '@/lib/madleague-roles';
import { CommunityFeed } from './CommunityFeed';
import { MadLoginButton } from '@/features/madleague/MadLoginButton';

export const metadata = { title: '자유 게시판', description: '매드리거 자유 게시판 — 동아리 구분 없이 전체 매드리거가 소통하는 공간' };

interface PageProps {
  searchParams: Promise<{ category?: string }>;
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
  const { category = 'all' } = await searchParams;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MADLEAGUER · 게시판</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black">매드리거만 접근 가능합니다</h1>
          <p className="mt-6 text-neutral-400">로그인 후 매드리거 연동을 완료하면 커뮤니티에 참여할 수 있습니다.</p>
          <MadLoginButton className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">로그인</MadLoginButton>
        </div>
      </div>
    );
  }

  // members 테이블에서 member_id 조회 → 활동 역할 확인
  const { data: memberRow } = await sb.from('members').select('id').eq('auth_id', user.id).maybeSingle();
  if (!memberRow) redirect('/madleague/apply');

  // 매드리거(club·showcase 활동 역할) 또는 직원만 — member_capability_roles SSOT
  const access = await getMadAccess(memberRow.id);
  if (!access.canEnter) redirect('/madleague/apply');

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MADLEAGUER · 게시판</div>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">자유 게시판</h1>
          <p className="mt-4 text-sm text-neutral-400">동아리 구분 없이 전체 매드리거가 소통하는 공간. 글은 승인된 매드리거만 볼 수 있습니다.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-6 border-b border-neutral-900">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={buildQS({ category: cat.slug === 'all' ? undefined : cat.slug })}
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
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <CommunityFeed initialCategory={category} />
      </section>
    </div>
  );
}

function buildQS(p: { category?: string }) {
  const qs = new URLSearchParams();
  if (p.category) qs.set('category', p.category);
  const s = qs.toString();
  return s ? `/madleague/community?${s}` : '/madleague/community';
}
