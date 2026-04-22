import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

  // 지원서 조회
  const { data: app } = await admin
    .from('mad_applications')
    .select('id, club_id, email, status, name, university, phone, major, activity_year, cohort, applicant_role')
    .eq('id', id)
    .maybeSingle();
  if (!app) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (app.status !== 'pending') return NextResponse.json({ error: 'ALREADY_PROCESSED' }, { status: 400 });

  const isClubLeaderApp = app.applicant_role === 'club_leader';
  const isMentorApp = app.applicant_role === 'mentor';
  const isCorporateApp = app.applicant_role === 'corporate';

  // 권한 확인
  const { data: club } = await admin
    .from('mad_clubs')
    .select('president_member_id')
    .eq('id', app.club_id)
    .maybeSingle();

  const { data: roleRow } = await sb
    .from('member_roles')
    .select('role')
    .eq('member_id', memberRow.id)
    .in('role', ['staff', 'manager', 'super_admin'])
    .eq('is_active', true)
    .maybeSingle();

  const isPresident = club?.president_member_id === memberRow.id;
  const isStaff = !!roleRow;

  // 동아리 회장·멘토·기업 신청은 staff만 승인 가능, 일반 신청은 회장 또는 staff
  if ((isClubLeaderApp || isMentorApp || isCorporateApp) && !isStaff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!isClubLeaderApp && !isMentorApp && !isCorporateApp && !isPresident && !isStaff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 지원자의 member_id 조회 (이메일로)
  const { data: applicantMember } = await admin
    .from('members')
    .select('id, auth_id')
    .eq('email', app.email)
    .maybeSingle();

  // 상태 변경
  const { error: updateErr } = await admin
    .from('mad_applications')
    .update({ status: 'approved' })
    .eq('id', id);
  if (updateErr) return NextResponse.json({ error: 'UPDATE_FAILED' }, { status: 500 });

  if (applicantMember) {
    const madRole = isClubLeaderApp ? 'club_leader' : isMentorApp ? 'mentor' : isCorporateApp ? 'corporate' : 'member';
    const memberRoleValue = isClubLeaderApp ? 'leader' : isMentorApp ? 'mentor' : isCorporateApp ? 'corporate' : 'approved_member';

    // mad_members INSERT
    const { data: existingMadMember } = await admin
      .from('mad_members')
      .select('id')
      .eq('user_id', applicantMember.auth_id)
      .maybeSingle();

    if (!existingMadMember) {
      await admin.from('mad_members').insert({
        user_id: applicantMember.auth_id,
        club_id: app.club_id,
        name: app.name,
        email: app.email,
        phone: app.phone ?? null,
        university: app.university ?? null,
        major: app.major ?? null,
        role: madRole,
        activity_years: app.activity_year ? [app.activity_year] : [],
        source_application_id: app.id,
      });
    }

    // member_roles INSERT
    const { data: existingRole } = await admin
      .from('member_roles')
      .select('id')
      .eq('member_id', applicantMember.id)
      .eq('role', memberRoleValue)
      .eq('context', 'brand:madleague')
      .eq('is_active', true)
      .maybeSingle();

    if (!existingRole) {
      await admin.from('member_roles').insert({
        member_id: applicantMember.id,
        role: memberRoleValue,
        context: 'brand:madleague',
        is_active: true,
      });
    }

    // 동아리 회장 신청이면 mad_clubs.president_member_id 설정
    if (isClubLeaderApp) {
      await admin
        .from('mad_clubs')
        .update({ president_member_id: applicantMember.id })
        .eq('id', app.club_id);
    }
  }

  return NextResponse.json({ ok: true });
}
