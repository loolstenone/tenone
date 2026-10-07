import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRound } from '@/lib/programs/access';
import { programRoomPath } from '@/lib/programs/paths';
import { MadLoginButton } from '@/features/madleague/MadLoginButton';
import { TeamBuilder } from '@/features/programs/TeamBuilder';
import { ChevronRight } from 'lucide-react';

export const metadata = { title: '팀 구성' };

/** 팀 구성·관리 — 운영진(직원·동아리 운영진)은 팀 꾸리기, 팀장은 팀명·초대 링크 (권한은 API가 판단) */
export default async function RoundTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const round = await getRound(id);
  if (!round) return null;
  if (!user) {
    return (
      <div className="min-h-[60vh] bg-black text-white">
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <h1 className="text-3xl font-black">로그인이 필요합니다</h1>
          <MadLoginButton className="mt-8 inline-block bg-[#EC1D25] px-8 py-4 font-bold text-white">로그인</MadLoginButton>
        </div>
      </div>
    );
  }
  const { data: site } = await createAdminClient().from('ums_sites').select('name').eq('slug', round.brand_id).maybeSingle();

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500">
            <Link href="/madleague/pt" className="transition hover:text-white">PT WORKSPACE</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={programRoomPath(round)} className="transition hover:text-white">회차 방</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#EC1D25]">팀 구성</span>
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">{round.title}</h1>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <TeamBuilder roundId={id} brandName={(site as { name: string } | null)?.name ?? round.brand_id} />
      </div>
    </div>
  );
}
