import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { acceptMadApplication, getMadAccess, officerClubIds } from '@/lib/madleague-roles';

export const runtime = 'nodejs';

const admin = createAdminClient();

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();

  // 인증 확인
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 현재 사용자의 member_id
  const { data: memberRow } = await sb.from('members').select('id').eq('auth_id', user.id).maybeSingle();
  if (!memberRow) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 지원서 조회 (권한 판단용)
  const { data: app } = await admin
    .from('mad_applications')
    .select('id, club_id, applicant_role')
    .eq('id', id)
    .maybeSingle();
  if (!app) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  const { data: club } = await admin
    .from('mad_clubs')
    .select('president_member_id')
    .eq('id', app.club_id)
    .maybeSingle();
  // 일반 신청 승인·반려 = 이 동아리 운영진 전원 (2026-10-08 사용자 결정) + (옛) 회장
  const access = await getMadAccess(memberRow.id);
  const isClubOfficer = officerClubIds(access).includes(app.club_id) || club?.president_member_id === memberRow.id;
  const isStaff = access.isStaff;

  // 동아리 회장·멘토·기업 신청은 staff만 승인 가능, 일반 신청은 운영진 또는 staff
  const isGeneralApp = (app.applicant_role ?? 'member') === 'member';
  if (!isStaff && !(isGeneralApp && isClubOfficer)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await acceptMadApplication(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
