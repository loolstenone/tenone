-- ============================================================================
-- 보안 긴급 조치 1단계 — 내부 전용 테이블 직원 전용화 (2026-10-05, MCP apply_migration)
--
-- 문제: "service role full access" 류 정책이 roles=public + USING(true)로 만들어져
--       anon(공개 키)·모든 로그인 회원에게 읽기·수정·삭제를 허용. anon에 DML GRANT까지 있어
--       듣봇 대화(deutbot_logs)·발송 메일(email_sends)·CRM·Brand Gravity 고객 데이터가 공개 상태였음.
-- 원칙: service_role은 RLS를 우회하므로 "service role용" 정책은 필요 없다. 내부 테이블은 직원만.
--
-- A. 내부 전용 → 열린 정책 제거 + 직원 전용 정책 + anon 권한 회수
-- B. 공개 읽기·직원 쓰기 (참조 데이터·공지) → 열린 쓰기 정책 제거 + 직원 쓰기
-- 전역: TRUNCATE는 RLS를 무시하므로 anon·authenticated에서 회수
-- 재실행 안전 (DROP IF EXISTS / 동적 정책 탐지)
-- ============================================================================

DO $$
DECLARE
    a_tables text[];
    b_tables text[] := ARRAY['jakka_notices','hit_hero_types','hit_report_modules'];
    t text;
    p record;
BEGIN
    SELECT array_agg(tablename) INTO a_tables FROM pg_tables
    WHERE schemaname = 'public' AND (
        tablename LIKE 'bg\_%' OR tablename LIKE 'crm\_%' OR tablename LIKE 'mkt\_%'
        OR tablename LIKE 'email\_%' OR tablename LIKE 'comm\_%'
        OR tablename = ANY (ARRAY[
            'deutbot_logs','agent_messages','agent_profiles','gmail_oauth_tokens',
            'content_pipeline','content_drafts','crawler_status',
            'workflow_automations','workflow_tasks',
            'smarcomm_ai_flag_sources','smarcomm_brand_facts','smarcomm_broadcasts',
            'smarcomm_creatives','smarcomm_hallucinations',
            'member_invites','badak_verify_codes','biz_plans','project_bids','project_vendors',
            'staff_education','library_items','library_bookmarks','bums_member_access'
        ])
    );

    -- A + B 공통: 누구에게나 열린 정책 제거 (anon/authenticated/public 대상)
    FOREACH t IN ARRAY a_tables || b_tables LOOP
        FOR p IN
            SELECT policyname, cmd, qual, with_check FROM pg_policies
            WHERE schemaname = 'public' AND tablename = t
              AND (roles && ARRAY['public','anon','authenticated']::name[])
              AND (
                  qual IN ('true', '(auth.uid() IS NOT NULL)')
                  OR with_check IN ('true', '(auth.uid() IS NOT NULL)')
                  OR (cmd = 'INSERT' AND with_check IS NULL)
              )
        LOOP
            -- B 테이블은 공개 읽기(SELECT) 정책은 유지
            IF t = ANY (b_tables) AND p.cmd = 'SELECT' THEN CONTINUE; END IF;
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
        END LOOP;

        EXECUTE format('DROP POLICY IF EXISTS p1_staff_all ON public.%I', t);
        EXECUTE format(
            'CREATE POLICY p1_staff_all ON public.%I FOR ALL TO authenticated USING (public.auth_is_staff()) WITH CHECK (public.auth_is_staff())', t);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;

    -- A: anon 권한 전부 회수
    FOREACH t IN ARRAY a_tables LOOP
        EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    END LOOP;

    -- B: anon은 읽기만
    FOREACH t IN ARRAY b_tables LOOP
        EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.%I FROM anon', t);
    END LOOP;
END $$;

-- B: 로그인 회원도 참조 데이터 읽기 유지 (기존 ALL 정책이 읽기를 겸하던 테이블)
DROP POLICY IF EXISTS p1_auth_read ON public.hit_hero_types;
CREATE POLICY p1_auth_read ON public.hit_hero_types FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS p1_auth_read ON public.hit_report_modules;
CREATE POLICY p1_auth_read ON public.hit_report_modules FOR SELECT TO authenticated USING (true);

-- 전역: TRUNCATE는 RLS 미적용 → 클라이언트 역할에서 회수
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
