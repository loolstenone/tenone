// Planner's 자료실 — 바닥상회(badak.biz 아임웹) PAD 플래너·템플릿 원본 → planners-files 버킷 + planners_files 테이블 (2026-10-14)
// 입력: scripts/data/planners-badak-mall.json (상품 번호·분류·이름) + 원본 폴더 (PP{번호}__{원본 파일명})
// 사용: node scripts/planners-files-import.mjs "<원본 폴더>" [--dry]
// 멱등: 파일은 badak/{번호}.{확장자} upsert, 행은 legacy_badak_no 기준 upsert (다운로드 수·공개 여부·순서는 덮어쓰지 않음 — 새 행만 기본값)
// ⚠️ 운영사 콘텐츠만. 바닥상회 0원 주문·회원 데이터는 옮기지 않는다 (CLAUDE.md §0.1)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');

const [, , dir, flag] = process.argv;
const DRY = flag === '--dry';
if (!dir) { console.error('usage: node scripts/planners-files-import.mjs "<원본 폴더>" [--dry]'); process.exit(1); }

// .env.local에서 필요한 값만 읽는다 (출력하지 않음)
const env = Object.fromEntries(
  fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
    .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const BUCKET = 'planners-files';
const data = JSON.parse(fs.readFileSync(path.resolve('scripts/data/planners-badak-mall.json'), 'utf8'));

// 아임웹 분류 → 사이트 분류 (kind: planner = 본체, template = 서식·자료)
const CATEGORY = {
  '연간 플래너': ['planner', '연간 플래너'],
  '노트 북': ['planner', '노트 북'],
  '프로젝트 북': ['planner', '프로젝트 북'],
  '노트': ['template', '노트'],
  '노트/스터디': ['template', '스터디'],
  '프레임 워크/스터디': ['template', '스터디'],
  '스케쥴': ['template', '스케줄'],
  '프레임 워크': ['template', '프레임워크'],
  '플레이': ['template', '플레이'],
  '스타트업': ['template', '스타트업'],
  '아이디어 샤워': ['template', '아이디어 샤워'],
};
// 아이디어 샤워 4종 전부 비공개 — '사례' 모음 3종은 타사 작품(저작권 확인 전), 모두의 캠페인 4번은 2026-10-14 사용자 결정으로 숨김
const HOLD = { ...data.unpublished, 5: '타사 작품 사례 모음 — 저작권 확인 전', 3: '타사 작품 사례 모음 — 저작권 확인 전', 2: '타사 작품 사례 모음 — 저작권 확인 전', 4: '아이디어 샤워 숨김 (사용자 결정)' };
// 분류 바로잡기 (상품 번호 → 사이트 분류) — 168 가계부: 아임웹 '노트/스터디' → 노트 (2026-10-14 사용자 지적)
const CATEGORY_FIX = { 168: '노트' };
const MIME = { pdf: 'application/pdf', zip: 'application/zip', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', png: 'image/png' };

/** 'Note_라인 기본' → '라인 기본' (분류가 따로 있으니 접두어는 뺀다) */
const cleanTitle = t => t.replace(/^(Note|FW|Schedule|Play)_\s*/, '').trim();

const files = new Map(fs.readdirSync(dir).map(f => [Number(f.match(/^PP(\d+)__/)?.[1]), f]).filter(([n]) => n));
let ok = 0, missing = [];
for (const [no, imwebCat, name] of data.items) {
  const file = files.get(no);
  if (!file) { missing.push(no); continue; }
  const [kind, mapped] = CATEGORY[imwebCat];
  const category = CATEGORY_FIX[no] ?? mapped;
  const originalName = file.replace(/^PP\d+__/, '');
  const ext = path.extname(originalName).slice(1).toLowerCase();
  const filePath = `badak/${no}.${ext}`;
  const size = fs.statSync(path.join(dir, file)).size;
  const year = kind === 'planner' && imwebCat === '연간 플래너' ? Number(name.match(/^(\d{4})/)?.[1]) || null : null;
  if (DRY) { console.log(no, kind, category, cleanTitle(name), filePath, size, HOLD[no] ? '(비공개)' : ''); ok++; continue; }

  const { error: upErr } = await sb.storage.from(BUCKET).upload(filePath, fs.readFileSync(path.join(dir, file)), { contentType: MIME[ext], upsert: true });
  if (upErr) { console.error('업로드 실패', no, upErr.message); continue; }

  const { data: existing } = await sb.from('planners_files').select('id').eq('legacy_badak_no', no).maybeSingle();
  const row = { kind, category, title: cleanTitle(name), year, file_path: filePath, file_name: originalName, file_size: size, mime_type: MIME[ext], updated_at: new Date().toISOString() };
  const { error } = existing
    ? await sb.from('planners_files').update(row).eq('id', existing.id)
    : await sb.from('planners_files').insert({ ...row, legacy_badak_no: no, sort_order: no, is_published: !HOLD[no] });
  if (error) { console.error('행 저장 실패', no, error.message); continue; }
  ok++;
}
console.log(`${DRY ? '[dry] ' : ''}완료 ${ok}/${data.items.length}${missing.length ? ` · 원본 없음 ${missing.join(',')}` : ''}`);
