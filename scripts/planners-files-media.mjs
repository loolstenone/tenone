// Planner's 자료실 몰 화면용 사진·설명 반영 — scripts/data/planners-badak-mall-media.json → planners_files (legacy_badak_no 기준, 멱등)
// 사용: node scripts/planners-files-media.mjs [--dry]
// 이미지는 지금 바닥상회(아임웹) CDN 주소를 그대로 쓴다 — badak.biz 종료 전에 Storage로 옮겨야 한다 (app/(Planners)/CLAUDE.md)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');
const DRY = process.argv[2] === '--dry';

const env = Object.fromEntries(
  fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const media = JSON.parse(fs.readFileSync(path.resolve('scripts/data/planners-badak-mall-media.json'), 'utf8'));
const url = f => media.cdn + f;

const { data: rows, error } = await sb.from('planners_files').select('id, legacy_badak_no').not('legacy_badak_no', 'is', null);
if (error) { console.error(error.message); process.exit(1); }
let ok = 0;
for (const r of rows) {
  const no = String(r.legacy_badak_no);
  const images = (media.gallery[no] ?? []).map(url);
  const detail = (media.detail[no] ?? []).map(url);
  const patch = { images, detail_images: detail, thumbnail_url: images[0] ?? null, description: media.description[no] ?? null, updated_at: new Date().toISOString() };
  if (DRY) { console.log(no, images.length, detail.length, patch.description ? 'desc' : ''); ok++; continue; }
  const { error: e } = await sb.from('planners_files').update(patch).eq('id', r.id);
  if (e) console.error(no, e.message); else ok++;
}
console.log(`${DRY ? '[dry] ' : ''}완료 ${ok}/${rows.length}`);
