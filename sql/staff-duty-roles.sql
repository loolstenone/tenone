-- ═══════════════════════════════════════════════════════════════
-- 직무 권한(duty) + 직원 입사·퇴사 상태 (2026-10-10, 적용: Supabase MCP apply_migration)
--   1) 인사·급여·재무·회계 데이터를 "직원이면 전부" → 본인 + 담당 직무로 (개인정보보호법 제29조 접근권한 최소화)
--      member_roles(role=hr|payroll|finance|accounting, context='duty') → JWT 'hr:duty' (sync_roles_to_jwt) → auth_has_duty()
--      super_admin@universe 는 모든 직무를 가진 것으로 본다
--   2) universe·system·duty 권한 부여는 super_admin만 (직원이 자기에게 super_admin을 줄 수 있던 구멍 차단)
--   3) tenone_staff_profiles 입사 상태·동의·퇴사일 (입사 → 온보딩 → 재직 → 퇴사)
--   재실행 가능 (CREATE OR REPLACE · DROP POLICY IF EXISTS · ADD COLUMN IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.auth_is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
    SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::BOOLEAN, false);
$$;

CREATE OR REPLACE FUNCTION public.auth_has_duty(duty text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
    SELECT public.auth_is_super_admin()
        OR COALESCE((auth.jwt() -> 'app_metadata' -> 'roles') ? (duty || ':duty'), false);
$$;

GRANT EXECUTE ON FUNCTION public.auth_is_super_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.auth_has_duty(text) TO authenticated, anon;

-- ── 권한 부여: universe·system·duty 는 super_admin만, brand·module 은 직원 ──
DROP POLICY IF EXISTS member_roles_insert ON public.member_roles;
CREATE POLICY member_roles_insert ON public.member_roles FOR INSERT
    WITH CHECK (auth_is_super_admin() OR (auth_is_staff() AND context IN ('brand', 'module')));
DROP POLICY IF EXISTS member_roles_update ON public.member_roles;
CREATE POLICY member_roles_update ON public.member_roles FOR UPDATE
    USING (auth_is_super_admin() OR (auth_is_staff() AND context IN ('brand', 'module')))
    WITH CHECK (auth_is_super_admin() OR (auth_is_staff() AND context IN ('brand', 'module')));

-- ── 급여 ──
DROP POLICY IF EXISTS payroll_select ON public.payroll;
CREATE POLICY payroll_select ON public.payroll FOR SELECT
    USING (member_id = auth_member_id() OR auth_has_duty('payroll') OR auth_has_duty('accounting'));
DROP POLICY IF EXISTS payroll_write ON public.payroll;
CREATE POLICY payroll_write ON public.payroll FOR ALL
    USING (auth_has_duty('payroll')) WITH CHECK (auth_has_duty('payroll'));

DROP POLICY IF EXISTS incentives_select ON public.incentives;
CREATE POLICY incentives_select ON public.incentives FOR SELECT
    USING (member_id = auth_member_id() OR auth_has_duty('payroll') OR auth_has_duty('accounting'));
DROP POLICY IF EXISTS incentives_insert ON public.incentives;
CREATE POLICY incentives_insert ON public.incentives FOR INSERT WITH CHECK (auth_has_duty('payroll'));
DROP POLICY IF EXISTS incentives_update ON public.incentives;
CREATE POLICY incentives_update ON public.incentives FOR UPDATE USING (auth_has_duty('payroll')) WITH CHECK (auth_has_duty('payroll'));

-- ── 인사: 근태 · 평가 · 직원 정보 · 교육 · 포인트 ──
DROP POLICY IF EXISTS attendance_select ON public.attendance;
CREATE POLICY attendance_select ON public.attendance FOR SELECT
    USING (member_id = auth_member_id() OR auth_has_duty('hr') OR auth_has_duty('payroll'));
DROP POLICY IF EXISTS attendance_upsert ON public.attendance;
CREATE POLICY attendance_upsert ON public.attendance FOR ALL
    USING (member_id = auth_member_id() OR auth_has_duty('hr'))
    WITH CHECK (member_id = auth_member_id() OR auth_has_duty('hr'));

DROP POLICY IF EXISTS gpr_select ON public.gpr_goals;
CREATE POLICY gpr_select ON public.gpr_goals FOR SELECT USING (member_id = auth_member_id() OR auth_has_duty('hr'));
DROP POLICY IF EXISTS gpr_insert ON public.gpr_goals;
CREATE POLICY gpr_insert ON public.gpr_goals FOR INSERT WITH CHECK (member_id = auth_member_id() OR auth_has_duty('hr'));
DROP POLICY IF EXISTS gpr_update ON public.gpr_goals;
CREATE POLICY gpr_update ON public.gpr_goals FOR UPDATE
    USING (member_id = auth_member_id() OR auth_has_duty('hr'))
    WITH CHECK (member_id = auth_member_id() OR auth_has_duty('hr'));

DROP POLICY IF EXISTS tenone_staff_update ON public.tenone_staff_profiles;
CREATE POLICY tenone_staff_update ON public.tenone_staff_profiles FOR UPDATE
    USING (member_id = auth_member_id() OR auth_has_duty('hr'))
    WITH CHECK (member_id = auth_member_id() OR auth_has_duty('hr'));

DROP POLICY IF EXISTS p1_staff_all ON public.staff_education;
DROP POLICY IF EXISTS staff_education_write ON public.staff_education;
DROP POLICY IF EXISTS staff_education_select ON public.staff_education;
CREATE POLICY staff_education_select ON public.staff_education FOR SELECT USING (auth_is_staff());
CREATE POLICY staff_education_write ON public.staff_education FOR ALL USING (auth_has_duty('hr')) WITH CHECK (auth_has_duty('hr'));

DROP POLICY IF EXISTS authenticated_read ON public.point_logs;   -- 로그인한 누구나(브랜드 회원 포함) 전부 읽던 정책
DROP POLICY IF EXISTS points_log_select ON public.point_logs;
CREATE POLICY points_log_select ON public.point_logs FOR SELECT USING (member_id = auth_member_id() OR auth_has_duty('hr'));

-- ── 재무(작성) · 회계(조회) ──
DROP POLICY IF EXISTS expenses_select ON public.expenses;
CREATE POLICY expenses_select ON public.expenses FOR SELECT
    USING (member_id = auth_member_id() OR auth_has_duty('finance') OR auth_has_duty('accounting'));
DROP POLICY IF EXISTS expenses_insert ON public.expenses;
CREATE POLICY expenses_insert ON public.expenses FOR INSERT WITH CHECK (member_id = auth_member_id() OR auth_has_duty('finance'));
DROP POLICY IF EXISTS expenses_update ON public.expenses;
CREATE POLICY expenses_update ON public.expenses FOR UPDATE USING (auth_has_duty('finance')) WITH CHECK (auth_has_duty('finance'));
DROP POLICY IF EXISTS expenses_delete ON public.expenses;
CREATE POLICY expenses_delete ON public.expenses FOR DELETE USING (auth_has_duty('finance'));

DROP POLICY IF EXISTS card_usage_select ON public.card_usage;
CREATE POLICY card_usage_select ON public.card_usage FOR SELECT
    USING (member_id = auth_member_id() OR auth_has_duty('finance') OR auth_has_duty('accounting'));
DROP POLICY IF EXISTS card_usage_insert ON public.card_usage;
CREATE POLICY card_usage_insert ON public.card_usage FOR INSERT WITH CHECK (auth_has_duty('finance'));

DROP POLICY IF EXISTS invoices_select ON public.invoices;
CREATE POLICY invoices_select ON public.invoices FOR SELECT USING (auth_has_duty('finance') OR auth_has_duty('accounting'));
DROP POLICY IF EXISTS invoices_insert ON public.invoices;
CREATE POLICY invoices_insert ON public.invoices FOR INSERT WITH CHECK (auth_has_duty('finance'));
DROP POLICY IF EXISTS invoices_update ON public.invoices;
CREATE POLICY invoices_update ON public.invoices FOR UPDATE USING (auth_has_duty('finance')) WITH CHECK (auth_has_duty('finance'));

DROP POLICY IF EXISTS payments_select ON public.payments;
CREATE POLICY payments_select ON public.payments FOR SELECT USING (auth_has_duty('finance') OR auth_has_duty('accounting'));
DROP POLICY IF EXISTS payments_insert ON public.payments;
CREATE POLICY payments_insert ON public.payments FOR INSERT WITH CHECK (auth_has_duty('finance'));
DROP POLICY IF EXISTS payments_update ON public.payments;
CREATE POLICY payments_update ON public.payments FOR UPDATE USING (auth_has_duty('finance')) WITH CHECK (auth_has_duty('finance'));

DROP POLICY IF EXISTS p1_staff_all ON public.biz_plans;
DROP POLICY IF EXISTS biz_plans_all ON public.biz_plans;
CREATE POLICY biz_plans_all ON public.biz_plans FOR ALL
    USING (auth_has_duty('finance') OR auth_has_duty('accounting')) WITH CHECK (auth_has_duty('finance'));

DROP POLICY IF EXISTS mf_select ON public.monthly_forecasts;
CREATE POLICY mf_select ON public.monthly_forecasts FOR SELECT USING (auth_has_duty('finance') OR auth_has_duty('accounting'));
DROP POLICY IF EXISTS mf_insert ON public.monthly_forecasts;
CREATE POLICY mf_insert ON public.monthly_forecasts FOR INSERT WITH CHECK (auth_has_duty('finance'));
DROP POLICY IF EXISTS mf_update ON public.monthly_forecasts;
CREATE POLICY mf_update ON public.monthly_forecasts FOR UPDATE USING (auth_has_duty('finance')) WITH CHECK (auth_has_duty('finance'));

-- ── 결재 요청: 브랜드 회원(비직원) 조회 차단 ──
DROP POLICY IF EXISTS approval_requests_select ON public.approval_requests;
CREATE POLICY approval_requests_select ON public.approval_requests FOR SELECT USING (is_tenone_staff());

-- ── 직원 입사·퇴사 상태 ──
--   status: invited(초대 메일 발송) → onboarding(첫 로그인, 동의 전) → active(재직) → offboarded(퇴사, 권한 전부 회수)
--   hr_consent: 인사 목적 개인정보 수집·이용 + 보안 서약 {privacy_version, pledge_version, agreed_at}
--   left_at: 퇴사일 — 근로자명부·계약서류는 퇴직 후 3년 보관(근로기준법 제42조) 후 파기
ALTER TABLE public.tenone_staff_profiles
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS preset text,
    ADD COLUMN IF NOT EXISTS hr_consent jsonb,
    ADD COLUMN IF NOT EXISTS onboarding jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS invited_at timestamptz,
    ADD COLUMN IF NOT EXISTS left_at date;
DO $$ BEGIN
    ALTER TABLE public.tenone_staff_profiles ADD CONSTRAINT tenone_staff_status_chk
        CHECK (status IN ('invited', 'onboarding', 'active', 'offboarded'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 본인은 동의·온보딩 체크만 바꾼다 — status·preset·left_at 은 인사만 (트리거로 보호)
CREATE OR REPLACE FUNCTION public.guard_staff_profile_self_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.auth_has_duty('hr') THEN
        IF NEW.status IS DISTINCT FROM OLD.status AND NOT (OLD.status = 'onboarding' AND NEW.status = 'active' AND NEW.hr_consent IS NOT NULL)
           OR NEW.preset IS DISTINCT FROM OLD.preset
           OR NEW.left_at IS DISTINCT FROM OLD.left_at
           OR NEW.employee_id IS DISTINCT FROM OLD.employee_id
           OR NEW.hire_date IS DISTINCT FROM OLD.hire_date
           OR NEW.employment_type IS DISTINCT FROM OLD.employment_type
           OR NEW.position IS DISTINCT FROM OLD.position
           OR NEW.department IS DISTINCT FROM OLD.department THEN
            RAISE EXCEPTION '인사 항목은 인사 담당만 수정할 수 있습니다';
        END IF;
    END IF;
    RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_guard_staff_profile_self_update ON public.tenone_staff_profiles;
CREATE TRIGGER trg_guard_staff_profile_self_update BEFORE UPDATE ON public.tenone_staff_profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_staff_profile_self_update();
