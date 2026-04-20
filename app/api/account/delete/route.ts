import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * DELETE /api/account/delete
 * 계정 탈퇴: members 익명화 + auth user 삭제
 */
export async function DELETE(request: NextRequest) {
const adminSupabase = createAdminClient();
    const supabase = await createServerClient();
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // members 테이블 익명화 (감사 로그 보존용)
    await adminSupabase
        .from('members')
        .update({
            name: '탈퇴한 회원',
            email: `deleted_${user.id}@deleted`,
            phone: null,
            company: null,
            avatar_url: null,
            handle: null,
            deleted_at: new Date().toISOString(),
        })
        .eq('auth_id', user.id);

    // Supabase Auth 유저 삭제
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
        return NextResponse.json({ error: '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
