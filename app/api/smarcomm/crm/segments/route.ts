// CRM 세그먼트 API — crm_segments 테이블

import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/api-guard';
import { SMARCOMM_BETA_EMAILS } from '@/lib/api-access-policy';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const guard = await requireStaff(request, { allowEmails: SMARCOMM_BETA_EMAILS });
    if (guard instanceof NextResponse) return guard;

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
