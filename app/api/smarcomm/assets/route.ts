// SmarComm Brand Assets API — V2.0 § 3-D
// GET: 자산 목록 조회
// POST: 새 자산 등록

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify, type EntityType } from '@/lib/smarcomm/assets';

const VALID_ENTITY_TYPES: EntityType[] = [
    'Organization', 'Service', 'Person', 'Product',
    'FAQPage', 'HowTo', 'WebSite', 'BreadcrumbList',
    'SoftwareApplication', 'Article',
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id') ?? 'tenone-demo';
    const entityType = searchParams.get('entity_type');
    const onlyActive = searchParams.get('active') !== 'false';

    const admin = createAdminClient();
    let query = admin
        .from('smarcomm_brand_assets')
        .select('id, tenant_id, entity_type, name, slug, description, schema_jsonld, valid_from, valid_until, persistence_score, is_public, created_at, updated_at, source_scan_id')
        .eq('tenant_id', tenantId)
        .order('updated_at', { ascending: false });

    if (entityType) {
        query = query.eq('entity_type', entityType);
    }
    if (onlyActive) {
        query = query.is('valid_until', null);
    }

    const { data, error } = await query;
    if (error) {
        console.error('[smarcomm/assets] list error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ assets: data ?? [] });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            tenant_id = 'tenone-demo',
            member_id = null,
            entity_type,
            name,
            slug,
            description,
            schema_jsonld,
            is_public = false,
            source_scan_id = null,
            source_campaign_id = null,
            source_creative_id = null,
        } = body;

        if (!entity_type || !VALID_ENTITY_TYPES.includes(entity_type)) {
            return NextResponse.json({ error: 'entity_type 필수 — 10종 중 하나' }, { status: 400 });
        }
        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'name 필수' }, { status: 400 });
        }
        if (!schema_jsonld || typeof schema_jsonld !== 'object') {
            return NextResponse.json({ error: 'schema_jsonld 필수' }, { status: 400 });
        }

        const finalSlug = slug && typeof slug === 'string' ? slugify(slug) : slugify(name);

        const admin = createAdminClient();
        const { data, error } = await admin
            .from('smarcomm_brand_assets')
            .insert({
                tenant_id,
                member_id,
                entity_type,
                name,
                slug: finalSlug,
                description: description || null,
                schema_jsonld,
                is_public,
                source_scan_id,
                source_campaign_id,
                source_creative_id,
                persistence_score: 0,
            })
            .select()
            .single();

        if (error) {
            // unique 충돌이면 slug 자동 변경
            if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
                const retrySlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`;
                const { data: retry, error: retryErr } = await admin
                    .from('smarcomm_brand_assets')
                    .insert({
                        tenant_id, member_id, entity_type, name,
                        slug: retrySlug,
                        description: description || null,
                        schema_jsonld, is_public,
                        source_scan_id, source_campaign_id, source_creative_id,
                        persistence_score: 0,
                    })
                    .select()
                    .single();
                if (retryErr) {
                    return NextResponse.json({ error: retryErr.message }, { status: 500 });
                }
                return NextResponse.json({ asset: retry });
            }
            console.error('[smarcomm/assets] create error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ asset: data });
    } catch (err) {
        console.error('[smarcomm/assets] POST error:', err);
        return NextResponse.json({ error: 'request 처리 실패' }, { status: 500 });
    }
}
