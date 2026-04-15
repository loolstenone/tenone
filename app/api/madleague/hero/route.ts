import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface Body {
  name: string;
  email: string;
  phone?: string;
  interests?: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  message?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
  }

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  const { error } = await sb.from('mad_hero_applications').insert({
    user_id: user?.id ?? null,
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone?.trim() || null,
    interests: body.interests?.length ? body.interests : null,
    resume_url: body.resumeUrl?.trim() || null,
    portfolio_url: body.portfolioUrl?.trim() || null,
    message: body.message?.trim() || null,
    status: 'pending',
  });

  if (error) {
    console.error('[madleague/hero] insert failed', error);
    return NextResponse.json({ error: 'INSERT_FAILED' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
