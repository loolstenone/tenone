import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTurnstile, CAPTCHA_REQUIRED_ERROR } from '@/lib/turnstile-server';

export const runtime = 'nodejs';

/** 수집·이용 동의 문구 버전 — HeroForm의 HERO_APPLY_CONSENT_VERSION과 같아야 한다 */
const CONSENT_VERSION = '2026-10-07.1';

interface Body {
  name: string;
  email: string;
  phone?: string;
  interests?: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  message?: string;
  privacyConsent?: boolean;
  consentVersion?: string;
  captchaToken?: string;
}

// 공개 폼: Turnstile + 동의 확인 후 서버(service_role)에서만 INSERT — 테이블의 공개 INSERT 정책은 제거 (sql/security-open-insert-lockdown-3.sql)
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  if (!(await verifyTurnstile(body.captchaToken, req))) {
    return NextResponse.json({ error: CAPTCHA_REQUIRED_ERROR }, { status: 400 });
  }
  if (body.privacyConsent !== true || body.consentVersion !== CONSENT_VERSION) {
    return NextResponse.json({ error: '개인정보 수집·이용에 동의해야 신청할 수 있습니다.' }, { status: 400 });
  }
  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
  }

  // 로그인 상태면 계정 연결 (선택)
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  const { error } = await createAdminClient().from('mad_hero_applications').insert({
    user_id: user?.id ?? null,
    name: body.name.trim().slice(0, 100),
    email: body.email.trim().slice(0, 200),
    phone: body.phone?.trim().slice(0, 30) || null,
    interests: body.interests?.length ? body.interests.slice(0, 10) : null,
    resume_url: body.resumeUrl?.trim().slice(0, 500) || null,
    portfolio_url: body.portfolioUrl?.trim().slice(0, 500) || null,
    message: body.message?.trim().slice(0, 3000) || null,
    status: 'pending',
    consent: { privacy: true, version: CONSENT_VERSION, agreed_at: new Date().toISOString() },
  });

  if (error) {
    console.error('[madleague/hero] insert failed', error);
    return NextResponse.json({ error: 'INSERT_FAILED' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
