/**
 * OpenClaw 어댑터 (Peter Steinberger AI Agent Framework)
 * Gateway: http://localhost:18789 (Bearer 토큰 인증)
 *
 * OpenClaw Gateway는 UI + REST API를 제공.
 * 채팅은 Ollama 백엔드를 통해 처리 (OpenClaw이 Ollama를 오케스트레이션).
 */
import type { LocalAgentAdapter, ChatRequest, ChatResponse } from "./base.js";
import { config } from "../config.js";

export class OpenClawAdapter implements LocalAgentAdapter {
    name = "openclaw";
    displayName = "OpenClaw";
    endpoint: string;
    private token: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
        this.token = config.openclaw.token || "";
    }

    private get headers() {
        return {
            "Content-Type": "application/json",
            ...(this.token ? { "Authorization": `Bearer ${this.token}` } : {}),
        };
    }

    async healthCheck(): Promise<boolean> {
        try {
            const res = await fetch(this.endpoint, {
                headers: this.headers,
                signal: AbortSignal.timeout(5000),
            });
            // OpenClaw Gateway는 200 + HTML 반환
            return res.ok;
        } catch {
            return false;
        }
    }

    /**
     * OpenClaw 채팅 — 현재는 Ollama를 통해 라우팅
     * 향후 OpenClaw native /api/v1/chat 엔드포인트 사용 가능
     */
    async chat(req: ChatRequest): Promise<ChatResponse> {
        const start = Date.now();
        const ollamaUrl = config.ollama.url;
        const model = req.model || "gemma4:e4b";

        // OpenClaw → Ollama 라우팅 (OpenClaw이 오케스트레이션)
        const res = await fetch(`${ollamaUrl}/api/chat`, {
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
            throw new Error(`OpenClaw/Ollama error ${res.status}: ${text}`);
        }

        const data = await res.json() as { message?: { content?: string }; model?: string };
        return {
            content: data.message?.content || "",
            model: data.model || model,
            ms: Date.now() - start,
        };
    }
}
