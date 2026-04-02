-- ============================================================
-- DB 전수 검토 리포트 조치 (2026-04-03)
-- 출처: TenOne_DB_Review_20260403.md
-- ============================================================

-- ── #1: RLS 미적용 9개 테이블 활성화 ──
ALTER TABLE wio_incentive_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_recognitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_production_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_equipment ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 인증 사용자만 접근
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'wio_incentive_records', 'wio_recognitions', 'wio_suppliers',
    'wio_purchase_orders', 'wio_inventory', 'wio_inventory_movements',
    'wio_production_plans', 'wio_quality_inspections', 'wio_equipment'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (auth.uid() IS NOT NULL)',
        t || '_auth_all', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ── #3: SECURITY DEFINER 뷰 → INVOKER ──
-- member_points_summary 뷰를 SECURITY INVOKER로 재생성
-- 먼저 현재 뷰 정의를 가져와야 하는데, 안전하게 DROP + CREATE
DROP VIEW IF EXISTS member_points_summary;
CREATE VIEW member_points_summary WITH (security_invoker = true) AS
SELECT
  member_id,
  SUM(CASE WHEN points > 0 THEN points ELSE 0 END) AS total_earned,
  SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) AS total_spent,
  SUM(points) AS balance,
  COUNT(*) AS transaction_count
FROM point_logs
GROUP BY member_id;

-- ── #4: Function search_path 수정 (10개) ──
ALTER FUNCTION increment_post_view SET search_path = public;
ALTER FUNCTION sync_comment_count SET search_path = public;
ALTER FUNCTION sync_like_count SET search_path = public;
ALTER FUNCTION sync_bookmark_count SET search_path = public;
ALTER FUNCTION ensure_wio_membership SET search_path = public;
ALTER FUNCTION sync_roles_to_legacy SET search_path = public;
ALTER FUNCTION sync_roles_to_jwt SET search_path = public;
ALTER FUNCTION auth_member_id SET search_path = public;
ALTER FUNCTION auth_is_staff SET search_path = public;
ALTER FUNCTION auth_has_brand SET search_path = public;

-- ── #5: Duplicate Index 삭제 (3건) ──
DROP INDEX IF EXISTS idx_agent_messages_co;
DROP INDEX IF EXISTS idx_library_source;
-- wio_members 중복: 이름이 잘렸으므로 정확한 이름 확인 후 삭제 필요
-- DROP INDEX IF EXISTS wio_members_te...; -- 수동 확인 필요

-- ── #6: th_* 테이블 삭제 (D-060 이행) ──
DROP TABLE IF EXISTS th_insights;
DROP TABLE IF EXISTS th_opportunities;
