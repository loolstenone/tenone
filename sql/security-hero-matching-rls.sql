-- security-hero-matching-rls.sql
-- 적용: 2026-10-08 (세션 165) — MCP apply_migration `security_hero_matching_rls`
--
-- 문제 (점검 축3 H-1): hero_matches_auth_read · hero_companies_auth_read = roles public + USING(true)
--   → 비로그인도 매칭 상태·AI 리포트·수수료·피드백 열람. anon SELECT GRANT 존재.
-- 함께 수정 (축1 C-1 패턴): hero_company_members_self_read가 member_id = auth.uid() 비교
--   (member_id는 members.id — auth uid와 다른 값) + 같은 테이블 자기 참조 → 브라우저 조회가 비거나 오류.
-- 수정:
--   hero_matches          — 인재 본인(profile_member_id) · 직원 읽기. 기업 측은 /api/hero/matching/inbox(서버)만
--   hero_companies        — 그 기업의 active 담당자 · 직원 읽기 (/hero/company 화면이 담당 기업 정보 embed)
--   hero_company_members  — 본인 행 · 직원 읽기 (hero_current_member_id() = members.id)
--   anon 권한 전부 REVOKE. 쓰기는 기존대로 서버 API(service_role)
-- 코드 대조: 브라우저 읽기 = 인트라 hero 화면 4개(직원) + /hero/company(담당자 본인). 나머지는 API(service_role)
-- API 2개(matching/inbox · journey/status)는 requireMember + assertSelf 추가 (코드)
-- 롤백: CREATE POLICY hero_matches_auth_read ON hero_matches FOR SELECT USING (true);
--       CREATE POLICY hero_companies_auth_read ON hero_companies FOR SELECT USING (true);
--       CREATE POLICY hero_company_members_self_read ON hero_company_members FOR SELECT TO authenticated
--         USING (member_id = auth.uid() OR company_id IN (SELECT company_id FROM hero_company_members WHERE member_id = auth.uid() AND status = 'active'));
--       GRANT SELECT ON hero_matches, hero_companies TO anon;  (+ 새 정책 3개 DROP)

BEGIN;

DROP POLICY IF EXISTS hero_matches_auth_read ON public.hero_matches;
CREATE POLICY hero_matches_self_staff_read ON public.hero_matches
  FOR SELECT TO authenticated
  USING (profile_member_id = public.hero_current_member_id() OR public.auth_is_staff());

DROP POLICY IF EXISTS hero_company_members_self_read ON public.hero_company_members;
CREATE POLICY hero_company_members_self_staff_read ON public.hero_company_members
  FOR SELECT TO authenticated
  USING (member_id = public.hero_current_member_id() OR public.auth_is_staff());

DROP POLICY IF EXISTS hero_companies_auth_read ON public.hero_companies;
CREATE POLICY hero_companies_member_staff_read ON public.hero_companies
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR id IN (SELECT hcm.company_id FROM public.hero_company_members hcm
              WHERE hcm.member_id = public.hero_current_member_id() AND hcm.status = 'active')
  );

REVOKE ALL ON public.hero_matches, public.hero_companies, public.hero_company_members FROM anon;

COMMIT;
