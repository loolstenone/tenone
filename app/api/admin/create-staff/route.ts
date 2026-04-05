import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 role 클라이언트 — auth.admin.createUser() 사용 가능
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
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
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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
        const { data: member, error: memberError } = await supabaseAdmin
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
            await supabaseAdmin.auth.admin.deleteUser(authUserId);
            return NextResponse.json({ error: memberError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, memberId: member.id, authId: authUserId }, { status: 201 });
    } catch (err) {
        console.error('[create-staff] unexpected error:', err);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}
