import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/api-guard';

const admin = createAdminClient();

/**
 * GET /api/intra/members
 * 인트라 전용 — 전체 회원 목록 조회 (service role)
 * staff 인증 필수 (requireStaff)
 */
export async function GET(request: NextRequest) {
    // 직원 확인 — member_roles 기반 공통 함수 (본인이 수정 가능한 members.roles·email로 판단하지 않음)
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '500'), 1000);
    const offset = parseInt(url.searchParams.get('offset') ?? '0');

    const { data: members, count: totalCount, error } = await admin
        .from('members')
        .select('id, name, email, handle, phone, bio, company, position, affiliations, roles, last_login_at, created_at, onboarding_completed, deleted_at', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 구독 정보 (active), 뉴스레터 구독자, UC 잔액, member_roles 병렬 조회
    // 브랜드 = member_brand_joins (헌법 원칙 1 — members.affiliations로 세지 않는다, 2026-10-10)
    const [subsRes, newslettersRes, ucBalancesRes, memberRolesRes, joinsRes] = await Promise.all([
        // 구독 SSOT = wio_subscriptions (모순 방지 원칙 1). user_id = auth.users.id → members.auth_id로 회원에 연결
        admin.from('wio_subscriptions').select('user_id, service, plan_key').eq('status', 'active'),
        admin.from('newsletter_subscribers').select('email').eq('status', 'active'),
        admin.from('uc_balances').select('member_id, balance'),
        admin.from('member_roles').select('member_id, role, context').eq('is_active', true),
        admin.from('member_brand_joins').select('member_id, brand_id').is('withdrawn_at', null),
    ]);
    const brandJoins: Record<string, string[]> = {};
    (joinsRes.data ?? []).forEach((j: { member_id: string; brand_id: string }) => {
        (brandJoins[j.member_id] ??= []).push(j.brand_id);
    });

    const subRows = (subsRes.data ?? []) as { user_id: string; service: string; plan_key: string }[];
    const authIds = [...new Set(subRows.map(r => r.user_id))];
    const { data: subMembers } = authIds.length
        ? await admin.from('members').select('id, auth_id').in('auth_id', authIds)
        : { data: [] as { id: string; auth_id: string }[] };
    const memberByAuth = new Map((subMembers ?? []).map(m => [m.auth_id as string, m.id as string]));
    const subscriptions = subRows.flatMap(r => {
        const memberId = memberByAuth.get(r.user_id);
        return memberId ? [{ member_id: memberId, service: r.service, plan: r.plan_key }] : [];
    });

    const newsletterEmails = (newslettersRes.data ?? []).map((r: { email: string }) => r.email.toLowerCase());
    const ucMap: Record<string, number> = {};
    (ucBalancesRes.data ?? []).forEach((b: { member_id: string; balance: number }) => {
        ucMap[b.member_id] = b.balance;
    });

    // member_id → [{role, context}]
    const rolesMap: Record<string, { role: string; context: string | null }[]> = {};
    (memberRolesRes.data ?? []).forEach((r: { member_id: string; role: string; context: string | null }) => {
        if (!rolesMap[r.member_id]) rolesMap[r.member_id] = [];
        rolesMap[r.member_id].push({ role: r.role, context: r.context });
    });

    return NextResponse.json({
        members: members ?? [],
        subscriptions,
        newsletterEmails,
        totalMembersCount: totalCount ?? (members?.length ?? 0),
        newsletterCount: newsletterEmails.length,
        ucBalances: ucMap,
        memberRoles: rolesMap,
        brandJoins,
    });
}
