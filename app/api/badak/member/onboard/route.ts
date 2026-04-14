import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY_PROD || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// PATCH: 온보딩 필수 정보 입력
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { industry, industryType, jobFunction, jobFunctionType, phone, displayName } = body;

  // 필수값 검증
  if (!industry?.trim()) return NextResponse.json({ error: '산업군을 선택해주세요' }, { status: 400 });
  if (!jobFunction?.trim()) return NextResponse.json({ error: '직무를 선택해주세요' }, { status: 400 });
  if (!phone?.trim()) return NextResponse.json({ error: '연락처를 입력해주세요' }, { status: 400 });

  const { data: member, error } = await supabase
    .from('badak_members')
    .update({
      display_name: displayName || undefined,
      industry: industry.trim(),
      industry_type: industryType || 'current',
      job_function: jobFunction.trim(),
      job_function_type: jobFunctionType || 'current',
      phone: phone.trim(),
      onboarded: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ member });
}
