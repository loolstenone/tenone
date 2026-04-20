/**
 * GET /api/newsletter/confirm?token=xxx
 * 구독 확인 링크 클릭 시 is_active = true 처리
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenone.biz';

function decodeToken(token: string): string | null {
    try {
        return Buffer.from(token, 'base64url').toString('utf8');
    } catch {
        return null;
    }
}

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
        return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?error=invalid`);
    }

    const subscriberId = decodeToken(token);
    if (!subscriberId) {
        return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?error=invalid`);
    }

    const supabase = getAdminClient();
    const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: true, confirmed_at: new Date().toISOString() })
        .eq('id', subscriberId);

    if (error) {
        return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?error=server`);
    }

    return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed`);
}
