// 공개 버킷의 큰 원본 이미지를 웹용(최대 2000px WebP)으로 다시 저장 — 같은 경로에 덮어써 게시글 주소는 그대로
// 2026-10-15: 아임웹에서 원본째 옮긴 RooK 이미지(1~16MB)를 크롤러가 반복해서 받아 Supabase Cached Egress 초과
// 사용: node scripts/storage-image-shrink.mjs <bucket> <prefix> [--min-kb=1000] [--backup=<폴더>] [--apply]
//   --apply 없으면 미리보기(받아서 줄여 보기만, 덮어쓰지 않음) · --apply면 원본을 backup 폴더에 저장한 뒤 덮어쓴다
//   원본 백업은 저장소 밖(G드라이브)에 — 저장소는 공개 (project_repo_is_public)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_PATH || 'sharp');
const { shrinkImage } = await import('../lib/image-rules.mjs');

const [bucket, prefix] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flag = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const APPLY = process.argv.includes('--apply');
const MIN_BYTES = Number(flag('min-kb', '1000')) * 1024;
const BACKUP = flag('backup', '');
if (!bucket || !prefix) { console.error('usage: node scripts/storage-image-shrink.mjs <bucket> <prefix> [--min-kb=1000] [--backup=dir] [--apply]'); process.exit(1); }
if (APPLY && !BACKUP) { console.error('--apply에는 --backup=<폴더> 필요 (원본 보관)'); process.exit(1); }

// .env.local에서 필요한 값만 읽는다 (출력하지 않음)
const env = Object.fromEntries(
  fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^["']|["']$/g, '').trim()])
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { Authorization: `Bearer ${KEY}`, apikey: KEY };

async function listAll(dir) {
  const out = [];
  for (let offset = 0; ; offset += 100) {
    const r = await fetch(`${URL_}/storage/v1/object/list/${bucket}`, {
      method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: dir, limit: 100, offset }),
    });
    const items = await r.json();
    if (!Array.isArray(items)) throw new Error(JSON.stringify(items));
    for (const it of items) {
      const full = dir ? `${dir}/${it.name}` : it.name;
      if (it.id === null) out.push(...await listAll(full)); // 폴더
      else out.push({ name: full, size: it.metadata?.size ?? 0, type: it.metadata?.mimetype ?? '' });
    }
    if (items.length < 100) break;
  }
  return out;
}

const encPath = n => n.split('/').map(encodeURIComponent).join('/');
const files = (await listAll(prefix)).filter(f => f.size >= MIN_BYTES && /^image\/(png|jpe?g|gif|webp)\b/.test(f.type));
console.log(`${bucket}/${prefix}: ${MIN_BYTES / 1024}KB 이상 이미지 ${files.length}개, ${(files.reduce((s, f) => s + f.size, 0) / 1048576).toFixed(1)}MB${APPLY ? '' : ' (미리보기)'}`);

let before = 0, after = 0, done = 0, skipped = 0, failed = 0;
for (const f of files) {
  try {
    const r = await fetch(`${URL_}/storage/v1/object/${bucket}/${encPath(f.name)}`, { headers: H });
    if (!r.ok) throw new Error(`download ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const out = await shrinkImage(sharp, buf);
    // 20% 이상 줄지 않으면 그대로 둔다
    if (!out || out.length > buf.length * 0.8) { skipped++; continue; }
    before += buf.length; after += out.length;
    if (APPLY) {
      const dest = path.join(BACKUP, bucket, f.name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
      const u = await fetch(`${URL_}/storage/v1/object/${bucket}/${encPath(f.name)}`, {
        method: 'PUT', headers: { ...H, 'Content-Type': 'image/webp', 'x-upsert': 'true', 'cache-control': 'max-age=86400' }, body: out,
      });
      if (!u.ok) throw new Error(`upload ${u.status} ${await u.text()}`);
    }
    done++;
    if (done % 20 === 0) console.log(`  ${done}/${files.length} …`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${f.name}: ${e.message}`);
  }
}
console.log(`${APPLY ? '다시 저장' : '줄일 수 있음'} ${done}개 · 그대로 ${skipped}개 · 실패 ${failed}개 · ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB (${before ? Math.round((1 - after / before) * 100) : 0}% 감소)`);
