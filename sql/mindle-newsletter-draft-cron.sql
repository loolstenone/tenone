-- mindle-newsletter-draft-cron.sql
-- pg_cron 등록 — Mindle 주간 뉴스레터 초안 자동 생성 (메인 1 + 페르소나 4)
--
-- Phase 1-E + Phase 2-C 통합 cron 등록
--
-- 스케줄 (KST 기준, UTC -9):
--   메인 호:     UTC 월 00:00 = KST 월 09:00 — target_tags=['mindle']
--   founder:     UTC 화 00:00 = KST 화 09:00 — target_tags=['mindle','persona:founder']
--   planner:     UTC 수 00:00 = KST 수 09:00 — target_tags=['mindle','persona:planner']
--   reporter:    UTC 목 00:00 = KST 목 09:00 — target_tags=['mindle','persona:reporter']
--   marketer:    UTC 금 00:00 = KST 금 09:00 — target_tags=['mindle','persona:marketer']
--
-- Edge Function: mindle-newsletter-draft (?persona=KEY 분기 지원)
--
-- 의존성:
--   - pg_cron / pg_net extension 활성화 (이미 활성화됨 — trend-crawl-hourly 등이 사용 중)
--   - vault.decrypted_secrets에 'service_role_key' 등록 (기존 mindle-metrics-compute-hourly와 동일 패턴)
--   - mindle_personas 시드 4종 등록 (founder/planner/reporter/marketer)
--
-- 정직성: 자동 생성 결과는 status='draft' — 운영자가 /intra/ums/newsletter/issues 에서 검수 후 발송
--
-- 적용 방법 (둘 중 하나):
--   (1) scripts/run-sql.js queries 배열에 본 파일 내용 추가 후 실행
--   (2) Supabase Dashboard > SQL Editor에서 직접 실행

-- 1. 기존 동일 이름 cron 모두 제거 (재등록 안전)
SELECT cron.unschedule(jobname)
FROM cron.job
WHERE jobname IN (
    'mindle-newsletter-draft-weekly',
    'mindle-newsletter-draft-founder',
    'mindle-newsletter-draft-planner',
    'mindle-newsletter-draft-reporter',
    'mindle-newsletter-draft-marketer'
);

-- 2. 메인 호 등록 — KST 월 09:00
SELECT cron.schedule(
    'mindle-newsletter-draft-weekly',
    '0 0 * * 1',
    $$
    SELECT net.http_post(
        url := 'https://ziotlxkdctlhiwkgmmsh.supabase.co/functions/v1/mindle-newsletter-draft',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- 3. 페르소나 호 4건 등록 — KST 화·수·목·금 09:00
SELECT cron.schedule(
    'mindle-newsletter-draft-founder',
    '0 0 * * 2',
    $$
    SELECT net.http_post(
        url := 'https://ziotlxkdctlhiwkgmmsh.supabase.co/functions/v1/mindle-newsletter-draft?persona=founder',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);

SELECT cron.schedule(
    'mindle-newsletter-draft-planner',
    '0 0 * * 3',
    $$
    SELECT net.http_post(
        url := 'https://ziotlxkdctlhiwkgmmsh.supabase.co/functions/v1/mindle-newsletter-draft?persona=planner',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);

SELECT cron.schedule(
    'mindle-newsletter-draft-reporter',
    '0 0 * * 4',
    $$
    SELECT net.http_post(
        url := 'https://ziotlxkdctlhiwkgmmsh.supabase.co/functions/v1/mindle-newsletter-draft?persona=reporter',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);

SELECT cron.schedule(
    'mindle-newsletter-draft-marketer',
    '0 0 * * 5',
    $$
    SELECT net.http_post(
        url := 'https://ziotlxkdctlhiwkgmmsh.supabase.co/functions/v1/mindle-newsletter-draft?persona=marketer',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- 4. 검증 — 등록 확인
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname LIKE 'mindle-newsletter-draft%'
ORDER BY jobname;
