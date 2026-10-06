import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireStaff } from '@/lib/api-guard';

// Service role client (서버 전용) — admin API는 RLS 우회
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Intra 관리자 인증 가드 — 직원(member_roles staff 계열 / @tenone.biz) 또는 내부 호출만 허용.
 * (이전: members row 존재만 확인 → 일반 회원도 통과하던 문제 수정)
 */
export async function requireIntraAdmin(req: NextRequest): Promise<{ userId: string | null } | NextResponse> {
  const auth = await requireStaff(req);
  if (auth instanceof NextResponse) return auth;
  return { userId: auth.kind === 'user' ? auth.user.id : null };
}
