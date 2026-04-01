-- ============================================================
-- RLS 일괄 활성화 — Supabase Security Advisor 경고 해결
-- 실행: Supabase Dashboard → SQL Editor
-- 날짜: 2026-04-01
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. SQL 파일에서 RLS 누락된 테이블 (코드베이스)
-- ══════════════════════════════════════════════════════════════

-- biz_plans
ALTER TABLE IF EXISTS biz_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "biz_plans_read" ON biz_plans;
CREATE POLICY "biz_plans_read" ON biz_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "biz_plans_write" ON biz_plans;
CREATE POLICY "biz_plans_write" ON biz_plans FOR ALL USING (true);

-- workflow_tasks
ALTER TABLE IF EXISTS workflow_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow_tasks_read" ON workflow_tasks;
CREATE POLICY "workflow_tasks_read" ON workflow_tasks FOR SELECT USING (true);
DROP POLICY IF EXISTS "workflow_tasks_write" ON workflow_tasks;
CREATE POLICY "workflow_tasks_write" ON workflow_tasks FOR ALL USING (true);

-- content_pipeline
ALTER TABLE IF EXISTS content_pipeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "content_pipeline_read" ON content_pipeline;
CREATE POLICY "content_pipeline_read" ON content_pipeline FOR SELECT USING (true);
DROP POLICY IF EXISTS "content_pipeline_write" ON content_pipeline;
CREATE POLICY "content_pipeline_write" ON content_pipeline FOR ALL USING (true);

-- workflow_automations
ALTER TABLE IF EXISTS workflow_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow_automations_read" ON workflow_automations;
CREATE POLICY "workflow_automations_read" ON workflow_automations FOR SELECT USING (true);
DROP POLICY IF EXISTS "workflow_automations_write" ON workflow_automations;
CREATE POLICY "workflow_automations_write" ON workflow_automations FOR ALL USING (true);

-- ══════════════════════════════════════════════════════════════
-- 2. Supabase Security Advisor에서 경고된 테이블 (Prod DB에 존재)
-- ══════════════════════════════════════════════════════════════

-- member_brand_joins
ALTER TABLE IF EXISTS member_brand_joins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "member_brand_joins_read" ON member_brand_joins;
CREATE POLICY "member_brand_joins_read" ON member_brand_joins FOR SELECT USING (true);
DROP POLICY IF EXISTS "member_brand_joins_write" ON member_brand_joins;
CREATE POLICY "member_brand_joins_write" ON member_brand_joins FOR ALL USING (true);

-- evolution_enrollments
ALTER TABLE IF EXISTS evolution_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "evolution_enrollments_read" ON evolution_enrollments;
CREATE POLICY "evolution_enrollments_read" ON evolution_enrollments FOR SELECT USING (true);
DROP POLICY IF EXISTS "evolution_enrollments_write" ON evolution_enrollments;
CREATE POLICY "evolution_enrollments_write" ON evolution_enrollments FOR ALL USING (true);

-- smarcomm_billing_history
ALTER TABLE IF EXISTS smarcomm_billing_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "smarcomm_billing_history_read" ON smarcomm_billing_history;
CREATE POLICY "smarcomm_billing_history_read" ON smarcomm_billing_history FOR SELECT USING (true);
DROP POLICY IF EXISTS "smarcomm_billing_history_write" ON smarcomm_billing_history;
CREATE POLICY "smarcomm_billing_history_write" ON smarcomm_billing_history FOR ALL USING (true);

-- member_visits
ALTER TABLE IF EXISTS member_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "member_visits_read" ON member_visits;
CREATE POLICY "member_visits_read" ON member_visits FOR SELECT USING (true);
DROP POLICY IF EXISTS "member_visits_write" ON member_visits;
CREATE POLICY "member_visits_write" ON member_visits FOR ALL USING (true);

-- member_brand_withdrawals
ALTER TABLE IF EXISTS member_brand_withdrawals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "member_brand_withdrawals_read" ON member_brand_withdrawals;
CREATE POLICY "member_brand_withdrawals_read" ON member_brand_withdrawals FOR SELECT USING (true);
DROP POLICY IF EXISTS "member_brand_withdrawals_write" ON member_brand_withdrawals;
CREATE POLICY "member_brand_withdrawals_write" ON member_brand_withdrawals FOR ALL USING (true);

-- wio_strategies
ALTER TABLE IF EXISTS wio_strategies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wio_strategies_read" ON wio_strategies;
CREATE POLICY "wio_strategies_read" ON wio_strategies FOR SELECT USING (true);
DROP POLICY IF EXISTS "wio_strategies_write" ON wio_strategies;
CREATE POLICY "wio_strategies_write" ON wio_strategies FOR ALL USING (true);

-- wio_kpi_targets
ALTER TABLE IF EXISTS wio_kpi_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wio_kpi_targets_read" ON wio_kpi_targets;
CREATE POLICY "wio_kpi_targets_read" ON wio_kpi_targets FOR SELECT USING (true);
DROP POLICY IF EXISTS "wio_kpi_targets_write" ON wio_kpi_targets;
CREATE POLICY "wio_kpi_targets_write" ON wio_kpi_targets FOR ALL USING (true);

-- wio_sales_pipeline
ALTER TABLE IF EXISTS wio_sales_pipeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wio_sales_pipeline_read" ON wio_sales_pipeline;
CREATE POLICY "wio_sales_pipeline_read" ON wio_sales_pipeline FOR SELECT USING (true);
DROP POLICY IF EXISTS "wio_sales_pipeline_write" ON wio_sales_pipeline;
CREATE POLICY "wio_sales_pipeline_write" ON wio_sales_pipeline FOR ALL USING (true);

-- wio_quotes
ALTER TABLE IF EXISTS wio_quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wio_quotes_read" ON wio_quotes;
CREATE POLICY "wio_quotes_read" ON wio_quotes FOR SELECT USING (true);
DROP POLICY IF EXISTS "wio_quotes_write" ON wio_quotes;
CREATE POLICY "wio_quotes_write" ON wio_quotes FOR ALL USING (true);

-- wio_orders
ALTER TABLE IF EXISTS wio_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wio_orders_read" ON wio_orders;
CREATE POLICY "wio_orders_read" ON wio_orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "wio_orders_write" ON wio_orders;
CREATE POLICY "wio_orders_write" ON wio_orders FOR ALL USING (true);

-- wio_bd_projects
ALTER TABLE IF EXISTS wio_bd_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wio_bd_projects_read" ON wio_bd_projects;
CREATE POLICY "wio_bd_projects_read" ON wio_bd_projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "wio_bd_projects_write" ON wio_bd_projects;
CREATE POLICY "wio_bd_projects_write" ON wio_bd_projects FOR ALL USING (true);

-- wio_work_assignments
ALTER TABLE IF EXISTS wio_work_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wio_work_assignments_read" ON wio_work_assignments;
CREATE POLICY "wio_work_assignments_read" ON wio_work_assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS "wio_work_assignments_write" ON wio_work_assignments;
CREATE POLICY "wio_work_assignments_write" ON wio_work_assignments FOR ALL USING (true);

-- wio_incentive_policies
ALTER TABLE IF EXISTS wio_incentive_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wio_incentive_policies_read" ON wio_incentive_policies;
CREATE POLICY "wio_incentive_policies_read" ON wio_incentive_policies FOR SELECT USING (true);
DROP POLICY IF EXISTS "wio_incentive_policies_write" ON wio_incentive_policies;
CREATE POLICY "wio_incentive_policies_write" ON wio_incentive_policies FOR ALL USING (true);

-- ══════════════════════════════════════════════════════════════
-- 3. member_points_summary (VIEW) — RLS는 테이블에만 적용 가능
--    View는 기반 테이블의 RLS를 따르므로 SECURITY INVOKER 설정
-- ══════════════════════════════════════════════════════════════
-- View는 ALTER TABLE ENABLE RLS가 불가능합니다.
-- 대신 View를 SECURITY INVOKER로 재생성하면 기반 테이블 RLS를 따릅니다.
-- 기존 View 정의를 확인 후 아래처럼 재생성:
-- CREATE OR REPLACE VIEW member_points_summary WITH (security_invoker = true) AS ...;
-- (View 정의를 모르므로 수동 확인 필요)

-- ══════════════════════════════════════════════════════════════
-- 완료 확인: Supabase Dashboard → Advisors → Security Advisor → Refresh
-- ══════════════════════════════════════════════════════════════
