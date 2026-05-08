import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// lazy 초기화 — 빌드 타임에 환경변수 없어도 안전
let _adminClient: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}

// 호출자가 super_admin인지 검증
async function verifySuperAdmin(req: NextRequest): Promise<{ ok: boolean; error?: NextResponse }> {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return { ok: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

    const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);
    if (error || !user) return { ok: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

    const { data: member } = await getSupabaseAdmin()
        .from('member_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .eq('is_active', true)
        .maybeSingle();

    if (!member) return { ok: false, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    return { ok: true };
}

export async function POST(req: NextRequest) {
    const auth = await verifySuperAdmin(req);
    if (!auth.ok) return auth.error!;

    try {
        const body = await req.json();
        const {
            email, name, tempPassword,
            employeeId, division, department, position, role,
            phone, startDate, brandAssociation, systemAccess,
        } = body;

        // 필수 검증
        if (!email || !name || !tempPassword || !employeeId || !department || !position) {
            return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
        }
        if (tempPassword.length < 6) {
            return NextResponse.json({ error: '임시 비밀번호 6자 이상 필요' }, { status: 400 });
        }

        // 1. Supabase Auth 계정 생성 (이메일 인증 없이 즉시 활성화)
        const { data: authData, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,        // 즉시 인증 완료
            user_metadata: { name },
        });

        if (authError) {
            // 이미 가입된 이메일
            if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
                return NextResponse.json({ error: '이미 등록된 이메일입니다.' }, { status: 409 });
            }
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        const authUserId = authData.user.id;

        // 2. members 테이블에 프로필 생성
        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || name.slice(0, 2).toUpperCase();
        const { data: member, error: memberError } = await getSupabaseAdmin()
            .from('members')
            .insert({
                auth_id: authUserId,
                email,
                name,
                account_type: 'staff',
                primary_type: 'staff',
                roles: ['staff'],
                avatar_initials: initials,
                role: role || 'Editor',
                department,
                position,
                employee_id: employeeId,
                phone: phone || null,
                hire_date: startDate || null,
                system_access: systemAccess || [],
                brand_access: brandAssociation || [],
                intra_access: true,
                module_access: ['myverse', 'townity', 'project', 'hero', 'evolution', 'smarcomm', 'wiki', 'erp', 'vridge', 'bums'],
                origin_site: 'tenone.biz',
            })
            .select()
            .single();

        if (memberError) {
            // members 생성 실패 시 auth 계정도 롤백
            await getSupabaseAdmin().auth.admin.deleteUser(authUserId);
            return NextResponse.json({ error: memberError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, memberId: member.id, authId: authUserId }, { status: 201 });
    } catch (err) {
        console.error('[create-staff] unexpected error:', err);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}
