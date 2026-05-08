/**
 * planners-moments → myverse-moments 버킷 마이그레이션
 *
 * 실행 전 .env.local에 SUPABASE_SERVICE_ROLE_KEY 추가 필요:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *
 * 실행: node scripts/migrate-moments-bucket.js
 */

const fs = require("fs");
const https = require("https");

const PROJECT = "ziotlxkdctlhiwkgmmsh";
const SB_URL = "https://ziotlxkdctlhiwkgmmsh.supabase.co";
const OLD_BUCKET = "planners-moments";
const NEW_BUCKET = "myverse-moments";

function loadEnv() {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

function httpsRequest(url, opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, opts, (res) => {
      const chunks = [];
      res.on("data", (d) => chunks.push(d));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function sqlQuery(pat, query) {
  const data = JSON.stringify({ query });
  const res = await httpsRequest(
    `https://api.supabase.com/v1/projects/${PROJECT}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + pat,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    },
    data
  );
  return JSON.parse(res.body.toString());
}

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on("data", (d) => chunks.push(d));
      res.on("end", () => resolve({ body: Buffer.concat(chunks), contentType: res.headers["content-type"] }));
    }).on("error", reject);
  });
}

async function uploadFile(serviceKey, bucket, path, fileBuffer, contentType) {
  const res = await httpsRequest(
    `${SB_URL}/storage/v1/object/${bucket}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + serviceKey,
        "Content-Type": contentType || "application/octet-stream",
        "Content-Length": fileBuffer.length,
        "x-upsert": "true",
      },
    },
    fileBuffer
  );
  return res;
}

async function main() {
  const env = loadEnv();
  const PAT = env["SUPABASE_ACCESS_TOKEN"];
  const SERVICE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!SERVICE_KEY) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다.");
    console.error("   Supabase Dashboard > Settings > API > service_role 키를 추가하세요.");
    process.exit(1);
  }

  console.log("1. planners-moments 오브젝트 목록 조회...");
  const objects = await sqlQuery(PAT, `SELECT id, name, metadata FROM storage.objects WHERE bucket_id = '${OLD_BUCKET}';`);
  console.log(`   ${objects.length}개 오브젝트 발견`);

  for (const obj of objects) {
    const oldUrl = `${SB_URL}/storage/v1/object/public/${OLD_BUCKET}/${obj.name}`;
    console.log(`\n2. 다운로드: ${obj.name}`);
    const file = await downloadFile(oldUrl);
    console.log(`   다운로드 완료 (${file.body.length} bytes, ${file.contentType})`);

    console.log(`   업로드 → ${NEW_BUCKET}/${obj.name}`);
    const uploadRes = await uploadFile(SERVICE_KEY, NEW_BUCKET, obj.name, file.body, file.contentType);
    if (uploadRes.status === 200 || uploadRes.status === 201) {
      console.log(`   ✅ 업로드 성공`);
    } else {
      console.error(`   ❌ 업로드 실패: ${uploadRes.status} ${uploadRes.body.toString()}`);
      continue;
    }

    // storage.objects bucket_id 업데이트
    await sqlQuery(PAT, `UPDATE storage.objects SET bucket_id = '${NEW_BUCKET}' WHERE id = '${obj.id}';`);
  }

  console.log("\n3. myverse_daily_moments media_url URL 업데이트...");
  const urlUpdate = await sqlQuery(
    PAT,
    `UPDATE myverse_daily_moments
     SET media_url = REPLACE(media_url, '/planners-moments/', '/myverse-moments/'),
         thumbnail_url = REPLACE(thumbnail_url, '/planners-moments/', '/myverse-moments/')
     WHERE media_url LIKE '%planners-moments%' OR thumbnail_url LIKE '%planners-moments%'
     RETURNING id;`
  );
  console.log(`   ✅ ${urlUpdate.length}개 행 URL 업데이트 완료`);

  console.log("\n✅ 마이그레이션 완료!");
  console.log("   planners-moments 버킷은 수동으로 삭제하세요 (Supabase Dashboard > Storage)");
}

main().catch(console.error);
