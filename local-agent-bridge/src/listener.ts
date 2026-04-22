/**
 * Supabase Realtime 리스너
 * chat_messages INSERT를 감지하여 로컬 에이전트에게 전달
 */
import { createClient, type SupabaseClient, type RealtimeChannel } from "@supabase/supabase-js";
import { config } from "./config.js";
import type { MessageRouter } from "./router.js";

interface ChatMessage {
    id: string;
    thread_id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    type: string;
    sender_type: string;
    message_format: string;
    read_by: string[];
    created_at: string;
}

interface ChatThread {
    id: string;
    agent_name: string | null;
    agent_runtime: string | null;
    thread_type: string;
}

export class SupabaseListener {
    private supabase: SupabaseClient;
    private router: MessageRouter;
    private channel: RealtimeChannel | null = null;
    // 에이전트 system prompt 캐시
    private promptCache: Map<string, string> = new Map();

    constructor(router: MessageRouter) {
        this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
        this.router = router;
    }

    start(): void {
        this.channel = this.supabase
            .channel("bridge-messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "wio_chat_messages",
                },
                (payload) => {
                    const msg = payload.new as ChatMessage;
                    this.handleMessage(msg).catch(e =>
                        console.error("[listener] 메시지 처리 오류:", e)
                    );
                }
            )
            .subscribe((status) => {
                console.log(`[listener] Realtime 상태: ${status}`);
            });

        console.log("[listener] Supabase Realtime 구독 시작");
    }

    stop(): void {
        if (this.channel) {
            this.supabase.removeChannel(this.channel);
            this.channel = null;
        }
    }

    private async handleMessage(msg: ChatMessage): Promise<void> {
        // 사람이 보낸 메시지만 처리 (에이전트/시스템 메시지 무시 → 루프 방지)
        if (msg.sender_type !== "human") return;

        // 해당 스레드가 로컬 에이전트 DM인지 확인
        const thread = await this.getThread(msg.thread_id);
        if (!thread) return;
        if (thread.thread_type !== "agent_dm") return;
        if (!thread.agent_name) return;
        if (thread.agent_runtime !== "local") return;

        console.log(`[listener] 로컬 에이전트 메시지: ${thread.agent_name} <- "${msg.content.slice(0, 50)}..."`);

        // system prompt 가져오기
        const systemPrompt = await this.getSystemPrompt(thread.agent_name);

        // 라우터에 전달
        const result = await this.router.route(
            thread.agent_name,
            msg.content,
            systemPrompt
        );

        console.log(`[listener] 응답: ${result.respondedBy} (${result.runtime}, ${result.ms}ms)`);

        // 응답을 chat_messages에 기록
        const senderType = result.runtime === "local" ? "local_agent" : "agent";
        await this.supabase.from("wio_chat_messages").insert({
            thread_id: msg.thread_id,
            sender_id: "00000000-0000-0000-0000-000000000000",
            sender_name: result.respondedBy,
            sender_type: senderType,
            content: result.response,
            type: "text",
            message_format: "text",
            metadata: {
                runtime: result.runtime,
                ms: result.ms,
                original_agent: thread.agent_name,
            },
            read_by: [],
        });

        // 스레드 updated_at 갱신
        await this.supabase
            .from("wio_chat_threads")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", msg.thread_id);
    }

    private async getThread(threadId: string): Promise<ChatThread | null> {
        const { data } = await this.supabase
            .from("wio_chat_threads")
            .select("id, agent_name, agent_runtime, thread_type")
            .eq("id", threadId)
            .single();
        return data;
    }

    private async getSystemPrompt(agentName: string): Promise<string | undefined> {
        if (this.promptCache.has(agentName)) {
            return this.promptCache.get(agentName);
        }

        const { data } = await this.supabase
            .from("agent_profiles")
            .select("system_prompt")
            .eq("name", agentName)
            .single();

        if (data?.system_prompt) {
            this.promptCache.set(agentName, data.system_prompt);
            return data.system_prompt;
        }
        return undefined;
    }
}
