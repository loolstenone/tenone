// 스캔 결과 DB 저장 — PDF 다운로드 전제 조건
// POST /api/smarcomm/scan/save
// Body: { url, industry, breakdown, benchmark }
// — 로그인 사용자만 저장 가능. 동일 domain은 upsert (최신 유지).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { url, industry, breakdown, benchmark } = body;

    if (!url || !breakdown) {
        return NextResponse.json({ error: 'url, breakdown 필드가 필요합니다' }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;

    let domain: string;
    try {
        domain = new URL(normalizedUrl).hostname.replace(/^www\./, '');
    } catch {
        return NextResponse.json({ error: '유효하지 않은 URL입니다' }, { status: 400 });
    }

    const now = new Date();
    const nextScan = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const payload = {
        user_id:      user.id,
        url:          normalizedUrl,
        domain,
        industry:     (industry || 'general').toLowerCase(),
        findability:  breakdown.findability ?? 0,
        trust:        breakdown.trust ?? 0,
        citability:   breakdown.citability ?? 0,
        index_score:  breakdown.index ?? 0,
        grade:        breakdown.grade ?? 'D',
        breakdown,
        benchmark:    benchmark ?? null,
        scanned_at:   now.toISOString(),
        next_scan_at: nextScan.toISOString(),
        score_delta:  null,
        notified:     false,
    };

    // 같은 사용자 + 동일 domain → 기존 row 갱신, 없으면 삽입
    const { data: existing } = await supabase
        .from('smarcomm_scan_results')
        .select('id, index_score')
        .eq('user_id', user.id)
        .eq('domain', domain)
        .order('scanned_at', { ascending: false })
        .limit(1)
        .single();

    if (existing) {
        const delta = (breakdown.index ?? 0) - existing.index_score;
        const { data, error } = await supabase
            .from('smarcomm_scan_results')
            .update({ ...payload, score_delta: delta })
            .eq('id', existing.id)
            .select('id')
            .single();

        if (error) {
            console.error('[smarcomm-save] update:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ id: data.id, saved: true });
    }

    const { data, error } = await supabase
        .from('smarcomm_scan_results')
        .insert(payload)
        .select('id')
        .single();

    if (error) {
        console.error('[smarcomm-save] insert:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data.id, saved: true });
}
