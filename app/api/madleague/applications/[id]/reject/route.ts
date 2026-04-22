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

  const { data: memberRow } = await sb.from('members').select('id').eq('auth_id', user.id).maybeSingle();
  if (!memberRow) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 지원서 조회
  const { data: app } = await admin
    .from('mad_applications')
    .select('id, club_id, status')
    .eq('id', id)
    .maybeSingle();
  if (!app) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (app.status !== 'pending') return NextResponse.json({ error: 'ALREADY_PROCESSED' }, { status: 400 });

  // 회장 또는 staff 확인
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
  if (!isPresident && !isStaff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await admin
    .from('mad_applications')
    .update({ status: 'rejected' })
    .eq('id', id);
  if (error) return NextResponse.json({ error: 'UPDATE_FAILED' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
