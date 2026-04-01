const https = require('https');
const fs = require('fs');
const path = require('path');

const PAT = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_36c62ea88ada59834815c671dc114306aa202b77';
const PROJECT = 'ziotlxkdctlhiwkgmmsh';

async function runSQL(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const options = {
      hostname: 'api.supabase.com',
      path: '/v1/projects/' + PROJECT + '/database/query',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + PAT,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const SQL_FILES = [
  'sql/erp-finance-tables.sql',
  'sql/monthly-forecasts-table.sql',
  'sql/standard-rates-table.sql',
  'sql/agent-tables.sql',
  'sql/workflow-tables.sql',
  'sql/badaksoe-rooms-table.sql',
  'supabase/migrations/007_shop_promotions.sql',
];

(async () => {
  const root = path.join(__dirname, '..');
  for (const filePath of SQL_FILES) {
    const abs = path.join(root, filePath);
    if (!fs.existsSync(abs)) {
      console.log(`SKIP (not found): ${filePath}`);
      continue;
    }
    const sql = fs.readFileSync(abs, 'utf8');
    const r = await runSQL(sql);
    const ok = [200, 201].includes(r.status);
    console.log(`${ok ? 'OK  ' : 'ERR '} ${filePath}${ok ? '' : '\n  -> ' + r.body.substring(0, 300)}`);
  }
  console.log('\nDone.');
})();
