import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ id: string }>;
}

// POST — toggle like on a community post
export async function POST(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  const memberId = (member as { id: string }).id;

  const { data: existing } = await sb
    .from('mad_post_likes')
    .select('id')
    .eq('post_id', id)
    .eq('member_id', memberId)
    .maybeSingle();

  if (existing) {
    await sb.from('mad_post_likes').delete().eq('id', (existing as { id: string }).id);
    return NextResponse.json({ ok: true, liked: false });
  }

  const { error } = await sb.from('mad_post_likes').insert({ post_id: id, member_id: memberId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, liked: true });
}

// GET — 현재 사용자가 이 글을 좋아요했는지
export async function GET(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ liked: false });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ liked: false });

  const { data } = await sb
    .from('mad_post_likes')
    .select('id')
    .eq('post_id', id)
    .eq('member_id', (member as { id: string }).id)
    .maybeSingle();

  return NextResponse.json({ liked: !!data });
}
