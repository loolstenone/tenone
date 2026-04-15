import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// members.affiliations에 'badak' 추가 (중복 방지)
async function addBadakAffiliation(client: ReturnType<typeof createClient>, authUserId: string) {
  const { data } = await client
    .from('members')
    .select('affiliations')
    .eq('auth_id', authUserId)
    .single();
  if (!data) return;
  const current: string[] = data.affiliations ?? [];
  if (current.includes('badak')) return;
  await client
    .from('members')
    .update({ affiliations: [...current, 'badak'] })
    .eq('auth_id', authUserId);
}

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

  // members.affiliations에 'badak' 추가 (멤버십 소스 오브 트루스)
  await addBadakAffiliation(supabase, user.id);

  return NextResponse.json({ member });
}

// PUT: 프로필 수정
export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.displayName !== undefined) updates.display_name = body.displayName.trim();
  if (body.phone !== undefined) updates.phone = body.phone.trim();
  if (body.industry !== undefined) updates.industry = body.industry;
  if (body.jobFunction !== undefined) updates.job_function = body.jobFunction;
  if (body.interests !== undefined) updates.interests = body.interests;
  if (body.bio !== undefined) updates.bio = body.bio?.trim() || null;
  if (body.experienceYears !== undefined) updates.experience_years = body.experienceYears;
  updates.updated_at = new Date().toISOString();

  const { data: member, error } = await supabase
    .from('badak_members')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ member });
}
