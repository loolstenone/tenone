import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';

const sb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/badak/members/search?q=&industry=&job_function=&exp_min=&exp_max=&limit=20&offset=0
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const industry = searchParams.get('industry') || '';
  const jobFunction = searchParams.get('job_function') || '';
  const expMin = searchParams.get('exp_min') ? parseInt(searchParams.get('exp_min')!) : null;
  const expMax = searchParams.get('exp_max') ? parseInt(searchParams.get('exp_max')!) : null;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
  const offset = parseInt(searchParams.get('offset') ?? '0');
  const sort = searchParams.get('sort') ?? 'latest';

  const orderCol = sort === 'exp_desc' || sort === 'exp_asc' ? 'experience_years' : 'created_at';
  const ascending = sort === 'exp_asc';

  let query = sb
    .from('badak_members')
    .select('id, user_id, display_name, avatar_url, industry, job_function, experience_years, bio, looking_for, can_offer, interest_tags, created_at', { count: 'exact' })
    .eq('tenant_id', 'tenone')
    .order(orderCol, { ascending, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (q) {
    query = query.or(`display_name.ilike.%${q}%,industry.ilike.%${q}%,job_function.ilike.%${q}%,bio.ilike.%${q}%`);
  }
  if (industry) query = query.eq('industry', industry);
  if (jobFunction) query = query.eq('job_function', jobFunction);
  if (expMin !== null) query = query.gte('experience_years', expMin);
  if (expMax !== null) query = query.lte('experience_years', expMax);

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    members: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  });
}
