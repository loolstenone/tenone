import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

async function getMemberId(token: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .single();
  return data?.id ?? null;
}

// POST: 미팅 신청
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const fromMemberId = await getMemberId(token);
  if (!fromMemberId) return NextResponse.json({ error: 'Badak member not found' }, { status: 404 });

  const body = await request.json() as { toMemberId: string; needId: string; message?: string };
  const { toMemberId, needId, message } = body;

  if (!toMemberId || !needId) {
    return NextResponse.json({ error: 'toMemberId, needId required' }, { status: 400 });
  }
  if (fromMemberId === toMemberId) {
    return NextResponse.json({ error: '자신에게 미팅 신청할 수 없습니다' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('badak_meeting_requests')
    .upsert(
      { from_member_id: fromMemberId, to_member_id: toMemberId, need_id: needId, message: message ?? null, status: 'pending' },
      { onConflict: 'from_member_id,to_member_id,need_id' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, data });
}

// GET: 내가 받은/보낸 미팅 신청 목록
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const memberId = await getMemberId(token);
  if (!memberId) return NextResponse.json({ error: 'Badak member not found' }, { status: 404 });

  const url = new URL(request.url);
  const direction = url.searchParams.get('direction') ?? 'received'; // 'received' | 'sent'

  const filterCol = direction === 'sent' ? 'from_member_id' : 'to_member_id';

  const { data, error } = await supabase
    .from('badak_meeting_requests')
    .select(`
      id, status, message, created_at, need_id,
      from_member:from_member_id(id, display_name, job_function, avatar_url),
      to_member:to_member_id(id, display_name, job_function, avatar_url),
      badak_needs!need_id(id, display_text)
    `)
    .eq(filterCol, memberId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ requests: data });
}
