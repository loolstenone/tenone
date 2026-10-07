/**
 * Vercel Cron — daily-gpr Edge Function 트리거
 * GET /api/cron/daily-gpr
 * 스케줄: "0 9 * * *" (UTC 09:00 = KST 18:00)
 */
import { NextRequest, NextResponse } from 'next/server';
import { isInternalRequest } from '@/lib/api-guard';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  if (!isInternalRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/daily-gpr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    const data = await res.json();
    return NextResponse.json({ ok: res.ok, result: data });
  } catch (error) {
    console.error('[cron/daily-gpr]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'cron 오류' },
      { status: 500 },
    );
  }
}
