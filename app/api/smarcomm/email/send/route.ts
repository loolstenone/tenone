/**
 * POST /api/smarcomm/email/send
 * body: { campaignId: string; testEmails?: string[]; scheduledAt?: string }
 *
 * SmarComm 사용자 전용 캠페인 발송. 발송 로직은 공용 헬퍼([lib/email/send-broadcast.ts])에 위임.
 * 본인 캠페인(created_by_service='smarcomm' AND owner_user_id=user.id) 한정.
 * RLS 정책 "crm_campaigns smarcomm owner"가 1차 필터, 본 라우트가 2차 검증.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendCampaignBroadcast, BroadcastError } from '@/lib/email/send-broadcast';

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { campaignId, testEmails, scheduledAt } = await request.json().catch(() => ({})) as {
        campaignId?: string; testEmails?: string[]; scheduledAt?: string;
    };
    if (!campaignId) return NextResponse.json({ error: 'campaignId가 필요합니다.' }, { status: 400 });

    const { data: campaign, error: cErr } = await supabase
        .from('crm_campaigns')
        .select('id, created_by_service, owner_user_id')
        .eq('id', campaignId)
        .single();
    if (cErr || !campaign) {
        return NextResponse.json({ error: '캠페인을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }
    if (campaign.created_by_service !== 'smarcomm' || campaign.owner_user_id !== user.id) {
        return NextResponse.json({ error: '본인 SmarComm 캠페인만 발송할 수 있습니다.' }, { status: 403 });
    }

    // TODO Phase 3.1.2: wio_subscriptions 한도 검증 (Free·Starter 월 N건 제한)

    try {
        const result = await sendCampaignBroadcast({
            campaignId,
            testEmails,
            scheduledAt,
            supabase,
            adminSupabase: getAdminClient(),
        });
        return NextResponse.json(result);
    } catch (e) {
        if (e instanceof BroadcastError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        throw e;
    }
}
