// 바닥상회 구매평 → planners_reviews (source='badak', 이름 가림 · 회원 연결 정보 없음) — 2026-10-14 사용자 승인 (후기만, 문의 제외)
// 입력 JSON: [{ no, title, rating, name(이미 가린 이름), date('YYYY-MM-DD HH:MM' KST), text, replies:[{date,text}] }]
//   ⚠️ 입력 파일은 저장소(git)에 넣지 않는다 — 가린 이름이라도 원본 후기 데이터
// 사용: node scripts/planners-reviews-import.mjs "<json 경로>" [--dry]
// 멱등: (file_id, created_at, masked_name, body) 같은 행이 있으면 건너뜀
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');
const [, , input, flag] = process.argv;
const DRY = flag === '--dry';
if (!input) { console.error('usage: node scripts/planners-reviews-import.mjs "<json>" [--dry]'); process.exit(1); }

const env = Object.fromEntries(
  fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// 옮기지 않은 옛 연도 판 → 같은 시리즈의 2026년판 (원래 판 이름은 edition으로 남김)
const SERIES = { 179: 182, 176: 182, 173: 182, 15: 182, 178: 183, 174: 183, 175: 184 };
const kst = d => new Date(`${d.replace(' ', 'T')}:00+09:00`).toISOString();
const maskOk = n => n === '익명' || /^.\*\*$/u.test(n);

const rows = JSON.parse(fs.readFileSync(input, 'utf8'));
const { data: files } = await sb.from('planners_files').select('id, legacy_badak_no, title');
const byNo = new Map(files.map(f => [f.legacy_badak_no, f]));

let ok = 0, skipped = 0, missing = [];
for (const r of rows) {
  if (!maskOk(r.name)) { console.error('가리지 않은 이름 — 중단', r.no); process.exit(1); }
  const target = byNo.get(SERIES[r.no] ?? r.no);
  if (!target) { missing.push(r.no); continue; }
  const reply = r.replies?.[0] ?? null;
  const row = {
    file_id: target.id,
    source: 'badak',
    masked_name: r.name,
    edition: SERIES[r.no] ? r.title : null,
    rating: r.rating,
    body: r.text.trim().slice(0, 2000),
    admin_reply: reply?.text ?? null,
    admin_replied_at: reply ? kst(reply.date) : null,
    created_at: kst(r.date),
  };
  if (DRY) { ok++; continue; }
  const { data: dup } = await sb.from('planners_reviews').select('id').eq('file_id', row.file_id).eq('created_at', row.created_at).eq('masked_name', row.masked_name).limit(1);
  if (dup?.length) { skipped++; continue; }
  const { error } = await sb.from('planners_reviews').insert(row);
  if (error) { console.error(r.no, error.message); continue; }
  ok++;
}
console.log(`${DRY ? '[dry] ' : ''}후기 ${ok}건${skipped ? ` · 이미 있음 ${skipped}` : ''}${missing.length ? ` · 상품 없음 ${missing.join(',')}` : ''}`);
