/**
 * Vercel Cron — PM 10:01 성과 보고 (13:01 UTC = 22:01 KST)
 * GET /api/cron/vrief-pm
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}` && auth !== `Bearer ${process.env.ADMIN_API_KEY}`) {
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
        body: JSON.stringify({ type: 'pm' }),
    });

    const data = await res.json();
    return NextResponse.json(data);
}
