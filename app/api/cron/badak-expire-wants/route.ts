import { NextRequest, NextResponse } from 'next/server';
import { isInternalRequest } from '@/lib/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

// GET /api/cron/badak-expire-wants
// Vercel Cron: 매일 0시 (vercel.json에 schedule 등록 필요)
export async function GET(request: NextRequest) {
  if (!isInternalRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.rpc('expire_badak_wants');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
