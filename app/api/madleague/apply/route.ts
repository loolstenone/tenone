import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireMember } from '@/lib/api-guard';
import { verifyTurnstile, CAPTCHA_REQUIRED_ERROR } from '@/lib/turnstile-server';

export const runtime = 'nodejs';

/** 지원서 수집·이용 동의 문구 버전 — ApplyForm의 MAD_APPLY_CONSENT_VERSION과 같아야 한다 */
const CONSENT_VERSION = '2026-10-08.1';

interface Body {
  applicantRole?: string;
  activityRegion?: string;
  companyName?: string;
  clubSlug?: string;
  cohort?: number;
  activityYear?: number;
  name: string;
  phone?: string;
  university?: string;
  major?: string;
  minor?: string;
  industry?: string;
  jobFunction?: string;
  motivation?: string;
  portfolioUrl?: string;
  privacyConsent?: boolean;
  consentVersion?: string;
  captchaToken?: string;
}

const clip = (v: string | undefined, max: number) => v?.trim().slice(0, max) || null;

// POST — 매드리거 등록 신청. 로그인(Ten:One ID) 필수, 지원자 식별은 members.id (데이터 계약 1)
export async function POST(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;

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
  if (!auth.email) {
    return NextResponse.json({ error: '계정 이메일을 확인할 수 없습니다.' }, { status: 400 });
  }

  const applicantRole = body.applicantRole === 'club_leader' ? 'club_leader'
    : body.applicantRole === 'mentor' ? 'mentor'
    : body.applicantRole === 'corporate' ? 'corporate'
    : 'member';
  const isCorporate = applicantRole === 'corporate';

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (isCorporate ? !body.companyName?.trim() : (!body.clubSlug || !body.university?.trim())) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }

  const sb = createAdminClient();

  let clubId: string | null = null;
  if (!isCorporate) {
    const { data: club } = await sb.from('mad_clubs').select('id').eq('slug', body.clubSlug!).maybeSingle();
    if (!club) return NextResponse.json({ error: 'CLUB_NOT_FOUND' }, { status: 404 });
    clubId = club.id;
  }

  // 같은 동아리(기업은 기업 신청)에 심사 대기 중인 신청이 있으면 중복 접수하지 않는다
  let dup = sb.from('mad_applications').select('id').eq('member_id', auth.memberId).eq('status', 'pending').eq('applicant_role', applicantRole);
  dup = clubId ? dup.eq('club_id', clubId) : dup.is('club_id', null);
  const { data: existing } = await dup.limit(1).maybeSingle();
  if (existing) return NextResponse.json({ error: '이미 심사 대기 중인 신청이 있습니다.' }, { status: 409 });

  const currentYear = new Date().getFullYear();
  const activityYear = body.activityYear && body.activityYear >= 2021 && body.activityYear <= currentYear + 1 ? body.activityYear : null;
  const portfolioUrl = clip(body.portfolioUrl, 500);

  const { error } = await sb.from('mad_applications').insert({
    member_id: auth.memberId,
    club_id: clubId,
    applicant_role: applicantRole,
    activity_region: clip(body.activityRegion, 50),
    company_name: clip(body.companyName, 100),
    cohort: body.cohort && body.cohort > 0 && body.cohort < 100 ? body.cohort : null,
    activity_year: activityYear,
    year: activityYear ?? currentYear,
    name: body.name.trim().slice(0, 50),
    email: auth.email,
    phone: clip(body.phone, 30),
    university: isCorporate ? null : clip(body.university, 100),
    major: clip(body.major, 100),
    minor: clip(body.minor, 100),
    interested_industry: clip(body.industry, 100),
    interested_job: clip(body.jobFunction, 100),
    motivation: clip(body.motivation, 2000),
    portfolio_url: portfolioUrl && /^https?:\/\//i.test(portfolioUrl) ? portfolioUrl : null,
    consent: { privacy: true, version: CONSENT_VERSION, agreed_at: new Date().toISOString() },
    status: 'pending',
  });

  if (error) {
    console.error('[madleague/apply] insert failed', error);
    return NextResponse.json({ error: 'INSERT_FAILED' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
