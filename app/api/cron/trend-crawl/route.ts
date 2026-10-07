/**
 * Vercel Cron — trend-crawl Edge Function 트리거
 * GET /api/cron/trend-crawl
 * 스케줄: "0 *-slash-3 * * *" → 매 3시간 정각
 */
import { NextRequest, NextResponse } from 'next/server';
import { edgeAuthHeaders } from '@/lib/edge-functions';
import { isInternalRequest } from '@/lib/api-guard';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  if (!isInternalRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/trend-crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        ...(await edgeAuthHeaders()), // x-edge-secret — Edge Function 호출 인증
      },
    });

    const data = await res.json();
    return NextResponse.json({ ok: res.ok, result: data });
  } catch (error) {
    console.error('[cron/trend-crawl]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'cron 오류' },
      { status: 500 },
    );
  }
}
