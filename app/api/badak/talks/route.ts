import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { listThreadsForUser } from '@/lib/wio/talk';

const supabase = createAdminClient();

// GET /api/badak/talks — 내 스레드 목록
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const threads = await listThreadsForUser(supabase, user.id, 50);

  // 상대방 정보 lookup
  const peerIds = Array.from(new Set(
    threads.flatMap((t) => t.participantIds.filter((id) => id !== user.id))
  ));
  const { data: members } = peerIds.length > 0
    ? await supabase
        .from('badak_members')
        .select('user_id, display_name, avatar_url, job_function')
        .in('user_id', peerIds)
    : { data: [] };

  const memberByUser = new Map(
    (members ?? []).map((m: { user_id: string; display_name: string; avatar_url: string | null; job_function: string | null }) => [m.user_id, m]),
  );

  const enriched = threads.map((t) => {
    const peerId = t.participantIds.find((id) => id !== user.id) ?? '';
    const peer = memberByUser.get(peerId);
    return {
      id: t.id,
      peerUserId: peerId,
      peerName: peer?.display_name ?? '바닥 멤버',
      peerAvatar: peer?.avatar_url ?? null,
      peerJob: peer?.job_function ?? null,
      subject: t.subject,
      lastMessagePreview: t.lastMessagePreview,
      lastMessageAt: t.lastMessageAt,
    };
  });

  // 읽지 않은 메시지 수 집계
  let unreadTotal = 0;
  if (threads.length > 0) {
    const threadIds = threads.map((t) => t.id);
    const { count } = await supabase
      .from('wio_talk_messages')
      .select('*', { count: 'exact', head: true })
      .in('thread_id', threadIds)
      .not('read_by', 'cs', `{${user.id}}`);
    unreadTotal = count ?? 0;
  }

  return NextResponse.json({ threads: enriched, unreadTotal });
}
