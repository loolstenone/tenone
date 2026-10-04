/** GET /api/intra/external/status 응답 — 인트라 외부 리소스 실시간 현황 */
export interface ExternalStatus {
    generatedAt: string;
    deployment: {
        env: string;
        commit: string | null;
        commitMessage: string | null;
        branch: string | null;
        region: string | null;
    };
    env: { key: string; purpose: string; scope: "public" | "server-only"; required: boolean; set: boolean }[];
    envMissingRequired: string[];
    envForbiddenSet: { key: string; reason: string }[];
    crons: { path: string; schedule: string; label: string }[];
    agents: {
        name: string;
        display_name: string;
        layer: number;
        agent_type: string;
        model_id: string | null;
        is_active: boolean;
        count30: number;
        lastActivity: string | null;
    }[];
    models: string[];
    gmail: { email: string; is_active: boolean; expiresAt: string | null; updated_at: string }[];
    sources: { total: number; active: number; lastCrawl: string | null };
}
