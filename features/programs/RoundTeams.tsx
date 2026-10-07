/** 팀 구성·관리 화면 (서버 컴포넌트) — 창구 사이트 공용. 권한은 API(/api/programs/rounds/{id}/teams)가 판단 */
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRound } from '@/lib/programs/access';
import { TeamBuilder } from '@/features/programs/TeamBuilder';
import { ProgramLoginButton } from '@/features/programs/ProgramLoginButton';
import type { ProgramTheme } from '@/features/programs/ProgramTheme';
import { ChevronRight } from 'lucide-react';

export async function RoundTeams({ id, theme }: { id: string; theme: ProgramTheme }) {
  const round = await getRound(id);
  if (!round) return null;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const style = { '--pa': theme.accent } as CSSProperties;
  if (!user) {
    return (
      <div className="min-h-[60vh] bg-black text-white" style={style}>
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <h1 className="text-3xl font-black">로그인이 필요합니다</h1>
          <ProgramLoginButton accentColor={theme.accent} className="mt-8 inline-block px-8 py-4 font-bold text-white">로그인</ProgramLoginButton>
        </div>
      </div>
    );
  }
  const { data: site } = await createAdminClient().from('ums_sites').select('name').eq('slug', round.brand_id).maybeSingle();
  return (
    <div className="min-h-screen bg-black text-white" style={style}>
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500">
            <Link href={theme.listHref} className="transition hover:text-white">{theme.listLabel}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`${theme.roomBase}/${id}`} className="transition hover:text-white">회차 방</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[var(--pa)]">팀 구성</span>
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
