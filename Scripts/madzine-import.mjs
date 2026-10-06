// MADzine 콘텐츠 이전 — madleague.net(아임웹) → mad_articles + Storage (2026-10-06)
// 입력: 추출 JSON (아임웹 /59 게시물: idx·title·category·publishedAt·bodyHtml·images·listThumb)
// 사용: node scripts/madzine-import.mjs <extract.json> [--dry]
// 멱등: 이미지는 같은 경로 upsert, 기사는 slug 'mz-{idx}' 기준 upsert
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const { createClient } = require('@supabase/supabase-js');

const [, , input, flag] = process.argv;
const DRY = flag === '--dry';
if (!input) { console.error('usage: node scripts/madzine-import.mjs <extract.json> [--dry]'); process.exit(1); }

// .env.local에서 필요한 값만 읽는다 (출력하지 않음)
const env = Object.fromEntries(
  fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const BUCKET = 'mad-community';
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
  if (uploaded.has(src)) return uploaded.get(src);
  const name = path.basename(new URL(src).pathname);
  const dest = `madzine/${idx}/${name}`;
  if (DRY) { uploaded.set(src, `(dry)/${dest}`); return uploaded.get(src); }
  const res = await fetch(src);
  if (!res.ok) throw new Error(`image ${res.status} ${src}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const { error } = await sb.storage.from(BUCKET).upload(dest, buf, {
    contentType: res.headers.get('content-type') ?? 'application/octet-stream', upsert: true,
  });
  if (error) throw new Error(`upload ${dest}: ${error.message}`);
  const url = sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
  uploaded.set(src, url);
  return url;
}

function cleanBody(html) {
  const doc = new JSDOM(`<body>${html}</body>`).window.document;
  // 아임웹 래퍼 div 풀기, 빈 첨부 영역 제거
  doc.querySelectorAll('div[class*="_comment_body"]').forEach(d => d.replaceWith(...d.childNodes));
  doc.querySelectorAll('div.file_area').forEach(d => { if (!d.textContent.trim() && !d.querySelector('a,img')) d.remove(); });
  // 연속된 빈 문단(<p><br></p>)은 하나만
  let prevEmpty = false;
  doc.querySelectorAll('body > p').forEach(p => {
    const empty = !p.textContent.trim() && !p.querySelector('img,iframe');
    if (empty && prevEmpty) p.remove();
    prevEmpty = empty;
  });
  return doc.body;
}

const articles = JSON.parse(fs.readFileSync(input, 'utf8'));
let ok = 0;
for (const a of articles) {
  const body = cleanBody(a.bodyHtml);
  for (const img of body.querySelectorAll('img')) {
    const src = img.getAttribute('src');
    if (src?.startsWith('https://cdn.imweb.me/')) img.setAttribute('src', await copyImage(src, a.idx));
  }
  const content = sanitize(body.innerHTML).trim();
  const thumb = a.listThumb ? await copyImage(a.listThumb, a.idx) : null;
  const leftover = (content.match(/cdn\.imweb\.me/g) ?? []).length;

  const row = {
    slug: `mz-${a.idx}`,
    title: a.title,
    content,
    category: a.category,
    excerpt: a.description,
    author_name: 'MAD League',
    thumbnail_url: thumb,
    year: a.publishedAt ? Number(a.publishedAt.slice(0, 4)) : null,
    status: 'published',
    is_published: true,
    published_at: a.publishedAt,
    created_at: a.publishedAt,
    updated_at: a.modifiedAt ?? a.publishedAt,
  };
  if (!DRY) {
    const { error } = await sb.from('mad_articles').upsert(row, { onConflict: 'slug' });
    if (error) throw new Error(`article ${row.slug}: ${error.message}`);
  }
  ok++;
  console.log(`${DRY ? '[dry] ' : ''}${row.slug} | ${row.category} | ${row.published_at?.slice(0, 10)} | ${content.length}자 | imweb잔여=${leftover} | ${row.title}`);
}
console.log(`\n${DRY ? '[dry] ' : ''}articles=${ok} images=${uploaded.size}`);
