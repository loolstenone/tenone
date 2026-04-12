/**
 * Ten:One Local Agent Bridge
 *
 * PC에 상주하며 Supabase ↔ 로컬 AI (OpenClaw, Gemma) 를 연결하는 데몬.
 * 메신저에서 로컬 에이전트 DM 메시지를 감지 → 로컬 AI 호출 → 응답 기록.
 * 로컬 AI 오프라인 시 클라우드 에이전트(1001)로 폴백.
 *
 * 실행: npm start (또는 npm run dev)
 */
import { config, validateConfig } from "./config.js";
import { OpenClawAdapter } from "./adapters/openclaw.js";
import { OllamaAdapter } from "./adapters/ollama.js";
import { HealthManager } from "./health.js";
import { MessageRouter } from "./router.js";
import { SupabaseListener } from "./listener.js";

async function main() {
    console.log("╔══════════════════════════════════════════╗");
    console.log("║  Ten:One™ Local Agent Bridge v1.0        ║");
    console.log("╚══════════════════════════════════════════╝");

    if (!validateConfig()) {
        process.exit(1);
    }

    // 1. 어댑터 초기화
    const openclaw = new OpenClawAdapter(config.openclaw.url);
    const ollama = new OllamaAdapter(config.ollama.url);
    const adapters = [openclaw, ollama];

    // 2. 폴백 매핑 (로컬 → 클라우드)
    const fallbacks = new Map<string, string>([
        ["openclaw", "1001"],
        ["gemma", "1001"],
    ]);

    // 3. 헬스체크 매니저
    const health = new HealthManager(adapters, fallbacks);
    health.start();

    // 초기 헬스체크 대기
    await health.checkAll();
    const statuses = health.getAllStatus();
    console.log("\n[상태]");
    for (const s of statuses) {
        const icon = s.isOnline ? "🟢" : "🔴";
        console.log(`  ${icon} ${s.displayName}: ${s.isOnline ? "온라인" : "오프라인"}`);
    }
    console.log();

    // 4. 라우터
    const router = new MessageRouter(adapters, health, fallbacks);

    // 5. Supabase Realtime 리스너
    const listener = new SupabaseListener(router);
    listener.start();

    console.log("[bridge] 대기 중... (Ctrl+C로 종료)\n");

    // Graceful shutdown
    const shutdown = () => {
        console.log("\n[bridge] 종료 중...");
        listener.stop();
        health.stop();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

main().catch(e => {
    console.error("[bridge] 치명적 오류:", e);
    process.exit(1);
});
