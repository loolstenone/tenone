// 현재 사용자의 SmarComm 구독 플랜 조회
// wio_subscriptions 활성 row → plan_key 반환

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ plan_key: 'free', authenticated: false });
        }

        const admin = createAdminClient();
        // 활성 구독 (status='active' 또는 trial)
        const { data: sub } = await admin
            .from('wio_subscriptions')
            .select('plan_key, status, expires_at')
            .eq('user_id', user.id)
            .eq('service', 'smarcomm')
            .in('status', ['active', 'trial', 'trialing'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        // staff/admin/master 이메일은 자동 business 티어
        const masterEmails = ['admin@smarcomm.com', 'cheonil@tenone.biz', 'tenone@tenone.biz', 'lools@tenone.biz'];
        if (masterEmails.includes(user.email ?? '')) {
            return NextResponse.json({
                plan_key: 'business',
                authenticated: true,
                via: 'master_email',
                expires_at: null,
            });
        }

        // member_roles에서 staff/manager/super_admin 여부 확인
        const { data: roles } = await admin
            .from('member_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('is_active', true);
        const isStaff = (roles ?? []).some(r => ['staff', 'manager', 'super_admin'].includes(r.role as string));
        if (isStaff) {
            return NextResponse.json({
                plan_key: 'business',
                authenticated: true,
                via: 'staff_role',
                expires_at: null,
            });
        }

        if (!sub) {
            return NextResponse.json({ plan_key: 'free', authenticated: true, via: 'no_subscription' });
        }

        return NextResponse.json({
            plan_key: sub.plan_key ?? 'free',
            authenticated: true,
            via: 'subscription',
            status: sub.status,
            expires_at: sub.expires_at,
        });
    } catch (e) {
        return NextResponse.json({ plan_key: 'free', authenticated: false, error: String(e) });
    }
}
