import { createClient } from '@/lib/supabase/client';

const FWN_SITE_ID = '070136ca-9edd-40f9-906b-762aeceb30c2';
const FWN_BOARD_ID = '6fd76337-d0f9-48a1-9188-b5d3ebf25821';

export interface FWNArticle {
  id: string;
  site_id: string;
  board_id: string;
  title: string;
  slug: string;
  body: string;
  summary: string;
  image: string | null;
  tags: string[];
  extra_fields: Record<string, unknown> | null;
  is_pinned: boolean;
  is_recommended: boolean;
  published_at: string;
  view_count: number;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

interface FetchArticlesOptions {
  category?: string;
  limit?: number;
  offset?: number;
  pinned?: boolean;
  recommended?: boolean;
  orderBy?: 'published_at' | 'view_count';
}

/**
 * FWN 기사 목록 조회
 */
export async function fetchFWNArticles(options?: FetchArticlesOptions): Promise<FWNArticle[]> {
  const supabase = createClient();
  const { category, limit = 20, offset = 0, pinned, recommended, orderBy = 'published_at' } = options ?? {};

  let query = supabase
    .from('ums_posts')
    .select('*')
    .eq('site_id', FWN_SITE_ID)
    .eq('board_id', FWN_BOARD_ID)
    .order(orderBy, { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.contains('tags', [category]);
  }

  if (pinned !== undefined) {
    query = query.eq('is_pinned', pinned);
  }

  if (recommended !== undefined) {
    query = query.eq('is_recommended', recommended);
  }

  const { data, error } = await query;

  if (error) {
    console.error('fetchFWNArticles error:', error);
    return [];
  }

  return (data ?? []) as FWNArticle[];
}

/**
 * FWN 단일 기사 조회 (slug)
 */
export async function fetchFWNArticle(slug: string): Promise<FWNArticle | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('ums_posts')
    .select('*')
    .eq('site_id', FWN_SITE_ID)
    .eq('board_id', FWN_BOARD_ID)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('fetchFWNArticle error:', error);
    return null;
  }

  return data as FWNArticle;
}

/**
 * 조회수 증가
 */
export async function incrementViewCount(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.rpc('increment_view_count', { post_id: id });

  if (error) {
    // rpc가 없으면 직접 업데이트 fallback
    const { data: current } = await supabase
      .from('ums_posts')
      .select('view_count')
      .eq('id', id)
      .single();

    if (current) {
      await supabase
        .from('ums_posts')
        .update({ view_count: (current.view_count ?? 0) + 1 })
        .eq('id', id);
    }
  }
}

/**
 * 날짜를 한국어 형식으로 포맷
 */
export function formatDateKorean(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/**
 * 카테고리 태그 → 한글 이름 매핑
 */
export const categoryNameMap: Record<string, string> = {
  seoul: '서울',
  paris: '파리',
  newyork: '뉴욕',
  london: '런던',
  milan: '밀라노',
  world: '월드',
  models: '모델',
  brands: '브랜드',
  street: '스트리트 런웨이',
  'editors-pick': "Editor's Pick",
};

/**
 * 기사의 주요 카테고리 태그 추출 (첫 번째 도시 태그 또는 첫 태그)
 */
export function getPrimaryCategory(tags: string[]): string {
  const cityTags = ['seoul', 'paris', 'newyork', 'london', 'milan', 'world'];
  const found = tags.find(t => cityTags.includes(t));
  return found ?? tags[0] ?? '';
}
