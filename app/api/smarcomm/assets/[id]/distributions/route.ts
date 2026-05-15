// SmarComm Asset Distributions API — V2.1 § 1.10 정직성 (UI 입력 경로 신설)
// 외부 매체 배포 이력은 사용자가 직접 등록한다 — 자동 감지 외부 도구 연동 전엔 수동 입력만 정직.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const VALID_CHANNELS = ['wikipedia', 'news_press', 'academic_paper', 'industry_directory', 'social_proof', 'company_listing', 'product_db', 'other'] as const;
const VALID_STATUS = ['pending', 'submitted', 'live', 'rejected', 'expired'] as const;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: assetId } = await params;
    if (!assetId) return NextResponse.json({ error: 'asset id required' }, { status: 400 });

    try {
        const body = await request.json();
        const { channel, medium_name, external_url, status = 'live', domain_authority, notes } = body;

        if (!channel || !VALID_CHANNELS.includes(channel)) {
            return NextResponse.json({ error: 'channel 필수 — 8종 중 하나' }, { status: 400 });
        }
        if (!medium_name || typeof medium_name !== 'string') {
            return NextResponse.json({ error: 'medium_name 필수' }, { status: 400 });
        }
        if (!VALID_STATUS.includes(status)) {
            return NextResponse.json({ error: 'status는 8종 중 하나' }, { status: 400 });
        }

        const admin = createAdminClient();
        // tenant_id를 자산에서 가져옴
        const { data: asset } = await admin
            .from('smarcomm_brand_assets')
            .select('tenant_id')
            .eq('id', assetId)
            .maybeSingle();
        if (!asset) return NextResponse.json({ error: 'asset not found' }, { status: 404 });

        const insertData: Record<string, unknown> = {
            asset_id: assetId,
            tenant_id: asset.tenant_id,
            channel,
            medium_name: medium_name.slice(0, 200),
            external_url: external_url || null,
            status,
            notes: notes ? String(notes).slice(0, 500) : null,
        };
        if (status === 'submitted' || status === 'live') insertData.submitted_at = new Date().toISOString();
        if (status === 'live') insertData.confirmed_at = new Date().toISOString();
        if (typeof domain_authority === 'number' && domain_authority >= 0 && domain_authority <= 100) {
            insertData.domain_authority = Math.round(domain_authority);
        }

        const { data, error } = await admin
            .from('smarcomm_asset_distributions')
            .insert(insertData)
            .select()
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ distribution: data });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: assetId } = await params;
    const { searchParams } = new URL(request.url);
    const distributionId = searchParams.get('distribution_id');
    if (!distributionId) return NextResponse.json({ error: 'distribution_id query 필수' }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from('smarcomm_asset_distributions')
        .delete()
        .eq('id', distributionId)
        .eq('asset_id', assetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
