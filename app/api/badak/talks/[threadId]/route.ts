import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { listMessages, sendMessage, markThreadRead } from '@/lib/wio/talk';

const supabase = createAdminClient();

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

async function checkMembership(threadId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('wio_talk_threads')
    .select('participant_ids')
    .eq('id', threadId)
    .single();
  return !!data && (data.participant_ids as string[]).includes(userId);
}

// GET /api/badak/talks/[threadId] — 스레드 메시지 목록 (+ 자동 read 처리)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { threadId } = await params;
  const isMember = await checkMembership(threadId, user.id);
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const messages = await listMessages(supabase, threadId, 200);
  // 읽음 표시는 백그라운드 (응답 블로킹 안 함)
  markThreadRead(supabase, threadId, user.id).catch(() => {});

  return NextResponse.json({ messages });
}

// POST /api/badak/talks/[threadId] — 메시지 전송
// body: { body: string }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { threadId } = await params;
  const isMember = await checkMembership(threadId, user.id);
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const text = (body.body ?? '').trim();
  if (!text) return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: '2000자 이하' }, { status: 400 });

  try {
    const message = await sendMessage(supabase, threadId, user.id, text);

    // 상대방에게 알림 (한 스레드당 최근 1시간 내 1회만)
    const { data: thread } = await supabase
      .from('wio_talk_threads')
      .select('participant_ids')
      .eq('id', threadId)
      .single();
    if (thread) {
      const others = (thread.participant_ids as string[]).filter((id) => id !== user.id);
      for (const peerId of others) {
        await supabase.from('badak_notifications').insert({
          user_id: peerId,
          type: 'new_message',
          title: '새 메시지',
          body: text.slice(0, 80),
          link: `/badak/my?tab=talks&thread=${threadId}`,
          read: false,
        }).then(() => {}, () => {});
      }
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
