import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { getAllExternalDomains } from '@/lib/domain-registry';

/**
 * SSO Initiate — tenone.biz 에서 호출
 *
 * 흐름:
 * 1. 타 도메인(smarcomm.biz 등)의 로그인 페이지가 여기로 리다이렉트
 * 2. .tenone.biz 쿠키에서 세션 확인
 * 3. 세션 있으면 → 일회성 토큰 생성 → 타 도메인의 /api/sso/exchange로 리다이렉트
 * 4. 세션 없으면 → tenone.biz 로그인 페이지로 (로그인 후 다시 여기로)
 *
 * Query params:
 *   origin: 타 도메인 origin (https://smarcomm.biz)
 *   final: 최종 리다이렉트 경로 (/dashboard)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');   // https://smarcomm.biz
    const final_path = searchParams.get('final') || '/';

    // origin 필수 + 안전한 URL인지 검증
    if (!origin || !origin.startsWith('https://')) {
        return NextResponse.json({ error: 'Missing or invalid origin' }, { status: 400 });
    }

    // 허용된 도메인 — domain-registry에서 자동 파생 (수동 관리 불필요)
    const allowedDomains = getAllExternalDomains();
    const originHost = new URL(origin).hostname;
    if (!allowedDomains.includes(originHost)) {
        return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    // .tenone.biz 쿠키에서 Supabase 세션 읽기
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll() { /* read-only */ },
            },
            auth: { storageKey: 'tenone-auth' },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // 세션 없음 → tenone.biz 로그인 페이지로 (로그인 후 다��� 여기로 돌아오도록)
        const currentUrl = request.url;
        const loginUrl = new URL('https://tenone.biz/login');
        loginUrl.searchParams.set('redirect', currentUrl);
        return NextResponse.redirect(loginUrl);
    }

    // 세션 있음 → 일회성 SSO 토큰 생성
    const token = randomBytes(32).toString('hex');

    // service_role 키로 sso_tokens 테이블에 INSERT (RLS 우회)
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await adminClient.from('sso_tokens').insert({
        token,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        redirect_to: origin,
        final_path,
    });

    if (error) {
        console.error('[SSO] Token insert error:', error);
        return NextResponse.json({ error: 'SSO token creation failed' }, { status: 500 });
    }

    // 타 도메인의 exchange 엔드포인트로 리다���렉트
    const exchangeUrl = new URL(`${origin}/api/sso/exchange`);
    exchangeUrl.searchParams.set('token', token);
    exchangeUrl.searchParams.set('final', final_path);

    return NextResponse.redirect(exchangeUrl);
}
