import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client (서버 전용) — admin API는 RLS 우회
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Intra 관리자 인증 가드.
 * Bearer 토큰으로 user를 확인하고, `members` 테이블에 해당 user가 존재하는지 체크한다.
 * (Intra 레이아웃과 동일한 권한 레벨 — 스태프 전원이 MADLeague 운영 가능)
 */
export async function requireIntraAdmin(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = authHeader.replace(/^Bearer\s+/i, '');

  const sb = getAdminClient();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await sb.from('members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return { userId: user.id };
}
