// SmarComm Brand Asset 단건 API — V2.0 § 3-D
// GET: 자산 + 배포·인용 이력
// PATCH: 자산 갱신 (schema·valid_until·is_public)
// DELETE: 자산 archive (valid_until = now)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { computePersistenceScore } from '@/lib/smarcomm/assets';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const admin = createAdminClient();

    // ID 또는 slug 둘 다 허용 (URL friendly)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const query = admin
        .from('smarcomm_brand_assets')
        .select('*')
        .limit(1);

    const { data: asset, error } = await (isUuid
        ? query.eq('id', id)
        : query.eq('slug', id)
    ).maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!asset) return NextResponse.json({ error: 'asset not found' }, { status: 404 });

    // 배포·인용 동시 조회
    const [{ data: distributions }, { data: citations }] = await Promise.all([
        admin
            .from('smarcomm_asset_distributions')
            .select('id, channel, medium_name, external_url, status, submitted_at, confirmed_at, domain_authority, notes, created_at')
            .eq('asset_id', asset.id)
            .order('created_at', { ascending: false }),
        admin
            .from('smarcomm_asset_citations')
            .select('id, platform, query, response_excerpt, probe_scan_id, accuracy, measured_at')
            .eq('asset_id', asset.id)
            .order('measured_at', { ascending: false }),
    ]);

    // 점수 재계산 (저장값과 lazy 동기화)
    const recomputed = computePersistenceScore(
        (distributions ?? []) as Parameters<typeof computePersistenceScore>[0],
        (citations ?? []) as Parameters<typeof computePersistenceScore>[1],
    );
    if (recomputed !== asset.persistence_score) {
        await admin.from('smarcomm_brand_assets')
            .update({ persistence_score: recomputed })
            .eq('id', asset.id);
        asset.persistence_score = recomputed;
    }

    return NextResponse.json({
        asset,
        distributions: distributions ?? [],
        citations: citations ?? [],
    });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    if ('name' in body) allowed.name = body.name;
    if ('description' in body) allowed.description = body.description;
    if ('schema_jsonld' in body) allowed.schema_jsonld = body.schema_jsonld;
    if ('is_public' in body) allowed.is_public = Boolean(body.is_public);
    if ('valid_until' in body) allowed.valid_until = body.valid_until;

    if (Object.keys(allowed).length === 0) {
        return NextResponse.json({ error: '갱신할 필드 없음' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('smarcomm_brand_assets')
        .update(allowed)
        .eq('id', id)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ asset: data });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const admin = createAdminClient();
    // soft delete — valid_until = now
    const { error } = await admin
        .from('smarcomm_brand_assets')
        .update({ valid_until: new Date().toISOString() })
        .eq('id', id)
        .is('valid_until', null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
