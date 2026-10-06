// RooK 콘텐츠 이전 — www.rook.co.kr(아임웹) Works·Artist·자유게시판 공지 → ums_posts + Storage (2026-10-07)
// 입력: 추출 JSON { works?, artist?, freeboard? } (idx·category·title·date·bodyHtml·images·youtube·listThumb·writer)
// 사용: node Scripts/rook-import.mjs <extract.json> [--dry]
// 멱등: 이미지는 같은 경로 upsert, 글은 (board, slug 'rk-{idx}') 기준 update/insert
// ⚠️ 운영사 콘텐츠만. 자유게시판은 원본에서 '공지'로 고정한 운영 글만 (스팸·일반 회원 글·회원 데이터는 이전하지 않음, §0.1)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const { createClient } = require('@supabase/supabase-js');

const [, , input, flag] = process.argv;
const DRY = flag === '--dry';
if (!input) { console.error('usage: node Scripts/rook-import.mjs <extract.json> [--dry]'); process.exit(1); }

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
async function copyImage(src, board, idx) {
  const abs = src.startsWith('//') ? `https:${src}` : src;
  if (uploaded.has(abs)) return uploaded.get(abs);
  const name = path.basename(new URL(abs).pathname);
  const dest = `rook/${board}/${idx}/${name}`;
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
const { data: site } = await sb.from('ums_sites').select('id').eq('slug', 'rook').single();
const { data: boards } = await sb.from('ums_boards').select('id, slug').eq('site_id', site.id).in('slug', ['works', 'artist', 'freeboard']);
const boardId = Object.fromEntries(boards.map(b => [b.slug, b.id]));

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
let ok = 0;
for (const board of ['works', 'artist', 'freeboard']) {
  for (const a of data[board] ?? []) {
    const body = cleanBody(a.bodyHtml);
    for (const img of body.querySelectorAll('img')) {
      const src = img.getAttribute('data-original') ?? img.getAttribute('src');
      if (src && /cdn\.imweb\.me/.test(src)) img.setAttribute('src', await copyImage(src, board, a.idx));
      img.removeAttribute('data-original');
    }
    const content = sanitize(body.innerHTML).trim();
    const leftover = (content.match(/cdn\.imweb\.me/g) ?? []).length;
    // 대표 이미지: 원본 목록 썸네일 → 본문 첫 이미지 → 유튜브 썸네일
    // (og:image는 본문 이미지가 없으면 사이트 기본 공유 이미지(RooKie 모집 배너)라 쓰지 않는다)
    const ytId = a.youtube?.[0]?.match(/embed\/([\w-]{6,})/)?.[1];
    const firstImg = body.querySelector('img')?.getAttribute('src') ?? null;
    const image = a.listThumb && /cdn\.imweb\.me/.test(a.listThumb)
      ? await copyImage(a.listThumb, board, a.idx)
      : a.listThumb ?? firstImg ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

    const text = new JSDOM(`<body>${content.replace(/<\/(p|li|div|h\d)>/g, ' </$1>')}</body>`).window.document.body.textContent.replace(/\s+/g, ' ').trim();
    const summary = text.length > 160 ? `${text.slice(0, 160)}…` : text;
    const slug = `rk-${a.idx}`;

    const row = {
      board_id: boardId[board],
      site_id: site.id,
      tenant_id: 'tenone',
      title: a.title.replace(/\s{2,}/g, ' '),
      slug,
      summary,
      body: content,
      status: 'published',
      category_id: a.category,
      author_id: null,
      // 아임웹 작성자 칸에 "Free Board 수정지우기"가 붙어 나옴 → 첫 줄(닉네임)만
      author_name: a.writer ? a.writer.split(/\s*\n\s*/)[0].trim() : 'RooK',
      is_pinned: true, // 원본에서 전부 '공지' 고정
      image,
      og_image: image,
      extra_fields: { source: `https://www.rook.co.kr/${board}/?idx=${a.idx}&bmode=view`, youtube_id: ytId ?? null },
      published_at: a.date,
      created_at: a.date,
      updated_at: a.date,
    };
    if (!DRY) {
      const { data: existing } = await sb.from('ums_posts').select('id').eq('board_id', row.board_id).eq('slug', slug).maybeSingle();
      const { error } = existing
        ? await sb.from('ums_posts').update(row).eq('id', existing.id)
        : await sb.from('ums_posts').insert(row);
      if (error) throw new Error(`post ${board}/${slug}: ${error.message}`);
    }
    ok++;
    console.log(`${DRY ? '[dry] ' : ''}${board}/${slug} | ${row.category_id} | ${row.published_at?.slice(0, 10)} | ${content.length}자 | imweb잔여=${leftover} | ${row.title}`);
  }
}
console.log(`\n${DRY ? '[dry] ' : ''}posts=${ok} images=${uploaded.size}`);
