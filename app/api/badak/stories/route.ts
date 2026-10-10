import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { earnUC } from '@/lib/supabase/uc';
import { requireMember, requireStaff } from '@/lib/api-guard';

/*
 * Badak 성장 스토리 (2026-10-11 보안 수리)
 *   - 회원 제출: 세션 회원의 badak_members로만 연결, published=false 고정 (body member_id·published 불신)
 *   - 수정·삭제·전체(미공개 포함) 조회: 직원만
 */

const supabase = createAdminClient();

const STORY_SELECT = `
  id, title, content, before_role, after_role, published, created_at,
  member:badak_members!badak_stories_member_id_fkey(id, display_name, avatar_url, job_function)
`;

// GET: 공개 스토리 목록 — ?all=true(미공개 포함)는 직원만
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';
  if (all) {
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;
  }

  let query = supabase.from('badak_stories').select(STORY_SELECT).order('created_at', { ascending: false }).limit(50);
  if (!all) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ stories: [] });
  return NextResponse.json({ stories: data || [] });
}

// POST: 스토리 제출 (로그인 회원 본인 명의 · 검토 전 비공개)
export async function POST(request: NextRequest) {
  const auth = await requireMember(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const { title, content, before_role, after_role } = body as Record<string, string | undefined>;
  if (!title?.trim()) {
    return NextResponse.json({ error: '제목을 입력해주세요' }, { status: 400 });
  }

  const { data: bm } = await supabase.from('badak_members').select('id').eq('user_id', auth.user.id).maybeSingle();
  if (!bm) return NextResponse.json({ error: 'Badak 회원 정보가 필요합니다' }, { status: 403 });

  const { data, error } = await supabase
    .from('badak_stories')
    .insert({
      tenant_id: 'tenone',
      title: title.trim().slice(0, 200),
      content: content?.trim().slice(0, 5000) || null,
      before_role: before_role?.trim().slice(0, 100) || null,
      after_role: after_role?.trim().slice(0, 100) || null,
      member_id: bm.id,
      published: false,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // UC 지급 (월 상한은 uc_rules monthly_cap)
  await earnUC(auth.memberId, 'submit_story', 'badak');

  return NextResponse.json({ story: data });
}

// PUT: 스토리 수정 (직원)
export async function PUT(request: NextRequest) {
  const auth = await requireStaff(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const { id, title, content, before_role, after_role, member_id, published } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = String(title).trim();
  if (content !== undefined) updates.content = content?.trim() || null;
  if (before_role !== undefined) updates.before_role = before_role?.trim() || null;
  if (after_role !== undefined) updates.after_role = after_role?.trim() || null;
  if (member_id !== undefined) updates.member_id = member_id || null;
  if (published !== undefined) updates.published = Boolean(published);

  const { data, error } = await supabase.from('badak_stories').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ story: data });
}

// DELETE: 스토리 삭제 (직원)
export async function DELETE(request: NextRequest) {
  const auth = await requireStaff(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabase.from('badak_stories').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deleted: true });
}
