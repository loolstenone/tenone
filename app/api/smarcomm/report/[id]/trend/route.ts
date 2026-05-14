// Trend API — 같은 도메인 시계열 점수 (Phase 3.2)
//
// 보고서의 "추이" 차트 데이터 제공.
// 같은 도메인의 모든 scan을 시간순으로 정렬해서 반환.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const admin = createAdminClient();

    // 현재 scan에서 domain 추출
    const { data: current } = await admin
        .from('smarcomm_scans')
        .select('domain, created_at')
        .eq('short_id', id)
        .maybeSingle();

    if (!current) return NextResponse.json({ error: 'not found' }, { status: 404 });

    // 같은 도메인의 모든 scan (최근 20개)
    const { data: history } = await admin
        .from('smarcomm_scans')
        .select('short_id, smarcomm_index, findability_score, trust_score, citability_score, grade, created_at')
        .eq('domain', current.domain)
        .order('created_at', { ascending: true })
        .limit(20);

    return NextResponse.json({
        domain: current.domain,
        scans: history ?? [],
    });
}
