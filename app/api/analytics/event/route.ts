import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST /api/analytics/event — 이벤트 로깅 (클라이언트에서 호출)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.eventType || !body?.brandId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // 인증 유저면 user_id 추출 (없으면 익명)
  let userId: string | null = null;
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) userId = user.id;
  }

  const { error } = await supabase.from('wio_analytics_events').insert({
    event_type:   body.eventType,
    brand_id:     body.brandId,
    tenant_id:    body.tenantId ?? 'tenone',
    user_id:      userId,
    session_id:   body.sessionId ?? null,
    page_path:    body.pagePath ?? null,
    properties:   body.properties ?? {},
    duration_sec: body.durationSec ?? null,
  });

  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// GET /api/analytics/event?brand=badak&from=YYYY-MM-DD — intra 대시보드용 집계
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brand') ?? 'badak';
  const from = searchParams.get('from') ?? new Date(Date.now() - 30 * 86400_000).toISOString();

  // MAU: 지난 30일간 unique user_id 수
  const { data: mauData } = await supabase
    .from('wio_analytics_events')
    .select('user_id')
    .eq('brand_id', brandId)
    .eq('event_type', 'page_view')
    .gte('created_at', from)
    .not('user_id', 'is', null);

  const mauCount = new Set((mauData ?? []).map((r) => r.user_id)).size;

  // 평균 체류시간 (session_end 이벤트의 duration_sec 평균)
  const { data: sessionData } = await supabase
    .from('wio_analytics_events')
    .select('duration_sec')
    .eq('brand_id', brandId)
    .eq('event_type', 'session_end')
    .gte('created_at', from)
    .not('duration_sec', 'is', null);

  const avgDuration = sessionData && sessionData.length > 0
    ? Math.round(sessionData.reduce((s, r) => s + (r.duration_sec ?? 0), 0) / sessionData.length)
    : null;

  // 주간 평균 방문 횟수 (지난 4주 주간 평균)
  const { data: weeklyData } = await supabase
    .from('wio_analytics_events')
    .select('user_id, created_at')
    .eq('brand_id', brandId)
    .eq('event_type', 'page_view')
    .gte('created_at', new Date(Date.now() - 28 * 86400_000).toISOString())
    .not('user_id', 'is', null);

  // 주차별 unique user 수 → 평균
  const weekCounts: Record<string, Set<string>> = {};
  for (const r of weeklyData ?? []) {
    const week = Math.floor(
      (Date.now() - new Date(r.created_at).getTime()) / (7 * 86400_000)
    );
    const key = String(week);
    if (!weekCounts[key]) weekCounts[key] = new Set();
    if (r.user_id) weekCounts[key].add(r.user_id);
  }
  const weekKeys = Object.keys(weekCounts);
  const avgWeeklyVisits = weekKeys.length > 0
    ? +(weekKeys.reduce((s, k) => s + weekCounts[k].size, 0) / weekKeys.length).toFixed(1)
    : null;

  return NextResponse.json({
    mauCount,
    avgDurationSec: avgDuration,
    avgWeeklyVisits,
    sampleSize: {
      pageViews: mauData?.length ?? 0,
      sessions: sessionData?.length ?? 0,
    },
  });
}
