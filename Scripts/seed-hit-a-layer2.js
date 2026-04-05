/**
 * HIT A Layer 2 모듈 72개 Supabase 시딩
 * 사용법: node scripts/seed-hit-a-layer2.js
 *
 * 데이터 소스: lib/hit/data/hit-a-layer2-modules.json (72개 풀 콘텐츠)
 * 대상 테이블: hit_report_modules (id TEXT PK, category, title, content)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROD_PROJECT_ID = 'ziotlxkdctlhiwkgmmsh';

function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

function runSQL(token, sql, label) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROD_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(data);
        } else {
          console.error(`  FAIL ${label} (HTTP ${res.statusCode}): ${data.slice(0, 300)}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function escSQL(str) {
  // Dollar-quoted string to avoid SQL injection / escaping issues
  let tag = 'M';
  let n = 0;
  while (str.includes(`$${tag}$`)) { tag = `M${++n}`; }
  return `$${tag}$${str}$${tag}$`;
}

async function main() {
  const env = loadEnv();
  const token = env['SUPABASE_ACCESS_TOKEN'] || env['SUPABASE_SERVICE_ROLE_KEY_PROD'];
  if (!token) {
    console.error('ERROR: SUPABASE_ACCESS_TOKEN or SUPABASE_SERVICE_ROLE_KEY_PROD not found in .env.local');
    process.exit(1);
  }

  // 1. 테이블 확인/생성
  console.log('=== Step 1: hit_report_modules 테이블 확인 ===\n');
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS hit_report_modules (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_hit_report_modules_category ON hit_report_modules(category);
    ALTER TABLE hit_report_modules ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hit_report_modules' AND policyname='hit_report_modules_public_read') THEN
        CREATE POLICY hit_report_modules_public_read ON hit_report_modules FOR SELECT TO anon USING (true);
      END IF;
    END $$;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hit_report_modules' AND policyname='hit_report_modules_auth') THEN
        CREATE POLICY hit_report_modules_auth ON hit_report_modules FOR ALL TO authenticated USING (true);
      END IF;
    END $$;
  `;
  try {
    await runSQL(token, createTableSQL, 'CREATE TABLE');
    console.log('  OK: 테이블 준비 완료\n');
  } catch {
    console.log('  테이블 이미 존재 (계속 진행)\n');
  }

  // 2. JSON 데이터 로드
  const modulesPath = path.join(__dirname, '../lib/hit/data/hit-a-layer2-modules.json');
  const modules = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));
  console.log(`=== Step 2: ${modules.length}개 모듈 시딩 ===\n`);

  // 3. 배치 UPSERT (5개씩)
  const BATCH = 5;
  let ok = 0, fail = 0;

  for (let i = 0; i < modules.length; i += BATCH) {
    const batch = modules.slice(i, i + BATCH);
    const values = batch.map(m =>
      `(${escSQL(m.id)}, ${escSQL(m.category)}, ${escSQL(m.title)}, ${escSQL(m.content)})`
    ).join(',\n      ');

    const sql = `INSERT INTO hit_report_modules (id, category, title, content)
    VALUES
      ${values}
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      category = EXCLUDED.category,
      updated_at = now();`;

    try {
      await runSQL(token, sql, `batch ${Math.floor(i / BATCH) + 1}`);
      ok += batch.length;
      process.stdout.write(`  ${ok}/${modules.length} ...  \r`);
    } catch {
      // 배치 실패 시 개별 시도
      for (const m of batch) {
        const single = `INSERT INTO hit_report_modules (id, category, title, content)
          VALUES (${escSQL(m.id)}, ${escSQL(m.category)}, ${escSQL(m.title)}, ${escSQL(m.content)})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title, content = EXCLUDED.content,
            category = EXCLUDED.category, updated_at = now();`;
        try {
          await runSQL(token, single, m.id);
          ok++;
        } catch {
          fail++;
          console.log(`  FAIL: ${m.id}`);
        }
      }
    }
  }

  console.log(`\n  시딩 완료: ${ok} 성공, ${fail} 실패\n`);

  // 4. 검증
  console.log('=== Step 3: 검증 ===\n');
  const verifySQL = `
    SELECT id, category, substring(title, 1, 40) as title_short
    FROM hit_report_modules
    WHERE category IN ('disc_primary','disc_combo','disc_low','mbti_axis','cross','sp','sp_growth','comm')
    ORDER BY category, id;`;
  try {
    const result = await runSQL(token, verifySQL, 'VERIFY');
    const rows = JSON.parse(result);
    const counts = {};
    rows.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });
    console.log('  카테고리별 카운트:');
    Object.entries(counts).sort().forEach(([cat, cnt]) => {
      console.log(`    ${cat}: ${cnt}`);
    });
    console.log(`\n  총 ${rows.length}개 (기대값: 72)`);
    if (rows.length === 72) console.log('  72개 전부 확인!');
  } catch {
    console.log('  검증 쿼리 실패 (수동 확인 필요)');
  }
}

main();
