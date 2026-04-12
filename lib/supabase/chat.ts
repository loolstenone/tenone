/**
 * Ten:One™ 메신저 Supabase CRUD + Realtime
 * 통합 커맨드 센터: 사람 + 클라우드AI + 로컬AI + 서비스
 */
import { createClient } from './client';
import type {
    MessengerThread, MessengerMessage, MessengerServiceHook,
    ActionPayload, AgentProfileExtended,
    ThreadType, SenderType, MessageFormat,
} from '@/types/messenger';

const supabase = createClient();

// 하위 호환 — 기존 코드가 ChatThread/ChatMessage를 import하는 곳 유지
export type ChatThread = MessengerThread;
export type ChatMessage = MessengerMessage;

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
            (payload: { new: Record<string, unknown> }) => {
                callback(payload.new as unknown as ChatMessage);
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
            (payload: { new: Record<string, unknown> }) => {
                callback(payload.new as unknown as ChatMessage);
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

// ── 채널 ──

/** 채널 목록 조회 (thread_type='channel') */
export async function fetchChannels(): Promise<ChatThread[]> {
    const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('thread_type', 'channel')
        .order('name');
    if (error) { console.error('fetchChannels:', error.message); return []; }
    return data || [];
}

/** 에이전트가 채널에 메시지 게시 */
export async function postAgentMessage(params: {
    channelName: string;
    agentName: string;
    content: string;
}): Promise<ChatMessage | null> {
    // 채널 스레드 찾기
    const { data: threads } = await supabase
        .from('chat_threads')
        .select('id')
        .eq('thread_type', 'channel')
        .eq('name', params.channelName)
        .limit(1);

    if (!threads || threads.length === 0) {
        console.error('postAgentMessage: channel not found:', params.channelName);
        return null;
    }

    const threadId = threads[0].id;
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            thread_id: threadId,
            sender_id: '00000000-0000-0000-0000-000000000000', // 에이전트 시스템 ID
            sender_name: params.agentName,
            sender_type: 'agent',
            content: params.content,
            type: 'text',
            read_by: [],
        })
        .select()
        .single();

    if (error) { console.error('postAgentMessage:', error.message); return null; }

    // 스레드 updated_at 갱신
    await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

    return data;
}

// ── Messenger Hub 확장 함수들 ──

/** 에이전트 DM 스레드 찾거나 생성 */
export async function findOrCreateAgentDM(params: {
    userId: string;
    agentName: string;
    agentRuntime: 'cloud' | 'local';
}): Promise<ChatThread | null> {
    // 기존 agent_dm 스레드 찾기
    const { data: existing } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('thread_type', 'agent_dm')
        .eq('agent_name', params.agentName)
        .contains('participants', [params.userId]);

    if (existing && existing.length > 0) return existing[0];

    // 새로 생성
    const { data, error } = await supabase
        .from('chat_threads')
        .insert({
            name: params.agentName,
            is_group: false,
            thread_type: 'agent_dm' as ThreadType,
            agent_name: params.agentName,
            agent_runtime: params.agentRuntime,
            participants: [params.userId],
        })
        .select()
        .single();

    if (error) { console.error('findOrCreateAgentDM:', error.message); return null; }
    return data;
}

/** 서비스 스레드 목록 조회 */
export async function fetchServiceThreads(): Promise<ChatThread[]> {
    const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('thread_type', 'service')
        .order('updated_at', { ascending: false });
    if (error) { console.error('fetchServiceThreads:', error.message); return []; }
    return data || [];
}

/** 에이전트 DM 스레드 목록 조회 */
export async function fetchAgentDMThreads(userId: string): Promise<ChatThread[]> {
    const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('thread_type', 'agent_dm')
        .contains('participants', [userId])
        .order('updated_at', { ascending: false });
    if (error) { console.error('fetchAgentDMThreads:', error.message); return []; }
    return data || [];
}

/** 서비스 훅 목록 조회 */
export async function fetchServiceHooks(): Promise<MessengerServiceHook[]> {
    const { data, error } = await supabase
        .from('messenger_service_hooks')
        .select('*')
        .eq('is_active', true)
        .order('display_name');
    if (error) { console.error('fetchServiceHooks:', error.message); return []; }
    return data || [];
}

/** 에이전트 프로필 목록 (런타임 포함) */
export async function fetchAgentProfiles(): Promise<AgentProfileExtended[]> {
    const { data, error } = await supabase
        .from('agent_profiles')
        .select('id, name, display_name, layer, agent_type, runtime, local_endpoint, fallback_agent, model_id, is_active, brand_id')
        .eq('is_active', true)
        .order('layer');
    if (error) { console.error('fetchAgentProfiles:', error.message); return []; }
    return data || [];
}

/** Action Card 상태 업데이트 */
export async function updateActionStatus(
    messageId: string,
    actionId: string,
    userId: string
): Promise<boolean> {
    const { data: msg } = await supabase
        .from('chat_messages')
        .select('action_payload')
        .eq('id', messageId)
        .single();

    if (!msg?.action_payload) return false;

    const payload = msg.action_payload as ActionPayload;
    if (payload.status !== 'pending') return false;

    const updated: ActionPayload = {
        ...payload,
        status: 'acted',
        acted_action_id: actionId,
        acted_at: new Date().toISOString(),
        acted_by: userId,
    };

    const { error } = await supabase
        .from('chat_messages')
        .update({ action_payload: updated })
        .eq('id', messageId);

    return !error;
}

/** 에이전트 메시지 전송 (DM용 — 범용) */
export async function sendAgentMessage(params: {
    threadId: string;
    agentName: string;
    content: string;
    senderType?: SenderType;
    messageFormat?: MessageFormat;
    actionPayload?: ActionPayload;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}): Promise<ChatMessage | null> {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            thread_id: params.threadId,
            sender_id: '00000000-0000-0000-0000-000000000000',
            sender_name: params.agentName,
            sender_type: params.senderType || 'agent',
            content: params.content,
            type: 'text',
            message_format: params.messageFormat || 'text',
            action_payload: params.actionPayload || null,
            correlation_id: params.correlationId || null,
            metadata: params.metadata || null,
            read_by: [],
        })
        .select()
        .single();

    if (error) { console.error('sendAgentMessage:', error.message); return null; }

    await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', params.threadId);

    return data;
}
