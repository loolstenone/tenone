export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';

const admin = createAdminClient();

/**
 * POST /api/uc/admin/backfill
 * 가입 완료 UC 미지급 회원에게 signup_complete UC를 일괄 지급
 * staff 인증 필수
 */
export async function POST() {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: me } = await admin
        .from('members')
        .select('roles, email')
        .eq('auth_id', user.id)
        .single();

    const isStaff = me?.email?.endsWith('@tenone.biz') ||
        (me?.roles ?? []).some((r: string) => ['staff', 'admin', 'superadmin'].includes(r));

    if (!isStaff) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // signup_complete 룰 조회
    const { data: rule } = await admin
        .from('uc_earn_rules')
        .select('amount')
        .eq('action_key', 'signup_complete')
        .is('brand_id', null)
        .is('valid_until', null)
        .maybeSingle();

    if (!rule) {
        return NextResponse.json({ error: 'signup_complete rule not found' }, { status: 404 });
    }

    // 이미 signup_complete UC를 받은 member_id 목록
    const { data: alreadyEarned } = await admin
        .from('uc_transactions')
        .select('member_id')
        .eq('action_key', 'signup_complete')
        .eq('type', 'earn');

    const earnedSet = new Set((alreadyEarned ?? []).map((r: { member_id: string }) => r.member_id));

    // 전체 활성 회원 조회
    const { data: allMembers } = await admin
        .from('members')
        .select('id')
        .is('deleted_at', null);

    const targets = (allMembers ?? []).filter((m: { id: string }) => !earnedSet.has(m.id));

    if (targets.length === 0) {
        return NextResponse.json({ granted: 0, message: '지급 대상 없음' });
    }

    // 트랜잭션 일괄 insert
    const txRows = targets.map((m: { id: string }) => ({
        member_id: m.id,
        action_key: 'signup_complete',
        amount: rule.amount,
        type: 'earn',
    }));

    const { error: txError } = await admin.from('uc_transactions').insert(txRows);
    if (txError) {
        return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // uc_balances upsert (기존 잔액에 더하기)
    const { data: existingBalances } = await admin
        .from('uc_balances')
        .select('member_id, balance, lifetime_earned')
        .in('member_id', targets.map((m: { id: string }) => m.id));

    const balMap: Record<string, { balance: number; lifetime_earned: number }> = {};
    (existingBalances ?? []).forEach((b: { member_id: string; balance: number; lifetime_earned: number }) => {
        balMap[b.member_id] = b;
    });

    const upsertRows = targets.map((m: { id: string }) => ({
        member_id: m.id,
        balance: (balMap[m.id]?.balance ?? 0) + rule.amount,
        lifetime_earned: (balMap[m.id]?.lifetime_earned ?? 0) + rule.amount,
        updated_at: new Date().toISOString(),
    }));

    await admin.from('uc_balances').upsert(upsertRows);

    return NextResponse.json({ granted: targets.length, amount: rule.amount });
}
