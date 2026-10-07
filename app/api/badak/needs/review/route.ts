import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/api-guard';

const supabase = createAdminClient();

// 관리자 판단 = 직원(member_roles) — badak_members.role은 본인이 수정 가능한 컬럼이라 권한 판단에 쓰지 않는다
// (2026-10-08 감사 축1 C-2, 데이터 계약 2조)

// GET /api/badak/needs/review?status=pending_review
// 관리자용 니즈 승인 큐 조회
export async function GET(request: NextRequest) {
  const auth = await requireStaff(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'pending_review';

  const { data, error } = await supabase
    .from('badak_needs')
    .select('id, display_text, keyword, count, interest_count, fire_count, status, created_at, updated_at')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ needs: data ?? [] });
}

// PATCH /api/badak/needs/review
// { needId, action: 'approve' | 'reject' }
export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { needId, action } = body as { needId?: string; action?: 'approve' | 'reject' };

    if (!needId || !action) {
      return NextResponse.json({ error: 'needId and action required' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'gathering' : 'rejected';

    const { error } = await supabase
      .from('badak_needs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', needId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ status: newStatus });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
