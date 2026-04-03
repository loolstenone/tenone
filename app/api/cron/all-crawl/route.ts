/**
 * Vercel Cron — 통합 크롤 (매일 AM 9:00 KST = 00:00 UTC)
 * GET /api/cron/all-crawl
 * Hobby 플랜 제약(1일 1회 2개 한도)으로 Whole See + 기회 수집 통합
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}` && auth !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.ADMIN_API_KEY}` };

    const [wholeSeeCrawl, opportunityCrawl] = await Promise.allSettled([
        fetch(`${baseUrl}/api/crawler`, { method: 'POST', headers, body: JSON.stringify({ action: 'crawl' }) })
            .then(r => r.json()),
        fetch(`${baseUrl}/api/opportunity/crawl`, { method: 'POST', headers, body: JSON.stringify({ action: 'crawl' }) })
            .then(r => r.json()),
    ]);

    return NextResponse.json({
        wholeSee: wholeSeeCrawl.status === 'fulfilled' ? wholeSeeCrawl.value : { error: String(wholeSeeCrawl.reason) },
        opportunity: opportunityCrawl.status === 'fulfilled' ? opportunityCrawl.value : { error: String(opportunityCrawl.reason) },
    });
}
