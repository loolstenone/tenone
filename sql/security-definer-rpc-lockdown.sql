-- SECURITY DEFINER RPC 노출 정리 1차 — 세션 161, 2026-10-07
-- 배경: anon이 실행 가능한 DEFINER 함수 51개 중 RLS 보조(7)·트리거(24)를 뺀 20개 점검
--   - DEFINER = RLS 우회. anon 키는 브라우저에 공개되어 있으므로 누구나 /rest/v1/rpc/{fn} 직접 호출 가능
-- 적용: 1)~3) 2026-10-07 MCP apply_migration `security_definer_rpc_lockdown` (롤백 시뮬레이션 + 운영 anon REST 401 확인) / 4) 미적용 — 배포 후

-- 1) 서버(service_role)에서만 쓰거나 호출처가 없는 함수 → anon·authenticated 실행 회수
--    set_brand_role               : 누구나 임의 회원의 members.brand_roles·brand_access 변조 가능 (호출처 없음)
--    link_hit_session_to_member   : 남의 진단 세션을 임의 회원에 연결 (호출처 없음)
--    (get_email_by_handle은 4) — handle-login API 배포 후)
--    hero_journey_stage·hero_streak·hero_active_company_ids·hero_match_candidates_for_jh : 회원 활동·매칭 데이터 (서버 API 또는 호출처 없음)
--    badak_*_count·badak_increment_group_members·increment_post_view : 카운터 조작 (서버 API만 호출)
DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.set_brand_role(uuid,text,text)',
    'public.link_hit_session_to_member(uuid,uuid)',
    'public.hero_journey_stage(uuid)',
    'public.hero_streak(uuid)',
    'public.hero_active_company_ids(uuid)',
    'public.hero_match_candidates_for_jh(uuid)',
    'public.badak_increment_need_count(uuid)',
    'public.badak_increment_need_count(uuid,text)',
    'public.badak_decrement_need_count(uuid)',
    'public.badak_decrement_need_count(uuid,text)',
    'public.badak_increment_group_members(uuid)',
    'public.increment_post_view(uuid)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;

-- 2) hero_match_candidates_for_tih: 인트라 매칭 화면(직원 브라우저)에서 호출 → 직원만 결과 반환
--    (이전: anon 포함 누구나 전체 구직자 진단 결과·매칭 점수 조회 가능)
DO $$
DECLARE d text; d2 text;
BEGIN
  d := pg_get_functiondef('public.hero_match_candidates_for_tih(uuid)'::regprocedure);
  IF position('auth_is_staff()' in d) = 0 THEN
    d2 := replace(d, E'BEGIN\n    SELECT t.derived_industry', E'BEGIN\n    IF NOT public.auth_is_staff() THEN RETURN; END IF;\n    SELECT t.derived_industry');
    IF d2 = d THEN RAISE EXCEPTION 'hero_match_candidates_for_tih: 보호 줄 삽입 위치를 찾지 못함'; END IF;
    EXECUTE d2;
  END IF;
END $$;
ALTER FUNCTION public.hero_match_candidates_for_tih(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.hero_match_candidates_for_tih(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hero_match_candidates_for_tih(uuid) TO authenticated, service_role;

-- 3) ensure_wio_membership: 브라우저에서 본인 user_id로 호출 → 본인(또는 직원)만
--    (이전: anon 포함 누구나 임의 user_id를 임의 tenant에 멤버로 추가)
DO $$
DECLARE d text; d2 text;
BEGIN
  d := pg_get_functiondef('public.ensure_wio_membership(uuid,uuid,text)'::regprocedure);
  IF position('auth.uid()' in d) = 0 THEN
    d2 := replace(d, E'BEGIN\n  -- 이미 존재하면 그냥 반환', E'BEGIN\n  IF p_user_id IS DISTINCT FROM auth.uid() AND NOT public.auth_is_staff() THEN\n    RAISE EXCEPTION ''forbidden'' USING ERRCODE = ''42501'';\n  END IF;\n  -- 이미 존재하면 그냥 반환');
    IF d2 = d THEN RAISE EXCEPTION 'ensure_wio_membership: 보호 줄 삽입 위치를 찾지 못함'; END IF;
    EXECUTE d2;
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.ensure_wio_membership(uuid,uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_wio_membership(uuid,uuid,text) TO authenticated, service_role;

-- 유지 (의도된 공개): get_public_profile(공개 프로필) · mad_increment_article_views·jakka_increment_product_view(조회수)
--   · ums_*_is_public · RLS 보조 7종(auth_is_staff 등) · 트리거 함수 24종(RPC로 호출 불가)

-- 4) [배포 후] get_email_by_handle: 핸들 → 이메일 = 회원 이메일 수집 경로
--    handle-login API가 admin 클라이언트로 바뀐 코드가 배포된 뒤에 실행 (먼저 실행하면 배포 전 핸들 로그인 실패)
-- REVOKE EXECUTE ON FUNCTION public.get_email_by_handle(text) FROM PUBLIC, anon, authenticated;
-- GRANT EXECUTE ON FUNCTION public.get_email_by_handle(text) TO service_role;
