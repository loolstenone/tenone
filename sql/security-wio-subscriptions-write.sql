-- ═══════════════════════════════════════════════════════════════
-- wio_subscriptions 쓰기 = 직원만 (2026-10-10 적용 — 사용자 승인)
--   기존 subs_own_write: (user_id = auth.uid()) OR auth_is_staff() — 회원이 자기 구독 행을 직접 INSERT/UPDATE 가능
--   → status='active'·plan_key='pro'를 스스로 넣으면 /api/smarcomm/me/plan 등 플랜 판단이 그대로 믿음 (데이터 계약 2 위반)
--   결제 연동 전이라 정상 경로에서 회원이 구독을 쓰는 곳 없음 (현재 3행 모두 마스터 테스트 행)
--   조회 subs_own_read(본인 + 직원)는 유지. 서버(service role)는 RLS 우회
--   롤백: 아래 DROP 후 원래 정책 재생성 — CREATE POLICY subs_own_write ON public.wio_subscriptions FOR ALL USING ((user_id = auth.uid()) OR auth_is_staff());
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS subs_own_write ON public.wio_subscriptions;
DROP POLICY IF EXISTS subs_staff_write ON public.wio_subscriptions;
CREATE POLICY subs_staff_write ON public.wio_subscriptions FOR ALL
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wio_subscriptions TO authenticated;
GRANT ALL ON public.wio_subscriptions TO service_role;
