/**
 * 뉴스룸 관리자 API
 * GET    /api/newsroom/admin  — 전체 아이템 (숨김 포함)
 * POST   /api/newsroom/admin  — 수동 아이템 등록
 * PATCH  /api/newsroom/admin  — 아이템 설정 변경 (is_featured, is_hidden, display_priority)
 * DELETE /api/newsroom/admin  — 아이템 삭제
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand  = searchParams.get('brand')  || 'all';
  const sort   = searchParams.get('sort')   || 'latest';
  const limit  = Math.min(Number(searchParams.get('limit')) || 50, 200);
  const page   = Math.max(Number(searchParams.get('page'))  || 1, 1);
  const offset = (page - 1) * limit;

  try {
    const supabase = await createClient();

    let query = supabase
      .from('newsroom_items')
      .select('*', { count: 'exact' });

    if (brand !== 'all') query = query.eq('source_brand', brand);

    if (sort === 'popular') {
      query = query.order('popularity_score', { ascending: false });
    } else if (sort === 'priority') {
      query = query.order('display_priority', { ascending: false }).order('published_at', { ascending: false });
    } else {
      query = query.order('published_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ items: data || [], total: count || 0, page, limit, hasMore: (count || 0) > offset + limit });
  } catch (error) {
    console.error('[newsroom admin GET]', error);
    return NextResponse.json({ items: [], total: 0 }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_brand, title, summary, thumbnail_url, url, category, tags, published_at } = body;

    if (!title || !source_brand) {
      return NextResponse.json({ error: 'title과 source_brand는 필수입니다.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('newsroom_items')
      .insert({
        source_type: 'manual',
        source_brand,
        title,
        summary: summary || null,
        thumbnail_url: thumbnail_url || null,
        url: url || null,
        category: category || null,
        tags: tags || [],
        published_at: published_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error('[newsroom admin POST]', error);
    return NextResponse.json({ error: '등록 실패' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });

    // 허용 필드만 통과
    const allowed: Record<string, unknown> = {};
    const allowedKeys = ['is_featured', 'is_hidden', 'display_priority', 'title', 'summary', 'thumbnail_url', 'url', 'category', 'tags'];
    for (const k of allowedKeys) {
      if (k in updates) allowed[k] = updates[k];
    }
    allowed['updated_at'] = new Date().toISOString();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('newsroom_items')
      .update(allowed)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('[newsroom admin PATCH]', error);
    return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from('newsroom_items').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[newsroom admin DELETE]', error);
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
