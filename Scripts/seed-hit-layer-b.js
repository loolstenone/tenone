/**
 * HIT Layer B — 50문항 시딩 SQL 생성기
 * (competency_core 18 + readiness_core 32)
 *
 * lib/hit/data/b-questions.ts 를 regex로 파싱하여
 * sql/seed-hit-v2/11-layer_b.sql 를 생성한다.
 *
 * 사용법: node Scripts/seed-hit-layer-b.js
 */

const fs   = require('fs');
const path = require('path');

const SRC     = path.join(__dirname, '..', 'lib', 'hit', 'data', 'b-questions.ts');
const OUT_DIR = path.join(__dirname, '..', 'sql', 'seed-hit-v2');
const OUT     = path.join(OUT_DIR, '11-layer_b.sql');

function sqlStr(s) {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}
function sqlJson(obj) {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function parseQuestions(src) {
  // Q('id', 'module', 'section', 'subscale', 'text', reverse, [crossTags])
  const re = /Q\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'((?:\\.|[^'\\])*)'\s*,\s*(true|false)\s*,\s*\[([^\]]*)\]\s*\)/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const id       = m[1];
    const module   = m[2];
    const section  = m[3];
    const subscale = m[4];
    const text     = m[5].replace(/\\'/g, "'").replace(/\\"/g, '"');
    const reverse  = m[6] === 'true';
    const tagsRaw  = m[7];
    const crossTags = [...tagsRaw.matchAll(/'([^']+)'/g)].map(x => x[1]);
    out.push({ id, module, section, subscale, text, reverse, crossTags });
  }
  return out;
}

function build(questions) {
  const lines = [];
  lines.push('-- HIT Layer B: 50문항 (competency_core 18 + readiness_core 32)');
  lines.push('-- 자동 생성: Scripts/seed-hit-layer-b.js');
  lines.push('');
  lines.push("DELETE FROM public.hit_questions WHERE module IN ('competency_core', 'readiness_core');");
  lines.push('');
  lines.push('INSERT INTO public.hit_questions');
  lines.push('  (id, module, test_type, question_index, question_text, sub_domain, response_type, reverse_scored, scoring_key)');
  lines.push('VALUES');

  const values = questions.map((q, i) => {
    const scoringKey = {
      section:   q.section,
      subscale:  q.subscale,
      crossTags: q.crossTags,
    };
    return (
      `  (${sqlStr(q.id)}, ${sqlStr(q.module)}, 'B', ${i + 1}, ` +
      `${sqlStr(q.text)}, ${sqlStr(q.subscale)}, 'likert7', ` +
      `${q.reverse}, ${sqlJson(scoringKey)})`
    );
  });

  lines.push(values.join(',\n') + ';');
  return lines.join('\n');
}

// ── main ────────────────────────────────────────────────────────

const src       = fs.readFileSync(SRC, 'utf8');
const questions = parseQuestions(src);

if (questions.length === 0) {
  console.error('❌ 문항이 파싱되지 않았습니다. Q() 포맷 확인 필요.');
  process.exit(1);
}

console.log(`✅ 파싱된 문항 수: ${questions.length}`);

const byModule = {};
for (const q of questions) {
  byModule[q.module] = (byModule[q.module] || 0) + 1;
}
for (const [mod, cnt] of Object.entries(byModule)) {
  console.log(`   - ${mod}: ${cnt}문항`);
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const sql = build(questions);
fs.writeFileSync(OUT, sql, 'utf8');
console.log(`✅ SQL 생성 완료: ${OUT}`);
console.log('👉 다음 단계: node scripts/run-sql.js seed-hit-v2/11-layer_b.sql');
