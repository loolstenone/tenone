// GET /api/smarcomm/scan/history
// 로그인 사용자의 스캔 이력 반환 (최신순 20개)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('smarcomm_scan_results')
        .select('id, url, domain, industry, index_score, grade, score_delta, scanned_at')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('[smarcomm-history]', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
}
