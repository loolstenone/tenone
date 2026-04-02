const https = require('https');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/SUPABASE_ACCESS_TOKEN=(.+)/)?.[1]?.trim();

function parseRss(xml, source, category) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const b = m[1];
    const title = (b.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || b.match(/<title>(.*?)<\/title>/)?.[1] || '').trim();
    const link = (b.match(/<link>(.*?)<\/link>/)?.[1] || '').trim();
    const desc = (b.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] || b.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '').replace(/<[^>]*>/g, '').trim().slice(0, 400);
    const pubDate = b.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    if (title && link) items.push({ title, link, desc, pubDate, source, category });
  }
  return items;
}

function esc(s) { return s.replace(/'/g, "''"); }

async function runSql(sql) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: '/v1/projects/ziotlxkdctlhiwkgmmsh/database/query',
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, data: d })); });
    req.write(body);
    req.end();
  });
}

async function run() {
  const sources = [
    { name: '모비인사이드', url: 'https://www.mobiinside.co.kr/feed', category: 'marketing' },
    { name: '플래텀', url: 'https://platum.kr/feed', category: 'startup' },
  ];
  let ok = 0, fail = 0;
  for (const src of sources) {
    const res = await fetch(src.url, { signal: AbortSignal.timeout(10000) });
    const xml = await res.text();
    const items = parseRss(xml, src.name, src.category).slice(0, 10);
    for (const item of items) {
      const pubAt = item.pubDate ? `'${new Date(item.pubDate).toISOString()}'` : 'NULL';
      const sql = `INSERT INTO collected_data (source_name, source_type, title, content, url, category, published_at, status, tenant_id, collected_at) VALUES ('${esc(item.source)}', 'rss', '${esc(item.title)}', '${esc(item.desc)}', '${esc(item.link)}', '${item.category}', ${pubAt}, 'raw', 'tenone', now()) ON CONFLICT (url) DO NOTHING;`;
      const result = await runSql(sql);
      if (result.status === 201) ok++;
      else { fail++; if (fail <= 2) console.log('ERR:', result.data.slice(0, 200)); }
    }
    console.log(`${src.name}: ${items.length} items`);
  }
  console.log(`OK: ${ok}, FAIL: ${fail}`);
}
run();
