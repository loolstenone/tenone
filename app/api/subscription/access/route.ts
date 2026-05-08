/**
 * 구독 접근 권한 확인 API
 * GET /api/subscription/access?userId=xxx&service=wio&feature=ai_agent
 * 인증 필수: 자신의 userId만 조회 가능. staff/super_admin은 타인 조회 허용.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { hasAccess } from '@/lib/supabase/wio';

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');
    const service = request.nextUrl.searchParams.get('service');
    const feature = request.nextUrl.searchParams.get('feature') || undefined;

    if (!userId || !service) {
        return NextResponse.json({ error: 'userId and service required' }, { status: 400 });
    }

    // 세션 검증
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 자기 자신만 조회 가능 (staff/super_admin 예외)
    if (user.id !== userId) {
        const { data: role } = await supabase
            .from('member_roles')
            .select('role')
            .eq('user_id', user.id)
            .in('role', ['staff', 'manager', 'super_admin'])
            .eq('is_active', true)
            .maybeSingle();
        if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const result = await hasAccess(userId, service, feature);
        return NextResponse.json(result);
    } catch {
        return NextResponse.json({ error: 'Access check failed' }, { status: 500 });
    }
}
