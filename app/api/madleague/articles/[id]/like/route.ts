import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ id: string }>;
}

// POST — toggle like
export async function POST(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  const memberId = (member as { id: string }).id;

  const { data: existing } = await sb.from('mad_article_likes')
    .select('id').eq('article_id', id).eq('member_id', memberId).maybeSingle();

  if (existing) {
    await sb.from('mad_article_likes').delete().eq('id', (existing as { id: string }).id);
    return NextResponse.json({ ok: true, liked: false });
  }

  const { error } = await sb.from('mad_article_likes').insert({ article_id: id, member_id: memberId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, liked: true });
}
