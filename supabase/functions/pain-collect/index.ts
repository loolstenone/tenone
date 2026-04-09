/**
 * pain-collect — Pain Collector (리뷰 크롤러)
 *
 * 역할:
 *   Naver Blog Search API → bg_pain_sources 저장
 *   URL 기준 중복 제거
 *
 * 호출:
 *   POST /functions/v1/pain-collect
 *   Body: {
 *     product_id: string,
 *     brand_name: string,
 *     category?: string,
 *     keywords?: string[],   // bg_products.target_keywords
 *     competitors?: string[], // bg_products.competitors
 *     limit?: number,        // 쿼리당 최대 수집 건수 (기본 20)
 *   }
 */

import { createClient } from 'npm:@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const NAVER_CLIENT_ID = Deno.env.get('NAVER_CLIENT_ID')!;
const NAVER_CLIENT_SECRET = Deno.env.get('NAVER_CLIENT_SECRET')!;
const NAVER_BLOG_API = 'https://openapi.naver.com/v1/search/blog.json';

interface NaverBlogItem {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  postdate: string;
}

interface NaverBlogResponse {
  items: NaverBlogItem[];
  total: number;
}

/** HTML 태그 및 엔티티 제거 */
function stripHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Naver Blog Search API 호출 */
async function searchNaverBlog(query: string, display = 20): Promise<NaverBlogItem[]> {
  const url = `${NAVER_BLOG_API}?query=${encodeURIComponent(query)}&display=${display}&sort=sim`;

  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    },
  });

  if (!res.ok) {
    console.error(`[pain-collect] Naver API error ${res.status} for query: ${query}`);
    return [];
  }

  const data: NaverBlogResponse = await res.json();
  return data.items ?? [];
}

/** 이미 수집된 URL 조회 */
async function getExistingUrls(productId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('bg_pain_sources')
    .select('url')
    .eq('product_id', productId);

  return new Set((data ?? []).map((r: { url: string }) => r.url));
}

/** 수집 결과 저장 */
async function saveSources(
  productId: string,
  items: NaverBlogItem[],
  existingUrls: Set<string>,
): Promise<number> {
  const rows = items
    .filter(item => item.link && !existingUrls.has(item.link))
    .map(item => ({
      product_id: productId,
      platform: 'naver_blog',
      url: item.link,
      raw_text: stripHtml(`${item.title}. ${item.description}`),
      author: item.bloggername ?? null,
      collected_at: new Date().toISOString(),
      processed: false,
    }));

  if (rows.length === 0) return 0;

  const { error } = await supabase.from('bg_pain_sources').insert(rows);
  if (error) {
    console.error('[pain-collect] insert error:', error);
    return 0;
  }

  // 새로 추가된 URL을 existingUrls에 등록 (동일 실행 내 중복 방지)
  rows.forEach(r => existingUrls.add(r.url));

  return rows.length;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' },
    });
  }

  const body = await req.json().catch(() => ({}));
  const {
    product_id,
    brand_name,
    category,
    keywords = [],
    competitors = [],
    limit = 20,
  } = body;

  if (!product_id || !brand_name) {
    return Response.json({ error: 'product_id, brand_name 필수' }, { status: 400 });
  }

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    return Response.json({ error: 'Naver API 키 누락 (NAVER_CLIENT_ID / NAVER_CLIENT_SECRET)' }, { status: 500 });
  }

  // 기존 URL 로드 (중복 제거용)
  const existingUrls = await getExistingUrls(product_id);

  // 쿼리 생성
  const queries: string[] = [
    `${brand_name} 리뷰`,
    `${brand_name} 후기`,
    `${brand_name} 솔직 후기`,
    `${brand_name} 단점`,
    `${brand_name} 구매 후기`,
  ];

  // 카테고리 쿼리
  if (category) {
    queries.push(`${category} 추천`);
    queries.push(`${category} 후기`);
  }

  // 추가 키워드 쿼리
  for (const kw of keywords.slice(0, 3)) {
    queries.push(`${kw} 리뷰`);
  }

  // 경쟁사 비교 쿼리
  for (const comp of competitors.slice(0, 2)) {
    queries.push(`${brand_name} vs ${comp}`);
    queries.push(`${comp} 비교 추천`);
  }

  let totalCollected = 0;
  const queryResults: Array<{ query: string; collected: number }> = [];

  for (const query of queries) {
    const items = await searchNaverBlog(query, Math.min(limit, 30));
    const collected = await saveSources(product_id, items, existingUrls);
    totalCollected += collected;
    queryResults.push({ query, collected });

    // API 레이트 리밋 방지
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return Response.json({
    ok: true,
    product_id,
    brand_name,
    total_collected: totalCollected,
    queries: queryResults,
    message: `${totalCollected}개 리뷰 수집 완료 (${queries.length}개 쿼리)`,
  });
});
