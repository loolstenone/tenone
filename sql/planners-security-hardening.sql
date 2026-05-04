-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — 보안 강화
-- 6개 함수에 search_path 고정 (SQL 인젝션 방어)
-- ═══════════════════════════════════════════════════════════════

-- 1. myverse_weekly_summary
ALTER FUNCTION myverse_weekly_summary(UUID, INTEGER, INTEGER) SET search_path = public, pg_temp;

-- 2. myverse_monthly_summary
ALTER FUNCTION myverse_monthly_summary(UUID, INTEGER, INTEGER) SET search_path = public, pg_temp;

-- 3. myverse_yearly_summary
ALTER FUNCTION myverse_yearly_summary(UUID, INTEGER) SET search_path = public, pg_temp;

-- 4. myverse_activate_subscription
ALTER FUNCTION myverse_activate_subscription(UUID, INTEGER, TEXT) SET search_path = public, pg_temp;

-- 5. myverse_activate_pdf_buyer
ALTER FUNCTION myverse_activate_pdf_buyer(UUID) SET search_path = public, pg_temp;

-- 6. myverse_expire_subscriptions
ALTER FUNCTION myverse_expire_subscriptions() SET search_path = public, pg_temp;

-- 7. _hero_readiness_score (HeRo에서 만든 헬퍼도 함께)
ALTER FUNCTION _hero_readiness_score(TEXT) SET search_path = public, pg_temp;
