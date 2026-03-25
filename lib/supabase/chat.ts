/**
 * Ten:One™ 메신저 Supabase CRUD + Realtime
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ChatThread {
    id: string;
    name: string | null;
    is_group: boolean;
    participants: string[];
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: string;
    thread_id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    type: string;
    read_by: string[];
    created_at: string;
}

// ── 스레드 ──

export async function fetchThreads(userId: string): Promise<ChatThread[]> {
    const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .contains('participants', [userId])
        .order('updated_at', { ascending: false });
    if (error) { console.error('fetchThreads:', error.message); return []; }
    return data || [];
}

export async function createThread(params: {
    name?: string;
    isGroup: boolean;
    participants: string[];
    createdBy: string;
}): Promise<ChatThread | null> {
    // 1:1 대화는 기존 스레드 찾기
    if (!params.isGroup && params.participants.length === 2) {
        const existing = await findDirectThread(params.participants[0], params.participants[1]);
        if (existing) return existing;
    }

    const { data, error } = await supabase
        .from('chat_threads')
        .insert({
            name: params.name || null,
            is_group: params.isGroup,
            participants: params.participants,
            created_by: params.createdBy,
        })
        .select()
        .single();
    if (error) { console.error('createThread:', error.message); return null; }
    return data;
}

async function findDirectThread(userA: string, userB: string): Promise<ChatThread | null> {
    const { data } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('is_group', false)
        .contains('participants', [userA])
        .contains('participants', [userB]);
    return data?.[0] || null;
}

// ── 메시지 ──

export async function fetchMessages(threadId: string, limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .limit(limit);
    if (error) { console.error('fetchMessages:', error.message); return []; }
    return data || [];
}

export async function sendMessage(params: {
    threadId: string;
    senderId: string;
    senderName: string;
    content: string;
    type?: string;
}): Promise<ChatMessage | null> {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            thread_id: params.threadId,
            sender_id: params.senderId,
            sender_name: params.senderName,
            content: params.content,
            type: params.type || 'text',
            read_by: [params.senderId],
        })
        .select()
        .single();

    if (error) { console.error('sendMessage:', error.message); return null; }

    // 스레드 updated_at 갱신
    await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', params.threadId);

    return data;
}

export async function markAsRead(threadId: string, userId: string): Promise<void> {
    // 해당 스레드의 읽지 않은 메시지에 userId 추가
    const { data: unread } = await supabase
        .from('chat_messages')
        .select('id, read_by')
        .eq('thread_id', threadId)
        .not('read_by', 'cs', `{${userId}}`);

    if (unread && unread.length > 0) {
        for (const msg of unread) {
            await supabase
                .from('chat_messages')
                .update({ read_by: [...(msg.read_by || []), userId] })
                .eq('id', msg.id);
        }
    }
}

// ── Realtime 구독 ──

export function subscribeToMessages(
    threadId: string,
    callback: (message: ChatMessage) => void
) {
    const channel = supabase
        .channel(`chat:${threadId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `thread_id=eq.${threadId}`,
            },
            (payload) => {
                callback(payload.new as ChatMessage);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

export function subscribeToAllThreads(
    userId: string,
    callback: (message: ChatMessage) => void
) {
    const channel = supabase
        .channel(`chat:all:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
            },
            (payload) => {
                callback(payload.new as ChatMessage);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// ── 유틸 ──

export function getUnreadCount(messages: ChatMessage[], userId: string): number {
    return messages.filter(m => m.sender_id !== userId && !m.read_by?.includes(userId)).length;
}

export function getLastMessage(messages: ChatMessage[]): ChatMessage | null {
    return messages.length > 0 ? messages[messages.length - 1] : null;
}
