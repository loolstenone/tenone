-- ═══════════════════════════════════════════════════════════════
-- UC 조회 정책 (2026-10-10, 적용: Supabase MCP apply_migration)
--   uc_balances·uc_transactions·uc_earn_rules 에 RLS는 켜져 있는데 정책이 0개 → 브라우저 조회가 항상 0건
--   (인트라 UC 잔액·거래 내역·Standard › UC 화면이 실제 잔액 5건·규칙 57개를 0으로 보여주던 문제)
--   조회만 연다: 잔액·거래 = 본인 + 직원, 적립 규칙 = 직원. 쓰기는 계속 서버 API(service role)만 — 원장은 브라우저에서 못 바꾼다
--   재실행 가능
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS uc_balances_select ON public.uc_balances;
CREATE POLICY uc_balances_select ON public.uc_balances FOR SELECT
    USING (member_id = auth_member_id() OR auth_is_staff());

DROP POLICY IF EXISTS uc_transactions_select ON public.uc_transactions;
CREATE POLICY uc_transactions_select ON public.uc_transactions FOR SELECT
    USING (member_id = auth_member_id() OR auth_is_staff());

DROP POLICY IF EXISTS uc_earn_rules_select ON public.uc_earn_rules;
CREATE POLICY uc_earn_rules_select ON public.uc_earn_rules FOR SELECT
    USING (auth_is_staff());

GRANT SELECT ON public.uc_balances, public.uc_transactions, public.uc_earn_rules TO authenticated;
GRANT ALL ON public.uc_balances, public.uc_transactions, public.uc_earn_rules TO service_role;
