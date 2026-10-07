-- pg_cron 깨진 작업 해제 — 세션 161, 2026-10-07
-- 근거 (net._http_response 실측):
--   daily-briefing-1001          : https://tenone.biz/api/agent/briefing 호출 → 401 (명령문 안 평문 키가 현재 키와 불일치)
--                                  같은 엔드포인트를 Vercel cron /api/cron/daily-vrief가 같은 시각(01:01 UTC)에 호출 = 중복
--   mindle-metrics-compute-hourly: functions/v1/mindle-metrics-compute → 404 (함수 미배포). 매시간 실패
-- 재도입 시: 키를 명령문에 넣지 말고 Vault(vault.decrypted_secrets)에서 읽는다
-- 적용: 2026-10-07 MCP execute_sql (cron.job 잔여 4개 확인, 평문 키 포함 명령 0)

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname IN ('daily-briefing-1001', 'mindle-metrics-compute-hourly');
