/**
 * 로컬 AI 헬스체크 매니저
 * 주기적으로 로컬 에이전트의 상태를 확인하고 Supabase에 기록
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LocalAgentAdapter } from "./adapters/base.js";
import { config } from "./config.js";

export interface AgentHealth {
    name: string;
    displayName: string;
    isOnline: boolean;
    lastCheck: Date;
    lastError?: string;
    fallbackAgent: string;
}

export class HealthManager {
    private adapters: LocalAgentAdapter[];
    private supabase: SupabaseClient;
    private status: Map<string, AgentHealth> = new Map();
    private interval: ReturnType<typeof setInterval> | null = null;
    private fallbacks: Map<string, string>;

    constructor(adapters: LocalAgentAdapter[], fallbacks: Map<string, string>) {
        this.adapters = adapters;
        this.fallbacks = fallbacks;
        this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
    }

    async checkAll(): Promise<void> {
        for (const adapter of this.adapters) {
            const wasOnline = this.status.get(adapter.name)?.isOnline;
            let isOnline = false;
            let lastError: string | undefined;

            try {
                isOnline = await adapter.healthCheck();
            } catch (e) {
                lastError = String(e);
            }

            const health: AgentHealth = {
                name: adapter.name,
                displayName: adapter.displayName,
                isOnline,
                lastCheck: new Date(),
                lastError,
                fallbackAgent: this.fallbacks.get(adapter.name) || "1001",
            };
            this.status.set(adapter.name, health);

            // 상태 변경 시 로그
            if (wasOnline !== undefined && wasOnline !== isOnline) {
                const statusText = isOnline ? "ONLINE" : "OFFLINE";
                console.log(`[health] ${adapter.displayName}: ${statusText}`);

                // 오프라인 전환 시 메신저 알림
                if (!isOnline) {
                    await this.notifyOffline(adapter);
                }
            }
        }
    }

    private async notifyOffline(adapter: LocalAgentAdapter): Promise<void> {
        const fallback = this.fallbacks.get(adapter.name) || "1001";
        try {
            await fetch(`${config.tenone.apiUrl}/api/messenger/service-hook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.tenone.adminKey}`,
                },
                body: JSON.stringify({
                    service: "wio",
                    event: "system_health",
                    title: `${adapter.displayName} 오프라인`,
                    body: `PC 로컬 AI가 응답하지 않습니다. ${fallback}이 대신 응답합니다.`,
                    priority: "high",
                    actions: [
                        { id: "act_health_dismiss", label: "확인", type: "dismiss" },
                    ],
                }),
            });
        } catch (e) {
            console.error("[health] 오프라인 알림 실패:", e);
        }
    }

    getStatus(agentName: string): AgentHealth | undefined {
        return this.status.get(agentName);
    }

    getAllStatus(): AgentHealth[] {
        return Array.from(this.status.values());
    }

    isOnline(agentName: string): boolean {
        return this.status.get(agentName)?.isOnline ?? false;
    }

    start(): void {
        // 즉시 1회 체크
        this.checkAll();
        // 주기적 체크
        this.interval = setInterval(() => this.checkAll(), config.healthInterval);
        console.log(`[health] 헬스체크 시작 (${config.healthInterval / 1000}초 주기)`);
    }

    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
