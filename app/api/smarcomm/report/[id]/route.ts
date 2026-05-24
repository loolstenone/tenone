// SmarComm Index 진단 보고서 조회 API — short_id 기반
// 공유 URL: /smarcomm/report/{short_id}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'short_id required' }, { status: 400 });

  const admin = createAdminClient();
  const { data: scan, error } = await admin
    .from('smarcomm_scans')
    .select('id, short_id, url, domain, industry, smarcomm_index, findability_score, trust_score, citability_score, performance_score, grade, fetch_time_ms, status_code, pages_analyzed, favicon_url, analysis, breakdown, created_at, expires_at')
    .eq('short_id', id)
    .maybeSingle();

  if (error) {
    console.error('[smarcomm/report] DB error:', error.message);
    return NextResponse.json({ error: 'failed to fetch report' }, { status: 500 });
  }
  if (!scan) return NextResponse.json({ error: 'report not found' }, { status: 404 });

  // 만료 체크
  if (scan.expires_at && new Date(scan.expires_at) < new Date()) {
    return NextResponse.json({ error: 'report expired', expired: true }, { status: 410 });
  }

  // 서브페이지 + AI Probe 실측 + Phase 3.4 환각 감지
  const [{ data: subPages }, { data: aiProbes }, { data: brandFacts }, { data: hallucinations }] = await Promise.all([
    admin
      .from('smarcomm_scan_pages')
      .select('url, title, has_meta_description, has_h1, text_length, img_count, img_with_alt, status_code, issues')
      .eq('scan_id', scan.id),
    admin
      .from('smarcomm_ai_probes')
      .select('platform, category, query, raw_response, citations, mentioned, position, accuracy, extracted_facts, measured_at')
      .eq('scan_id', scan.id)
      .order('measured_at', { ascending: true }),
    admin
      .from('smarcomm_brand_facts')
      .select('fact_type, fact_value, source, raw_excerpt, confidence')
      .eq('scan_id', scan.id),
    admin
      .from('smarcomm_hallucinations')
      .select('platform, claim_text, claim_type, ground_truth, severity, explanation, confidence, detected_at')
      .eq('scan_id', scan.id)
      .order('severity', { ascending: true }),
  ]);

  return NextResponse.json({
    scan,
    subPages: subPages ?? [],
    aiProbes: aiProbes ?? [],
    brandFacts: brandFacts ?? [],
    hallucinations: hallucinations ?? [],
  });
}
