/**
 * HIT Layer D — 142문항 시딩 SQL 생성기
 *
 * lib/hit/data/d-questions.ts 를 regex로 파싱하여
 * sql/seed-hit-v2/08-layer_d.sql 를 생성한다.
 *
 * 사용법: node scripts/seed-hit-layer-d.js
 *
 * 생성된 SQL 파일은 메인 클로드에서 MCP로 별도 실행한다.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'lib', 'hit', 'data', 'd-questions.ts');
const OUT_DIR = path.join(__dirname, '..', 'sql', 'seed-hit-v2');
const OUT = path.join(OUT_DIR, '08-layer_d.sql');

function sqlStr(s) {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}
function sqlJson(obj) {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function parseQuestions(src) {
  // Q('id', 'section', 'subscale', 'text', reverse, [crossTags])
  const re = /Q\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'((?:\\.|[^'\\])*)'\s*,\s*(true|false)\s*,\s*\[([^\]]*)\]\s*\)/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const id = m[1];
    const section = m[2];
    const subscale = m[3];
    const text = m[4].replace(/\\'/g, "'").replace(/\\"/g, '"');
    const reverse = m[5] === 'true';
    const tagsRaw = m[6];
    const crossTags = [...tagsRaw.matchAll(/'([^']+)'/g)].map(x => x[1]);
    out.push({ id, section, subscale, text, reverse, crossTags });
  }
  return out;
}

function build(questions) {
  const lines = [];
  lines.push('-- HIT Layer D: 142문항 (140 + 미끼 2)');
  lines.push('-- HIT_D_Final.md 설계서 기반');
  lines.push('-- 자동 생성: scripts/seed-hit-layer-d.js');
  lines.push('');
  lines.push('DELETE FROM public.hit_questions WHERE module = \'layer_d\';');
  lines.push('');
  lines.push('INSERT INTO public.hit_questions');
  lines.push('  (id, module, test_type, question_index, question_text, sub_domain, response_type, reverse_scored, scoring_key)');
  lines.push('VALUES');

  const values = questions.map((q, i) => {
    const scoringKey = {
      section: q.section,
      subscale: q.subscale,
      crossTags: q.crossTags,
    };
    return `  (${sqlStr(q.id)}, 'layer_d', 'D', ${i}, ${sqlStr(q.text)}, ${sqlStr(q.subscale)}, 'likert7', ${q.reverse}, ${sqlJson(scoringKey)})`;
  });

  lines.push(values.join(',\n') + ';');
  lines.push('');
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const src = fs.readFileSync(SRC, 'utf8');
  const questions = parseQuestions(src);
  if (questions.length !== 142) {
    console.warn(`[WARN] expected 142 questions, parsed ${questions.length}`);
  }
  const sql = build(questions);
  fs.writeFileSync(OUT, sql, 'utf8');
  console.log(`[OK] ${questions.length} questions → ${OUT}`);
  const counts = {};
  questions.forEach(q => { counts[q.section] = (counts[q.section] || 0) + 1; });
  console.log('섹션별:', counts);
}

main();
