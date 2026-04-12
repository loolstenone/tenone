/**
 * Local Agent Status API
 * GET /api/messenger/local-status
 *
 * 로컬 AI 에이전트(OpenClaw, Gemma)의 온라인 상태를 확인.
 * Bridge 데몬이 없어도 직접 헬스체크 시도.
 */
import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAuthOrAdmin } from "@/lib/supabase/api-utils";
import { createClient } from "@/lib/supabase/server";

interface AgentStatus {
    name: string;
    display_name: string;
    runtime: string;
    endpoint: string | null;
    is_online: boolean;
    fallback_agent: string | null;
}

export async function GET(request: NextRequest) {
    const { error: authErr } = await requireAuthOrAdmin(request);
    if (authErr) return authErr;

    const supabase = await createClient();

    // 로컬 에이전트 목록 조회
    const { data: agents } = await supabase
        .from("agent_profiles")
        .select("name, display_name, runtime, local_endpoint, fallback_agent")
        .eq("runtime", "local")
        .eq("is_active", true);

    if (!agents || agents.length === 0) {
        return successResponse({ agents: [], message: "로컬 에이전트 없음" });
    }

    // 각 에이전트 헬스체크
    const statuses: AgentStatus[] = await Promise.all(
        agents.map(async (agent) => {
            let isOnline = false;

            if (agent.local_endpoint) {
                try {
                    // Ollama: /api/tags, OpenClaw: root (200 = running)
                    const origin = new URL(agent.local_endpoint).origin;
                    const checkUrl = agent.local_endpoint.includes("11434")
                        ? `${origin}/api/tags`
                        : origin;

                    const res = await fetch(checkUrl, {
                        signal: AbortSignal.timeout(3000),
                    });
                    isOnline = res.ok;
                } catch {
                    isOnline = false;
                }
            }

            return {
                name: agent.name,
                display_name: agent.display_name,
                runtime: agent.runtime,
                endpoint: agent.local_endpoint,
                is_online: isOnline,
                fallback_agent: agent.fallback_agent,
            };
        })
    );

    return successResponse({ agents: statuses });
}
