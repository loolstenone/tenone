/**
 * Gmail OAuth 콜백
 * GET /api/auth/gmail/callback?code=...
 *
 * Google에서 code를 받아 tokens로 교환 → DB에 저장.
 * mindle_sources에 뉴스레터 소스로 자동 등록.
 */
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, getProfile } from '@/lib/gmail/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const error = request.nextUrl.searchParams.get('error');

    if (error) {
        return new NextResponse(
            `<html><body><h2>Gmail 인증 실패</h2><p>${error}</p><a href="/intra/intel/wholesee/sources">돌아가기</a></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    }

    if (!code) {
        return new NextResponse(
            `<html><body><h2>인증 코드 없음</h2><a href="/intra/intel/wholesee/sources">돌아가기</a></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    }

    try {
        const redirectUri = `https://tenone.biz/api/auth/gmail/callback`;

        // code → tokens 교환
        const tokens = await exchangeCode(code, redirectUri);

        // 이메일 주소 확인
        const email = await getProfile(tokens);

        // DB에 저장 (upsert) — service_role로 RLS 우회
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        await supabase.from('gmail_oauth_tokens').upsert({
            email,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
            scope: 'https://www.googleapis.com/auth/gmail.readonly',
            is_active: true,
            label: `newsletter:${email}`,
            tenant_id: 'tenone',
            updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        // mindle_sources에 뉴스레터 소스 등록 (없으면)
        const { data: existing } = await supabase
            .from('mindle_sources')
            .select('id')
            .eq('url', `mailto:${email}`)
            .limit(1);

        if (!existing || existing.length === 0) {
            await supabase.from('mindle_sources').insert({
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

        return new NextResponse(
            `<html><body style="font-family:sans-serif;padding:40px;text-align:center">
                <h2>Gmail 연결 완료</h2>
                <p><strong>${email}</strong> 계정이 Mindle 뉴스레터 수집에 연결되었습니다.</p>
                <p style="color:#888;margin-top:20px">이제 Cron이 자동으로 뉴스레터를 수집합니다.</p>
                <a href="/intra/intel/wholesee/sources" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#111;color:#fff;text-decoration:none">RSS 소스 관리로 돌아가기</a>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    } catch (e) {
        console.error('[Gmail OAuth] 오류:', e);
        return new NextResponse(
            `<html><body><h2>Gmail 인증 오류</h2><p>${e instanceof Error ? e.message : 'Unknown error'}</p><a href="/intra/intel/wholesee/sources">돌아가기</a></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    }
}
