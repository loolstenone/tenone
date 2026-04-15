import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateDirectThread } from '@/lib/wio/talk';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// 일일 전송 상한
const DAILY_LIMIT = 5;

// GET: 내가 보낸/받은 제안
// ?direction=sent|received (기본 both)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const direction = searchParams.get('direction') ?? 'both';

  const [sentRes, receivedRes] = await Promise.all([
    direction === 'received'
      ? Promise.resolve({ data: [] })
      : supabase
          .from('badak_connections')
          .select('*')
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
    direction === 'sent'
      ? Promise.resolve({ data: [] })
      : supabase
          .from('badak_connections')
          .select('*')
          .eq('target_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
  ]);

  // peer 이름·아바타 lookup
  const allUserIds = Array.from(new Set([
    ...(sentRes.data ?? []).map((c: { target_id: string }) => c.target_id),
    ...(receivedRes.data ?? []).map((c: { requester_id: string }) => c.requester_id),
  ]));

  const { data: members } = allUserIds.length > 0
    ? await supabase
        .from('badak_members')
        .select('user_id, id, display_name, avatar_url, job_function, experience_years')
        .in('user_id', allUserIds)
    : { data: [] };

  const memberByUser = new Map(
    (members ?? []).map((m: {
      user_id: string; id: string; display_name: string; avatar_url: string | null;
      job_function: string | null; experience_years: number | null;
    }) => [m.user_id, m]),
  );

  const enrich = (c: {
    id: string; requester_id: string; target_id: string; type: string;
    message: string | null; status: string; want_id: string | null;
    created_at: string; responded_at: string | null;
  }, peerUserId: string) => {
    const peer = memberByUser.get(peerUserId);
    return {
      id: c.id,
      type: c.type,
      status: c.status,
      message: c.message,
      wantId: c.want_id,
      createdAt: c.created_at,
      respondedAt: c.responded_at,
      peer: {
        userId: peerUserId,
        memberId: peer?.id ?? null,
        displayName: peer?.display_name ?? '바닥 멤버',
        avatarUrl: peer?.avatar_url ?? null,
        jobFunction: peer?.job_function ?? null,
        experienceYears: peer?.experience_years ?? null,
      },
    };
  };

  return NextResponse.json({
    sent: (sentRes.data ?? []).map((c) => enrich(c, c.target_id)),
    received: (receivedRes.data ?? []).map((c) => enrich(c, c.requester_id)),
  });
}

// POST: 관심/파트너/네트워킹 제안 보내기
// body: { toUserId, type, wantId?, message? }
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { toUserId, type = 'interest', wantId, message } = body;

  if (!toUserId) return NextResponse.json({ error: 'toUserId required' }, { status: 400 });
  if (toUserId === user.id) return NextResponse.json({ error: '자기 자신에게 보낼 수 없어요' }, { status: 400 });
  if (!['interest', 'partner', 'network'].includes(type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  }

  // 상대가 blocked? (자기 자신 차단 체크)
  const { data: blocked } = await supabase
    .from('badak_connections')
    .select('id')
    .eq('requester_id', user.id)
    .eq('target_id', toUserId)
    .eq('status', 'blocked')
    .maybeSingle();
  if (blocked) {
    return NextResponse.json({ error: '차단된 상대' }, { status: 403 });
  }

  // 일일 상한 체크
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: todayCount } = await supabase
    .from('badak_connections')
    .select('*', { count: 'exact', head: true })
    .eq('requester_id', user.id)
    .gte('created_at', dayAgo);
  if ((todayCount ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json({ error: `하루 ${DAILY_LIMIT}회까지만 보낼 수 있어요` }, { status: 429 });
  }

  // 중복 방지: 같은 requester+target+type이 있으면 기존 것 반환
  const { data: existing } = await supabase
    .from('badak_connections')
    .select('*')
    .eq('requester_id', user.id)
    .eq('target_id', toUserId)
    .eq('type', type)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ connection: existing, already: true });
  }

  const { data: created, error } = await supabase
    .from('badak_connections')
    .insert({
      requester_id: user.id,
      target_id: toUserId,
      type,
      want_id: wantId ?? null,
      message: message?.trim() || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 상대에게 알림 (badak_notifications)
  await supabase.from('badak_notifications').insert({
    user_id: toUserId,
    type: 'connection_request',
    title: '새 관심 제안',
    body: message?.trim() || `${type === 'partner' ? '파트너' : type === 'network' ? '네트워킹' : '관심'} 제안이 도착했어요`,
    link: '/badak/my?tab=connections',
    read: false,
  }).then(() => {}, () => { /* notification 실패는 무시 */ });

  return NextResponse.json({ connection: created }, { status: 201 });
}

// PATCH: 받은 제안에 응답 (수락/거절/차단)
// body: { id, status }
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { id, status } = body as { id?: string; status?: string };

  if (!id || !status) return NextResponse.json({ error: 'id, status required' }, { status: 400 });
  if (!['accepted', 'declined', 'blocked'].includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }

  // 본인이 target인 제안만 응답 가능
  const { data: conn } = await supabase
    .from('badak_connections')
    .select('*')
    .eq('id', id)
    .single();
  if (!conn) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (conn.target_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data: updated, error } = await supabase
    .from('badak_connections')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 수락 시 Talk 스레드 자동 생성
  let threadId: string | null = null;
  if (status === 'accepted') {
    try {
      const thread = await getOrCreateDirectThread(
        supabase,
        conn.requester_id,
        conn.target_id,
        { type: 'badak_connection', id: conn.id },
      );
      threadId = thread.id;

      // 요청자에게 수락 알림
      await supabase.from('badak_notifications').insert({
        user_id: conn.requester_id,
        type: 'connection_accepted',
        title: '제안이 수락되었어요',
        body: '이제 대화를 시작할 수 있어요',
        link: `/badak/my?tab=talks&thread=${threadId}`,
        read: false,
      }).then(() => {}, () => {});
    } catch { /* thread 생성 실패 무시 */ }
  }

  return NextResponse.json({ connection: updated, threadId });
}
