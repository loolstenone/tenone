/**
 * FWN WordPress → Supabase 마이그레이션
 * fwn.co.kr WP REST API에서 기사를 가져와 posts 테이블에 저장
 */

const WP_BASE = 'https://fwn.co.kr/wp-json/wp/v2';
const SUPABASE_URL = 'https://ziotlxkdctlhiwkgmmsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppb3RseGtkY3RsaGl3a2dtbXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjE4MTcsImV4cCI6MjA4Njk5NzgxN30.9Dx4IpmhYXmTbkX8KxX4O2U1qTWfvN_DDFrYvIoYxi8';

async function fetchWP(endpoint) {
  const res = await fetch(`${WP_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`WP API error: ${res.status} ${endpoint}`);
  const total = res.headers.get('x-wp-total');
  const data = await res.json();
  return { data, total: total ? parseInt(total) : data.length };
}

const SUPABASE_ACCESS_TOKEN = 'sbp_73e079226d5c9eb154fe1a36d704c7e170d21b65';
const PROJECT_ID = 'ziotlxkdctlhiwkgmmsh';

async function supabaseInsert(table, rows) {
  // Management API로 직접 SQL INSERT (RLS 우회)
  const values = rows.map(r => {
    const cols = Object.keys(r);
    const vals = cols.map(c => {
      const v = r[c];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    return `(${vals.join(', ')})`;
  }).join(',\n');

  const cols = Object.keys(rows[0]).join(', ');
  const sql = `INSERT INTO ${table} (${cols}) VALUES ${values} ON CONFLICT DO NOTHING;`;

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`SQL error:`, err.substring(0, 200));
    return false;
  }
  return true;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&#8217;/g, "'").replace(/&#8220;|&#8221;/g, '"').replace(/&amp;/g, '&').trim();
}

function wpSlugToCategory(categories, catIds) {
  const cat = categories.find(c => catIds.includes(c.id));
  return cat ? decodeURIComponent(cat.slug) : 'uncategorized';
}

const CATEGORY_MAP = {
  '%ec%84%9c%ec%9a%b8': 'seoul',
  '%ed%8c%8c%eb%a6%ac': 'paris',
  '%eb%89%b4%ec%9a%95': 'newyork',
  '%eb%9f%b0%eb%8d%98': 'london',
  '%eb%b0%80%eb%9d%bc%eb%85%b8': 'milan',
  '%eb%aa%a8%eb%8d%b8': 'models',
  '%eb%b8%8c%eb%9e%9c%eb%93%9c': 'brands',
  'editors-pick': 'editors-pick',
  'main-story': 'main-story',
  'trending-story': 'trending-story',
  '%eb%af%b8-%eb%b6%84%eb%a5%98': 'uncategorized',
};

async function migrate() {
  console.log('=== FWN WordPress → Supabase 마이그레이션 ===\n');

  // 1. 카테고리 가져오기
  console.log('1. 카테고리 가져오는 중...');
  const { data: wpCategories } = await fetchWP('/categories?per_page=100');
  console.log(`   ${wpCategories.length}개 카테고리`);

  // 2. 기사 가져오기 (전체)
  console.log('2. 기사 가져오는 중...');
  let allPosts = [];
  let page = 1;
  while (true) {
    const { data: posts, total } = await fetchWP(`/posts?per_page=100&page=${page}&_embed`);
    allPosts = allPosts.concat(posts);
    console.log(`   페이지 ${page}: ${posts.length}건 (전체 ${total}건)`);
    if (allPosts.length >= total || posts.length === 0) break;
    page++;
  }
  console.log(`   총 ${allPosts.length}건 기사\n`);

  // 3. 변환 + 저장
  console.log('3. Supabase에 저장 중...');
  const rows = allPosts.map(post => {
    // 카테고리 매핑
    const catSlugs = post.categories.map(catId => {
      const cat = wpCategories.find(c => c.id === catId);
      if (!cat) return 'uncategorized';
      const slug = cat.slug;
      return CATEGORY_MAP[slug] || decodeURIComponent(slug);
    });
    const primaryCategory = catSlugs.find(s => !['editors-pick', 'main-story', 'trending-story', 'uncategorized'].includes(s)) || catSlugs[0] || 'uncategorized';
    const tags = catSlugs.filter(s => s !== primaryCategory);

    // 대표 이미지
    let featuredImage = null;
    try {
      const media = post._embedded?.['wp:featuredmedia']?.[0];
      featuredImage = media?.source_url || media?.media_details?.sizes?.medium?.source_url || null;
    } catch {}

    return {
      site_id: '070136ca-9edd-40f9-906b-762aeceb30c2',
      board_id: '6fd76337-d0f9-48a1-9188-b5d3ebf25821',
      title: stripHtml(post.title.rendered),
      slug: post.slug,
      body: post.content.rendered,
      summary: stripHtml(post.excerpt.rendered).substring(0, 300),
      status: 'published',
      is_pinned: catSlugs.includes('main-story'),
      is_recommended: catSlugs.includes('editors-pick'),
      author_name: 'FWN Editor',
      image: featuredImage,
      tags: `{${tags.concat([primaryCategory]).map(t => `"${t}"`).join(',')}}`,
      extra_fields: JSON.stringify({ wp_id: post.id, wp_category: primaryCategory, wp_categories: catSlugs }),
      view_count: 0,
      comment_count: 0,
      published_at: post.date_gmt + 'Z',
      created_at: post.date_gmt + 'Z',
      updated_at: post.modified_gmt + 'Z',
      tenant_id: 'tenone',
    };
  });

  // 배치 저장 (10개씩)
  let saved = 0;
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const ok = await supabaseInsert('ums_posts', batch);
    if (ok) saved += batch.length;
    process.stdout.write(`   ${saved}/${rows.length}\r`);
  }

  console.log(`\n\n=== 완료: ${saved}/${rows.length}건 저장 ===`);

  // 4. 확인
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/ums_posts?site_id=eq.070136ca-9edd-40f9-906b-762aeceb30c2&select=id,title,slug,image&order=created_at.desc&limit=5`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });
  const checkData = await checkRes.json();
  console.log('\n최근 5개 기사:');
  checkData.forEach(p => console.log(`  ${p.title} [${p.slug}] ${p.image ? '📷' : ''}`));
}

migrate().catch(err => {
  console.error('마이그레이션 실패:', err.message);
  process.exit(1);
});
