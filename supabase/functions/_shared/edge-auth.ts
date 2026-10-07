/**
 * Edge Function 호출 인증 — 우리 쪽 호출자(pg_cron·Vercel 서버)만 실행
 *
 * 요청 헤더 `x-edge-secret` 이 Vault 비밀(edge_function_secret)과 같아야 한다.
 *   - 비밀 조회: public.edge_function_secret() — service_role 전용 (sql/edge-function-auth.sql)
 *   - pg_cron  : vault.decrypted_secrets에서 읽어 헤더로 보냄
 *   - Vercel   : lib/edge-functions.ts edgeAuthHeaders()
 * 비밀을 못 읽으면 전부 거부(fail-closed). OPTIONS(CORS preflight)는 통과.
 *
 * 배포: 각 함수 폴더에 이 파일을 edge-auth.ts로 함께 올리고 `import { requireEdgeSecret } from './edge-auth.ts'`
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

let cachedSecret: string | null = null;

async function loadSecret(): Promise<string | null> {
  if (cachedSecret) return cachedSecret;
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.rpc('edge_function_secret');
  if (error || typeof data !== 'string' || data.length < 32) {
    console.error('[edge-auth] 비밀 조회 실패', error?.message);
    return null;
  }
  cachedSecret = data;
  return data;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** 통과면 null, 거부면 401 Response */
export async function requireEdgeSecret(req: Request): Promise<Response | null> {
  if (req.method === 'OPTIONS') return null;
  const given = req.headers.get('x-edge-secret') ?? '';
  const secret = await loadSecret();
  if (secret && given && safeEqual(given, secret)) return null;
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
