-- hero_talent_applications 읽기 정책 교정 — 2026-10-08 적용 (MCP apply_migration: security_hero_talent_applications_rls)
-- 감사 docs/audit/2026-10/axis-1-data-contract.md C-1:
--   기존 hero_talent_app_owner_read = (member_id = auth.uid()) OR (member_id IS NULL), roles=public
--   ① member_id는 members.id인데 auth.uid()와 비교(키 혼용 — 본인도 못 읽음)
--   ② 비회원 신청(member_id NULL)의 이름·이메일·전화가 anon에게 공개
-- 쓰기는 /api/hero/talent-agent/apply (service_role)만. 인트라 화면은 직원 세션으로 읽고 수정한다.
-- 재실행 가능.

DROP POLICY IF EXISTS hero_talent_app_owner_read ON public.hero_talent_applications;

CREATE POLICY hero_talent_app_owner_read ON public.hero_talent_applications
  FOR SELECT TO authenticated
  USING (member_id = public.auth_member_id() OR public.auth_is_staff());

DROP POLICY IF EXISTS hero_talent_app_staff_update ON public.hero_talent_applications;
CREATE POLICY hero_talent_app_staff_update ON public.hero_talent_applications
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff()) WITH CHECK (public.auth_is_staff());

REVOKE ALL ON public.hero_talent_applications FROM anon;
GRANT SELECT, UPDATE ON public.hero_talent_applications TO authenticated;
GRANT ALL ON public.hero_talent_applications TO service_role;
