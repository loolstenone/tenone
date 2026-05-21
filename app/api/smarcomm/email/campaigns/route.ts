/**
 * GET  /api/smarcomm/email/campaigns
 * POST /api/smarcomm/email/campaigns
 *
 * SmarComm 사용자 본인 이메일 캠페인 목록·생성.
 * RLS 정책 "crm_campaigns smarcomm owner"로 본인 row만 보인다.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('crm_campaigns')
        .select('id, name, subject, status, scheduled_at, sent_at, recipient_count, created_at')
        .eq('created_by_service', 'smarcomm')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaigns: data ?? [] });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({})) as {
        name?: string;
        subject?: string;
        body_text?: string;
        body_html?: string;
        sender_id?: string;
        preheader?: string;
        button_label?: string;
        button_url?: string;
        brand_name?: string;
        brand_color?: string;
        segment_id?: string;
        person_ids?: string[];
    };
    if (!body.name || !body.subject || !body.body_text) {
        return NextResponse.json({ error: 'name·subject·body_text가 필요합니다.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('crm_campaigns').insert({
        name: body.name,
        subject: body.subject,
        body_text: body.body_text,
        body_html: body.body_html ?? null,
        sender_id: body.sender_id ?? 'hello',
        preheader: body.preheader ?? null,
        button_label: body.button_label ?? null,
        button_url: body.button_url ?? null,
        brand_name: body.brand_name ?? null,
        brand_color: body.brand_color ?? '#171717',
        segment_id: body.segment_id ?? null,
        person_ids: body.person_ids ?? null,
        status: 'draft',
        created_by_service: 'smarcomm',
        owner_user_id: user.id,
        brand_id: 'smarcomm',
        tenant_id: 'tenone',
    }).select('id').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id });
}
