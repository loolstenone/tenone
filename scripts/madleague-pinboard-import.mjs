// MAD League 공모전/프로젝트 이전 — madleague.net/pinboard(아임웹) → ums_posts(site madleague, board contest) + Storage (2026-10-16)
// 입력: 추출 JSON 배열 (idx·category·title·date·bodyHtml·images·listThumb·ogImage·writer)
// 사용: node scripts/madleague-pinboard-import.mjs <extract.json> [--dry]
// 멱등: 이미지는 같은 경로 upsert, 글은 (board, slug 'mp-{idx}') 기준 update/insert
// ⚠️ 운영사·기관 공지만 (회원 글·댓글 없음). 채용 공고 2건·게시판 안내 1건은 제외 (직업안정법 — MADLeague CLAUDE.md "채용 연결 문구 금지")
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const { createClient } = require('@supabase/supabase-js');

const [, , input, flag] = process.argv;
const DRY = flag === '--dry';
if (!input) { console.error('usage: node scripts/madleague-pinboard-import.mjs <extract.json> [--dry]'); process.exit(1); }

// .env.local에서 필요한 값만 읽는다 (출력하지 않음)
const env = Object.fromEntries(
  fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const BUCKET = 'board-assets';
const YOUTUBE_EMBED = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//i;
const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe' && !YOUTUBE_EMBED.test(node.getAttribute('src') ?? '')) node.parentNode?.removeChild(node);
});
const sanitize = html => DOMPurify.sanitize(html, {
  ADD_TAGS: ['iframe'], ADD_ATTR: ['allowfullscreen', 'frameborder'], FORBID_ATTR: ['style', 'class', 'contenteditable'],
});

const uploaded = new Map();
async function copyImage(src, idx) {
  const abs = src.startsWith('//') ? `https:${src}` : src;
  if (uploaded.has(abs)) return uploaded.get(abs);
  const name = path.basename(new URL(abs).pathname);
  const dest = `madleague/contest/${idx}/${name}`;
  if (DRY) { uploaded.set(abs, `(dry)/${dest}`); return uploaded.get(abs); }
  const res = await fetch(abs);
  if (!res.ok) throw new Error(`image ${res.status} ${abs}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const { error } = await sb.storage.from(BUCKET).upload(dest, buf, {
    contentType: res.headers.get('content-type') ?? 'application/octet-stream', upsert: true,
  });
  if (error) throw new Error(`upload ${dest}: ${error.message}`);
  const url = sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
  uploaded.set(abs, url);
  return url;
}

function cleanBody(html) {
  const doc = new JSDOM(`<body>${html}</body>`).window.document;
  doc.querySelectorAll('div[class*="_comment_body"]').forEach(d => d.replaceWith(...d.childNodes));
  doc.querySelectorAll('div.file_area').forEach(d => { if (!d.textContent.trim() && !d.querySelector('a,img')) d.remove(); });
  // 아임웹 iframe은 src에 쿼리(&wmode=opaque)가 붙음 → 깨끗한 embed URL로
  doc.querySelectorAll('iframe').forEach(f => {
    const src = f.getAttribute('src') ?? f.getAttribute('data-src') ?? '';
    const id = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/)?.[1];
    if (id) { f.setAttribute('src', `https://www.youtube.com/embed/${id}`); f.setAttribute('allowfullscreen', ''); }
    else f.remove();
  });
  let prevEmpty = false;
  doc.querySelectorAll('body > p').forEach(p => {
    const empty = !p.textContent.trim() && !p.querySelector('img,iframe');
    if (empty && prevEmpty) p.remove();
    prevEmpty = empty;
  });
  return doc.body;
}

// 사이트·게시판 id
const { data: site } = await sb.from('ums_sites').select('id').eq('slug', 'madleague').single();
const { data: board } = await sb.from('ums_boards').select('id').eq('site_id', site.id).eq('slug', 'contest').single();

/** 제외: 채용 공고 2건(직업소개 미신고) · 게시판 안내 1건 */
const SKIP = new Set(['12801138', '12792133', '12332079']);
/** 분류 없는 글 → 같은 유형 글과 맞춤 (고구마팜 에디터 모집 = 프로젝트) */
const CATEGORY_FIX = { '29034656': '프로젝트' };

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
let ok = 0;
for (const a of data) {
  if (SKIP.has(a.idx)) { console.log(`skip ${a.idx} | ${a.title}`); continue; }
  const body = cleanBody(a.bodyHtml);
  for (const img of body.querySelectorAll('img')) {
    const src = img.getAttribute('data-original') ?? img.getAttribute('src');
    if (src && /cdn\.imweb\.me/.test(src)) img.setAttribute('src', await copyImage(src, a.idx));
    img.removeAttribute('data-original');
  }
  const content = sanitize(body.innerHTML).trim();
  const leftover = (content.match(/cdn\.imweb\.me/g) ?? []).length;
  // 대표 이미지: 목록 썸네일 → 공유 이미지(og) → 본문 첫 이미지
  const firstImg = body.querySelector('img')?.getAttribute('src') ?? null;
  const thumbSrc = [a.listThumb, a.ogImage].find(u => u && /cdn\.imweb\.me/.test(u));
  const image = thumbSrc ? await copyImage(thumbSrc, a.idx) : firstImg;

  const text = new JSDOM(`<body>${content.replace(/<\/(p|li|div|h\d)>/g, ' </$1>')}</body>`).window.document.body.textContent.replace(/\s+/g, ' ').trim();
  const summary = text.length > 160 ? `${text.slice(0, 160)}…` : text;
  const slug = `mp-${a.idx}`;
  const date = a.date ? `${a.date}T09:00:00+09:00` : null;

  const row = {
    board_id: board.id,
    site_id: site.id,
    tenant_id: 'tenone',
    title: a.title.replace(/\s{2,}/g, ' '),
    slug,
    summary,
    body: content,
    status: 'published',
    category_id: CATEGORY_FIX[a.idx] ?? a.category ?? '공모전',
    author_id: null,
    author_name: a.writer && a.writer !== '관리자' ? a.writer : 'MAD League',
    is_pinned: false,
    image,
    og_image: image,
    extra_fields: { source: `https://madleague.net/pinboard/?bmode=view&idx=${a.idx}` },
    published_at: date,
    created_at: date,
    updated_at: date,
  };
  if (!DRY) {
    const { data: existing } = await sb.from('ums_posts').select('id').eq('board_id', row.board_id).eq('slug', slug).maybeSingle();
    const { error } = existing
      ? await sb.from('ums_posts').update(row).eq('id', existing.id)
      : await sb.from('ums_posts').insert(row);
    if (error) throw new Error(`post ${slug}: ${error.message}`);
  }
  ok++;
  console.log(`${DRY ? '[dry] ' : ''}${slug} | ${row.category_id} | ${a.date} | ${content.length}자 | imweb잔여=${leftover} | ${row.author_name} | ${row.title}`);
}
console.log(`
${DRY ? '[dry] ' : ''}posts=${ok} images=${uploaded.size}`);
