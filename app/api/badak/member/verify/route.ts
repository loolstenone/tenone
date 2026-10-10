import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireUser } from '@/lib/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';

/*
 * Badak 프로필 변경 인증 코드 (2026-10-11 보안 수리)
 *   - 대상 이메일·사용자 ID는 세션에서만 — 요청 body의 email·userId는 받지 않는다 (남의 계정으로 메일 발송·코드 검증 차단)
 *   - 실패 5회면 코드 무효화 (badak_verify_codes.attempts) · 10분 만료 · 재발송 60초 간격
 */

const resend = new Resend(process.env.RESEND_API_KEY);
const MAX_ATTEMPTS = 5;
const RESEND_INTERVAL_MS = 60 * 1000;

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

// POST: 인증 코드 발송 (세션 이메일로만)
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth instanceof NextResponse) return auth;
  const email = auth.email;
  const userId = auth.user.id;
  if (!email) return NextResponse.json({ error: '계정에 이메일이 없습니다.' }, { status: 400 });

  try {
    const supabase = createAdminClient();

    // 재발송 간격
    const { data: recent } = await supabase
      .from('badak_verify_codes')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recent && Date.now() - new Date(recent.created_at).getTime() < RESEND_INTERVAL_MS) {
      return NextResponse.json({ error: '잠시 후 다시 요청해주세요.' }, { status: 429 });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10분

    // 기존 코드 무효화 + 새 코드 저장
    await supabase.from('badak_verify_codes').update({ used: true }).eq('user_id', userId).eq('used', false);
    const { error: insertErr } = await supabase
      .from('badak_verify_codes')
      .insert({ user_id: userId, email, code, expires_at: expiresAt, used: false, attempts: 0 });
    if (insertErr) {
      console.error('[Badak Verify] DB insert error:', insertErr);
      return NextResponse.json({ error: '인증 코드 저장 실패' }, { status: 500 });
    }

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

// PUT: 인증 코드 검증 (세션 사용자의 코드만)
export async function PUT(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user.id;

  try {
    const body = await req.json().catch(() => ({}));
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: '6자리 인증 코드를 입력해주세요.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: current } = await supabase
      .from('badak_verify_codes')
      .select('id, code, attempts')
      .eq('user_id', userId)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!current) {
      return NextResponse.json({ error: '인증 코드가 만료되었습니다. 다시 요청해주세요.' }, { status: 400 });
    }

    if (current.code !== code) {
      const attempts = (current.attempts ?? 0) + 1;
      // 실패 횟수 초과 → 코드 폐기
      await supabase
        .from('badak_verify_codes')
        .update(attempts >= MAX_ATTEMPTS ? { attempts, used: true } : { attempts })
        .eq('id', current.id);
      return NextResponse.json(
        { error: attempts >= MAX_ATTEMPTS ? '실패 횟수를 초과했습니다. 코드를 다시 요청해주세요.' : '인증 코드가 올바르지 않습니다.' },
        { status: 400 },
      );
    }

    await supabase.from('badak_verify_codes').update({ used: true }).eq('id', current.id);
    return NextResponse.json({ success: true, verified: true });
  } catch (err) {
    console.error('[Badak Verify] Unexpected error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
