/**
 * Vercel Cron — 통합 처리 + 브리핑 (매일 AM 9:30 KST = 00:30 UTC)
 * GET /api/cron/all-process
 * Whole See 처리 + 기회 AI 분석 + AM 브리핑 통합
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}` && auth !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.ADMIN_API_KEY}` };

    // 처리 순서: Whole See 트렌드 → 기회 AI 분석 → AM 브리핑
    const [wholeProcess, opportunityProcess, vrief] = await Promise.allSettled([
        fetch(`${baseUrl}/api/crawler`, { method: 'POST', headers, body: JSON.stringify({ action: 'process' }) })
            .then(r => r.json()),
        fetch(`${baseUrl}/api/opportunity/crawl`, { method: 'POST', headers, body: JSON.stringify({ action: 'process' }) })
            .then(r => r.json()),
        fetch(`${baseUrl}/api/agent/vrief`, { method: 'POST', headers, body: JSON.stringify({ period: 'am' }) })
            .then(r => r.json()),
    ]);

    return NextResponse.json({
        wholeSeeProcess: wholeProcess.status === 'fulfilled' ? wholeProcess.value : { error: String(wholeProcess.reason) },
        opportunityProcess: opportunityProcess.status === 'fulfilled' ? opportunityProcess.value : { error: String(opportunityProcess.reason) },
        vrief: vrief.status === 'fulfilled' ? vrief.value : { error: String(vrief.reason) },
    });
}
