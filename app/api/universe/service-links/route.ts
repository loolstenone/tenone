import { NextRequest, NextResponse } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { grantServiceLink, listActiveServiceLinks, revokeServiceLink } from '@/lib/service-links-server';

export const runtime = 'nodejs';

// 서비스 간 연계 동의 — 본인 것만 (memberId는 세션에서, body 값은 쓰지 않는다)
// GET                         → { links: [{ scope, consent_version, granted_at }] }
// POST { scope, agree: true } → 동의
// DELETE { scope }            → 철회
export async function GET(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json({ links: await listActiveServiceLinks(auth.memberId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json().catch(() => ({}));
  if (body.agree !== true) return NextResponse.json({ error: '동의가 필요합니다.' }, { status: 400 });
  const { error } = await grantServiceLink(auth.memberId, String(body.scope ?? ''));
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json().catch(() => ({}));
  const { error } = await revokeServiceLink(auth.memberId, String(body.scope ?? ''));
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
