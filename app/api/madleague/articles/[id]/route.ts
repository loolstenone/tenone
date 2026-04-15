import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ id: string }>;
}

// PATCH — 본인 draft 수정 또는 제출(pending_review)
export async function PATCH(req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  const { data: article } = await sb.from('mad_articles').select('author_id, status').eq('id', id).maybeSingle();
  if (!article) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if ((article as { author_id: string }).author_id !== (member as { id: string }).id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }
  if (!['draft', 'rejected'].includes((article as { status: string }).status)) {
    return NextResponse.json({ error: 'NOT_EDITABLE' }, { status: 403 });
  }

  let body: { title?: string; subtitle?: string; content?: string; category?: string; tags?: string[]; thumbnail_url?: string; action?: 'draft' | 'submit' };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title) update.title = body.title.trim().slice(0, 200);
  if (body.subtitle !== undefined) update.subtitle = body.subtitle.trim().slice(0, 300) || null;
  if (body.content) update.content = body.content.trim().slice(0, 50000);
  if (body.category && ['interview', 'case', 'report', 'cover', 'news'].includes(body.category)) update.category = body.category;
  if (body.tags !== undefined) update.tags = Array.isArray(body.tags) ? body.tags.slice(0, 10).map(t => String(t).trim().slice(0, 30)).filter(Boolean) : null;
  if (body.thumbnail_url !== undefined) update.thumbnail_url = body.thumbnail_url?.trim() || null;
  if (body.action === 'submit') update.status = 'pending_review';

  const { error } = await sb.from('mad_articles').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — 본인 draft 삭제
export async function DELETE(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  const { data: article } = await sb.from('mad_articles').select('author_id, status').eq('id', id).maybeSingle();
  if (!article) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if ((article as { author_id: string; status: string }).author_id !== (member as { id: string }).id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { error } = await sb.from('mad_articles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
