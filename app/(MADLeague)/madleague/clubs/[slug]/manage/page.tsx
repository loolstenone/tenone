import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canEditClubProfile, canViewClubApplications, getMadAccess } from '@/lib/madleague-roles';
import { ManagePanel } from './ManagePanel';
import { ClubOfficersEditor } from '@/components/madleague/ClubOfficersEditor';
import { ClubProfileEditor } from '@/components/madleague/ClubProfileEditor';
import { ClubRecruitResponses } from '@/components/madleague/ClubRecruitResponses';
import { clubRecruitProgram } from '@/lib/madleague-recruit';

/* 동아리 관리 — 상단 탭으로 구분 (2026-10-11): 소개 페이지 · 부원 모집 · 운영진 · 매드리거 등록. 탭 = ?tab= (링크 공유 가능) */
type TabKey = 'profile' | 'recruit' | 'officers' | 'applications';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ClubManagePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;
  const sb = await createClient();
  const admin = createAdminClient();

  // 인증 확인
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect(`/madleague/clubs/${slug}`);

  // 현재 사용자의 member_id 조회 (admin 클라이언트로 RLS 우회)
  const { data: memberRow } = await admin.from('members').select('id, name').eq('auth_id', user.id).maybeSingle();
  if (!memberRow) redirect(`/madleague/clubs/${slug}`);

  // 동아리 조회 (president_member_id 포함)
  const { data: club } = await admin
    .from('mad_clubs')
    .select('id, slug, name, region, color, president_member_id')
    .eq('slug', slug)
    .maybeSingle();
  if (!club) notFound();

  // 권한 확인: 지원서 = 직원 / 이 동아리 운영진 / 담당 멘토 (소속 인증, 개인정보라 동아리 범위로 제한)
  //           소개 페이지 = 직원 / 이 동아리 운영진 (멘토 제외)
  const access = await getMadAccess(memberRow.id);
  const canApplications = canViewClubApplications(access, memberRow.id, club);
  const canProfile = canEditClubProfile(access, memberRow.id, club);
  if (!canApplications && !canProfile) {
    redirect(`/madleague/clubs/${slug}`);
  }

  // 볼 수 있는 탭 (멘토는 매드리거 등록만)
  const tabs: { key: TabKey; label: string }[] = [
    ...(canProfile ? [
      { key: 'profile' as const, label: '소개 페이지' },
      { key: 'recruit' as const, label: '부원 모집' },
      { key: 'officers' as const, label: '운영진' },
    ] : []),
    ...(canApplications ? [{ key: 'applications' as const, label: '매드리거 등록' }] : []),
  ];
  const tab: TabKey = tabs.find(t => t.key === tabParam)?.key ?? tabs[0].key;

  // 탭 배지 — 처리 대기 수 (count만)
  const [appPending, recruitPending] = await Promise.all([
    canApplications
      ? admin.from('mad_applications').select('id', { count: 'exact', head: true }).eq('club_id', club.id).eq('status', 'pending').then(r => r.count ?? 0)
      : Promise.resolve(0),
    canProfile
      ? admin.from('forms').select('id').eq('brand_id', 'madleague').eq('program', clubRecruitProgram(club.slug)).then(async ({ data }) => {
          const ids = (data ?? []).map(f => f.id);
          if (!ids.length) return 0;
          const { count } = await admin.from('form_responses').select('id', { count: 'exact', head: true }).in('form_id', ids).eq('status', 'pending');
          return count ?? 0;
        })
      : Promise.resolve(0),
  ]);
  const badge: Partial<Record<TabKey, number>> = { applications: appPending, recruit: recruitPending };

  // 매드리거 등록 지원서 — 그 탭일 때만 조회
  const { data: applications } = canApplications && tab === 'applications'
    ? await admin
      .from('mad_applications')
      .select('id, name, email, phone, university, major, minor, cohort, activity_year, interested_industry, interested_job, motivation, portfolio_url, status, created_at')
      .eq('club_id', club.id)
      .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-[#EC1D25]">CLUB MANAGE</p>
          <h1 className="mt-2 text-3xl font-black">{club.name} 동아리 관리</h1>
          <p className="mt-1 text-sm text-neutral-400">이 동아리 운영진·담당 멘토와 MADLeague 운영진만 볼 수 있습니다.</p>
        </div>

        {/* 탭 */}
        <nav className="mb-10 flex gap-1 overflow-x-auto border-b border-neutral-800" aria-label="동아리 관리 메뉴">
          {tabs.map(t => (
            <Link key={t.key} href={`/madleague/clubs/${club.slug}/manage?tab=${t.key}`} scroll={false}
              aria-current={tab === t.key ? 'page' : undefined}
              className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition ${tab === t.key ? 'border-[#EC1D25] text-white' : 'border-transparent text-neutral-500 hover:text-neutral-200'}`}>
              {t.label}
              {(badge[t.key] ?? 0) > 0 && <span className="bg-[#EC1D25] px-1.5 text-[11px] text-white tabular-nums">{badge[t.key]}</span>}
            </Link>
          ))}
        </nav>

        {tab === 'profile' && <ClubProfileEditor slug={club.slug} />}

        {tab === 'recruit' && <ClubRecruitResponses slug={club.slug} />}

        {/* 운영진 — 회장·부회장이 다음 임기 운영진 지정 */}
        {tab === 'officers' && <ClubOfficersEditor slug={club.slug} />}

        {tab === 'applications' && (
          <>
            <p className="mb-4 text-sm text-neutral-400">운영진 누구나 승인·반려할 수 있습니다. 승인하면 소속이 인증되고 매드리거 공간 이용 권한이 부여됩니다.</p>
            <ManagePanel
              clubId={club.id}
              clubSlug={club.slug}
              applications={applications ?? []}
              accentColor={club.color ?? '#EC1D25'}
            />
          </>
        )}
      </div>
    </div>
  );
}
