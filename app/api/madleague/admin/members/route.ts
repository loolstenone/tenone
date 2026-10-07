import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * GET /api/madleague/admin/members — 인트라 MADLeague 회원 관리
 * 회원 = member_capability_roles(brand_id='madleague') 활동 역할 보유자 (§1.3.1). 계정 정보는 members, MADLeague 고유 정보는 mad_members.
 * member_capability_roles는 본인 조회 RLS만 있어 직원 화면은 이 API(service_role)로 읽는다.
 * ?history=1 이면 종료된 역할(valid_until 있음)도 포함
 */
export async function GET(req: NextRequest) {
  const auth = await requireStaff(req);
  if (auth instanceof NextResponse) return auth;

  const admin = createAdminClient();
  const withHistory = req.nextUrl.searchParams.get('history') === '1';

  let q = admin
    .from('member_capability_roles')
    .select('member_id, capability_key, role, context, valid_from, valid_until')
    .eq('brand_id', 'madleague')
    .order('valid_from', { ascending: false });
  if (!withHistory) q = q.is('valid_until', null);
  const { data: roles, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const memberIds = Array.from(new Set((roles ?? []).map(r => r.member_id as string)));
  const clubIds = Array.from(new Set((roles ?? []).map(r => (r.context as { club_id?: string } | null)?.club_id).filter((v): v is string => !!v)));

  const [membersRes, madRes, clubsRes] = await Promise.all([
    memberIds.length ? admin.from('members').select('id, name, email, avatar_url').in('id', memberIds) : Promise.resolve({ data: [] }),
    memberIds.length ? admin.from('mad_members').select('member_id, university, major, portfolio_public, joined_at').in('member_id', memberIds) : Promise.resolve({ data: [] }),
    clubIds.length ? admin.from('mad_clubs').select('id, name, color').in('id', clubIds) : Promise.resolve({ data: [] }),
  ]);

  const members = new Map(((membersRes.data ?? []) as { id: string; name: string | null; email: string | null; avatar_url: string | null }[]).map(m => [m.id, m]));
  const mad = new Map(((madRes.data ?? []) as { member_id: string; university: string | null; major: string | null; portfolio_public: boolean | null; joined_at: string | null }[]).map(m => [m.member_id, m]));
  const clubs = new Map(((clubsRes.data ?? []) as { id: string; name: string; color: string | null }[]).map(c => [c.id, c]));

  const byMember = new Map<string, {
    member_id: string; name: string | null; email: string | null; avatar_url: string | null;
    university: string | null; major: string | null; portfolio_public: boolean;
    roles: { capability_key: string; role: string; club: { id: string; name: string; color: string | null } | null; year: number | null; position: string | null; company: string | null; valid_from: string; valid_until: string | null }[];
  }>();
  for (const r of roles ?? []) {
    const id = r.member_id as string;
    const m = members.get(id);
    const madRow = mad.get(id);
    if (!byMember.has(id)) {
      byMember.set(id, {
        member_id: id, name: m?.name ?? null, email: m?.email ?? null, avatar_url: m?.avatar_url ?? null,
        university: madRow?.university ?? null, major: madRow?.major ?? null, portfolio_public: !!madRow?.portfolio_public,
        roles: [],
      });
    }
    const ctx = (r.context ?? {}) as { club_id?: string; year?: number; position?: string; company?: string };
    byMember.get(id)!.roles.push({
      capability_key: r.capability_key as string,
      role: r.role as string,
      club: ctx.club_id ? clubs.get(ctx.club_id) ?? null : null,
      year: typeof ctx.year === 'number' ? ctx.year : null,
      position: ctx.position ?? null,
      company: ctx.company ?? null,
      valid_from: r.valid_from as string,
      valid_until: (r.valid_until as string | null) ?? null,
    });
  }

  return NextResponse.json({ members: Array.from(byMember.values()) });
}
