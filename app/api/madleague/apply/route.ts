import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface Body {
  clubSlug: string;
  name: string;
  email: string;
  phone?: string;
  university: string;
  major?: string;
  yearInSchool?: number;
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

  if (!body.clubSlug || !body.name || !body.email || !body.university) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
  }

  const sb = await createClient();
  const { data: club } = await sb.from('mad_clubs').select('id').eq('slug', body.clubSlug).maybeSingle();
  if (!club) {
    return NextResponse.json({ error: 'CLUB_NOT_FOUND' }, { status: 404 });
  }

  const year = new Date().getFullYear();

  const { error } = await sb.from('mad_applications').insert({
    club_id: club.id,
    year,
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone?.trim() || null,
    university: body.university.trim(),
    major: body.major?.trim() || null,
    year_in_school: body.yearInSchool ?? null,
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
