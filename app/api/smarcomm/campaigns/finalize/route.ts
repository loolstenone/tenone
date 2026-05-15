// SmarComm Campaign Finalize API — V2.0 § 3-D 의무 규약
// 캠페인 종료 시 산출물을 자동으로 Entity 자산으로 영속화

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { autoAssetizeCampaign } from '@/lib/smarcomm/auto-assetize';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            tenant_id = 'tenone-demo',
            campaign_id,
            campaign_name,
            description,
            org_name,
            org_url,
            org_logo,
            faqs,
            source_scan_id,
            service_price,
            is_public = false,
        } = body;

        if (!campaign_name || typeof campaign_name !== 'string') {
            return NextResponse.json({ error: 'campaign_name 필수' }, { status: 400 });
        }

        const admin = createAdminClient();
        const result = await autoAssetizeCampaign(admin, {
            tenant_id,
            campaign_id,
            campaign_name,
            description,
            org_name,
            org_url,
            org_logo,
            faqs,
            source_scan_id,
            service_price,
            is_public,
        });

        return NextResponse.json({
            ok: true,
            campaign_name,
            ...result,
        });
    } catch (err) {
        console.error('[smarcomm/campaigns/finalize] error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
