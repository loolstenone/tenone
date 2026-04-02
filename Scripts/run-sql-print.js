/**
 * SQL 실행 후 결과를 출력하는 스크립트
 * 사용법: node scripts/run-sql-print.js "SELECT ..."
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const PROD_PROJECT_ID = 'ziotlxkdctlhiwkgmmsh';

function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

async function runSQL(sql) {
  const key = loadEnv()['SUPABASE_SERVICE_ROLE_KEY_PROD'];
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROD_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}`, 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const sql = process.argv[2];
if (!sql) { console.error('Usage: node run-sql-print.js "SELECT ..."'); process.exit(1); }

runSQL(sql).then(r => {
  if (Array.isArray(r)) {
    console.table(r);
  } else {
    console.log(JSON.stringify(r, null, 2));
  }
}).catch(console.error);
