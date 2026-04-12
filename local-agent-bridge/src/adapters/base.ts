/**
 * Local Agent 어댑터 공통 인터페이스
 */

export interface ChatRequest {
    messages: { role: "system" | "user" | "assistant"; content: string }[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
}

export interface ChatResponse {
    content: string;
    model: string;
    ms: number;
}

export interface LocalAgentAdapter {
    name: string;
    displayName: string;
    endpoint: string;

    healthCheck(): Promise<boolean>;
    chat(req: ChatRequest): Promise<ChatResponse>;
}
