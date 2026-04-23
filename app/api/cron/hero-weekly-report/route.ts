/**
 * Vercel Cron — HeRo 주간 리포트 이메일 배치
 * GET /api/cron/hero-weekly-report
 * 스케줄: "0 0 * * 1" (UTC 월 00:00 = KST 월 09:00)
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (
    auth !== `Bearer ${process.env.CRON_SECRET}` &&
    auth !== `Bearer ${process.env.ADMIN_API_KEY}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tenone.biz';
    const res = await fetch(`${origin}/api/hero/journey/weekly-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ADMIN_API_KEY}`,
      },
    });

    const data = await res.json();
    return NextResponse.json({ ok: res.ok, result: data });
  } catch (error) {
    console.error('[cron/hero-weekly-report]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'cron 오류' },
      { status: 500 },
    );
  }
}
