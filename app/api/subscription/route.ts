/**
 * 구독 관리 API
 * GET  /api/subscription?service=wio  → 플랜 목록
 * POST /api/subscription              → 구독 생성
 * PATCH /api/subscription              → 구독 상태 변경
 */
import { NextRequest, NextResponse } from 'next/server';
import { fetchSubscriptionPlans, createSubscription, updateSubscriptionStatus, hasAccess } from '@/lib/supabase/wio';

export async function GET(request: NextRequest) {
    const service = request.nextUrl.searchParams.get('service') || undefined;
    try {
        const plans = await fetchSubscriptionPlans(service);
        return NextResponse.json({ plans });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { planId, userId, tenantId, service, planKey, pricePaid, billingCycle, paymentMethod } = body;
        if (!planId || !userId || !service || !planKey) {
            return NextResponse.json({ error: 'planId, userId, service, planKey required' }, { status: 400 });
        }
        const sub = await createSubscription({ planId, userId, tenantId, service, planKey, pricePaid, billingCycle, paymentMethod });
        return NextResponse.json({ subscription: sub });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { id, status } = await request.json();
        if (!id || !status) {
            return NextResponse.json({ error: 'id and status required' }, { status: 400 });
        }
        const sub = await updateSubscriptionStatus(id, status);
        return NextResponse.json({ subscription: sub });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
}
