/**
 * Vercel Cron — RSS 크롤 (매 6시간)
 * GET /api/cron/crawl
 */
import { NextRequest, NextResponse } from 'next/server';
import { isInternalRequest } from '@/lib/api-guard';

export async function GET(request: NextRequest) {
    if (!isInternalRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/crawler`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ADMIN_API_KEY}`,
        },
        body: JSON.stringify({ action: 'crawl' }),
    });

    const data = await res.json();
    return NextResponse.json(data);
}
