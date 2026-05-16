// SmarComm Asset Distribution DA Enrichment — Phase 5 Item 4
// Moz DA (primary) 또는 Ahrefs DR (secondary)로 distribution.domain_authority 자동 채움.
// API 키 미설정 시 { status: 'api_key_missing' } 정직 반환 (§ ZERO 정직 원칙).

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function extractDomain(url: string): string | null {
  try {
    const { hostname } = new URL(url.startsWith('http') ? url : `https://${url}`);
    return hostname.replace(/^www\./i, '');
  } catch {
    return null;
  }
}

// POST /api/smarcomm/assets/[id]/distributions/enrich-da
// Body: { distribution_id: string } — 단건; 생략 시 asset의 외부 URL 있는 전체 배치
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assetId } = await params;

  const mozAccessId = process.env.MOZSCAPE_ACCESS_ID;
  const mozSecretKey = process.env.MOZSCAPE_SECRET_KEY;
  const ahrefsKey = process.env.AHREFS_API_KEY;

  if (!mozAccessId && !mozSecretKey && !ahrefsKey) {
    return NextResponse.json({ distributions: [], status: 'api_key_missing' }, { status: 200 });
  }

  const useMoz = !!(mozAccessId && mozSecretKey);

  let distributionId: string | null = null;
  try {
    const body = await req.json();
    distributionId = body?.distribution_id ?? null;
  } catch {
    // no body — batch mode
  }

  const admin = createAdminClient();

  const baseQuery = admin
    .from('smarcomm_asset_distributions')
    .select('id, external_url')
    .eq('asset_id', assetId)
    .not('external_url', 'is', null);

  const { data: distributions, error: fetchError } = distributionId
    ? await baseQuery.eq('id', distributionId)
    : await baseQuery;

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!distributions || distributions.length === 0) {
    return NextResponse.json({ distributions: [], status: 'ok' });
  }

  const results: Array<{ id: string; domain: string | null; domain_authority: number | null; error?: string }> = [];

  for (const dist of distributions) {
    const domain = extractDomain(dist.external_url!);
    if (!domain) {
      results.push({ id: dist.id, domain: null, domain_authority: null, error: 'invalid_url' });
      continue;
    }

    let da: number | null = null;

    try {
      if (useMoz) {
        const credentials = Buffer.from(`${mozAccessId}:${mozSecretKey}`).toString('base64');
        const mozRes = await fetch('https://lsapi.seomoz.com/v2/url_metrics', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ targets: [`${domain}/`], metrics: ['domain_authority'] }),
        });
        if (mozRes.ok) {
          const mozData = await mozRes.json();
          const raw = mozData.results?.[0]?.domain_authority;
          if (typeof raw === 'number') da = Math.round(raw);
        }
      } else if (ahrefsKey) {
        const ahrefsRes = await fetch(
          `https://apiv2.ahrefs.com/?from=domain_rating&target=${encodeURIComponent(domain)}&mode=domain&output=json`,
          { headers: { Authorization: `Bearer ${ahrefsKey}` } }
        );
        if (ahrefsRes.ok) {
          const ahrefsData = await ahrefsRes.json();
          const dr = ahrefsData.domain?.domain_rating;
          if (typeof dr === 'number') da = Math.round(dr);
        }
      }
    } catch (err) {
      console.error('[enrich-da] API error:', domain, err);
      results.push({ id: dist.id, domain, domain_authority: null, error: String(err) });
      continue;
    }

    if (da !== null) {
      await admin
        .from('smarcomm_asset_distributions')
        .update({ domain_authority: da })
        .eq('id', dist.id);
    }

    results.push({ id: dist.id, domain, domain_authority: da });
  }

  const { data: updated } = await admin
    .from('smarcomm_asset_distributions')
    .select('id, channel, medium_name, external_url, status, submitted_at, confirmed_at, domain_authority, notes, created_at')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false });

  return NextResponse.json({ distributions: updated ?? [], results, status: 'ok' });
}
