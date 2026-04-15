/**
 * WIO Talk — 1:1 내부 메시징 모듈
 *
 * 크로스 브랜드 공통 DM 엔진. Badak/HeRo/MADLeague 등 모든 브랜드가 import하여 사용.
 *
 * 간이 버전 — 폴링 기반. 실시간 구독은 Phase 4에서 Supabase realtime으로 업그레이드.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface TalkThread {
  id: string;
  participantIds: string[];
  contextType: string;
  contextId: string | null;
  subject: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  createdAt: string;
}

export interface TalkMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  readBy: string[];
  createdAt: string;
}

/**
 * 두 사용자 사이의 스레드를 찾거나 생성한다.
 * 이미 있으면 재사용 (중복 방지).
 */
export async function getOrCreateDirectThread(
  supabase: SupabaseClient,
  a: string,
  b: string,
  context: { type?: string; id?: string | null; subject?: string } = {},
): Promise<TalkThread> {
  const participants = [a, b].sort();

  // 기존 스레드 검색 — 정확히 이 2명만 있는 direct 스레드
  const { data: existing } = await supabase
    .from('wio_talk_threads')
    .select('*')
    .contains('participant_ids', participants)
    .eq('context_type', context.type ?? 'direct')
    .limit(10);

  const exact = (existing ?? []).find((t: { participant_ids: string[] }) => {
    if (t.participant_ids.length !== 2) return false;
    const sorted = [...t.participant_ids].sort();
    return sorted[0] === participants[0] && sorted[1] === participants[1];
  });

  if (exact) return rowToThread(exact);

  const { data: created, error } = await supabase
    .from('wio_talk_threads')
    .insert({
      participant_ids: participants,
      context_type: context.type ?? 'direct',
      context_id: context.id ?? null,
      subject: context.subject ?? null,
    })
    .select()
    .single();

  if (error || !created) throw new Error(error?.message ?? 'Failed to create thread');
  return rowToThread(created);
}

export async function listThreadsForUser(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<TalkThread[]> {
  const { data } = await supabase
    .from('wio_talk_threads')
    .select('*')
    .contains('participant_ids', [userId])
    .order('last_message_at', { ascending: false })
    .limit(limit);
  return (data ?? []).map(rowToThread);
}

export async function listMessages(
  supabase: SupabaseClient,
  threadId: string,
  limit = 100,
): Promise<TalkMessage[]> {
  const { data } = await supabase
    .from('wio_talk_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(limit);
  return (data ?? []).map(rowToMessage);
}

export async function sendMessage(
  supabase: SupabaseClient,
  threadId: string,
  senderId: string,
  body: string,
): Promise<TalkMessage> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('빈 메시지는 전송할 수 없습니다');

  const { data: msg, error } = await supabase
    .from('wio_talk_messages')
    .insert({
      thread_id: threadId,
      sender_id: senderId,
      body: trimmed,
      read_by: [senderId],
    })
    .select()
    .single();

  if (error || !msg) throw new Error(error?.message ?? 'Failed to send message');

  // 스레드 메타 업데이트
  await supabase
    .from('wio_talk_threads')
    .update({
      last_message_at: msg.created_at,
      last_message_preview: trimmed.slice(0, 80),
    })
    .eq('id', threadId);

  return rowToMessage(msg);
}

export async function markThreadRead(
  supabase: SupabaseClient,
  threadId: string,
  userId: string,
): Promise<void> {
  // read_by 배열에 userId 추가 (중복 제거는 array_append 대신 함수 필요 — 간단히 overwrite)
  const { data: rows } = await supabase
    .from('wio_talk_messages')
    .select('id, read_by')
    .eq('thread_id', threadId)
    .not('read_by', 'cs', `{${userId}}`);

  if (!rows || rows.length === 0) return;

  for (const r of rows as { id: string; read_by: string[] }[]) {
    const next = Array.from(new Set([...(r.read_by ?? []), userId]));
    await supabase.from('wio_talk_messages').update({ read_by: next }).eq('id', r.id);
  }
}

function rowToThread(r: {
  id: string; participant_ids: string[]; context_type: string; context_id: string | null;
  subject: string | null; last_message_at: string; last_message_preview: string | null; created_at: string;
}): TalkThread {
  return {
    id: r.id,
    participantIds: r.participant_ids,
    contextType: r.context_type,
    contextId: r.context_id,
    subject: r.subject,
    lastMessageAt: r.last_message_at,
    lastMessagePreview: r.last_message_preview,
    createdAt: r.created_at,
  };
}

function rowToMessage(r: {
  id: string; thread_id: string; sender_id: string; body: string; read_by: string[] | null; created_at: string;
}): TalkMessage {
  return {
    id: r.id,
    threadId: r.thread_id,
    senderId: r.sender_id,
    body: r.body,
    readBy: r.read_by ?? [],
    createdAt: r.created_at,
  };
}
