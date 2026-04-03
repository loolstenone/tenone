-- ============================================================
-- RLS 정책 교체 — HR/Finance/wio_members/sso_tokens
-- 실행일: 2026-04-03
-- ============================================================

-- ① HR 테이블 — staff only
DROP POLICY IF EXISTS "hr_payroll_all" ON hr_payroll;
CREATE POLICY "hr_payroll_staff_only" ON hr_payroll FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

DROP POLICY IF EXISTS "hr_attendance_all" ON hr_attendance;
CREATE POLICY "hr_attendance_staff_only" ON hr_attendance FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

DROP POLICY IF EXISTS "hr_evaluations_all" ON hr_evaluations;
CREATE POLICY "hr_evaluations_staff_only" ON hr_evaluations FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

DROP POLICY IF EXISTS "hr_feedback_all" ON hr_feedback;
CREATE POLICY "hr_feedback_staff_only" ON hr_feedback FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

-- ② Finance 테이블 — staff only
DROP POLICY IF EXISTS "fin_assets_all" ON fin_assets;
CREATE POLICY "fin_assets_staff_only" ON fin_assets FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

DROP POLICY IF EXISTS "fin_budgets_all" ON fin_budgets;
CREATE POLICY "fin_budgets_staff_only" ON fin_budgets FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

DROP POLICY IF EXISTS "fin_contracts_all" ON fin_contracts;
CREATE POLICY "fin_contracts_staff_only" ON fin_contracts FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

DROP POLICY IF EXISTS "fin_invoices_all" ON fin_invoices;
CREATE POLICY "fin_invoices_staff_only" ON fin_invoices FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

DROP POLICY IF EXISTS "fin_journals_all" ON fin_journals;
CREATE POLICY "fin_journals_staff_only" ON fin_journals FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

-- ③ wio_members — SELECT open (tenant 내), INSERT/UPDATE/DELETE auth 기반
DROP POLICY IF EXISTS "members_open_read" ON wio_members;
DROP POLICY IF EXISTS "members_open_insert" ON wio_members;
DROP POLICY IF EXISTS "members_open_update" ON wio_members;

CREATE POLICY "wio_members_select" ON wio_members FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()
    )
    OR is_tenone_staff()
  );
CREATE POLICY "wio_members_insert" ON wio_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "wio_members_update" ON wio_members FOR UPDATE
  USING (user_id = auth.uid() OR is_tenone_staff())
  WITH CHECK (user_id = auth.uid() OR is_tenone_staff());
CREATE POLICY "wio_members_delete" ON wio_members FOR DELETE
  USING (is_tenone_staff());

-- ④ sso_tokens — staff only
CREATE POLICY "sso_tokens_staff_only" ON sso_tokens FOR ALL
  USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());
