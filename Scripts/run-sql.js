/**
 * Ten:One Prod SQL 실행 스크립트
 * 사용법: node scripts/run-sql.js [파일명]
 *   예: node scripts/run-sql.js agent-tables.sql
 *   전체: node scripts/run-sql.js (PENDING_FILES 전부 실행)
 *
 * 필요 환경변수 (.env.local):
 *   SUPABASE_SERVICE_ROLE_KEY_PROD=eyJ...
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROD_PROJECT_ID = 'ziotlxkdctlhiwkgmmsh';
const SQL_DIR = path.join(__dirname, '../sql');

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

const PENDING_FILES = [
  'erp-finance-tables.sql',
  'monthly-forecasts-table.sql',
  'standard-rates-table.sql',
  'agent-tables.sql',
  'workflow-tables.sql',
  'badaksoe-rooms-table.sql',
];

async function runSQL(serviceRoleKey, sql, label) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROD_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`SUCCESS ${label} (HTTP ${res.statusCode})`);
          resolve(data);
        } else {
          console.error(`FAIL ${label} (HTTP ${res.statusCode}): ${data.slice(0, 200)}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const env = loadEnv();
  // Management API는 PAT(SUPABASE_ACCESS_TOKEN)를 사용한다.
  // 호환성을 위해 SUPABASE_SERVICE_ROLE_KEY_PROD도 받지만, .env.local에는 SUPABASE_ACCESS_TOKEN이 표준.
  const serviceRoleKey = env['SUPABASE_ACCESS_TOKEN'] || env['SUPABASE_SERVICE_ROLE_KEY_PROD'];
  if (!serviceRoleKey) {
    console.error('ERROR: SUPABASE_ACCESS_TOKEN (또는 SUPABASE_SERVICE_ROLE_KEY_PROD) not found in .env.local');
    process.exit(1);
  }
  const files = process.argv[2] ? [process.argv[2]] : PENDING_FILES;
  console.log(`Running ${files.length} SQL file(s) on Prod...\n`);
  let ok = 0, fail = 0;
  for (const file of files) {
    const p = path.join(SQL_DIR, file);
    if (!fs.existsSync(p)) { console.warn(`SKIP ${file} (not found)`); continue; }
    try { await runSQL(serviceRoleKey, fs.readFileSync(p, 'utf8'), file); ok++; }
    catch { fail++; }
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`);
}
main();
