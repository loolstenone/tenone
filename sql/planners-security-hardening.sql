-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — 보안 강화
-- 6개 함수에 search_path 고정 (SQL 인젝션 방어)
-- ═══════════════════════════════════════════════════════════════

-- 1. planners_weekly_summary
ALTER FUNCTION planners_weekly_summary(UUID, INTEGER, INTEGER) SET search_path = public, pg_temp;

-- 2. planners_monthly_summary
ALTER FUNCTION planners_monthly_summary(UUID, INTEGER, INTEGER) SET search_path = public, pg_temp;

-- 3. planners_yearly_summary
ALTER FUNCTION planners_yearly_summary(UUID, INTEGER) SET search_path = public, pg_temp;

-- 4. planners_activate_subscription
ALTER FUNCTION planners_activate_subscription(UUID, INTEGER, TEXT) SET search_path = public, pg_temp;

-- 5. planners_activate_pdf_buyer
ALTER FUNCTION planners_activate_pdf_buyer(UUID) SET search_path = public, pg_temp;

-- 6. planners_expire_subscriptions
ALTER FUNCTION planners_expire_subscriptions() SET search_path = public, pg_temp;

-- 7. _hero_readiness_score (HeRo에서 만든 헬퍼도 함께)
ALTER FUNCTION _hero_readiness_score(TEXT) SET search_path = public, pg_temp;
