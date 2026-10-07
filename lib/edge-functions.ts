// 서버 전용 — Supabase Edge Function 호출 인증 헤더
// Edge Function은 x-edge-secret(Vault edge_function_secret)이 맞아야 실행된다 (supabase/functions/_shared/edge-auth.ts)
// 비밀은 public.edge_function_secret() (service_role 전용)로 읽는다 — 환경변수에 두지 않음 (sql/edge-function-auth.sql)
import { createAdminClient } from "@/lib/supabase/admin";

let cached: string | null = null;

export async function edgeAuthHeaders(): Promise<Record<string, string>> {
    if (!cached) {
        const { data, error } = await createAdminClient().rpc("edge_function_secret");
        if (error || typeof data !== "string" || !data) {
            console.error("[edge-functions] 비밀 조회 실패", error?.message);
            return {};
        }
        cached = data;
    }
    return { "x-edge-secret": cached };
}
