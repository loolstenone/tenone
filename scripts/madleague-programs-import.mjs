#!/usr/bin/env node
/**
 * madleague.net(아임웹) 프로그램 이미지 → Storage board-assets/madleague/programs/{group}/{id}.webp (멱등)
 * 2026-10-07 — 프로그램(크리에이지·댐 파티·히스토리·아이디어 무브먼트)·경쟁 PT·히어로 콘텐츠 이전
 *
 *   node scripts/madleague-programs-import.mjs          이미지 업로드
 *
 * 페이지는 lib/madleague-program-assets.ts의 madProgramAsset(group, id)로 같은 경로를 참조한다.
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __dirname = require('path').dirname(fileURLToPath(import.meta.url));
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#'))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const BUCKET = 'board-assets';
const CDN = 'https://cdn.imweb.me/thumbnail/';

// group → 아임웹 경로(YYYYMMDD/id.ext) — 원본 페이지 순서 그대로
const IMAGES = {
  creazy: ['20241214/6f08fd889c1c5.png'],
  dam: ['20241214/e55bba5dd5ebb.png', '20231009/2142ccb80a031.jpg', '20231017/b83a9480f4e95.jpg', '20231017/d9f2d062661a8.jpg',
        '20231017/2a2c77eb17f0f.jpg', '20231017/c6ee55c38851b.jpg', '20231017/76798f6f09093.jpg', '20231017/ec8dedb1cb5e4.jpg',
        '20231017/eebca32ac898a.jpg', '20231017/e9dbf1e7262c1.jpg', '20231030/4ce3bfc9ae848.png'],
  'dam-history': ['20230926/73ba05a743a0a.jpg', '20230926/f1aff9a115f41.png', '20230926/3eb7596632e82.png', '20230926/053b30d9771a6.jpg',
                  '20230926/60a278461a184.jpg', '20230926/7d88bc18b46ff.jpg', '20230926/63ba888f1c0d0.jpg', '20230926/aaf79dbf3401e.jpg',
                  '20230926/594f8f2de62e1.jpg', '20230926/c60be401d9697.png', '20230926/956b0f23d844d.jpg'],
  im: ['20241213/92372a42e8330.png', '20241213/7357b87b5ea00.png', '20241214/199b0a48b3817.png'],
  hero: ['20241213/bf978f83e29d6.png', '20241213/4ab100693b727.png', '20241213/a1ed9bf576277.png', '20241213/b5415631c9ed3.png'],
  pt: ['20260107/88dd025d720da.png',
       '20260107/3cc380de1afb6.png', '20260107/9e51de11b9c1b.png', '20260107/77efc772b91b6.png', '20260107/ebf5d1bd22680.png',
       '20250905/01ed880a45dad.png', '20250905/014e066281217.png', '20250905/0040db378fa38.png', '20250905/e69acb812da8d.png', '20250905/8f50929fa55c5.png',
       '20250905/1c6fe5c16769a.png', '20250905/ba2b35413d8f7.png', '20250905/a1d00227bff56.png', '20250905/9786f6ef75c79.png'],
};

const idOf = (p) => p.split('/').pop().replace(/\.\w+$/, '');
const dest = (group, id) => `madleague/programs/${group}/${id}.webp`;

async function upload(group, src) {
  const res = await fetch(CDN + src);
  if (!res.ok) throw new Error(`${src} ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  // 원본 PNG가 수 MB라 webp로 (폭 1920 상한)
  const buf = await sharp(input).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
  const { error } = await sb.storage.from(BUCKET).upload(dest(group, idOf(src)), buf, { contentType: 'image/webp', upsert: true });
  if (error) throw new Error(`upload ${src}: ${error.message}`);
  return buf.length;
}

(async () => {
  let n = 0, bytes = 0;
  for (const [group, list] of Object.entries(IMAGES)) {
    for (const src of list) { bytes += await upload(group, src); n++; }
    console.log(`${group}: ${list.length}`);
  }
  console.log(`images=${n} (${(bytes / 1024 / 1024).toFixed(1)}MB)`);

})().catch(e => { console.error(e); process.exit(1); });
