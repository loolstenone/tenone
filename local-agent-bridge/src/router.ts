/**
 * 메시지 라우터
 * agent_name → 적절한 로컬 어댑터 매핑 + 오프라인 시 폴백
 */
import type { LocalAgentAdapter, ChatResponse } from "./adapters/base.js";
import type { HealthManager } from "./health.js";
import { config } from "./config.js";

export class MessageRouter {
    private adapters: Map<string, LocalAgentAdapter>;
    private health: HealthManager;
    private fallbacks: Map<string, string>;

    constructor(
        adapters: LocalAgentAdapter[],
        health: HealthManager,
        fallbacks: Map<string, string>
    ) {
        this.adapters = new Map(adapters.map(a => [a.name, a]));
        this.health = health;
        this.fallbacks = fallbacks;
    }

    /**
     * 메시지를 적절한 에이전트로 라우팅
     * 로컬 온라인 → 로컬 처리
     * 로컬 오프라인 → 클라우드 폴백
     */
    async route(
        agentName: string,
        content: string,
        systemPrompt?: string
    ): Promise<{ response: string; respondedBy: string; runtime: "local" | "cloud"; ms: number }> {
        const adapter = this.adapters.get(agentName);

        // 로컬 어댑터가 있고 온라인인 경우 → 로컬 처리
        if (adapter && this.health.isOnline(agentName)) {
            try {
                const result = await adapter.chat({
                    messages: [
                        ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
                        { role: "user" as const, content },
                    ],
                });
                return {
                    response: result.content,
                    respondedBy: agentName,
                    runtime: "local",
                    ms: result.ms,
                };
            } catch (e) {
                console.error(`[router] ${agentName} 로컬 처리 실패, 폴백 전환:`, e);
            }
        }

        // 폴백: 클라우드 에이전트 (TenOne API)
        const fallbackAgent = this.fallbacks.get(agentName) || "1001";
        return this.fallbackToCloud(fallbackAgent, content, agentName);
    }

    private async fallbackToCloud(
        fallbackAgent: string,
        content: string,
        originalAgent: string
    ): Promise<{ response: string; respondedBy: string; runtime: "cloud"; ms: number }> {
        const start = Date.now();
        const prefixedMessage = `[${originalAgent} 오프라인 — 대신 응답] ${content}`;

        try {
            const res = await fetch(`${config.tenone.apiUrl}/api/agent/hub`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.tenone.adminKey}`,
                },
                body: JSON.stringify({
                    agentName: fallbackAgent,
                    message: prefixedMessage,
                }),
                signal: AbortSignal.timeout(60000),
            });

            const data = await res.json() as { response?: string; error?: string };
            return {
                response: data.response || data.error || "응답 없음",
                respondedBy: fallbackAgent,
                runtime: "cloud",
                ms: Date.now() - start,
            };
        } catch (e) {
            return {
                response: `에이전트 응답 불가 (${originalAgent} 오프라인, ${fallbackAgent} 폴백 실패)`,
                respondedBy: "system",
                runtime: "cloud",
                ms: Date.now() - start,
            };
        }
    }
}
