/**
 * Vercel Cron — 10:01 KST 자동 브리핑 트리거
 * GET /api/cron/daily-vrief
 * 스케줄: "1 1 * * *" (UTC 01:01 = KST 10:01)
 */
import { NextRequest, NextResponse } from 'next/server';
import { isInternalRequest } from '@/lib/api-guard';

export async function GET(request: NextRequest) {
  if (!isInternalRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/agent/briefing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ADMIN_API_KEY}`,
      },
    });

    const data = await res.json();
    return NextResponse.json({ ok: res.ok, result: data });
  } catch (error) {
    console.error('[cron/daily-vrief]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'cron 오류' },
      { status: 500 },
    );
  }
}
