-- Edge Function 호출 인증 — 세션 161, 2026-10-07 (사용자 승인: "Vault 비밀 생성 진행해")
-- 배경: 배포된 Edge Function 대부분이 verify_jwt=false + 본문 인증 없음 → 누구나 URL 호출로 Claude API 크레딧 소모·agent_messages 오염 가능
-- 방식: 공유 비밀 1개를 Vault에 DB 안에서 생성(사람·코드 어디에도 평문 없음)
--   - Edge Function : 요청 헤더 x-edge-secret ↔ public.edge_function_secret() (service_role 전용) 비교 — supabase/functions/_shared/edge-auth.ts
--   - pg_cron       : 명령에서 vault.decrypted_secrets를 직접 읽어 헤더로 전송
--   - Vercel 서버   : lib/edge-functions.ts edgeAuthHeaders() 가 같은 DB 함수로 읽어 전송
-- 적용: 2026-10-07 MCP apply_migration `edge_function_auth` (비밀 64자 · anon/authenticated 실행 불가 · pg_cron 3개 헤더 확인)

-- 1) 비밀 생성 (이미 있으면 유지)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'edge_function_secret') THEN
    PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'edge_function_secret', 'Edge Function 호출 인증 (x-edge-secret)');
  END IF;
END $$;

-- 2) 서버(service_role)만 읽는 함수
CREATE OR REPLACE FUNCTION public.edge_function_secret()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_function_secret' LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.edge_function_secret() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.edge_function_secret() TO service_role;

-- 3) pg_cron 작업이 비밀 헤더를 보내도록 (Edge Function 가드 배포 전에 먼저 적용 — 옛 함수는 헤더를 무시)
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('trend-crawl-hourly',    '0 * * * *',  'trend-crawl'),
    ('trend-to-draft-hourly', '30 * * * *', 'trend-to-draft'),
    ('daily-vrief-morning',   '1 1 * * *',  'daily-vrief')
  ) AS t(jobname, sched, fn) LOOP
    PERFORM cron.schedule(r.jobname, r.sched, format($cmd$
  SELECT net.http_post(
    url := 'https://ziotlxkdctlhiwkgmmsh.supabase.co/functions/v1/%s',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-edge-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_function_secret')
    ),
    body := '{}'::jsonb
  )
  $cmd$, r.fn));
  END LOOP;
END $$;
