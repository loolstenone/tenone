/**
 * 뉴스룸 피드 API — 유니버스 전체 게시글 조회
 * GET /api/newsroom/feed?sort=latest|popular&brand=all|tenone|...&limit=20&page=1
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'latest';
  const brand = searchParams.get('brand') || 'all';
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const offset = (page - 1) * limit;

  try {
    const supabase = createClient();

    let query = supabase
      .from('posts')
      .select('id, site, board, title, excerpt, represent_image, created_at, view_count, like_count, comment_count, author_name, guest_nickname, author_type, category, tags', { count: 'exact' })
      .eq('status', 'published');

    if (brand !== 'all') {
      query = query.eq('site', brand);
    }

    if (sort === 'popular') {
      query = query.order('like_count', { ascending: false }).order('view_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      posts: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    console.error('newsroom feed error:', error);
    return NextResponse.json({ posts: [], total: 0, page: 1, limit, hasMore: false });
  }
}
