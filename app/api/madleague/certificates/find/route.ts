import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTurnstile, CAPTCHA_REQUIRED_ERROR } from '@/lib/turnstile-server';

export const runtime = 'nodejs';

const NOT_FOUND = '입력한 정보와 일치하는 인증서가 없습니다. 이름·생년월일·대학을 참가 신청 때와 같게 입력했는지 확인해 주세요.';

/** 대학 표기 차이 흡수 — 공백·'학교' 제거 (고려대학교 세종캠퍼스 ↔ 고려대, 국민대 ↔ 국민대학교) */
const normUniv = (s: string) => s.replace(/\s+/g, '').replace(/대학교/g, '대').toLowerCase();
const univMatch = (input: string, stored: string | null) => {
  if (!stored) return false;
  const a = normUniv(input), b = normUniv(stored);
  return a.length >= 2 && (a === b || b.startsWith(a) || a.startsWith(b));
};

/**
 * POST { name, birthdate(YYYY-MM-DD), university, captchaToken }
 * MADLeague 경쟁 PT 인증서 본인 조회 — 계정 없이 (수료증 관리 대장 기반, 2026-10-09)
 * 이름·생년월일 정확히 + 대학 일치해야 한다. 어느 항목이 틀렸는지는 알려주지 않는다 (추측 방지)
 * 응답은 본인 인증서 이미지에 들어가는 항목만 — 전화번호 등은 저장하지도 않음
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(body.captchaToken, req))) return NextResponse.json({ error: CAPTCHA_REQUIRED_ERROR }, { status: 400 });

  const name = String(body.name ?? '').replace(/\s+/g, '');
  const birthdate = String(body.birthdate ?? '');
  const university = String(body.university ?? '').trim();
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate) || university.length < 2) {
    return NextResponse.json({ error: '이름·생년월일·대학을 모두 입력해 주세요.' }, { status: 400 });
  }

  const { data, error } = await createAdminClient().from('program_certificates')
    .select('code, type, result, issued_at, snapshot')
    .eq('brand_id', 'madleague').in('type', ['participation', 'award']).is('revoked_at', null)
    .eq('snapshot->>name', name).eq('snapshot->>birthdate', birthdate)
    .order('issued_at', { ascending: true });
  if (error) {
    console.error('[madleague/certificates/find]', error);
    return NextResponse.json({ error: '조회하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
  }

  type Snap = { name: string; birthdate: string | null; university: string | null; major: string | null; group_name: string | null; cohort: string | null; client_name: string | null; round_title: string | null; year: number | null };
  const certificates = (data ?? [])
    .filter(c => univMatch(university, (c.snapshot as Snap).university))
    .map(c => {
      const s = c.snapshot as Snap;
      return {
        code: c.code, type: c.type, result: c.result, issued_at: c.issued_at,
        name: s.name, birthdate: s.birthdate, university: s.university, major: s.major,
        club: s.group_name, cohort: s.cohort, client: s.client_name, title: s.round_title ?? '경쟁 PT', year: s.year,
      };
    });
  if (certificates.length === 0) return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  return NextResponse.json({ certificates });
}
