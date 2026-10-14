import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getApiUser } from '@/lib/api-guard';

/**
 * POST /api/auth/cancel-signup — 소셜 첫 로그인 후 회원가입 화면에서 '가입하지 않기'
 *
 * Supabase는 Google·Kakao 확인만으로 계정(이메일·이름)을 먼저 만든다. 동의하지 않았으면 그 계정을 남기지 않는다 (개인정보보호법 제15·21조).
 * CLAUDE.md '절대 하지 말 것 › auth.users 삭제 금지'의 예외 (2026-10-15 사용자 승인) — 조건을 모두 만족할 때만:
 *   ① 본인 세션의 계정 ② 회원 정보(members) 없음 ③ 동의 기록 없음(user_metadata.consent 없음)
 * 회원 정보가 있으면 탈퇴 절차(/api/account/delete)를 따른다
 */
export async function POST(req: NextRequest) {
    const u = await getApiUser(req);
    if (!u) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    if (u.memberId) return NextResponse.json({ error: 'ALREADY_MEMBER' }, { status: 409 });

    const admin = createAdminClient();
    // 세션 정보만 믿지 않고 DB에서 다시 확인
    const { data: member, error: lookupError } = await admin.from('members').select('id').eq('auth_id', u.user.id).maybeSingle();
    if (lookupError) return NextResponse.json({ error: 'LOOKUP_FAILED' }, { status: 500 });
    if (member) return NextResponse.json({ error: 'ALREADY_MEMBER' }, { status: 409 });
    if ((u.user.user_metadata as Record<string, unknown> | undefined)?.consent) {
        return NextResponse.json({ error: 'HAS_CONSENT' }, { status: 409 });
    }

    const { error } = await admin.auth.admin.deleteUser(u.user.id);
    if (error) {
        console.error('[cancel-signup] deleteUser failed:', error.message);
        return NextResponse.json({ error: 'DELETE_FAILED' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
