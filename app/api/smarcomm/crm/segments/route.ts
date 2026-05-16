// CRM 세그먼트 API — crm_segments 테이블

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('crm_segments')
        .select('id, name, description, kind, color, last_computed_count, person_ids, rules, created_at')
        .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const segments = (data ?? []).map(r => ({
        id: r.id as string,
        name: (r.name as string) ?? '',
        description: (r.description as string) ?? '',
        kind: (r.kind as string) ?? 'static',
        color: (r.color as string) ?? '#64748b',
        count: (r.last_computed_count as number | null) ?? ((r.person_ids as string[] | null)?.length ?? null),
        rules: r.rules ?? null,
        created_at: ((r.created_at as string) ?? '').slice(0, 10),
    }));
    return NextResponse.json({ segments });
}
