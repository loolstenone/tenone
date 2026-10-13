import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  // DB 니즈만 — 없으면 빈 목록 (목업 대체값 금지, 2026-10-14)
  if (url && key) {
    try {
      const supabase = createClient(url, key);
      const { data, error } = await supabase
        .from('badak_needs')
        .select('id, display_text, count, interest_count, fire_count, status')
        .in('status', ['gathering', 'active', 'group_created'])
        .order('count', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        const needs = data.map(n => ({
          id: n.id,
          text: n.display_text,
          count: n.count ?? 0,
          interestCount: n.interest_count ?? 0,
          fireCount: n.fire_count ?? 0,
          status: n.status,
        }));
        return NextResponse.json({ needs, source: 'db' });
      }
    } catch (e) { console.error('[badak/cloud]', e); }
  }

  return NextResponse.json({ needs: [], source: 'db' });
}
