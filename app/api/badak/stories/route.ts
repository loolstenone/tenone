import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// GET: 스토리 목록 (published=true만 — 프론트용 / published 파라미터로 전체 조회 가능)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';

  let query = supabase
    .from('badak_stories')
    .select(`
      id, title, content, before_role, after_role, published, created_at,
      member:badak_members!badak_stories_member_id_fkey(id, display_name, avatar_url, job_function)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!all) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ stories: [] });
  return NextResponse.json({ stories: data || [] });
}

// POST: 스토리 생성 (관리자)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content, before_role, after_role, member_id, published } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: '제목을 입력해주세요' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('badak_stories')
    .insert({
      tenant_id: 'tenone',
      title: title.trim(),
      content: content?.trim() || null,
      before_role: before_role?.trim() || null,
      after_role: after_role?.trim() || null,
      member_id: member_id || null,
      published: published ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ story: data });
}

// PUT: 스토리 수정 (관리자)
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, title, content, before_role, after_role, member_id, published } = body;

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title.trim();
  if (content !== undefined) updates.content = content?.trim() || null;
  if (before_role !== undefined) updates.before_role = before_role?.trim() || null;
  if (after_role !== undefined) updates.after_role = after_role?.trim() || null;
  if (member_id !== undefined) updates.member_id = member_id || null;
  if (published !== undefined) updates.published = published;

  const { data, error } = await supabase
    .from('badak_stories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ story: data });
}

// DELETE: 스토리 삭제 (관리자)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabase.from('badak_stories').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deleted: true });
}
