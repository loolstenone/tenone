// 바닥상회 '플래너'스 플래너 사용자' 게시판(badak.biz/PlannersPlannerUser) 운영사 글 8건 → Planner's 이야기 게시판 '공지' — 2026-10-14
//   - 글쓴이 전부 운영사(Ten:One™) → 운영사 콘텐츠 이전 (회원 데이터 아님). 회원 댓글(2023·2024 글 6건)은 옮기지 않는다 (§0.1 회원 데이터 이전 없음)
//   - 본문 사진은 공개 버킷 planners-media/badak/notices/ 로 복사 (아임웹 주소 0건)
//   - 링크: 옛 상품 번호 → 플래너스 PAD 상품(옮기지 않은 옛 연도 판은 같은 시리즈 2026년판) · 옛 사이트 주소 → planners 경로 · 광고 블록 제거
// 사용: node scripts/planners-notices-import.mjs [--dry]   (원본은 scripts/data/planners-badak-notices.json 에 저장 후 재사용)
// 멱등: extra_fields.legacy_badak_idx 가 같은 글이 있으면 건너뜀
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');
const DRY = process.argv.includes('--dry');

const env = Object.fromEntries(
  fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// 게시판 목록에서 읽은 값 (번호·작성일·조회수)
const POSTS = [
  { idx: 168270237, date: '2025-10-20', views: 1068 },
  { idx: 129284395, date: '2024-11-29', views: 1466 },
  { idx: 17405760, date: '2023-12-29', views: 1398 },
  { idx: 13477950, date: '2022-11-18', views: 5856 },
  { idx: 8994859, date: '2021-11-28', views: 2684 },
  { idx: 6013763, date: '2021-03-07', views: 1872 },
  { idx: 5908427, date: '2021-02-16', views: 6224 },
  { idx: 5892709, date: '2021-02-13', views: 2525 },
];
// 옮기지 않은 옛 연도 판 → 같은 시리즈 2026년판 (후기 이전과 같은 규칙) · 172 일력은 판매 종료 → PAD 목록
const SERIES = { 1: 182, 179: 182, 176: 182, 173: 182, 180: 183, 178: 183, 174: 183, 181: 184, 177: 184, 175: 184 };
const DATA = path.resolve('scripts/data/planners-badak-notices.json');

async function fetchOriginals() {
  if (fs.existsSync(DATA)) return JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const out = [];
  for (const p of POSTS) {
    const html = await (await fetch(`https://badak.biz/PlannersPlannerUser/?bmode=view&idx=${p.idx}&t=board`)).text();
    const title = html.match(/<title>([^<]+?) : 플래너(?:'|&#039;)스 플래너 사용자/)?.[1]?.trim();
    const start = html.search(/<div class=["']board_txt_area/);
    const end = html.indexOf('<ins class="adsbygoogle"', start);
    if (!title || start < 0 || end < 0) throw new Error(`본문을 찾지 못함 ${p.idx}`);
    const body = html.slice(html.indexOf('>', start) + 1, end).replace(/(<br>|\s|<hr>)+$/g, '').trim();
    out.push({ ...p, title: title.replace(/&#039;|&apos;/g, "'").replace(/&amp;/g, '&'), html: body });
  }
  fs.mkdirSync(path.dirname(DATA), { recursive: true });
  fs.writeFileSync(DATA, JSON.stringify(out, null, 2));
  return out;
}

const posts = await fetchOriginals();
const { data: files } = await sb.from('planners_files').select('id, legacy_badak_no');
const byNo = new Map(files.map(f => [f.legacy_badak_no, f.id]));
const { data: board } = await sb.from('ums_boards').select('id, site_id, ums_sites!inner(slug)').eq('ums_sites.slug', 'planners').eq('slug', 'stories').single();

const productHref = (no) => {
  const id = byNo.get(SERIES[no] ?? no);
  return id ? `/planners/pad/${id}` : '/planners/pad';
};
function rewriteUrl(u) {
  const m = u.match(/badak(?:\.tenone)?\.biz\/(?:PlannersPlanner|shop_view)\/\?idx=(\d+)/);
  if (m) return productHref(Number(m[1]));
  if (/planners\.tenone\.biz\/planners-planner/.test(u)) return '/planners/pad';
  if (/planners\.tenone\.biz\/?$/.test(u)) return '/planners/about';
  if (/badak\.biz\/planners\b/.test(u)) return '/planners/pad?c=' + encodeURIComponent('연간 플래너');
  if (/badak\.biz\/notebook\b/.test(u)) return '/planners/pad?c=' + encodeURIComponent('노트 북');
  if (/badak\.biz\/Template\b/.test(u)) return '/planners/pad';
  return u;
}

async function copyImage(src) {
  const name = src.split('/').pop();
  const key = `badak/notices/${name}`;
  if (!DRY) {
    const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
    const { error } = await sb.storage.from('planners-media').upload(key, buf, { contentType: 'image/png', upsert: true });
    if (error) throw new Error(`사진 올리기 실패 ${name}: ${error.message}`);
  }
  return sb.storage.from('planners-media').getPublicUrl(key).data.publicUrl;
}

let ok = 0, skipped = 0;
for (const p of posts) {
  const { data: dup } = await sb.from('ums_posts').select('id').eq('board_id', board.id).eq('extra_fields->>legacy_badak_idx', String(p.idx)).maybeSingle();
  if (dup) { skipped++; continue; }

  let html = p.html
    .replace(/^<div[^>]*>/, '').replace(/<\/div>\s*$/, '')            // 바깥 래퍼
    .replace(/\s(class|style)="[^"]*"/g, '')                          // 아임웹 편집기 서식
    .replace(/파일 다운로도/g, '파일 받기')
    .replace(/(<p><br><\/p>){2,}/g, '<p><br></p>');
  // 링크 글자 자체가 주소인 경우 → 링크로 감싸고, href도 새 경로로
  html = html.replace(/<a href="([^"]+)">(.*?)<\/a>/g, (_, href, text) => {
    const to = rewriteUrl(href);
    return `<a href="${to}">${text.startsWith('http') ? '바로 가기' : text}</a>`;
  });
  html = html.replace(/(<p>[^<]*?)(https?:\/\/[^\s<&]+)/g, (all, pre, u) => (/(badak(.tenone)?.biz|planners.tenone.biz)/.test(u) ? `${pre}<a href="${rewriteUrl(u)}">바로 가기</a>` : all));
  for (const src of [...html.matchAll(/<img src="(https:\/\/cdn\.imweb\.me[^"]+)"/g)].map(m => m[1])) {
    html = html.replace(src, await copyImage(src));
  }
  if (/imweb\.me|badak(\.tenone)?\.biz|planners\.tenone\.biz/.test(html)) throw new Error(`옛 주소가 남음 ${p.idx}`);
  html += '<p><br></p><p>※ 바닥상회(badak.biz)에 올렸던 글을 옮겨 왔습니다. 옛 연도 판은 내려받기를 마쳤고, 링크는 최신판으로 연결됩니다.</p>';

  const at = new Date(`${p.date}T09:00:00+09:00`).toISOString();
  const row = {
    board_id: board.id, site_id: board.site_id, title: p.title.replace('배표', '배포').replace('Wrok', 'Work').replace(/\s+/g, ' '), body: html,
    summary: html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160),
    image: html.match(/<img src="([^"]+)"/)?.[1] ?? null,
    status: 'published', category_id: '공지', author_name: "Planner's",
    view_count: p.views, published_at: at, created_at: at, updated_at: at,
    extra_fields: { legacy_badak_idx: String(p.idx), source: 'badak.biz/PlannersPlannerUser' },
  };
  if (DRY) { console.log(p.idx, p.title, row.body.length, (html.match(/<img/g) || []).length); continue; }
  const { error } = await sb.from('ums_posts').insert(row);
  if (error) throw new Error(`${p.idx} 저장 실패: ${error.message}`);
  ok++;
}
console.log({ ok, skipped, total: posts.length, dry: DRY });
