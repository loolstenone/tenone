/**
 * Myverse 노트 마커 마이그레이션
 * planners: → myverse: 마커 일괄 교체
 *
 * 대상 테이블:
 *   - myverse_project_notes.content (handwriting, tpl, canvas 마커)
 *   - myverse_canvases.data (canvas 마커)
 *   - myverse_daily.notes JSONB (canvas 참조)
 *
 * 실행: node scripts/migrate-note-markers.js [--dry-run]
 */

const https = require("https");
const fs = require("fs");

const PROJECT = "ziotlxkdctlhiwkgmmsh";

function loadEnv() {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

function apiCall(pat, query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const opts = {
      hostname: "api.supabase.com",
      path: `/v1/projects/${PROJECT}/database/query`,
      method: "POST",
      headers: {
        Authorization: "Bearer " + pat,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(opts, (res) => {
      let buf = "";
      res.on("data", (d) => (buf += d));
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(buf) }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const env = loadEnv();
  const PAT = env["SUPABASE_ACCESS_TOKEN"];
  const isDryRun = process.argv.includes("--dry-run");

  if (isDryRun) console.log("🔍 DRY RUN 모드 — 실제 변경 없음\n");

  // 1. myverse_project_notes: planners:handwriting → myverse:handwriting
  const hwCount = await apiCall(PAT, `
    SELECT count(*) FROM myverse_project_notes
    WHERE content LIKE '%planners:handwriting%';
  `);
  console.log(`1. planners:handwriting 노트: ${hwCount.body[0]?.count ?? 0}개`);

  if (!isDryRun && parseInt(hwCount.body[0]?.count ?? "0") > 0) {
    const r = await apiCall(PAT, `
      UPDATE myverse_project_notes
      SET content = REPLACE(content, '<!-- planners:handwriting -->', '<!-- myverse:handwriting -->')
      WHERE content LIKE '%<!-- planners:handwriting -->%'
      RETURNING id;
    `);
    console.log(`   ✅ ${r.body.length}개 업데이트`);
  }

  // 2. myverse_project_notes: planners:tpl= → myverse:tpl=
  const tplCount = await apiCall(PAT, `
    SELECT count(*) FROM myverse_project_notes
    WHERE content LIKE '%planners:tpl=%';
  `);
  console.log(`2. planners:tpl 노트: ${tplCount.body[0]?.count ?? 0}개`);

  if (!isDryRun && parseInt(tplCount.body[0]?.count ?? "0") > 0) {
    const r = await apiCall(PAT, `
      UPDATE myverse_project_notes
      SET content = REGEXP_REPLACE(content, '<!-- planners:tpl=', '<!-- myverse:tpl=', 'g')
      WHERE content LIKE '%<!-- planners:tpl=%'
      RETURNING id;
    `);
    console.log(`   ✅ ${r.body.length}개 업데이트`);
  }

  // 3. myverse_project_notes: planners:canvas= → myverse:canvas=
  const canvasCount = await apiCall(PAT, `
    SELECT count(*) FROM myverse_project_notes
    WHERE content LIKE '%planners:canvas=%';
  `);
  console.log(`3. planners:canvas 노트: ${canvasCount.body[0]?.count ?? 0}개`);

  if (!isDryRun && parseInt(canvasCount.body[0]?.count ?? "0") > 0) {
    const r = await apiCall(PAT, `
      UPDATE myverse_project_notes
      SET content = REGEXP_REPLACE(content, '<!-- planners:canvas=', '<!-- myverse:canvas=', 'g')
      WHERE content LIKE '%<!-- planners:canvas=%'
      RETURNING id;
    `);
    console.log(`   ✅ ${r.body.length}개 업데이트`);
  }

  console.log(isDryRun ? "\n✅ DRY RUN 완료 (변경 없음)" : "\n✅ 마이그레이션 완료");
}

main().catch(console.error);
