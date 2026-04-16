import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { createClient as createAdmin } from '@supabase/supabase-js';

const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/badak/members/search?q=&industry=&job_function=&limit=20&offset=0
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const industry = searchParams.get('industry') || '';
  const jobFunction = searchParams.get('job_function') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
  const offset = parseInt(searchParams.get('offset') ?? '0');

  const sb = createAdmin(adminUrl, adminKey);

  let query = sb
    .from('badak_members')
    .select('id, user_id, display_name, avatar_url, industry, job_function, experience_years, bio, looking_for, can_offer, interest_tags, created_at', { count: 'exact' })
    .eq('tenant_id', 'tenone')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // 텍스트 검색
  if (q) {
    query = query.or(`display_name.ilike.%${q}%,industry.ilike.%${q}%,job_function.ilike.%${q}%,bio.ilike.%${q}%`);
  }

  // 필터
  if (industry) {
    query = query.eq('industry', industry);
  }
  if (jobFunction) {
    query = query.eq('job_function', jobFunction);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    members: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  });
}
