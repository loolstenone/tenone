import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/api-guard';

const supabase = createAdminClient();

// 관리자 = 직원(member_roles) — badak_members.role은 본인이 수정 가능한 컬럼이라 권한 판단에 쓰지 않는다 (2026-10-11 레드팀)
async function requireAdmin(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const auth = await requireStaff(request);
  if (auth instanceof NextResponse) return auth;
  return { userId: 'user' in auth ? auth.user.id : 'internal' };
}

// GET: 전체 신청 목록 (관리자 전용)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '100');

  let query = supabase
    .from('badak_leader_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ applications: data || [] });
}
