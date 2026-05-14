// GET /api/smarcomm/plan-check?feature=xxx
// 현재 사용자의 SmarComm 구독 플랜과 요청 feature 접근 가능 여부 반환.
// 응답: { plan: 'free'|'starter'|'pro'|'business'|null, allowed: boolean, reason?: string }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_RANK: Record<string, number> = {
    free: 0,
    starter: 1,
    pro: 2,
    business: 3,
};

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ plan: null, allowed: false, reason: 'unauthenticated' }, { status: 401 });
    }

    const url = new URL(request.url);
    const requiredPlan = url.searchParams.get('requiredPlan') || 'free';
    const feature = url.searchParams.get('feature') || undefined;

    // 활성 구독 조회
    const { data: subs } = await supabase
        .from('wio_subscriptions')
        .select('plan_key, status, expires_at')
        .eq('user_id', user.id)
        .eq('service', 'smarcomm')
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

    const currentPlan = subs?.[0]?.plan_key ?? 'free';
    const currentRank = PLAN_RANK[currentPlan] ?? 0;
    const requiredRank = PLAN_RANK[requiredPlan] ?? 0;

    if (currentRank < requiredRank) {
        return NextResponse.json({
            plan: currentPlan,
            allowed: false,
            reason: 'plan_insufficient',
            requiredPlan,
        });
    }

    // feature flag 추가 검사 (선택)
    if (feature) {
        const { data: plan } = await supabase
            .from('wio_subscription_plans')
            .select('id')
            .eq('service', 'smarcomm')
            .eq('plan_key', currentPlan)
            .single();

        if (plan) {
            const { data: flag } = await supabase
                .from('wio_feature_flags')
                .select('enabled')
                .eq('plan_id', plan.id)
                .eq('feature_key', feature)
                .single();

            if (flag && !flag.enabled) {
                return NextResponse.json({
                    plan: currentPlan,
                    allowed: false,
                    reason: 'feature_not_included',
                    requiredPlan,
                });
            }
        }
    }

    return NextResponse.json({ plan: currentPlan, allowed: true });
}
