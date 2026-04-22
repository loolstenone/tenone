import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface Body {
  applicantRole?: string;
  activityRegion?: string;
  companyName?: string;
  clubSlug: string;
  cohort?: number;
  activityYear?: number;
  name: string;
  email: string;
  phone?: string;
  university: string;
  major?: string;
  minor?: string;
  industry?: string;
  jobFunction?: string;
  motivation?: string;
  portfolioUrl?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const isCorporate = body.applicantRole === 'corporate';

  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (!isCorporate && (!body.clubSlug || !body.university)) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
  }

  const sb = await createClient();

  let clubId: string | null = null;
  if (!isCorporate && body.clubSlug) {
    const { data: club } = await sb.from('mad_clubs').select('id').eq('slug', body.clubSlug).maybeSingle();
    if (!club) return NextResponse.json({ error: 'CLUB_NOT_FOUND' }, { status: 404 });
    clubId = club.id;
  }

  const applicantRole = body.applicantRole === 'club_leader' ? 'club_leader'
    : body.applicantRole === 'mentor' ? 'mentor'
    : body.applicantRole === 'corporate' ? 'corporate'
    : 'member';

  const { error } = await sb.from('mad_applications').insert({
    club_id: clubId,
    applicant_role: applicantRole,
    activity_region: body.activityRegion?.trim() || null,
    company_name: body.companyName?.trim() || null,
    cohort: body.cohort ?? null,
    activity_year: body.activityYear ?? null,
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone?.trim() || null,
    university: body.university?.trim() || null,
    major: body.major?.trim() || null,
    minor: body.minor?.trim() || null,
    interested_industry: body.industry?.trim() || null,
    interested_job: body.jobFunction?.trim() || null,
    motivation: body.motivation?.trim() || null,
    portfolio_url: body.portfolioUrl?.trim() || null,
    status: 'pending',
  });

  if (error) {
    console.error('[madleague/apply] insert failed', error);
    return NextResponse.json({ error: 'INSERT_FAILED' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
