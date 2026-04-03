/**
 * Vercel Cron — 비즈니스 기회 AI 처리 (매일 AM 8:30 KST = 23:30 UTC)
 * GET /api/cron/opportunity-process
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}` && auth !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/opportunity/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.ADMIN_API_KEY}` },
        body: JSON.stringify({ action: 'process' }),
    });
    return NextResponse.json(await res.json());
}
