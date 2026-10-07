/**
 * Vercel Cron — AM 10:01 브리핑 (01:01 UTC = 10:01 KST)
 * GET /api/cron/vrief-am
 */
import { NextRequest, NextResponse } from 'next/server';
import { isInternalRequest } from '@/lib/api-guard';

export async function GET(request: NextRequest) {
    if (!isInternalRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/agent/vrief`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ADMIN_API_KEY}`,
        },
        body: JSON.stringify({ type: 'am' }),
    });

    const data = await res.json();
    return NextResponse.json(data);
}
