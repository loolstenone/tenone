import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRoundAccess } from '@/lib/programs/access';
import { MadLoginButton } from '@/features/madleague/MadLoginButton';
import { RoundTabs } from '@/features/programs/RoundTabs';
import { PROGRAM_KIND_LABEL, programTeamsPath } from '@/lib/programs/paths';
import { hasProgramConsent } from '@/lib/programs/consent';
import { officerGroupIds } from '@/lib/programs/brands';
import { ProgramConsent } from '@/features/programs/ProgramConsent';
import { ChevronRight, Calendar, Users } from 'lucide-react';

export const metadata = { title: '회차 공지 · Q&A' };

const STATUS = { upcoming: '모집 예정', ongoing: '진행 중', completed: '종료', cancelled: '취소' } as Record<string, string>;
const ROLE = { staff: '운영진', client: '클라이언트', team: '참여 팀' } as const;
const day = (d: string | null) => d ? new Date(`${d}T00:00:00+09:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : null;

/** 회차 방 — 그 회차 참가자 · 직원 · 클라이언트만 (코어 lib/programs/access) — MADLeague 창구 */
export default async function RoundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
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

  const access = await getRoundAccess(id);
  if (!access) {
    // 운영진(동아리 임원)은 팀 배정 전이어도 팀 구성 화면으로
    const { data: m } = await createAdminClient().from('members').select('id').eq('auth_id', user.id).maybeSingle();
    const { data: r } = await createAdminClient().from('program_rounds').select('id, brand_id, channels, title').eq('id', id).maybeSingle();
    const officer = m && r ? (await officerGroupIds(r.brand_id, m.id)).length > 0 : false;
    return (
      <div className="min-h-[60vh] bg-black text-white">
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <h1 className="text-3xl font-black">이 회차 참여자만 볼 수 있습니다</h1>
          <p className="mt-3 text-sm text-neutral-500">팀 배정은 동아리 운영진이 하거나, 팀장에게 받은 초대 링크로 합류합니다.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {officer && r && <Link href={programTeamsPath(r)} className="inline-block bg-[#EC1D25] px-6 py-3 text-sm font-bold">팀 구성하기</Link>}
            <Link href="/madleague/pt" className="inline-block border border-neutral-700 px-6 py-3 text-sm font-bold">워크스페이스로</Link>
          </div>
        </div>
      </div>
    );
  }

  const db = createAdminClient();
  // 참가자는 주인 브랜드 참가 동의 후 입장 (브리프·공지 포함) — 직원·클라이언트 제외
  if (access.role === 'team' && !(await hasProgramConsent(access.memberId, access.round.brand_id))) {
    const { data: site } = await db.from('ums_sites').select('name').eq('slug', access.round.brand_id).maybeSingle();
    return (
      <div className="min-h-[70vh] bg-black px-4 py-16 text-white sm:px-6">
        <p className="mx-auto mb-6 max-w-xl text-sm text-neutral-400">{access.round.title}</p>
        <ProgramConsent brand={access.round.brand_id} brandName={(site as { name: string } | null)?.name ?? access.round.brand_id} />
      </div>
    );
  }
  const [{ data: comp }, { data: team }] = await Promise.all([
    db.from('program_rounds').select('title, kind, status, year, client_name, brief_title, brief_content, end_date, final_deadline, presentation_date').eq('id', id).single(),
    access.teamId ? db.from('program_teams').select('name, is_finalist').eq('id', access.teamId).single() : Promise.resolve({ data: null }),
  ]);
  if (!comp) return null;
  const dates = [
    ['예선 제출 마감', day(comp.end_date)],
    ['본선 제출 마감', day(comp.final_deadline)],
    ['발표', day(comp.presentation_date)],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500">
            <Link href="/madleague/pt" className="transition hover:text-white">PT WORKSPACE</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#EC1D25]">{PROGRAM_KIND_LABEL[comp.kind] ?? comp.kind}</span>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="bg-[#EC1D25]/20 px-2.5 py-1 text-[#EC1D25]">{STATUS[comp.status] ?? comp.status}</span>
            <span className="bg-white/5 px-2.5 py-1 text-white/60">{ROLE[access.role]}{team ? ` · ${team.name}` : ''}</span>
            {team?.is_finalist && <span className="bg-[#FFC000]/15 px-2.5 py-1 text-[#FFC000]">본선 진출</span>}
            {(access.teamId || access.role === 'staff') && access.round.mode === 'team' && (
              <Link href={programTeamsPath(access.round)} className="inline-flex items-center gap-1 border border-white/15 px-2.5 py-1 text-white/70 hover:text-white">
                <Users className="h-3 w-3" /> {access.role === 'staff' ? '팀 구성' : '팀 관리'}
              </Link>
            )}
          </div>
          <h1 className="text-2xl font-black sm:text-4xl">{comp.title}</h1>
          {comp.client_name && <p className="mt-1 text-sm text-neutral-500">클라이언트 · {comp.client_name}</p>}
          {comp.brief_title && <p className="mt-3 text-sm text-neutral-400">{comp.brief_title}</p>}
          {comp.brief_content && (
            <details className="mt-3 text-sm text-neutral-300">
              <summary className="cursor-pointer text-xs font-bold text-neutral-500">브리프 보기</summary>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{comp.brief_content}</p>
            </details>
          )}
          {dates.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-400">
              {dates.map(([k, v]) => <span key={k} className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#EC1D25]" />{k} {v}</span>)}
            </div>
          )}
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <Suspense fallback={<p className="pt-6 text-sm text-neutral-500">불러오는 중…</p>}>
          <RoundTabs compId={id} role={access.role} teamId={access.teamId} isFinalist={!!team?.is_finalist} kind={comp.kind} finalDeadline={day(comp.final_deadline)} />
        </Suspense>
      </div>
    </div>
  );
}
