import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';

const admin = createAdminClient();

/**
 * GET /api/intra/members
 * 인트라 전용 — 전체 회원 목록 조회 (service role)
 * staff 인증 필수
 */
export async function GET(request: NextRequest) {
    // 인증 확인
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // staff 확인 (roles 배열에 staff/admin 포함 또는 tenone 도메인)
    const { data: member } = await admin
        .from('members')
        .select('roles, email')
        .eq('auth_id', user.id)
        .single();

    const isStaff = member?.email?.endsWith('@tenone.biz') ||
        (member?.roles ?? []).some((r: string) => ['staff', 'admin', 'superadmin'].includes(r));

    if (!isStaff) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '500'), 1000);
    const offset = parseInt(url.searchParams.get('offset') ?? '0');

    const { data: members, count: totalCount, error } = await admin
        .from('members')
        .select('id, name, email, handle, phone, bio, company, position, affiliations, roles, last_login_at, created_at, signup_source, onboarding_completed, deleted_at', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 구독 정보 (active), 뉴스레터 구독자, UC 잔액 병렬 조회
    const [subsRes, newslettersRes, ucBalancesRes] = await Promise.all([
        admin.from('subscriptions').select('member_id, service, plan').eq('status', 'active'),
        admin.from('newsletter_subscribers').select('email').eq('status', 'active'),
        admin.from('uc_balances').select('member_id, balance'),
    ]);

    const newsletterEmails = (newslettersRes.data ?? []).map((r: { email: string }) => r.email.toLowerCase());
    const ucMap: Record<string, number> = {};
    (ucBalancesRes.data ?? []).forEach((b: { member_id: string; balance: number }) => {
        ucMap[b.member_id] = b.balance;
    });

    return NextResponse.json({
        members: members ?? [],
        subscriptions: subsRes.data ?? [],
        newsletterEmails,
        totalMembersCount: totalCount ?? (members?.length ?? 0),
        newsletterCount: newsletterEmails.length,
        ucBalances: ucMap,
    });
}
