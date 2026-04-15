import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// GET — 현재 로그인한 사용자의 발급 가능 + 이미 발급된 인증서 목록
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  const admin = adminClient();
  const [eligibleRes, issuedRes] = await Promise.all([
    admin.rpc('mad_eligible_certificates', { p_member_id: member.id }),
    admin.from('mad_certificates').select('*').eq('member_id', member.id).eq('revoked', false).order('issued_at', { ascending: false }),
  ]);

  return NextResponse.json({
    eligible: eligibleRes.data ?? [],
    issued: issuedRes.data ?? [],
  });
}

// POST { type, details } — 특정 인증서 발급
export async function POST(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  let body: { type?: string; title?: string; details?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }
  if (!body.type || !body.title || !body.details) return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  if (!['activity', 'competition', 'award', 'crown'].includes(body.type)) {
    return NextResponse.json({ error: 'INVALID_TYPE' }, { status: 400 });
  }

  const admin = adminClient();

  // 발급 가능 여부 서버사이드 재확인
  const { data: eligible } = await admin.rpc('mad_eligible_certificates', { p_member_id: member.id });
  const match = (eligible ?? []).find((e: { cert_type: string; cert_details: Record<string, unknown>; already_issued: boolean }) =>
    e.cert_type === body.type &&
    !e.already_issued &&
    JSON.stringify(e.cert_details) === JSON.stringify(body.details)
  );
  if (!match) return NextResponse.json({ error: 'NOT_ELIGIBLE' }, { status: 403 });

  // 고유 코드 생성 (최대 5회 시도)
  let code: string | null = null;
  for (let i = 0; i < 5; i++) {
    const { data: codeData } = await admin.rpc('mad_gen_cert_code');
    if (!codeData) continue;
    const { data: exists } = await admin.from('mad_certificates').select('id').eq('verification_code', codeData).maybeSingle();
    if (!exists) { code = codeData; break; }
  }
  if (!code) return NextResponse.json({ error: 'CODE_GEN_FAILED' }, { status: 500 });

  const { data, error } = await admin
    .from('mad_certificates')
    .insert({
      member_id: member.id,
      type: body.type,
      title: body.title,
      details: body.details,
      verification_code: code,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, certificate: data });
}
