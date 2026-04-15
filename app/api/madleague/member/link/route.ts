import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

/**
 * 로그인한 사용자의 이메일로 mad_members 레코드를 찾아 user_id를 연결한다.
 * Apply → 관리자 승인 → mad_members 자동생성 → (사용자 가입·로그인) → 본 API로 연결
 */
export async function POST() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // 이미 연결된 경우 해당 멤버 반환
  const { data: existing } = await admin.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, memberId: existing.id, linked: true });
  }

  // 이메일로 미연결 멤버 찾기
  const { data: match } = await admin
    .from('mad_members')
    .select('id')
    .eq('email', user.email)
    .is('user_id', null)
    .maybeSingle();

  if (!match) {
    return NextResponse.json({ ok: false, reason: 'NO_MATCH' });
  }

  const { error } = await admin
    .from('mad_members')
    .update({ user_id: user.id })
    .eq('id', match.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, memberId: match.id, linked: false });
}
