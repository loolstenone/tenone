/**
 * POST /api/intra/crm/segments/preview
 * body: { rules: SegmentRules, limit?: number }
 * 규칙 기반 미리보기 — 카운트 + 샘플 rows
 * auth: Intra staff
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildSegmentQuery, type SegmentRules } from '@/lib/crm-segments';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({})) as { rules?: SegmentRules; limit?: number };
    const rules = body.rules;
    if (!rules || !Array.isArray(rules.conditions)) {
        return NextResponse.json({ error: 'Invalid rules' }, { status: 400 });
    }

    const limit = Math.min(body.limit ?? 20, 100);

    // count
    const countQ = buildSegmentQuery(supabase, rules, 'id', { count: 'exact' });
    const { count, error: cntErr } = await countQ.limit(0);
    if (cntErr) return NextResponse.json({ error: cntErr.message }, { status: 500 });

    // sample
    const sampleQ = buildSegmentQuery(supabase, rules, 'id, name, email, lifecycle_stage, company, last_touched_at');
    const { data: sample, error: sErr } = await sampleQ.order('last_touched_at', { ascending: false, nullsFirst: false }).limit(limit);
    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

    return NextResponse.json({ count: count ?? 0, sample: sample ?? [] });
}
