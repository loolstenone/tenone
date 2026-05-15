// SmarComm 주간 자동 재진단 Cron — V2.0 Phase 5 Item 1
// Schedule: 매주 월요일 03:00 UTC (vercel.json)
// Smart-Data Hub 시계열 풍부화 + AIRM 자동 발견

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runFullScan } from '@/lib/smarcomm/run-scan';

export const maxDuration = 300; // 5분 — 복수 사이트 순차 처리

// Vercel Cron 인증 헤더 검증
function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  // 재진단 대상: active=true + next_run_at <= now
  const { data: schedules, error } = await admin
    .from('smarcomm_rescan_schedules')
    .select('*')
    .eq('active', true)
    .lte('next_run_at', now.toISOString())
    .order('next_run_at', { ascending: true })
    .limit(10); // 1회 Cron당 최대 10개 — 타임아웃 방어

  if (error) {
    console.error('[cron/smarcomm-weekly-rescan] schedules query failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!schedules || schedules.length === 0) {
    return NextResponse.json({ processed: 0, message: '재진단 대상 없음' });
  }

  const results: { id: string; domain: string; success: boolean; shortId?: string | null; error?: string }[] = [];

  for (const schedule of schedules) {
    try {
      const scanResult = await runFullScan({
        url: schedule.url,
        requester_email: schedule.requester_email,
        industry: schedule.industry,
        tenant_id: schedule.tenant_id,
      });

      // next_run_at 갱신
      const nextRun = computeNextRun(now, schedule.cadence);
      await admin
        .from('smarcomm_rescan_schedules')
        .update({
          last_run_at: now.toISOString(),
          next_run_at: nextRun.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', schedule.id);

      results.push({ id: schedule.id, domain: schedule.domain, success: true, shortId: scanResult.shortId });
    } catch (e) {
      console.error(`[cron/smarcomm-weekly-rescan] scan failed for ${schedule.domain}:`, e);
      results.push({ id: schedule.id, domain: schedule.domain, success: false, error: String(e) });
    }
  }

  console.log(`[cron/smarcomm-weekly-rescan] processed ${results.length} schedules`);
  return NextResponse.json({ processed: results.length, results });
}

function computeNextRun(from: Date, cadence: string): Date {
  const d = new Date(from);
  switch (cadence) {
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    default: // weekly
      d.setDate(d.getDate() + 7);
  }
  return d;
}
