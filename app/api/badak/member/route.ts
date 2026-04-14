import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY_PROD || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// GET: 현재 유저의 badak_members 조회
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ member: null }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ member: null }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({ member });
}

// POST: badak_members 자동 생성 (최초 방문 시)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 이미 있으면 반환
  const { data: existing } = await supabase
    .from('badak_members')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (existing) return NextResponse.json({ member: existing });

  // members 테이블에서 이름 가져오기
  const { data: mainMember } = await supabase
    .from('members')
    .select('name, avatar_url')
    .eq('auth_id', user.id)
    .single();

  const body = await request.json().catch(() => ({}));

  const { data: member, error } = await supabase
    .from('badak_members')
    .insert({
      user_id: user.id,
      display_name: body.displayName || mainMember?.name || user.email?.split('@')[0] || '바닥인',
      avatar_url: mainMember?.avatar_url || null,
      industry: body.industry || null,
      job_function: body.jobFunction || null,
      experience_years: body.experienceYears || null,
      bio: body.bio || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ member });
}
