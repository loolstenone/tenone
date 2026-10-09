import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireMember } from '@/lib/api-guard';
import { verifyTurnstile, CAPTCHA_REQUIRED_ERROR } from '@/lib/turnstile-server';
import { PT_CERT_CONSENT_VERSION } from '@/features/madleague/pt-certificate-consent';
import { LEDGER_NOTE, hasMadRegistration, linkLedgerByRegistration } from '@/lib/programs/ledger-match';

export const runtime = 'nodejs';

const NOT_FOUND = '입력한 정보와 일치하는 인증서가 없습니다. 이름·생년월일·대학을 참가 신청 때와 같게 입력했는지 확인해 주세요.';
const TAKEN = '이 인증서는 이미 다른 계정에 연결되어 있습니다. 본인이라면 매드리거 등록 후 "등록 정보로 찾기"를 누르거나 문의하기로 알려 주세요.';

/** 대학 표기 차이 흡수 — 공백·'대학교'/'대' (고려대학교 세종캠퍼스 ↔ 고려대, 국민대 ↔ 국민대학교) */
const normUniv = (s: string) => s.replace(/\s+/g, '').replace(/대학교/g, '대').toLowerCase();
const univMatch = (input: string, stored: string | null) => {
  if (!stored) return false;
  const a = normUniv(input), b = normUniv(stored);
  return a.length >= 2 && (a === b || b.startsWith(a) || a.startsWith(b));
};

type Snap = { name: string; birthdate: string | null; university: string | null; major: string | null; group_name: string | null; cohort: string | null; client_name: string | null; round_title: string | null; year: number | null };
type Row = { id: string; member_id: string | null; linked_by: string | null; code: string; type: string; result: string | null; issued_at: string; snapshot: Snap };

const toDoc = (c: Row) => ({
  code: c.code, type: c.type, result: c.result, issued_at: c.issued_at,
  name: c.snapshot.name, birthdate: c.snapshot.birthdate, university: c.snapshot.university, major: c.snapshot.major,
  club: c.snapshot.group_name, cohort: c.snapshot.cohort, client: c.snapshot.client_name, title: c.snapshot.round_title ?? '경쟁 PT', year: c.snapshot.year,
});

const base = () => createAdminClient().from('program_certificates')
  .select('id, member_id, linked_by, code, type, result, issued_at, snapshot')
  .eq('brand_id', 'madleague').eq('note', LEDGER_NOTE).is('revoked_at', null);

/** GET — 내 계정의 경쟁 PT 인증서 + 매드리거 등록 여부 (등록 정보로 찾기 버튼 노출용) */
export async function GET(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;
  const [registered, { data, error }] = await Promise.all([hasMadRegistration(auth.memberId), base().eq('member_id', auth.memberId).order('issued_at')]);
  if (error) return NextResponse.json({ error: '조회하지 못했습니다.' }, { status: 500 });
  return NextResponse.json({ certificates: ((data ?? []) as Row[]).map(toDoc), registered });
}

/** MADLeague 이용 동의 — 가입 기록이 없을 때만 새로 (기존 가입 경로·동의는 보존) */
async function recordCertJoin(memberId: string) {
  const admin = createAdminClient();
  const { data: join } = await admin.from('member_brand_joins').select('member_id').eq('member_id', memberId).eq('brand_id', 'madleague').maybeSingle();
  if (join) return;
  const { error } = await admin.from('member_brand_joins').insert({
    member_id: memberId, brand_id: 'madleague', origin: 'certificate', status: 'active', terms_version: PT_CERT_CONSENT_VERSION, terms_agreed_at: new Date().toISOString(),
  });
  if (error) console.error('[madleague/certificates/find] join', error);
}

async function mine(memberId: string, linked: number) {
  const { data } = await base().eq('member_id', memberId).order('issued_at');
  return NextResponse.json({ certificates: ((data ?? []) as Row[]).map(toDoc), linked });
}

/**
 * POST { mode: 'registration', agree: true } — 매드리거 등록 정보(이름+전화번호)로 찾기 · 등록자 우선권 (직접 확인 연결도 넘겨받음)
 *   등록 정보는 회원 활동 목적으로 받았으므로 인증서 찾기에 쓰려면 이 동의가 필요하다 (개인정보보호법 제18조)
 * POST { name, birthdate(YYYY-MM-DD), university, agree: true, captchaToken } — 직접 확인
 * 경쟁 PT 인증서 받기 = 로그인 유도 (2026-10-09 사용자 결정). 본인 확인 → 내 계정에 연결(member_id) → 이후 로그인만 하면 바로
 * 이름·생년월일 정확히 + 대학 일치. 어느 항목이 틀렸는지 알려주지 않는다 (추측 방지)
 * 연결과 함께 MADLeague 이용 동의를 member_brand_joins에 기록 (데이터 계약 4조)
 */
export async function POST(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json().catch(() => ({}));
  if (body.agree !== true) return NextResponse.json({ error: '필수 동의가 필요합니다.' }, { status: 400 });

  if (body.mode === 'registration') {
    const linked = await linkLedgerByRegistration(auth.memberId);
    if (linked > 0) await recordCertJoin(auth.memberId);
    return mine(auth.memberId, linked);
  }

  if (!(await verifyTurnstile(body.captchaToken, req))) return NextResponse.json({ error: CAPTCHA_REQUIRED_ERROR }, { status: 400 });

  const name = String(body.name ?? '').replace(/\s+/g, '');
  const birthdate = String(body.birthdate ?? '');
  const university = String(body.university ?? '').trim();
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate) || university.length < 2) {
    return NextResponse.json({ error: '이름·생년월일·대학을 모두 입력해 주세요.' }, { status: 400 });
  }

  const { data, error } = await base().eq('snapshot->>name', name).eq('snapshot->>birthdate', birthdate);
  if (error) {
    console.error('[madleague/certificates/find]', error);
    return NextResponse.json({ error: '조회하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
  }
  const matched = ((data ?? []) as Row[]).filter(c => univMatch(university, c.snapshot.university));
  if (matched.length === 0) return NextResponse.json({ error: NOT_FOUND }, { status: 404 });

  // 매드리거 등록 정보로 이미 다른 계정에 연결된 것은 넘보지 않는다 (등록자 우선권). 직접 확인 연결은 먼저 한 계정
  const free = matched.filter(c => !c.member_id);
  if (free.length === 0 && !matched.some(c => c.member_id === auth.memberId)) return NextResponse.json({ error: TAKEN }, { status: 409 });

  if (free.length > 0) {
    await recordCertJoin(auth.memberId);
    // 동시에 다른 계정이 연결하지 못하게 member_id IS NULL 조건으로만
    const { error: uErr } = await createAdminClient().from('program_certificates').update({ member_id: auth.memberId, linked_by: 'manual' })
      .in('id', free.map(c => c.id)).is('member_id', null);
    if (uErr) return NextResponse.json({ error: '연결하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
  }
  return mine(auth.memberId, free.length);
}
