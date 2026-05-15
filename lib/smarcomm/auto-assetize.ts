// Auto-Assetize — V2.0 § 3-D 의무 규약
//
// 캠페인 종료 시 산출물을 brand_assets로 자동 영속화.
// "캠페인 종료 = 자산화 시작" — 캠페인 끝나면 검색·AI가 평생 참조할 Entity 자산 자동 등록.

import type { SupabaseClient } from '@supabase/supabase-js';
import {
    buildOrganizationSchema,
    buildServiceSchema,
    buildFAQSchema,
    slugify,
    type BrandAsset,
    type EntityType,
} from './assets';

export interface AutoAssetizeInput {
    /** workspace 격리 키 */
    tenant_id: string;
    /** 캠페인 메타 */
    campaign_id?: string;
    campaign_name: string;
    description?: string;
    /** 광고주 조직 (이름·URL·로고) — 없으면 Organization Entity 생성 안 함 */
    org_name?: string;
    org_url?: string;
    org_logo?: string;
    /** 캠페인 FAQ — 있으면 FAQPage Entity 생성 */
    faqs?: Array<{ q: string; a: string }>;
    /** 원천 진단 ID */
    source_scan_id?: string;
    /** Service 가격 (있으면 offers에 포함) */
    service_price?: { value: number; currency?: string };
    /** 자동 공개 여부 — 기본 false (수동 검토 후 공개 권장) */
    is_public?: boolean;
}

export interface AutoAssetizeResult {
    created: Array<{ entity_type: EntityType; name: string; slug: string; id: string }>;
    skipped: Array<{ entity_type: EntityType; name: string; reason: string }>;
}

/**
 * 캠페인 종료 시 자동으로 Entity 자산을 생성한다.
 *
 * 규칙:
 *   - Organization (org_name 있을 때) — 같은 tenant에 이미 있으면 skip
 *   - Service (campaign_name) — slug 충돌 시 timestamp suffix
 *   - FAQPage (faqs 있을 때) — slug 충돌 시 timestamp suffix
 *
 * 멱등성: Organization은 (tenant_id, org_name) 단위로 1개만 유지.
 */
// UUID v4 형식 검증 — 외부 ID(mock·string) 들어오면 null로 처리해 DB 캐스팅 실패 방지
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function normalizeUuid(id?: string): string | null {
    if (!id || !UUID_RE.test(id)) return null;
    return id;
}

export async function autoAssetizeCampaign(
    admin: SupabaseClient,
    input: AutoAssetizeInput,
): Promise<AutoAssetizeResult> {
    const created: AutoAssetizeResult['created'] = [];
    const skipped: AutoAssetizeResult['skipped'] = [];
    const campaignUuid = normalizeUuid(input.campaign_id);
    const scanUuid = normalizeUuid(input.source_scan_id);

    // ── 1. Organization Entity (있는 경우)
    if (input.org_name) {
        const orgSlug = slugify(input.org_name);
        // 같은 tenant에 같은 slug Organization이 있으면 skip
        const { data: existing } = await admin
            .from('smarcomm_brand_assets')
            .select('id, name, slug')
            .eq('tenant_id', input.tenant_id)
            .eq('entity_type', 'Organization')
            .eq('slug', orgSlug)
            .is('valid_until', null)
            .maybeSingle();

        if (existing) {
            skipped.push({ entity_type: 'Organization', name: existing.name, reason: '이미 존재' });
        } else {
            const schema = buildOrganizationSchema({
                name: input.org_name,
                url: input.org_url,
                description: input.description,
                logo: input.org_logo,
            });
            const { data: orgRow, error: orgErr } = await admin
                .from('smarcomm_brand_assets')
                .insert({
                    tenant_id: input.tenant_id,
                    entity_type: 'Organization',
                    name: input.org_name,
                    slug: orgSlug,
                    description: input.description ?? null,
                    schema_jsonld: schema,
                    source_scan_id: scanUuid,
                    source_campaign_id: campaignUuid,
                    is_public: input.is_public ?? false,
                    persistence_score: 0,
                })
                .select('id, name, slug')
                .single();
            if (!orgErr && orgRow) {
                created.push({ entity_type: 'Organization', name: orgRow.name, slug: orgRow.slug, id: orgRow.id });
            } else if (orgErr) {
                skipped.push({ entity_type: 'Organization', name: input.org_name, reason: orgErr.message });
            }
        }
    }

    // ── 2. Service Entity (캠페인 자체)
    {
        const serviceSlug = await reserveSlug(admin, input.tenant_id, slugify(input.campaign_name));
        const schema = buildServiceSchema({
            name: input.campaign_name,
            description: input.description,
            provider: input.org_name,
            offers: input.service_price,
        });
        const { data: srvRow, error: srvErr } = await admin
            .from('smarcomm_brand_assets')
            .insert({
                tenant_id: input.tenant_id,
                entity_type: 'Service',
                name: input.campaign_name,
                slug: serviceSlug,
                description: input.description ?? null,
                schema_jsonld: schema,
                source_scan_id: scanUuid,
                source_campaign_id: campaignUuid,
                is_public: input.is_public ?? false,
                persistence_score: 0,
            })
            .select('id, name, slug')
            .single();
        if (!srvErr && srvRow) {
            created.push({ entity_type: 'Service', name: srvRow.name, slug: srvRow.slug, id: srvRow.id });
        } else if (srvErr) {
            skipped.push({ entity_type: 'Service', name: input.campaign_name, reason: srvErr.message });
        }
    }

    // ── 3. FAQPage (FAQ 있는 경우)
    if (input.faqs && input.faqs.length > 0) {
        const faqName = `${input.campaign_name} FAQ`;
        const faqSlug = await reserveSlug(admin, input.tenant_id, slugify(faqName));
        const schema = buildFAQSchema({ name: faqName, questions: input.faqs });
        const { data: faqRow, error: faqErr } = await admin
            .from('smarcomm_brand_assets')
            .insert({
                tenant_id: input.tenant_id,
                entity_type: 'FAQPage',
                name: faqName,
                slug: faqSlug,
                description: `${input.campaign_name} 캠페인 자주 묻는 질문 (${input.faqs.length}건)`,
                schema_jsonld: schema,
                source_scan_id: scanUuid,
                source_campaign_id: campaignUuid,
                is_public: input.is_public ?? false,
                persistence_score: 0,
            })
            .select('id, name, slug')
            .single();
        if (!faqErr && faqRow) {
            created.push({ entity_type: 'FAQPage', name: faqRow.name, slug: faqRow.slug, id: faqRow.id });
        } else if (faqErr) {
            skipped.push({ entity_type: 'FAQPage', name: faqName, reason: faqErr.message });
        }
    }

    return { created, skipped };
}

/** slug 충돌 회피 — 같은 tenant에 같은 slug 있으면 timestamp suffix */
async function reserveSlug(admin: SupabaseClient, tenant_id: string, baseSlug: string): Promise<string> {
    const { data } = await admin
        .from('smarcomm_brand_assets')
        .select('slug')
        .eq('tenant_id', tenant_id)
        .eq('slug', baseSlug)
        .maybeSingle();
    if (!data) return baseSlug;
    return `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
}
