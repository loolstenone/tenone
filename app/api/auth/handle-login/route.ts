import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/auth/handle-login — 핸들 ID + 비밀번호 로그인
 * Body: { handle, password, captchaToken }
 * Response: { session: { access_token, refresh_token } }  → 브라우저가 supabase.auth.setSession
 *
 * 이메일은 서버 안에서만 쓰고 응답에 싣지 않는다 (예전: 핸들만 보내면 누구에게나 이메일을 돌려줌 — 점검 축3 · 로드맵 "핸들→이메일 공개 API").
 * 세션은 비밀번호를 맞힌 본인에게만 돌아간다. 없는 핸들·틀린 비밀번호는 같은 오류 (핸들 존재 여부를 따로 알려주지 않음).
 * 캡차는 Supabase Bot Protection이 signInWithPassword에서 검증한다.
 */
const INVALID = '핸들 또는 비밀번호가 올바르지 않습니다.';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({})) as { handle?: unknown; password?: unknown; captchaToken?: unknown };
    const handle = typeof body.handle === 'string' ? body.handle.replace(/^@/, '').toLowerCase().trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : undefined;

    if (handle.length < 3 || !password) {
        return NextResponse.json({ error: '핸들과 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    // get_email_by_handle은 service_role 전용 (sql/security-definer-rpc-lockdown.sql)
    const { data: email } = await createAdminClient().rpc('get_email_by_handle', { p_handle: handle });
    if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    // 세션을 저장하지 않는 일회용 클라이언트로 로그인 → 토큰만 본인에게 전달
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await sb.auth.signInWithPassword({ email, password, options: { captchaToken } });

    if (error || !data.session) {
        const msg = error?.message ?? '';
        if (msg.includes('Email not confirmed')) {
            return NextResponse.json({ error: '이메일 인증이 필요합니다. 가입 시 받은 인증 메일을 확인해주세요.' }, { status: 401 });
        }
        if (msg.toLowerCase().includes('captcha')) {
            return NextResponse.json({ error: '보안 확인에 실패했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.' }, { status: 400 });
        }
        return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    createAdminClient().from('members').update({ last_login_at: new Date().toISOString() })
        .eq('auth_id', data.user.id).then(() => {});

    return NextResponse.json({
        session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token },
    }, { headers: { 'Cache-Control': 'no-store' } });
}
