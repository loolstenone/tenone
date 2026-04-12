/**
 * OpenClaw 어댑터 (Peter Steinberger AI Agent Framework)
 * OpenAI-compatible /v1/chat/completions 엔드포인트
 */
import type { LocalAgentAdapter, ChatRequest, ChatResponse } from "./base.js";

export class OpenClawAdapter implements LocalAgentAdapter {
    name = "openclaw";
    displayName = "OpenClaw";
    endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async healthCheck(): Promise<boolean> {
        try {
            const res = await fetch(`${this.endpoint}/v1/models`, {
                signal: AbortSignal.timeout(5000),
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    async chat(req: ChatRequest): Promise<ChatResponse> {
        const start = Date.now();
        const model = req.model || "openclaw-local";

        const res = await fetch(`${this.endpoint}/v1/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                messages: req.messages,
                temperature: req.temperature ?? 0.3,
                max_tokens: req.max_tokens ?? 2048,
                stream: false,
            }),
            signal: AbortSignal.timeout(120000),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`OpenClaw error ${res.status}: ${text}`);
        }

        const data = await res.json() as {
            choices?: { message?: { content?: string } }[];
            model?: string;
        };
        return {
            content: data.choices?.[0]?.message?.content || "",
            model: data.model || model,
            ms: Date.now() - start,
        };
    }

    /**
     * Lobster 워크플로우 실행 (OpenClaw 전용)
     */
    async runWorkflow(workflowName: string, inputs: Record<string, unknown>): Promise<{ result: unknown; ms: number }> {
        const start = Date.now();
        const res = await fetch(`${this.endpoint}/v1/workflows/${workflowName}/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputs }),
            signal: AbortSignal.timeout(300000),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`OpenClaw workflow error ${res.status}: ${text}`);
        }

        const data = await res.json();
        return { result: data, ms: Date.now() - start };
    }
}
