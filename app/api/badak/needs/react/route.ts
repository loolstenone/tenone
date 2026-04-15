import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET: 현재 유저의 리액션 상태 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const needId = searchParams.get('needId');
  const authHeader = request.headers.get('authorization');

  if (!needId) return NextResponse.json({ error: 'needId required' }, { status: 400 });
  if (!authHeader) return NextResponse.json({ interest: false, fire: false });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ interest: false, fire: false });

  const { data } = await supabase
    .from('badak_needs_interests')
    .select('reaction')
    .eq('need_id', needId)
    .eq('user_id', user.id);

  const reactions = (data ?? []).map((r) => r.reaction);
  return NextResponse.json({
    interest: reactions.includes('interest'),
    fire: reactions.includes('fire'),
  });
}

// POST: 리액션 토글 (interest | fire)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { needId, reaction = 'interest', message } = body as {
    needId: string;
    reaction: 'interest' | 'fire';
    message?: string;
  };

  if (!needId) return NextResponse.json({ error: 'needId required' }, { status: 400 });

  // 이미 등록했으면 취소 (토글)
  const { data: existing } = await supabase
    .from('badak_needs_interests')
    .select('id')
    .eq('need_id', needId)
    .eq('user_id', user.id)
    .eq('reaction', reaction)
    .maybeSingle();

  const col = reaction === 'fire' ? 'fire_count' : 'interest_count';

  if (existing) {
    // 취소
    await supabase.from('badak_needs_interests').delete().eq('id', existing.id);
    await supabase.rpc('badak_decrement_need_count', { need_uuid: needId, col_name: col });
    return NextResponse.json({ action: 'removed', reaction });
  }

  // 신규 등록
  const { error } = await supabase.from('badak_needs_interests').insert({
    need_id: needId,
    user_id: user.id,
    reaction,
    message: message || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 카운트 증가
  await supabase.rpc('badak_increment_need_count', { need_uuid: needId, col_name: col });

  // count 동기화 (interest_count + fire_count)
  const { data: need } = await supabase
    .from('badak_needs')
    .select('interest_count, fire_count')
    .eq('id', needId)
    .single();

  if (need) {
    await supabase
      .from('badak_needs')
      .update({ count: (need.interest_count ?? 0) + (need.fire_count ?? 0) })
      .eq('id', needId);
  }

  return NextResponse.json({ action: 'added', reaction });
}
