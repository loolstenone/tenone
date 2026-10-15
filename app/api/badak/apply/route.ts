import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/api-guard';

const supabase = createAdminClient();

// 관리자 = 직원(member_roles) — badak_members.role은 본인이 수정 가능한 컬럼이라 권한 판단에 쓰지 않는다 (2026-10-11 레드팀)
async function requireAdmin(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const auth = await requireStaff(request);
  if (auth instanceof NextResponse) return auth;
  return { userId: 'user' in auth ? auth.user.id : 'internal' };
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
// 대기 중인 신청만 바꾼다. 끝난 심사 잠금·신청자 셀프 승인 차단·승인 시 바닥장 역할 부여는 DB 트리거가 한다
// (sql/intra-review-guard.sql) — 인트라 화면도 이 API 하나만 쓴다
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { id, status, note } = body;
  if (!id || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'id and valid status required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { status, reviewed_at: new Date().toISOString() };
  if (note) updates.reviewer_note = note;

  const { data, error } = await supabase
    .from('badak_leader_applications')
    .update(updates)
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: '이미 처리된 신청입니다' }, { status: 409 });

  if (data.user_id) {
    const approved = status === 'approved';
    const { error: notifyError } = await supabase.from('badak_notifications').insert(approved ? {
      user_id: data.user_id,
      type: 'leader_approved',
      title: '바닥장 신청이 승인됐습니다 🎉',
      body: data.need_text
        ? `"${data.need_text}" 니즈의 공식 바닥장이 되었습니다. 이제 모임을 개설할 수 있어요!`
        : '공식 바닥장이 되었습니다. 이제 모임을 개설할 수 있어요!',
      link: '/badak',
      metadata: { applicationId: data.id, needId: data.need_id },
    } : {
      user_id: data.user_id,
      type: 'leader_rejected',
      title: '바닥장 신청 결과 안내',
      body: note
        ? `아쉽게도 이번 신청은 승인되지 않았습니다. 사유: ${note}`
        : '아쉽게도 이번 신청은 승인되지 않았습니다. 다음에 다시 도전해보세요!',
      link: '/badak/apply',
      metadata: { applicationId: data.id },
    });
    if (notifyError) console.error('[badak/apply] 심사 알림 실패:', notifyError.message);
  }

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
