import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#1a1a2e;padding:28px 32px;">
      <h1 style="margin:0;font-size:18px;color:#ffd93d;font-weight:700;">Badak</h1>
    </td></tr>
    <tr><td style="padding:32px;">
      <p style="margin:0 0 8px;font-size:14px;color:#333;">프로필 변경 인증 코드</p>
      <p style="margin:0 0 24px;font-size:13px;color:#888;">아래 인증 코드를 입력해주세요.</p>
      <div style="background:#f8f8f8;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
        <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#1a1a2e;">${code}</span>
      </div>
      <p style="margin:0;font-size:11px;color:#aaa;">이 코드는 10분간 유효합니다. 본인이 요청하지 않았다면 무시해주세요.</p>
    </td></tr>
    <tr><td style="background:#f9f9f9;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#bbb;">Badak · Powered by Ten:One™ Universe</p>
    </td></tr>
  </table>
</body></html>`;
}

// POST: 인증 코드 발송
export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json();
    if (!email || !userId) {
      return NextResponse.json({ error: '이메일과 사용자 ID가 필요합니다.' }, { status: 400 });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10분

    const supabase = getAdminClient();

    // 기존 코드 무효화 + 새 코드 저장
    await supabase
      .from('badak_verify_codes')
      .update({ used: true })
      .eq('user_id', userId)
      .eq('used', false);

    const { error: insertErr } = await supabase
      .from('badak_verify_codes')
      .insert({ user_id: userId, email, code, expires_at: expiresAt, used: false });

    if (insertErr) {
      console.error('[Badak Verify] DB insert error:', insertErr);
      return NextResponse.json({ error: '인증 코드 저장 실패' }, { status: 500 });
    }

    // 이메일 발송
    const { error: emailErr } = await resend.emails.send({
      from: 'Badak <noreply@tenone.biz>',
      to: email,
      subject: '[Badak] 프로필 변경 인증 코드',
      html: buildEmailHtml(code),
    });

    if (emailErr) {
      console.error('[Badak Verify] Email send error:', emailErr);
      return NextResponse.json({ error: '이메일 발송 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Badak Verify] Unexpected error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// PUT: 인증 코드 검증
export async function PUT(req: NextRequest) {
  try {
    const { userId, code } = await req.json();
    if (!userId || !code) {
      return NextResponse.json({ error: '사용자 ID와 인증 코드가 필요합니다.' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('badak_verify_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: '인증 코드가 올바르지 않거나 만료되었습니다.' }, { status: 400 });
    }

    // 코드 사용 처리
    await supabase
      .from('badak_verify_codes')
      .update({ used: true })
      .eq('id', data.id);

    return NextResponse.json({ success: true, verified: true });
  } catch (err) {
    console.error('[Badak Verify] Unexpected error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
