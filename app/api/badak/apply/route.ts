import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

async function requireAdmin(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (member?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return { userId: user.id };
}

const SUGGEST_INTERESTS = [
  '마케팅/광고', '데이터/분석', '디자인/UX', '개발/IT',
  '기획/PM', '브랜딩', '콘텐츠', '이직/커리어',
  '리더십', '프리랜서/창업', '네트워킹', '스터디',
];

// POST: 바닥장 신청
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, industry, experience, interests, reason, plan, contact, needId, needText } = body;

  if (!name?.trim() || !experience?.trim() || !reason?.trim() || !contact?.trim()) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요' }, { status: 400 });
  }

  if (reason.trim().length < 20) {
    return NextResponse.json({ error: '지원 동기는 20자 이상 작성해주세요' }, { status: 400 });
  }

  // 중복 신청 방지 (pending 또는 approved 상태 있으면 거부)
  const { data: existing } = await supabase
    .from('badak_leader_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .maybeSingle();

  if (existing) {
    const msg = existing.status === 'approved'
      ? '이미 바닥장으로 승인된 계정입니다'
      : '이미 심사 중인 신청이 있습니다';
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  // badak_members 연결
  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  // 커스텀 분야 분리
  const customInterests = interests.filter((i: string) => !SUGGEST_INTERESTS.includes(i));

  const { data: application, error } = await supabase
    .from('badak_leader_applications')
    .insert({
      user_id: user.id,
      member_id: member?.id || null,
      name: name.trim(),
      industry: industry?.trim() || null,
      experience: experience.trim(),
      interests: interests || [],
      custom_interests: customInterests,
      reason: reason.trim(),
      plan: plan?.trim() || null,
      contact: contact.trim(),
      need_id: needId || null,
      need_text: needText || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ application }, { status: 201 });
}

// PATCH: 관리자 심사 결과 반영 (approved / rejected)
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await request.json();
  const { id, status, note } = body;
  if (!id || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'id and valid status required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { status, reviewed_by: userId, reviewed_at: new Date().toISOString() };
  if (note) updates.note = note;

  const { data, error } = await supabase
    .from('badak_leader_applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ application: data });
}

// GET: 내 신청 상태 조회
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ application: null }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ application: null }, { status: 401 });

  const { data: application } = await supabase
    .from('badak_leader_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ application });
}
