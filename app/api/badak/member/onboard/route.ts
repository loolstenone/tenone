import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';

// members.affiliations에 'badak' 추가 (중복 방지)
async function addBadakAffiliation(client: SupabaseClient, authUserId: string) {
  const { data } = await client
    .from('members')
    .select('affiliations')
    .eq('auth_id', authUserId)
    .single();
  if (!data) return;
  const row = data as { affiliations: string[] | null };
  const current: string[] = row.affiliations ?? [];
  if (current.includes('badak')) return;
  await client
    .from('members')
    .update({ affiliations: [...current, 'badak'] })
    .eq('auth_id', authUserId);
}

const supabase = createAdminClient();

// PATCH: 온보딩 필수 정보 입력
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { industry, industryType, jobFunction, jobFunctionType, phone, displayName, handle, expectations } = body;

  // 필수값 검증
  if (!displayName?.trim()) return NextResponse.json({ error: '닉네임을 입력해주세요' }, { status: 400 });
  if (!industry?.trim()) return NextResponse.json({ error: '산업군을 선택해주세요' }, { status: 400 });
  if (!jobFunction?.trim()) return NextResponse.json({ error: '직무를 선택해주세요' }, { status: 400 });
  const cleanPhone = phone?.trim().replace(/[^0-9]/g, '') ?? '';
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return NextResponse.json({ error: '올바른 휴대전화 번호를 입력해주세요 (10~11자리)' }, { status: 400 });
  }

  const { data: member, error } = await supabase
    .from('badak_members')
    .upsert({
      user_id: user.id,
      display_name: displayName.trim(),
      industry: industry.trim(),
      industry_type: industryType || 'current',
      job_function: jobFunction.trim(),
      job_function_type: jobFunctionType || 'current',
      phone: cleanPhone,
      interests: Array.isArray(expectations) && expectations.length > 0 ? expectations : undefined,
      onboarded: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // members 테이블도 동기화 (phone, name, handle, onboarding_completed)
  const membersUpdate: Record<string, unknown> = {
    name: displayName.trim(),
    phone: cleanPhone,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };
  if (handle?.trim()) {
    const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanHandle.length >= 3) membersUpdate.handle = cleanHandle;
  }
  await supabase
    .from('members')
    .update(membersUpdate)
    .eq('auth_id', user.id);

  // 온보딩 완료 = 정식 바닥 멤버 → members.affiliations 동기화
  await addBadakAffiliation(supabase, user.id);

  // 가입 완료 UC 지급 (최초 1회)
  try {
    const { data: memberRow } = await supabase
      .from('members')
      .select('id')
      .eq('auth_id', user.id)
      .single();
    if (memberRow) {
      const { earnUC } = await import('@/lib/supabase/uc');
      await earnUC(memberRow.id, 'signup_complete', null);
    }
  } catch { /* UC 지급 실패는 온보딩을 막지 않는다 */ }

  return NextResponse.json({ member });
}
