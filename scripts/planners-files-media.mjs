// Planner's 자료실 몰 화면용 사진·설명 반영 — scripts/data/planners-badak-mall-media.json → planners_files (legacy_badak_no 기준, 멱등)
// 사용: node scripts/planners-files-media.mjs [--dry] [--cdn]
//   기본: 바닥상회(아임웹) 사진을 공개 버킷 planners-media/badak/{파일명} 으로 복사한 뒤 그 주소를 쓴다 (2026-10-14 사용자 승인)
//   --cdn: 복사 없이 아임웹 CDN 주소를 그대로 (복사 전 임시)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');
const DRY = process.argv.includes('--dry');
const USE_CDN = process.argv.includes('--cdn');
const BUCKET = 'planners-media';

const env = Object.fromEntries(
  fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const media = JSON.parse(fs.readFileSync(path.resolve('scripts/data/planners-badak-mall-media.json'), 'utf8'));

// 1) 사진 복사 (이미 있으면 건너뜀)
const files = new Set();
for (const o of [media.gallery, media.detail]) for (const list of Object.values(o)) list.forEach(f => files.add(f));
const publicUrl = f => sb.storage.from(BUCKET).getPublicUrl(`badak/${f}`).data.publicUrl;
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' };

if (!USE_CDN) {
  const { data: existing } = await sb.storage.from(BUCKET).list('badak', { limit: 1000 });
  const have = new Set((existing ?? []).map(o => o.name));
  let copied = 0, skipped = 0, failed = [];
  for (const f of files) {
    if (have.has(f)) { skipped++; continue; }
    if (DRY) { copied++; continue; }
    try {
      const res = await fetch(media.cdn + f);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const { error } = await sb.storage.from(BUCKET).upload(`badak/${f}`, buf, { contentType: MIME[f.split('.').pop().toLowerCase()] ?? 'image/png', upsert: true });
      if (error) throw new Error(error.message);
      copied++;
    } catch (e) { failed.push(`${f} ${e.message}`); }
  }
  console.log(`사진 ${files.size}장 — 복사 ${copied} · 이미 있음 ${skipped} · 실패 ${failed.length}`);
  if (failed.length) { console.error(failed.slice(0, 10).join('\n')); process.exit(1); }
}
const url = f => (USE_CDN ? media.cdn + f : publicUrl(f));

// 2) 행 갱신
const { data: rows, error } = await sb.from('planners_files').select('id, legacy_badak_no').not('legacy_badak_no', 'is', null);
if (error) { console.error(error.message); process.exit(1); }
let ok = 0;
for (const r of rows) {
  const no = String(r.legacy_badak_no);
  const images = (media.gallery[no] ?? []).map(url);
  const detail = (media.detail[no] ?? []).map(url);
  const patch = { images, detail_images: detail, thumbnail_url: images[0] ?? null, description: media.description[no] ?? null, updated_at: new Date().toISOString() };
  if (DRY) { ok++; continue; }
  const { error: e } = await sb.from('planners_files').update(patch).eq('id', r.id);
  if (e) console.error(no, e.message); else ok++;
}
console.log(`${DRY ? '[dry] ' : ''}행 ${ok}/${rows.length}`);
