import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

async function requireAdmin(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // badak_members.role이 'admin' 또는 'super_admin'인지 확인
  const { data: member } = await supabase
    .from('badak_members')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const row = member as { role: string } | null;
  if (!row || !['admin', 'super_admin'].includes(row.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { userId: user.id };
}

// GET /api/badak/needs/review?status=pending_review
// 관리자용 니즈 승인 큐 조회
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
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
  const auth = await requireAdmin(request);
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
