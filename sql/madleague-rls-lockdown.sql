-- MADLeague RLS 잠금 — mad_members · mad_applications — 운영 적용 2026-10-06 (migration madleague_rls_lockdown, 롤백 시뮬레이션·anon REST 401 검증)
-- 문제 1: mad_members_read_public (public, portfolio_public=true) → anon이 행 전체(email·phone 포함) 조회 가능
-- 문제 2: mad_apps_insert (public, WITH CHECK true) → anon 직접 INSERT = 캡차·로그인 우회
-- 문제 3: mad_members_update_own → 본인 행의 role·status·email·user_id까지 수정 가능 (role='staff' 사칭)
-- 문제 4: anon에게 두 테이블 INSERT·UPDATE·DELETE GRANT
--
-- 쓰기 경로: /api/madleague/apply · approve · reject · member/link · admin/* (service_role)
-- 공개 포트폴리오: /api/madleague/portfolio/[memberId] (service_role + 컬럼 화이트리스트 + portfolio_public=true)
-- 본인 지원서 조회 정책은 member_id 컬럼 추가와 함께 별도 마이그레이션(madleague-apply-member-link)

-- ── mad_applications ──
DROP POLICY IF EXISTS mad_apps_insert ON public.mad_applications;

DROP POLICY IF EXISTS mad_apps_staff_all ON public.mad_applications;
CREATE POLICY mad_apps_staff_all ON public.mad_applications
    FOR ALL TO authenticated
    USING (public.auth_is_staff())
    WITH CHECK (public.auth_is_staff());

REVOKE ALL ON public.mad_applications FROM anon;
REVOKE INSERT, DELETE ON public.mad_applications FROM authenticated;
GRANT SELECT, UPDATE ON public.mad_applications TO authenticated;
GRANT ALL ON public.mad_applications TO service_role;

-- ── mad_members ──
DROP POLICY IF EXISTS mad_members_read_public ON public.mad_members;

REVOKE ALL ON public.mad_members FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.mad_members FROM authenticated;
GRANT SELECT ON public.mad_members TO authenticated;
-- 본인 수정 가능 컬럼만 (member/profile API와 동일). role·status·email·user_id·club_id 등은 service_role만
GRANT UPDATE (bio, skill_tags, portfolio_public, avatar_url, phone, major, year_in_school, university, updated_at)
    ON public.mad_members TO authenticated;
GRANT ALL ON public.mad_members TO service_role;
