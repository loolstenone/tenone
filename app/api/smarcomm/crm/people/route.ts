// CRM 고객 API — crm_people 테이블

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function rowToPerson(r: Record<string, unknown>) {
    return {
        id: r.id as string,
        name: (r.name as string) ?? '',
        email: (r.email as string) ?? '',
        phone: (r.phone as string) ?? '',
        company: (r.company as string) ?? '',
        position: (r.position as string) ?? '',
        lifecycle_stage: (r.lifecycle_stage as string) ?? 'lead',
        status: (r.status as string) ?? 'Active',
        source: (r.source as string) ?? '',
        primary_brand_id: (r.primary_brand_id as string) ?? '',
        tags: (r.tags as string[]) ?? [],
        last_contacted: r.last_contacted ? ((r.last_contacted as string).slice(0, 10)) : null,
        last_touched_at: r.last_touched_at ? (r.last_touched_at as string) : null,
        lifetime_value: r.lifetime_value as number | null,
        do_not_email: (r.do_not_email as boolean) ?? false,
        do_not_contact: (r.do_not_contact as boolean) ?? false,
        avatar_initials: (r.avatar_initials as string) ?? null,
        created_at: ((r.created_at as string) ?? '').slice(0, 10),
    };
}

export async function GET() {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('crm_people')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const people = (data ?? []).map(rowToPerson);

    const byStage: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let emailReachable = 0;
    for (const p of people) {
        byStage[p.lifecycle_stage] = (byStage[p.lifecycle_stage] ?? 0) + 1;
        byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
        if (p.source) bySource[p.source] = (bySource[p.source] ?? 0) + 1;
        if (p.email && !p.do_not_email) emailReachable += 1;
    }

    return NextResponse.json({
        people,
        total: people.length,
        byStage,
        byStatus,
        bySource,
        emailReachable,
    });
}
