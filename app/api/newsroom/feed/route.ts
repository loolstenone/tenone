/**
 * 뉴스룸 피드 API — newsroom_items 기반 (브랜드 전체 통합)
 * GET /api/newsroom/feed?sort=latest|popular|featured&brand=all|tenone|...&limit=20&page=1
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort  = searchParams.get('sort')  || 'latest';
  const brand = searchParams.get('brand') || 'all';
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
  const page  = Math.max(Number(searchParams.get('page'))  || 1, 1);
  const offset = (page - 1) * limit;

  try {
    const supabase = await createClient();

    let query = supabase
      .from('newsroom_items')
      .select('*', { count: 'exact' })
      .eq('is_hidden', false);

    if (brand !== 'all') {
      query = query.eq('source_brand', brand);
    }

    // 정렬: 핀/추천 항목은 항상 최상위, 그 다음 선택 기준
    if (sort === 'popular') {
      query = query
        .order('display_priority', { ascending: false })
        .order('popularity_score', { ascending: false })
        .order('published_at', { ascending: false });
    } else if (sort === 'featured') {
      query = query
        .order('is_featured', { ascending: false })
        .order('display_priority', { ascending: false })
        .order('published_at', { ascending: false });
    } else {
      // latest (기본)
      query = query
        .order('display_priority', { ascending: false })
        .order('published_at', { ascending: false });
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
