import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

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
  const { name, industry, experience, interests, reason, plan, contact } = body;

  if (!name?.trim() || !industry?.trim() || !experience?.trim() || !interests?.length || !reason?.trim() || !contact?.trim()) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요' }, { status: 400 });
  }

  if (reason.trim().length < 20) {
    return NextResponse.json({ error: '지원 동기는 20자 이상 작성해주세요' }, { status: 400 });
  }

  // 중복 신청 방지 (pending 상태 있으면 거부)
  const { data: existing } = await supabase
    .from('badak_leader_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: '이미 심사 중인 신청이 있습니다' }, { status: 409 });
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
      industry: industry.trim(),
      experience: experience.trim(),
      interests,
      custom_interests: customInterests,
      reason: reason.trim(),
      plan: plan?.trim() || null,
      contact: contact.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ application }, { status: 201 });
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
