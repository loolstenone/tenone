/**
 * Gmail OAuth 콜백 — 직원 전용
 * GET /api/auth/gmail/callback?code=...&state=...
 *
 * state 확인 → code를 토큰으로 교환 → DB 저장(service_role) → mindle_sources에 뉴스레터 소스 등록(없으면)
 * → 인트라 뉴스레터 화면으로 돌아간다 (?gmail=connected|error). 화면에 외부 입력을 그대로 그리지 않는다.
 */
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, getProfile, GMAIL_REDIRECT_URI, GMAIL_STATE_COOKIE } from '@/lib/gmail/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/api-guard';
import { getCookieDomain } from '@/lib/domain-registry';

const RETURN_PATH = '/intra/intel/wholesee/newsletter';

function back(request: NextRequest, result: 'connected' | 'error', reason?: string) {
    const url = new URL(RETURN_PATH, 'https://intra.tenone.biz');
    if (process.env.VERCEL_ENV !== 'production') url.host = request.nextUrl.host;
    url.searchParams.set('gmail', result);
    if (reason) url.searchParams.set('reason', reason);
    const res = NextResponse.redirect(url);
    res.cookies.set(GMAIL_STATE_COOKIE, '', { path: '/api/auth/gmail', maxAge: 0, domain: getCookieDomain(request.nextUrl.hostname) });
    return res;
}

export async function GET(request: NextRequest) {
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;

    const sp = request.nextUrl.searchParams;
    const state = sp.get('state');
    if (!state || state !== request.cookies.get(GMAIL_STATE_COOKIE)?.value) return back(request, 'error', 'state');
    if (sp.get('error')) return back(request, 'error', 'denied');
    const code = sp.get('code');
    if (!code) return back(request, 'error', 'code');

    try {
        const tokens = await exchangeCode(code, GMAIL_REDIRECT_URI);
        // prompt=consent라 항상 오지만, 없으면 다음 갱신 때 끊긴다 → 실패로 처리
        if (!tokens.refresh_token) return back(request, 'error', 'no_refresh_token');
        const email = await getProfile(tokens);

        const admin = createAdminClient();
        const { error } = await admin.from('gmail_oauth_tokens').upsert({
            email,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
            scope: 'https://www.googleapis.com/auth/gmail.readonly',
            is_active: true,
            label: `newsletter:${email}`,
            tenant_id: 'tenone',
            needs_reconnect: false,
            last_error: null,
            last_error_at: null,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
        if (error) throw error;

        const { data: existing } = await admin.from('mindle_sources').select('id').eq('url', `mailto:${email}`).limit(1);
        if (!existing?.length) {
            await admin.from('mindle_sources').insert({
                name: `${email} 뉴스레터`,
                url: `mailto:${email}`,
                source_type: 'newsletter',
                category: 'general',
                is_active: true,
                crawl_interval_hours: 24,
                tenant_id: 'tenone',
                notes: 'Gmail OAuth 자동 등록',
            });
        }
        return back(request, 'connected');
    } catch (e) {
        console.error('[Gmail OAuth] 오류:', e);
        return back(request, 'error', 'exchange');
    }
}
