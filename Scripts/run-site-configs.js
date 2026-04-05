const https = require('https');
const fs = require('fs');

const PAT = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_73e079226d5c9eb154fe1a36d704c7e170d21b65';
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

// Read SQL file and split into executable parts
const sqlFile = fs.readFileSync('sql/site-configs-table.sql', 'utf8');

// Split by semicolons but keep INSERT as one chunk
const parts = [];

// 1. CREATE TABLE
const createMatch = sqlFile.match(/CREATE TABLE IF NOT EXISTS site_configs \([^;]+\);/s);
if (createMatch) parts.push(createMatch[0]);

// 2. CREATE INDEX
const indexMatch = sqlFile.match(/CREATE INDEX IF NOT EXISTS idx_site_configs_domain[^;]+;/);
if (indexMatch) parts.push(indexMatch[0]);

// 3. RLS
parts.push('ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY');
parts.push('DROP POLICY IF EXISTS "site_configs_read" ON site_configs');
parts.push('CREATE POLICY "site_configs_read" ON site_configs FOR SELECT USING (true)');
parts.push('DROP POLICY IF EXISTS "site_configs_write" ON site_configs');
parts.push('CREATE POLICY "site_configs_write" ON site_configs FOR ALL USING (true)');

// 4. INSERT (the big one)
const insertMatch = sqlFile.match(/INSERT INTO site_configs[\s\S]+ON CONFLICT \(site_id\) DO NOTHING;/);
if (insertMatch) parts.push(insertMatch[0]);

(async () => {
  for (let i = 0; i < parts.length; i++) {
    const r = await runSQL(parts[i]);
    const short = parts[i].substring(0, 80).replace(/\n/g, ' ');
    const ok = r.status === 200 || r.status === 201;
    console.log(`${i+1}/${parts.length} ${ok ? 'OK' : 'ERR(' + r.status + ')'} ${short}...`);
    if (!ok) {
      console.log('  → ' + r.body.substring(0, 300));
    }
  }

  // Verify
  const verify = await runSQL("SELECT site_id, name, domain FROM site_configs ORDER BY site_id LIMIT 30");
  console.log('\n=== Verification ===');
  if (verify.status === 200 || verify.status === 201) {
    const rows = JSON.parse(verify.body);
    console.log(`${rows.length} sites in DB:`);
    rows.forEach(r => console.log(`  ${r.site_id.padEnd(15)} ${r.name.padEnd(20)} ${r.domain}`));
  } else {
    console.log('Verify failed:', verify.body.substring(0, 200));
  }

  console.log('\nDone.');
})();
