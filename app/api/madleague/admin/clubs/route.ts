import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const admin = createAdminClient();

async function verifyStaff(token: string) {
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return null;
  const { data: roleRow } = await admin
    .from('member_roles')
    .select('role')
    .eq('member_id', (await admin.from('members').select('id').eq('auth_id', user.id).maybeSingle()).data?.id ?? '')
    .in('role', ['staff', 'manager', 'super_admin'])
    .eq('is_active', true)
    .maybeSingle();
  return roleRow ? user : null;
}

// GET — approved members (for president selector)
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: memberRow } = await admin.from('members').select('id').eq('auth_id', user.id).maybeSingle();
  if (!memberRow) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: roleRow } = await admin
    .from('member_roles')
    .select('role')
    .eq('member_id', memberRow.id)
    .in('role', ['staff', 'manager', 'super_admin'])
    .eq('is_active', true)
    .maybeSingle();
  if (!roleRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // All approved MADLeague members
  const { data: approvedRoles } = await admin
    .from('member_roles')
    .select('member_id')
    .eq('role', 'approved_member')
    .eq('context', 'brand:madleague')
    .eq('is_active', true);

  const memberIds = (approvedRoles ?? []).map((r: { member_id: string }) => r.member_id);

  if (memberIds.length === 0) return NextResponse.json({ members: [] });

  const { data: members } = await admin
    .from('members')
    .select('id, name, email')
    .in('id', memberIds)
    .order('name');

  return NextResponse.json({ members: members ?? [] });
}

// PATCH — set president_member_id on a club
export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: memberRow } = await admin.from('members').select('id').eq('auth_id', user.id).maybeSingle();
  if (!memberRow) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: roleRow } = await admin
    .from('member_roles')
    .select('role')
    .eq('member_id', memberRow.id)
    .in('role', ['staff', 'manager', 'super_admin'])
    .eq('is_active', true)
    .maybeSingle();
  if (!roleRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { clubId, presidentMemberId } = body as { clubId: string; presidentMemberId: string | null };
  if (!clubId) return NextResponse.json({ error: 'MISSING_CLUB_ID' }, { status: 400 });

  const { error } = await admin
    .from('mad_clubs')
    .update({ president_member_id: presidentMemberId ?? null })
    .eq('id', clubId);

  if (error) return NextResponse.json({ error: 'UPDATE_FAILED' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
