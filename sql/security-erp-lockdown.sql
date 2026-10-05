-- ============================================================
-- ERP·프로젝트 테이블 접근 정리 (인트라 5단계 — 실데이터 운영 전 필수)
-- 적용: 2026-10-05 (MCP apply_migration: security_erp_lockdown) — 롤백 트랜잭션으로 anon·회원·직원 검증 완료
--
-- 발견 (2026-10-05):
--   projects          projects_read (roles=public, USING true) → 비로그인 포함 누구나 매출·이익 조회
--   jobs·project_members authenticated_read (USING true) → 모든 회원이 전체 조회
--                     jobs는 INSERT/UPDATE 정책이 없어 직원도 Job 생성 불가
--   partners          partners_select (public, true) → 협력사 연락처 공개
--   wio_opportunities wio_opportunities_api_write (anon, ALL) → 비로그인이 수주 파이프라인 읽기·쓰기·삭제
--                     (수집 API는 service_role 사용 → 이 정책 불필요)
-- 원칙: 직원 = 전체(auth_is_staff), 회원 = 본인이 속한 프로젝트만, 비로그인 = 없음
-- ============================================================

-- projects
DROP POLICY IF EXISTS projects_read ON public.projects;
DROP POLICY IF EXISTS authenticated_read ON public.projects;
DROP POLICY IF EXISTS projects_member_read ON public.projects;
CREATE POLICY projects_member_read ON public.projects FOR SELECT TO authenticated
    USING (id IN (SELECT project_id FROM public.project_members WHERE member_id = auth_member_id()));

-- jobs
DROP POLICY IF EXISTS authenticated_read ON public.jobs;
DROP POLICY IF EXISTS p1_staff_all ON public.jobs;
DROP POLICY IF EXISTS jobs_member_read ON public.jobs;
CREATE POLICY p1_staff_all ON public.jobs FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());
CREATE POLICY jobs_member_read ON public.jobs FOR SELECT TO authenticated
    USING (project_id IN (SELECT project_id FROM public.project_members WHERE member_id = auth_member_id()));

-- project_members (pm_select = 본인 행 또는 직원 — 유지)
DROP POLICY IF EXISTS authenticated_read ON public.project_members;
DROP POLICY IF EXISTS p1_staff_all ON public.project_members;
CREATE POLICY p1_staff_all ON public.project_members FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- partners (partners_write = 직원 ALL — 유지)
DROP POLICY IF EXISTS partners_select ON public.partners;

-- wio_opportunities (wio_opportunities_tenant 유지 + 직원 전체)
DROP POLICY IF EXISTS wio_opportunities_api_write ON public.wio_opportunities;
DROP POLICY IF EXISTS p1_staff_all ON public.wio_opportunities;
CREATE POLICY p1_staff_all ON public.wio_opportunities FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- 비로그인 권한 회수 — ERP·프로젝트 테이블은 공개 읽기 대상이 아니다
REVOKE ALL ON public.projects, public.jobs, public.project_members, public.partners,
    public.wio_opportunities, public.wio_timesheets,
    public.invoices, public.payments, public.revenue, public.monthly_forecasts,
    public.gpr_goals, public.attendance, public.incentives,
    public.expenses, public.card_usage, public.approvals
FROM anon;
