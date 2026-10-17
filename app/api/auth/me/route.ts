import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isStaffMember } from '@/lib/api-guard';

/**
 * 현재 로그인 사용자 이메일 반환 (쿠키 기반 서버 인증)
 * SiteClosedOverlay 등 클라이언트에서 크로스 서브도메인 인증 확인용.
 * 브라우저 클라이언트의 localStorage는 origin별로 분리되지만,
 * 이 API는 .tenone.biz 공유 쿠키를 읽으므로 서브도메인 간에도 동작한다.
 * staff = member_roles 직원(staff·manager·super_admin@universe) 여부 — 닫힌 사이트 가림막 통과 기준 (이메일로 판단하지 않는다, §1.6)
 */
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ email: null, staff: false });
    const admin = createAdminClient();
    const { data: member } = await admin.from('members').select('id').eq('auth_id', user.id).maybeSingle();
    const staff = member ? await isStaffMember(admin, member.id) : false;
    return NextResponse.json({ email: user.email ?? null, staff });
}
