import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// RSS 피드 목록
const RSS_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', topic: 'ai_tech' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', topic: 'ai_tech' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/feed', topic: 'business' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', topic: 'ai_tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', topic: 'ai_tech' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', topic: 'ai_tech' },
  { name: 'Google News KR Tech', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko', topic: 'ai_tech' },
  { name: 'Google News KR Business', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko', topic: 'business' },
];

// XML에서 RSS 아이템 파싱 (간단한 regex 기반)
function parseRSSItems(xml: string, maxItems = 10): { title: string; link: string; description: string; pubDate: string }[] {
  const items: { title: string; link: string; description: string; pubDate: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;

  const getTag = (text: string, tag: string): string => {
    // CDATA 처리
    const cdataMatch = text.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
    if (cdataMatch) return cdataMatch[1].trim();
    const match = text.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1].trim().replace(/<[^>]+>/g, '') : '';
  };

  const getLink = (text: string): string => {
    const linkTag = text.match(/<link[^>]*href="([^"]+)"/);
    if (linkTag) return linkTag[1];
    return getTag(text, 'link');
  };

  // RSS 2.0 형식
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
    const content = match[1];
    items.push({
      title: getTag(content, 'title'),
      link: getTag(content, 'link') || getLink(content),
      description: getTag(content, 'description').substring(0, 500),
      pubDate: getTag(content, 'pubDate') || getTag(content, 'published'),
    });
  }

  // Atom 형식
  if (items.length === 0) {
    while ((match = entryRegex.exec(xml)) !== null && items.length < maxItems) {
      const content = match[1];
      items.push({
        title: getTag(content, 'title'),
        link: getLink(content),
        description: (getTag(content, 'summary') || getTag(content, 'content')).substring(0, 500),
        pubDate: getTag(content, 'published') || getTag(content, 'updated'),
      });
    }
  }

  return items;
}

// GET: 수동 트리거 (테스트용)
// POST: cron job 트리거
export async function GET() {
  return runCrawl();
}

export async function POST() {
  return runCrawl();
}

async function runCrawl() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  let totalCollected = 0;
  const errors: string[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(feed.url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mindle RSS Parser/1.0' },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        errors.push(`${feed.name}: HTTP ${res.status}`);
        continue;
      }

      const xml = await res.text();
      const items = parseRSSItems(xml, 5); // 피드당 최신 5개

      if (items.length === 0) {
        errors.push(`${feed.name}: No items found`);
        continue;
      }

      // 중복 체크: 최근 24시간 내 같은 URL이 있으면 스킵
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from('collected_data')
        .select('url')
        .eq('source_name', feed.name)
        .gte('collected_at', yesterday);

      const existingUrls = new Set((existing || []).map(e => e.url));

      const newItems = items.filter(item => item.link && !existingUrls.has(item.link));

      if (newItems.length === 0) continue;

      const rows = newItems.map(item => ({
        source_type: 'rss',
        source_name: feed.name,
        topic: feed.topic,
        author: feed.name,
        title: item.title,
        content: item.description || item.title,
        content_type: 'article',
        url: item.link,
        has_urls: !!item.link,
        extracted_urls: item.link ? [item.link] : [],
        metadata: { pubDate: item.pubDate },
      }));

      const { error } = await supabase.from('collected_data').insert(rows);

      if (error) {
        errors.push(`${feed.name}: DB error - ${error.message}`);
      } else {
        totalCollected += rows.length;
      }
    } catch (e: any) {
      errors.push(`${feed.name}: ${e.message || 'fetch failed'}`);
    }
  }

  // crawler_status 업데이트
  await supabase.from('crawler_status').upsert({
    crawler_name: 'rss_parser',
    status: errors.length < RSS_FEEDS.length ? 'active' : 'error',
    last_run: new Date().toISOString(),
    last_count: totalCollected,
    error_message: errors.length > 0 ? errors.join('; ') : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'crawler_name' });

  return NextResponse.json({
    success: true,
    collected: totalCollected,
    feeds: RSS_FEEDS.length,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  });
}
