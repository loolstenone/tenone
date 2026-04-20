import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

// GET /api/badak/members/me — 현재 로그인 사용자의 바닥 멤버 프로필
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ member: null });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ member: null });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id, display_name, job_function, industry, interest_tags, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({ member: member ?? null });
}
