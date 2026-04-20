/**
 * 통합 수신거부 API
 * - token = base64url(subscriberId)        → newsletter_subscribers.is_active = false
 * - token = base64url("person:" + personId) → crm_people.do_not_email = true
 *
 * GET  : 링크 클릭 (페이지 리디렉션)
 * POST : One-Click List-Unsubscribe (RFC 8058)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

function decodeToken(token: string): { kind: 'subscriber' | 'person'; id: string } | null {
    try {
        const raw = Buffer.from(token, 'base64url').toString('utf8');
        if (raw.startsWith('person:')) {
            return { kind: 'person', id: raw.slice('person:'.length) };
        }
        return { kind: 'subscriber', id: raw };
    } catch {
        return null;
    }
}

async function processUnsubscribe(token: string): Promise<{ ok: boolean; error?: string }> {
    const decoded = decodeToken(token);
    if (!decoded) return { ok: false, error: 'invalid token' };

    const supabase = getAdminClient();
    const now = new Date().toISOString();

    if (decoded.kind === 'subscriber') {
        const { error } = await supabase
            .from('newsletter_subscribers')
            .update({ is_active: false, unsubscribed_at: now })
            .eq('id', decoded.id);
        if (error) return { ok: false, error: error.message };
    } else {
        const { error } = await supabase
            .from('crm_people')
            .update({ do_not_email: true, updated_at: now })
            .eq('id', decoded.id);
        if (error) return { ok: false, error: error.message };

        // 접점 기록
        await supabase.from('crm_touchpoints').insert({
            person_id: decoded.id,
            type: 'unsubscribed',
            subject: '수신거부',
        });
    }
    return { ok: true };
}

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenone.biz';
    if (!token) return NextResponse.redirect(`${siteUrl}/unsubscribe?error=missing_token`);

    const result = await processUnsubscribe(token);
    if (!result.ok) {
        return NextResponse.redirect(`${siteUrl}/unsubscribe?error=${encodeURIComponent(result.error ?? 'unknown')}`);
    }
    return NextResponse.redirect(`${siteUrl}/unsubscribe?done=1`);
}

export async function POST(request: NextRequest) {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const token = params.get('token') || request.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    const result = await processUnsubscribe(token);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
}
