-- ============================================================
-- HeRo HIT 검사 데이터 잠금 (콘텐츠 관리 점검 1단계)
-- 적용: 2026-10-05 (MCP apply_migration: security_hit_lockdown)
--
-- 발견 (2026-10-05):
--   hit_a_results_safe·hit_b_results_safe 뷰가 소유자 권한으로 실행 → 비로그인이 REST로 성향 점수(MBTI·DISC) 조회
--   hit_sessions·hit_responses·hit_chat_messages  anon SELECT/INSERT/UPDATE true, authenticated ALL true
--   hit_a/b_results  anon INSERT true, authenticated ALL true (남의 결과 수정·삭제 가능)
--   hit_c~f_results·hit_results  public SELECT/INSERT true
--   hero_profiles  anon SELECT/INSERT true, authenticated ALL true
--   hit_admin_flags  INSERT true, 조회 조건이 members.id = auth.uid() (ID 체계 불일치)
--   ※ member_id는 members.id — 기존 "본인" 정책의 auth.uid() 비교는 항상 거짓
--
-- 원칙: 검사 진행·채점·저장은 서버(app/api/hit/*, 서비스 롤)만.
--       브라우저 직접 접근 = 본인 결과 읽기 + 직원 전체. 비로그인 = 없음.
--       공유 링크 결과 보기는 /api/hit/{a..f}/result/[id] (서버) 경유.
-- ============================================================

-- 1) 뷰를 호출자 권한으로 (원본 테이블 RLS 적용)
ALTER VIEW public.hit_a_results_safe SET (security_invoker = true);
ALTER VIEW public.hit_b_results_safe SET (security_invoker = true);
ALTER VIEW public.member_point_balances SET (security_invoker = true);
REVOKE ALL ON public.hit_a_results_safe, public.hit_b_results_safe, public.member_point_balances FROM anon;

-- 2) 열려 있던 정책 제거
DROP POLICY IF EXISTS hit_sessions_anon_insert ON public.hit_sessions;
DROP POLICY IF EXISTS hit_sessions_anon_select ON public.hit_sessions;
DROP POLICY IF EXISTS hit_sessions_anon_update ON public.hit_sessions;
DROP POLICY IF EXISTS hit_sessions_auth ON public.hit_sessions;

DROP POLICY IF EXISTS hit_responses_anon_insert ON public.hit_responses;
DROP POLICY IF EXISTS hit_responses_anon_select ON public.hit_responses;
DROP POLICY IF EXISTS hit_responses_auth ON public.hit_responses;

DROP POLICY IF EXISTS hit_a_results_anon_insert ON public.hit_a_results;
DROP POLICY IF EXISTS hit_a_results_auth ON public.hit_a_results;
DROP POLICY IF EXISTS hit_a_results_owner_read ON public.hit_a_results;
DROP POLICY IF EXISTS hit_b_results_anon_insert ON public.hit_b_results;
DROP POLICY IF EXISTS hit_b_results_auth ON public.hit_b_results;
DROP POLICY IF EXISTS hit_b_results_owner_read ON public.hit_b_results;
DROP POLICY IF EXISTS hit_c_results_public_insert ON public.hit_c_results;
DROP POLICY IF EXISTS hit_c_results_public_read ON public.hit_c_results;
DROP POLICY IF EXISTS hit_d_results_public_insert ON public.hit_d_results;
DROP POLICY IF EXISTS hit_d_results_public_read ON public.hit_d_results;
DROP POLICY IF EXISTS hit_e_results_public_insert ON public.hit_e_results;
DROP POLICY IF EXISTS hit_e_results_public_read ON public.hit_e_results;
DROP POLICY IF EXISTS hit_f_results_public_read ON public.hit_f_results;
DROP POLICY IF EXISTS hit_f_results_service_insert ON public.hit_f_results;

DROP POLICY IF EXISTS hit_chat_anon_insert ON public.hit_chat_messages;
DROP POLICY IF EXISTS hit_chat_anon_select ON public.hit_chat_messages;
DROP POLICY IF EXISTS hit_chat_auth ON public.hit_chat_messages;

DROP POLICY IF EXISTS auth_insert_hit ON public.hit_results;
DROP POLICY IF EXISTS auth_read_hit ON public.hit_results;
DROP POLICY IF EXISTS hit_insert ON public.hit_results;
DROP POLICY IF EXISTS hit_read ON public.hit_results;

DROP POLICY IF EXISTS hero_profiles_anon_insert ON public.hero_profiles;
DROP POLICY IF EXISTS hero_profiles_anon_select ON public.hero_profiles;
DROP POLICY IF EXISTS hero_profiles_auth ON public.hero_profiles;
DROP POLICY IF EXISTS "본인 삽입" ON public.hero_profiles;
DROP POLICY IF EXISTS "본인 수정" ON public.hero_profiles;
DROP POLICY IF EXISTS "본인 읽기" ON public.hero_profiles;
-- hero_select (본인·직원·HeRo 브랜드 관리자 읽기) 유지

DROP POLICY IF EXISTS admin_only_insert ON public.hit_admin_flags;
DROP POLICY IF EXISTS admin_only_select ON public.hit_admin_flags;
DROP POLICY IF EXISTS admin_only_update ON public.hit_admin_flags;

-- 3) 본인 읽기 + 직원 전체
DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['hit_sessions','hit_a_results','hit_b_results','hit_c_results','hit_d_results',
                             'hit_e_results','hit_f_results','hit_chat_messages','hit_results'] LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_own_read', t);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (member_id = auth_member_id())', t || '_own_read', t);
    END LOOP;
    FOREACH t IN ARRAY ARRAY['hit_sessions','hit_responses','hit_a_results','hit_b_results','hit_c_results','hit_d_results',
                             'hit_e_results','hit_f_results','hit_chat_messages','hit_results','hero_profiles','hit_admin_flags'] LOOP
        EXECUTE format('DROP POLICY IF EXISTS p1_staff_all ON public.%I', t);
        EXECUTE format('CREATE POLICY p1_staff_all ON public.%I FOR ALL TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff())', t);
        EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    END LOOP;
END $$;
