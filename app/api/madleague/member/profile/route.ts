import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// PATCH — 본인 프로필 업데이트 (bio, skill_tags, portfolio_public, avatar_url, phone, major, year_in_school, university)
export async function PATCH(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  let body: {
    bio?: string;
    skill_tags?: string[];
    portfolio_public?: boolean;
    avatar_url?: string;
    phone?: string;
    major?: string;
    year_in_school?: number;
    university?: string;
  };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const update: Record<string, unknown> = {};
  if (typeof body.bio === 'string') update.bio = body.bio.slice(0, 500);
  if (Array.isArray(body.skill_tags)) update.skill_tags = body.skill_tags.slice(0, 20).map(t => String(t).trim().slice(0, 30)).filter(Boolean);
  if (typeof body.portfolio_public === 'boolean') update.portfolio_public = body.portfolio_public;
  if (typeof body.avatar_url === 'string') update.avatar_url = body.avatar_url.slice(0, 500) || null;
  if (typeof body.phone === 'string') update.phone = body.phone.slice(0, 30) || null;
  if (typeof body.major === 'string') update.major = body.major.slice(0, 100) || null;
  if (typeof body.year_in_school === 'number' && body.year_in_school > 0 && body.year_in_school < 10) update.year_in_school = body.year_in_school;
  if (typeof body.university === 'string') update.university = body.university.slice(0, 100) || null;

  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'NO_FIELDS' }, { status: 400 });

  const { error } = await sb.from('mad_members').update(update).eq('id', (member as { id: string }).id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
