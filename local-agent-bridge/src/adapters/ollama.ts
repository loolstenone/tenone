/**
 * Ollama 어댑터 (Gemma 4 등 로컬 LLM)
 */
import type { LocalAgentAdapter, ChatRequest, ChatResponse } from "./base.js";

export class OllamaAdapter implements LocalAgentAdapter {
    name = "gemma";
    displayName = "Gemma";
    endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async healthCheck(): Promise<boolean> {
        try {
            const res = await fetch(`${this.endpoint}/api/tags`, {
                signal: AbortSignal.timeout(5000),
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    async chat(req: ChatRequest): Promise<ChatResponse> {
        const start = Date.now();
        const model = req.model || "gemma4:e4b";

        const res = await fetch(`${this.endpoint}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                messages: req.messages,
                stream: false,
                options: {
                    temperature: req.temperature ?? 0.3,
                    num_predict: req.max_tokens ?? 2048,
                },
            }),
            signal: AbortSignal.timeout(120000),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Ollama error ${res.status}: ${text}`);
        }

        const data = await res.json() as { message?: { content?: string }; model?: string };
        return {
            content: data.message?.content || "",
            model: data.model || model,
            ms: Date.now() - start,
        };
    }
}
