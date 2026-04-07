/**
 * 뉴스룸 헬퍼 — newsroom_items 자동 등록
 * 게시글 발행 시 호출: registerToNewsroom(post)
 */
import { createClient } from '@/lib/supabase/server';

export interface NewsroomSourcePost {
  id: string;
  site: string;           // brand code (e.g. 'madleague', 'hero')
  title: string;
  excerpt?: string | null;
  represent_image?: string | null;
  category?: string | null;
  tags?: string[] | null;
  view_count?: number;
  like_count?: number;
  created_at?: string;
  url?: string;           // 직접 지정 (없으면 자동 생성)
}

/**
 * 게시글을 newsroom_items에 자동 등록 (중복 방지: source_id 체크)
 */
export async function registerToNewsroom(post: NewsroomSourcePost): Promise<void> {
  try {
    const supabase = await createClient();

    // 이미 등록된 항목이면 통계만 업데이트
    const { data: existing } = await supabase
      .from('newsroom_items')
      .select('id, view_count, like_count')
      .eq('source_id', post.id)
      .maybeSingle();

    const popularity = (post.view_count || 0) + (post.like_count || 0) * 3;
    const url = post.url || resolveUrl(post.site, post.id);

    if (existing) {
      await supabase
        .from('newsroom_items')
        .update({
          view_count: post.view_count || 0,
          like_count: post.like_count || 0,
          popularity_score: popularity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      return;
    }

    // 신규 등록
    await supabase.from('newsroom_items').insert({
      source_type: 'board_post',
      source_id: post.id,
      source_brand: post.site,
      title: post.title,
      summary: post.excerpt || null,
      thumbnail_url: post.represent_image || null,
      url,
      category: post.category || null,
      tags: post.tags || [],
      view_count: post.view_count || 0,
      like_count: post.like_count || 0,
      popularity_score: popularity,
      published_at: post.created_at || new Date().toISOString(),
    });
  } catch (err) {
    // 뉴스룸 등록 실패는 게시글 발행에 영향 없음
    console.error('[newsroom register]', err);
  }
}

/**
 * 브랜드별 게시글 URL 자동 생성
 */
function resolveUrl(site: string, postId: string): string {
  const map: Record<string, string> = {
    tenone:    `/newsroom`,
    madleague: `/madleague/madzine`,
    badak:     `/badak/community`,
    hero:      `/hero`,
    rook:      `/rook/board`,
    changeup:  `/changeup/community`,
    mindle:    `/mindle`,
    youinone:  `/youinone`,
    smarcomm:  `/smarcomm`,
    wio:       `/wio`,
  };
  const base = map[site] || `/${site}`;
  return `${base}?postId=${postId}`;
}

/**
 * 뉴스룸 아이템 조회 (public)
 */
export async function getNewsroomItems(opts: {
  brand?: string;
  sort?: 'latest' | 'popular' | 'featured';
  limit?: number;
  page?: number;
}) {
  const supabase = await createClient();
  const { brand = 'all', sort = 'latest', limit = 20, page = 1 } = opts;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('newsroom_items')
    .select('*', { count: 'exact' })
    .eq('is_hidden', false);

  if (brand !== 'all') query = query.eq('source_brand', brand);

  if (sort === 'popular') {
    query = query.order('display_priority', { ascending: false }).order('popularity_score', { ascending: false });
  } else if (sort === 'featured') {
    query = query.order('is_featured', { ascending: false }).order('display_priority', { ascending: false });
  } else {
    query = query.order('display_priority', { ascending: false }).order('published_at', { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) throw error;

  return { items: data || [], total: count || 0, hasMore: (count || 0) > offset + limit };
}
