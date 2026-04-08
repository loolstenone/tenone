/**
 * GET  /api/newsletter/unsubscribe?token=xxx  — 링크 클릭 수신거부
 * POST /api/newsletter/unsubscribe             — One-Click List-Unsubscribe (RFC 8058)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function decodeToken(token: string): string | null {
  try {
    return Buffer.from(token, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return new NextResponse('잘못된 요청입니다.', { status: 400 });
  }

  const subscriberId = decodeToken(token);
  if (!subscriberId) {
    return new NextResponse('유효하지 않은 토큰입니다.', { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq('id', subscriberId);

  if (error) {
    return new NextResponse('수신거부 처리 중 오류가 발생했습니다.', { status: 500 });
  }

  // 수신거부 완료 페이지로 리디렉션
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenone.biz';
  return NextResponse.redirect(`${siteUrl}/unsubscribe/done`);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const params = new URLSearchParams(body);
  const token = params.get('token') || request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }

  const subscriberId = decodeToken(token);
  if (!subscriberId) {
    return NextResponse.json({ error: 'invalid token' }, { status: 400 });
  }

  const supabase = await createClient();
  await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq('id', subscriberId);

  return NextResponse.json({ ok: true });
}
