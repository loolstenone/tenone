import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST: 니즈에 관심 표시
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: needId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!member) return NextResponse.json({ error: 'Badak member not found' }, { status: 404 });

  // 관심 표시 (upsert)
  const { error: interestError } = await supabase
    .from('badak_need_interests')
    .upsert({ need_id: needId, member_id: member.id }, { onConflict: 'need_id,member_id' });

  if (interestError) return NextResponse.json({ error: interestError.message }, { status: 400 });

  // count 증가
  await supabase.rpc('badak_increment_need_count', { need_uuid: needId });

  return NextResponse.json({ success: true });
}

// DELETE: 관심 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: needId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!member) return NextResponse.json({ error: 'Badak member not found' }, { status: 404 });

  await supabase
    .from('badak_need_interests')
    .delete()
    .eq('need_id', needId)
    .eq('member_id', member.id);

  // count 감소
  await supabase.rpc('badak_decrement_need_count', { need_uuid: needId });

  return NextResponse.json({ success: true });
}
