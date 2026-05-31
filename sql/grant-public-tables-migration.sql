-- Supabase 2026-10-30 정책 대응: public 스키마 Data API GRANT 일괄 적용
-- 배경: 2026-05-30부터 신규 프로젝트, 2026-10-30부터 기존 프로젝트도
--       public 스키마 테이블이 PostgREST/supabase-js에 자동 노출되지 않음.
--       명시적 GRANT 없으면 Data API에서 테이블 접근 불가.
--
-- 실행 방식: scripts/run-sql.js 에 추가 후 node scripts/run-sql.js
--            또는 Supabase Dashboard > SQL Editor에서 직접 실행
-- 실행 시점: 2026-10-30 이전 1회. 이후 신규 테이블은 개별 SQL에 GRANT 포함.
-- 안전성: RLS가 이미 활성화되어 있으므로 GRANT는 "접근 시도 허용"만,
--          실제 행 접근은 기존 RLS 정책이 계속 통제.

DO $$
DECLARE
  r RECORD;
  tbl TEXT;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  LOOP
    tbl := quote_ident(r.tablename);

    -- authenticated: 로그인 사용자 — 모든 DML 허용 (RLS가 행 단위 통제)
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', r.tablename);

    -- anon: 비로그인 — SELECT만 허용 (RLS가 실제 노출 여부 통제)
    EXECUTE format('GRANT SELECT ON public.%I TO anon', r.tablename);

    -- service_role: Edge Function / 서버 백엔드 — 전체 권한
    EXECUTE format('GRANT ALL ON public.%I TO service_role', r.tablename);

    RAISE NOTICE 'GRANTED: %', r.tablename;
  END LOOP;
END;
$$;

-- 시퀀스(serial/identity) GRANT — INSERT 시 nextval 권한 필요
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE public.%I TO authenticated', r.sequence_name);
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE public.%I TO anon', r.sequence_name);
    EXECUTE format('GRANT ALL ON SEQUENCE public.%I TO service_role', r.sequence_name);
  END LOOP;
END;
$$;
