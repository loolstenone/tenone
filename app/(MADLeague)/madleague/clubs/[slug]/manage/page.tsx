import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canViewClubApplications, getMadAccess } from '@/lib/madleague-roles';
import { ManagePanel } from './ManagePanel';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClubManagePage({ params }: PageProps) {
  const { slug } = await params;
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

  // 권한 확인: 직원 / 이 동아리 회장 / 이 동아리 담당 멘토 (지원서 = 소속 인증, 개인정보라 동아리 범위로 제한)
  const access = await getMadAccess(memberRow.id);
  if (!canViewClubApplications(access, memberRow.id, club)) {
    redirect(`/madleague/clubs/${slug}`);
  }

  // 대기 중 + 완료 지원서 조회
  const { data: applications } = await admin
    .from('mad_applications')
    .select('id, name, email, phone, university, major, minor, cohort, activity_year, interested_industry, interested_job, motivation, portfolio_url, status, created_at')
    .eq('club_id', club.id)
    .order('created_at', { ascending: false });

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-[#EC1D25]">CLUB MANAGE</p>
          <h1 className="mt-2 text-3xl font-black">{club.name} 지원서 관리</h1>
          <p className="mt-1 text-sm text-neutral-400">이 동아리 회장·담당 멘토·운영진만 볼 수 있습니다. 승인(회장·운영진)하면 소속이 인증되고 매드리거 공간 이용 권한이 부여됩니다.</p>
        </div>

        <ManagePanel
          clubId={club.id}
          clubSlug={club.slug}
          applications={applications ?? []}
          accentColor={club.color ?? '#EC1D25'}
        />
      </div>
    </div>
  );
}
