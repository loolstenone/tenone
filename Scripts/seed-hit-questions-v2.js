/**
 * HIT Phase 5 — 신규 6개 모듈 문항 시딩
 *
 * TS 데이터 파일을 regex로 파싱하여 hit_questions 테이블에 INSERT.
 *
 * 사용법: node scripts/seed-hit-questions-v2.js
 * 필요: .env.local SUPABASE_ACCESS_TOKEN
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROD_PROJECT_ID = 'ziotlxkdctlhiwkgmmsh';
const DATA_DIR = path.join(__dirname, '..', 'lib', 'hit', 'data');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

/**
 * 공통 object block 파서 — 간단한 TS 객체 리터럴을 JS 객체로
 * 지원: string, boolean, string array
 */
function parseObjectBlock(block) {
  const obj = {};
  // id: 'xxx'
  const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
  if (idM) obj.id = idM[1];

  // text: '...' (single or double quote; allow escaped chars)
  const textM = block.match(/text:\s*(['"])((?:\\.|(?!\1).)*)\1/);
  if (textM) obj.text = textM[2].replace(/\\'/g, "'").replace(/\\"/g, '"');

  // reverse: true/false
  const revM = block.match(/reverse:\s*(true|false)/);
  if (revM) obj.reverse = revM[1] === 'true';

  // direction / axis / subscale / area / btType / hollandType / subDomain
  const pick = (key) => {
    const m = block.match(new RegExp(`${key}:\\s*['"]([^'"]+)['"]`));
    return m ? m[1] : null;
  };
  obj.direction = pick('direction');
  obj.axis = pick('axis');
  obj.subscale = pick('subscale');
  obj.area = pick('area');
  obj.btType = pick('btType');
  obj.hollandType = pick('hollandType');
  obj.subDomain = pick('subDomain');
  obj.darkTag = pick('darkTag');

  // arrays: discCross / spowerContrib / mbtiTags / mbtiCross
  const arr = (key) => {
    const m = block.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`));
    if (!m) return [];
    return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1]);
  };
  obj.discCross = arr('discCross');
  obj.spowerContrib = arr('spowerContrib');
  obj.mbtiTags = arr('mbtiTags');
  obj.mbtiCross = arr('mbtiCross');

  return obj;
}

/**
 * TS 파일 내 모든 { ... } 객체 블록 추출
 * 중괄호 균형 체크로 배열 요소 분리
 */
function extractObjects(source) {
  const objects = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let stringChar = null;
  let escaped = false;

  for (let i = 0; i < source.length; i++) {
    const c = source[i];

    if (escaped) { escaped = false; continue; }
    if (c === '\\') { escaped = true; continue; }

    if (inString) {
      if (c === stringChar) { inString = false; stringChar = null; }
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      inString = true;
      stringChar = c;
      continue;
    }

    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        const block = source.slice(start, i + 1);
        // 객체 블록이 id: 를 포함해야 문항으로 간주 (인터페이스 정의 제외)
        if (/id:\s*['"]/.test(block)) {
          objects.push(block);
        }
        start = -1;
      }
    }
  }
  return objects;
}

function readFile(name) {
  return fs.readFileSync(path.join(DATA_DIR, name), 'utf8');
}

// SQL 문자열 이스케이프 (작은따옴표 → '')
function sqlStr(s) {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

function sqlJson(obj) {
  // JSON.stringify 후 SQL 문자열로 (한국어 그대로)
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function buildInsert(module, rows) {
  if (!rows.length) return '';
  const values = rows.map((r, i) =>
    `  (${sqlStr(r.id)}, ${sqlStr(module)}, 'A', ${i}, ${sqlStr(r.text)}, ${sqlStr(r.sub)}, 'likert7', ${r.reverse}, ${sqlJson(r.scoringKey)})`
  ).join(',\n');
  return `INSERT INTO public.hit_questions (id, module, test_type, question_index, question_text, sub_domain, response_type, reverse_scored, scoring_key)\nVALUES\n${values};`;
}

// ── 모듈별 매퍼 ──

function mapPT(objs) {
  return objs.map(o => ({
    id: o.id,
    text: o.text,
    reverse: o.reverse || false,
    sub: o.direction,
    scoringKey: { axis: o.axis, direction: o.direction, discCross: o.discCross, spowerContrib: o.spowerContrib },
  }));
}

function mapBT(objs) {
  return objs.map(o => ({
    id: o.id,
    text: o.text,
    reverse: o.reverse || false,
    sub: o.btType,
    scoringKey: { btType: o.btType, mbtiTags: o.mbtiTags, darkTag: o.darkTag || null },
  }));
}

function mapCHCore(objs) {
  return objs.map(o => ({
    id: o.id,
    text: o.text,
    reverse: o.reverse || false,
    sub: o.area,
    scoringKey: { area: o.area, subDomain: o.subDomain, darkTag: o.darkTag || null },
  }));
}

function mapAPCore(objs) {
  return objs.map(o => ({
    id: o.id,
    text: o.text,
    reverse: false,
    sub: o.hollandType,
    scoringKey: { hollandType: o.hollandType, discCross: o.discCross, mbtiCross: o.mbtiCross },
  }));
}

function mapCHDeep(objs) {
  return objs.map(o => ({
    id: o.id,
    text: o.text,
    reverse: o.reverse || false,
    sub: o.subscale,
    scoringKey: { subscale: o.subscale, darkTag: o.darkTag || null },
  }));
}

function mapAPDeep(objs) {
  return objs.map(o => ({
    id: o.id,
    text: o.text,
    reverse: false,
    sub: o.hollandType,
    scoringKey: { hollandType: o.hollandType },
  }));
}

async function runSQL(token, sql, label) {
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
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`  ✓ ${label} — ${res.statusCode}`);
          resolve(data);
        } else {
          console.error(`  ✗ ${label} — ${res.statusCode}: ${data}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const outputMode = process.argv.includes('--sql-only');

  let token = null;
  if (!outputMode) {
    const env = loadEnv();
    token = env.SUPABASE_ACCESS_TOKEN;
    if (!token) {
      console.log('No SUPABASE_ACCESS_TOKEN — switching to SQL-only mode (output files, no execution)');
    }
  }

  console.log('Reading TS data files...');
  const ptSrc = readFile('pt-questions.ts');
  const btSrc = readFile('bt-questions.ts');
  const chCoreSrc = readFile('ch-core-questions.ts');
  const apCoreSrc = readFile('ap-core-questions.ts');
  const chDeepSrc = readFile('ch-deep-questions.ts');
  const apDeepSrc = readFile('ap-deep-questions.ts');

  console.log('Parsing objects...');
  const pt = mapPT(extractObjects(ptSrc).map(parseObjectBlock));
  const bt = mapBT(extractObjects(btSrc).map(parseObjectBlock));
  const chCore = mapCHCore(extractObjects(chCoreSrc).map(parseObjectBlock));
  const apCore = mapAPCore(extractObjects(apCoreSrc).map(parseObjectBlock));
  const chDeep = mapCHDeep(extractObjects(chDeepSrc).map(parseObjectBlock));
  const apDeep = mapAPDeep(extractObjects(apDeepSrc).map(parseObjectBlock));

  console.log(`Parsed: PT=${pt.length}, BT=${bt.length}, CH-core=${chCore.length}, AP-core=${apCore.length}, CH-deep=${chDeep.length}, AP-deep=${apDeep.length}`);
  console.log(`Total: ${pt.length + bt.length + chCore.length + apCore.length + chDeep.length + apDeep.length}`);

  // Expected: 62 + 40 + 40 + 30 + 45 + 30 = 247
  const expected = { pt: 62, bt: 40, chCore: 40, apCore: 30, chDeep: 45, apDeep: 30 };
  const actual = { pt: pt.length, bt: bt.length, chCore: chCore.length, apCore: apCore.length, chDeep: chDeep.length, apDeep: apDeep.length };
  let mismatch = false;
  for (const [k, v] of Object.entries(expected)) {
    if (actual[k] !== v) {
      console.error(`  ✗ ${k}: expected ${v}, got ${actual[k]}`);
      mismatch = true;
    }
  }
  if (mismatch) {
    console.error('Count mismatch. Aborting.');
    process.exit(1);
  }

  const sqlDir = path.join(__dirname, '..', 'sql', 'seed-hit-v2');
  if (!fs.existsSync(sqlDir)) fs.mkdirSync(sqlDir, { recursive: true });

  const batches = [
    ['personality_type', pt],
    ['behavior_type', bt],
    ['character_core', chCore],
    ['aptitude_core', apCore],
    ['character_deep', chDeep],
    ['aptitude_deep', apDeep],
  ];

  // Always write SQL files (for reference/backup)
  const deleteSQL = `DELETE FROM public.hit_questions WHERE module IN ('personality_type', 'behavior_type', 'character_core', 'aptitude_core', 'character_deep', 'aptitude_deep');\n`;
  fs.writeFileSync(path.join(sqlDir, '00-delete-old.sql'), deleteSQL);

  let fileIdx = 1;
  for (const [module, rows] of batches) {
    const sql = buildInsert(module, rows);
    const fname = `${String(fileIdx).padStart(2, '0')}-${module}.sql`;
    fs.writeFileSync(path.join(sqlDir, fname), sql + '\n');
    console.log(`  wrote ${fname} (${rows.length} rows)`);
    fileIdx++;
  }

  if (!token) {
    console.log('\n✓ SQL files written to sql/seed-hit-v2/ — execute via MCP apply_migration');
    return;
  }

  // Execute directly
  console.log('\nClearing existing data...');
  await runSQL(token, deleteSQL, 'DELETE old modules');

  console.log('\nInserting new data...');
  for (const [module, rows] of batches) {
    const sql = buildInsert(module, rows);
    await runSQL(token, sql, `INSERT ${module} (${rows.length})`);
  }

  console.log('\nVerifying...');
  const verifyResult = await runSQL(token,
    `SELECT module, COUNT(*) AS cnt FROM public.hit_questions WHERE module IN ('personality_type', 'behavior_type', 'character_core', 'aptitude_core', 'character_deep', 'aptitude_deep') GROUP BY module ORDER BY module;`,
    'VERIFY counts'
  );
  console.log('\nFinal counts:');
  console.log(verifyResult);

  console.log('\n✓ Phase 5 seeding complete.');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
