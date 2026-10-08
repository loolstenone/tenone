import { NextRequest, NextResponse } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMadAccess, officerClubIds } from '@/lib/madleague-roles';

export const runtime = 'nodejs';

/**
 * 동아리 운영진 마이페이지 — 내 동아리 대기 중 일반 지원서
 * 운영진 = (club, 임원, context.club_id) 활동 역할 + (옛) mad_clubs.president_member_id — approve/reject API와 같은 기준.
 * mad_applications는 RLS로 본인·직원만 조회 가능하므로 서버에서 회장 확인 후 필요한 필드만 반환
 * manageClubs = 마이페이지 "내 동아리 관리" 바로가기 (운영진·(옛) 회장·담당 멘토 → /madleague/clubs/{slug}/manage)
 */
export async function GET(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;

  const admin = createAdminClient();
  // 운영진인 동아리 (운영진 전원이 승인 가능, 2026-10-08) + (옛) 회장 동아리
  const [{ data: clubs }, access] = await Promise.all([
    admin.from('mad_clubs').select('id').eq('president_member_id', auth.memberId),
    getMadAccess(auth.memberId),
  ]);
  const clubIds = [...new Set([...(clubs ?? []).map((c: { id: string }) => c.id), ...officerClubIds(access)])];
  const manageIds = [...new Set([...clubIds, ...access.mentorClubIds])];
  const { data: manageRows } = manageIds.length
    ? await admin.from('mad_clubs').select('slug, name').in('id', manageIds).order('name')
    : { data: [] };
  const manageClubs = (manageRows ?? []) as { slug: string; name: string }[];
  if (clubIds.length === 0) return NextResponse.json({ isPresident: false, applications: [], manageClubs });

  const { data, error } = await admin
    .from('mad_applications')
    .select('id, name, university, created_at')
    .in('club_id', clubIds)
    .eq('status', 'pending')
    .eq('applicant_role', 'member')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[madleague/applications/president]', error.message);
    return NextResponse.json({ error: 'QUERY_FAILED' }, { status: 500 });
  }
  return NextResponse.json({ isPresident: true, applications: data ?? [], manageClubs });
}
