import { NextRequest, NextResponse } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * 동아리 회장 마이페이지 — 내 동아리 대기 중 일반 지원서
 * 회장 = mad_clubs.president_member_id (approve/reject API와 같은 기준).
 * mad_applications는 RLS로 본인·직원만 조회 가능하므로 서버에서 회장 확인 후 필요한 필드만 반환
 */
export async function GET(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;

  const admin = createAdminClient();
  const { data: clubs } = await admin
    .from('mad_clubs')
    .select('id')
    .eq('president_member_id', auth.memberId);
  const clubIds = (clubs ?? []).map((c: { id: string }) => c.id);
  if (clubIds.length === 0) return NextResponse.json({ isPresident: false, applications: [] });

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
  return NextResponse.json({ isPresident: true, applications: data ?? [] });
}
