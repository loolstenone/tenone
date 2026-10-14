// OAuth 보호 자원 메타데이터 (RFC 9728) — /.well-known/oauth-protected-resource 로 노출 (next.config.ts rewrites)
// 플래너'스 AI 연결 서버(/api/planners-mcp)의 로그인 서버 = Supabase OAuth 2.1 (자동 클라이언트 등록·PKCE)
import { protectedResourceHandler, metadataCorsOptionsRequestHandler } from "mcp-handler";

// 환경변수 끝 줄바꿈이 주소에 섞여 실서버 메타데이터가 깨졌던 사고 (2026-10-14) — trim 필수
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");

const handler = protectedResourceHandler({
    authServerUrls: [`${supabaseUrl}/auth/v1`],
});

export { handler as GET };
export const OPTIONS = metadataCorsOptionsRequestHandler();
