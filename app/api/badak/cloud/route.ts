import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  // Phase 1: DB에서 실제 니즈 데이터 로드, 없으면 Mock 폴백
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
    } catch { /* fallback to mock */ }
  }

  // Mock 폴백
  return NextResponse.json({ needs: CLOUD_WORDS, source: 'mock' });
}
