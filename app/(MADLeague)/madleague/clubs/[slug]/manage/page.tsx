import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

  // 권한 확인: 회장 본인 / staff(super_admin 포함) / mentor
  const [staffRes, mentorRes] = await Promise.all([
    admin.from('member_roles').select('role')
      .eq('member_id', memberRow.id)
      .in('role', ['staff', 'manager', 'super_admin'])
      .eq('is_active', true)
      .maybeSingle(),
    admin.from('member_roles').select('role')
      .eq('member_id', memberRow.id)
      .eq('role', 'mentor')
      .eq('context', 'brand:madleague')
      .eq('is_active', true)
      .maybeSingle(),
  ]);

  const isPresident = club.president_member_id === memberRow.id;
  const isStaff = !!staffRes.data;
  const isMentor = !!mentorRes.data;

  if (!isPresident && !isStaff && !isMentor) {
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
          <p className="mt-1 text-sm text-neutral-400">회장만 접근 가능. 지원서를 승인하면 매드리거 커뮤니티 이용 권한이 부여됩니다.</p>
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
