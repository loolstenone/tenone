require('dotenv').config();
const puppeteer = require('puppeteer');

// ── Config ──────────────────────────────────────────
const COLLECT_API_URL = process.env.COLLECT_API_URL || 'http://localhost:3000/api/trendhunter/collect';
const API_KEY = process.env.TRENDHUNTER_API_KEY || '';

// Naver Cafe targets
const NAVER_CAFE_TARGETS = [
  { cafeId: 'startupall', name: '스타트업 얼라이언스', topic: 'business', boardId: '' },
  // Add more cafes here
];

// Naver Blog search keywords
const BLOG_KEYWORDS = [
  { keyword: 'AI 트렌드 2026', topic: 'ai_tech' },
  { keyword: '스타트업 투자', topic: 'business' },
  { keyword: 'MZ세대 소비', topic: 'trend' },
];

// ── Helpers ──────────────────────────────────────────
async function sendToCollect(items) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;

    const res = await fetch(COLLECT_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    console.log(`📦 Sent ${items.length} items → inserted: ${data.inserted}, errors: ${data.errors || 0}`);
    return data;
  } catch (err) {
    console.error('❌ Send error:', err.message);
    return null;
  }
}

// ── Naver Blog Search Crawler ───────────────────────
async function crawlNaverBlogSearch(browser, keyword, topic) {
  console.log(`\n🔍 Searching Naver Blog: "${keyword}"`);
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    const searchUrl = `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(keyword)}&sm=tab_opt&date_from=&date_to=&date_option=1`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 });

    // Wait for blog results
    await page.waitForSelector('.api_txt_lines', { timeout: 5000 }).catch(() => null);

    const posts = await page.evaluate(() => {
      const items = [];
      const elements = document.querySelectorAll('.api_txt_lines.total_tit');
      elements.forEach((el, i) => {
        if (i >= 10) return; // Max 10 per keyword
        const link = el.closest('a');
        const descEl = el.closest('.total_wrap')?.querySelector('.api_txt_lines.dsc_txt');
        const dateEl = el.closest('.total_wrap')?.querySelector('.sub_time');
        items.push({
          title: el.textContent?.trim() || '',
          url: link?.href || '',
          description: descEl?.textContent?.trim() || '',
          date: dateEl?.textContent?.trim() || '',
        });
      });
      return items;
    });

    console.log(`   Found ${posts.length} posts`);

    const items = posts
      .filter((p) => p.title && p.url)
      .map((p) => ({
        source: 'web',
        room: 'Naver Blog',
        topic,
        sender: 'Naver Blog',
        title: p.title,
        message: `${p.title}\n${p.description}`,
        url: p.url,
        content_type: 'article',
        metadata: { keyword, date: p.date },
        timestamp: new Date().toISOString(),
      }));

    if (items.length > 0) {
      await sendToCollect(items);
    }
  } catch (err) {
    console.error(`   ❌ Error crawling "${keyword}":`, err.message);
  } finally {
    await page.close();
  }
}

// ── Naver Cafe Crawler ──────────────────────────────
async function crawlNaverCafe(browser, cafe) {
  console.log(`\n🏠 Crawling Naver Cafe: ${cafe.name}`);
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    const cafeUrl = `https://cafe.naver.com/${cafe.cafeId}`;
    await page.goto(cafeUrl, { waitUntil: 'networkidle2', timeout: 15000 });

    // Naver Cafe uses iframe, need to access it
    const frame = page.frames().find((f) => f.url().includes('cafe.naver.com/ArticleList'));
    if (!frame) {
      console.log('   ⚠️ Could not find article list frame');
      return;
    }

    const posts = await frame.evaluate(() => {
      const items = [];
      const rows = document.querySelectorAll('.article-board .board-list .inner_list');
      rows.forEach((row, i) => {
        if (i >= 10) return;
        const titleEl = row.querySelector('.article');
        const dateEl = row.querySelector('.td_date');
        const authorEl = row.querySelector('.td_name .p-nick');
        items.push({
          title: titleEl?.textContent?.trim() || '',
          url: titleEl?.querySelector('a')?.href || '',
          date: dateEl?.textContent?.trim() || '',
          author: authorEl?.textContent?.trim() || '',
        });
      });
      return items;
    });

    console.log(`   Found ${posts.length} posts`);

    const items = posts
      .filter((p) => p.title)
      .map((p) => ({
        source: 'web',
        room: `Naver Cafe: ${cafe.name}`,
        topic: cafe.topic,
        sender: p.author || cafe.name,
        title: p.title,
        message: p.title,
        url: p.url || `https://cafe.naver.com/${cafe.cafeId}`,
        content_type: 'post',
        metadata: { cafe_id: cafe.cafeId, date: p.date },
        timestamp: new Date().toISOString(),
      }));

    if (items.length > 0) {
      await sendToCollect(items);
    }
  } catch (err) {
    console.error(`   ❌ Error crawling ${cafe.name}:`, err.message);
  } finally {
    await page.close();
  }
}

// ── Main ────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const target = args.find((a) => a.startsWith('--target='))?.split('=')[1]
    || args[args.indexOf('--target') + 1]
    || 'all';

  console.log('🚀 Mindle Web Crawler starting...');
  console.log(`   Target: ${target}`);
  console.log(`   API: ${COLLECT_API_URL}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    if (target === 'all' || target === 'naver-blog') {
      for (const { keyword, topic } of BLOG_KEYWORDS) {
        await crawlNaverBlogSearch(browser, keyword, topic);
        // Delay between searches to avoid rate limiting
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (target === 'all' || target === 'naver-cafe') {
      for (const cafe of NAVER_CAFE_TARGETS) {
        await crawlNaverCafe(browser, cafe);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    console.log('\n✅ Crawl complete');
  } catch (err) {
    console.error('❌ Crawler error:', err);
  } finally {
    await browser.close();
  }
}

main();
