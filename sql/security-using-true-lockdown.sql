-- security-using-true-lockdown.sql
-- 적용: 2026-10-08 (세션 165) — MCP apply_migration `security_using_true_lockdown`
--
-- 문제 (점검 축3 H-3): USING(true) 읽기·쓰기 정책으로 방문 IP·수집 데이터·탈퇴 사유·주문·대화 스레드가 anon에 열림.
--   collected_data는 anon UPDATE까지 허용(37,7xx행, Mindle 파이프라인 오염 가능).
-- 수정 원칙: 본인(members.auth_id = auth.uid() — JWT member_id는 직원 계정에만 있어 쓰지 않음) · 직원(auth_is_staff()) · service_role(RLS 우회)만. anon 테이블 권한 전부 REVOKE.
-- 코드 대조 (2026-10-08):
--   collected_data          — 쓰기: API·Edge Function(service_role) / 읽기: 인트라·/mindle/admin(직원)
--   member_brand_withdrawals — 인트라 개인정보 화면(직원)만
--   newsletter_subscribers   — API(service_role)·인트라(직원). /api/newsletter/unsubscribe는 admin 클라이언트로 수정
--   wio_orders               — WIO 앱(테넌트 회원) → 같은 테넌트 회원 + 직원
--   member_visits · chat_threads · evolution_enrollments — 앱 코드 사용 없음
-- 제외: wio_tenants(public read) — WIO 테넌트 자가 가입 항목과 함께 별도 처리 (로그인·초대 코드 조회가 의존)
-- 롤백: 하단 주석의 원래 정책 재생성 + GRANT

BEGIN;

-- 1) collected_data — 직원 읽기만, 쓰기는 service_role
DROP POLICY IF EXISTS anon_read   ON public.collected_data;
DROP POLICY IF EXISTS anon_update ON public.collected_data;
DROP POLICY IF EXISTS auth_read   ON public.collected_data;
CREATE POLICY collected_data_staff_read ON public.collected_data
  FOR SELECT TO authenticated USING (public.auth_is_staff());

-- 2) member_visits — 본인·직원 읽기, 쓰기는 service_role
DROP POLICY IF EXISTS member_visits_read  ON public.member_visits;
DROP POLICY IF EXISTS member_visits_write ON public.member_visits;
CREATE POLICY member_visits_self_staff_read ON public.member_visits
  FOR SELECT TO authenticated USING (member_id IN (SELECT m.id FROM public.members m WHERE m.auth_id = auth.uid()) OR public.auth_is_staff());

-- 3) member_brand_withdrawals — 본인·직원 읽기, 쓰기는 service_role (탈퇴 처리 API)
DROP POLICY IF EXISTS member_brand_withdrawals_read  ON public.member_brand_withdrawals;
DROP POLICY IF EXISTS member_brand_withdrawals_write ON public.member_brand_withdrawals;
CREATE POLICY member_brand_withdrawals_self_staff_read ON public.member_brand_withdrawals
  FOR SELECT TO authenticated USING (member_id IN (SELECT m.id FROM public.members m WHERE m.auth_id = auth.uid()) OR public.auth_is_staff());

-- 4) chat_threads — 직원 전용
DROP POLICY IF EXISTS chat_threads_agent_read   ON public.chat_threads;
DROP POLICY IF EXISTS chat_threads_anon_update  ON public.chat_threads;
DROP POLICY IF EXISTS chat_threads_authenticated ON public.chat_threads;
CREATE POLICY chat_threads_staff_all ON public.chat_threads
  FOR ALL TO authenticated USING (public.auth_is_staff()) WITH CHECK (public.auth_is_staff());

-- 5) wio_orders — 같은 테넌트 회원 + 직원
DROP POLICY IF EXISTS wio_orders_read  ON public.wio_orders;
DROP POLICY IF EXISTS wio_orders_write ON public.wio_orders;
CREATE POLICY wio_orders_tenant_all ON public.wio_orders
  FOR ALL TO authenticated
  USING (tenant_id IN (SELECT public.auth_wio_tenant_ids()) OR public.auth_is_staff())
  WITH CHECK (tenant_id IN (SELECT public.auth_wio_tenant_ids()) OR public.auth_is_staff());

-- 6) evolution_enrollments — 본인 읽기 · 직원 전체 (수강 등록·점수·수료증은 운영자가)
DROP POLICY IF EXISTS evolution_enrollments_read  ON public.evolution_enrollments;
DROP POLICY IF EXISTS evolution_enrollments_write ON public.evolution_enrollments;
CREATE POLICY evolution_enrollments_self_read ON public.evolution_enrollments
  FOR SELECT TO authenticated USING (member_id IN (SELECT m.id FROM public.members m WHERE m.auth_id = auth.uid()));
CREATE POLICY evolution_enrollments_staff_all ON public.evolution_enrollments
  FOR ALL TO authenticated USING (public.auth_is_staff()) WITH CHECK (public.auth_is_staff());

-- 7) newsletter_subscribers — 로그인 누구나 읽기 → 직원만
DROP POLICY IF EXISTS newsletter_read_auth ON public.newsletter_subscribers;
CREATE POLICY newsletter_subscribers_staff_read ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.auth_is_staff());

-- anon 권한 회수 (부록 D: anon은 공개 읽기만 — 이 7개는 공개 데이터 아님)
REVOKE ALL ON public.collected_data, public.member_visits, public.member_brand_withdrawals,
              public.chat_threads, public.wio_orders, public.evolution_enrollments,
              public.newsletter_subscribers FROM anon;

COMMIT;

-- ── 롤백 (원래 정책) ──
-- CREATE POLICY anon_read ON collected_data FOR SELECT TO anon USING (true);
-- CREATE POLICY anon_update ON collected_data FOR UPDATE TO anon USING (tenant_id='tenone') WITH CHECK (tenant_id='tenone');
-- CREATE POLICY auth_read ON collected_data FOR SELECT TO authenticated USING (true);
-- CREATE POLICY member_visits_read ON member_visits FOR SELECT USING (true);
-- CREATE POLICY member_visits_write ON member_visits FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY member_brand_withdrawals_read ON member_brand_withdrawals FOR SELECT USING (true);
-- CREATE POLICY member_brand_withdrawals_write ON member_brand_withdrawals FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY chat_threads_agent_read ON chat_threads FOR SELECT TO anon USING (true);
-- CREATE POLICY chat_threads_anon_update ON chat_threads FOR UPDATE TO anon USING (thread_type='channel') WITH CHECK (thread_type='channel');
-- CREATE POLICY chat_threads_authenticated ON chat_threads FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
-- CREATE POLICY wio_orders_read ON wio_orders FOR SELECT USING (true);
-- CREATE POLICY wio_orders_write ON wio_orders FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY evolution_enrollments_read ON evolution_enrollments FOR SELECT USING (true);
-- CREATE POLICY evolution_enrollments_write ON evolution_enrollments FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY newsletter_read_auth ON newsletter_subscribers FOR SELECT TO authenticated USING (true);
-- GRANT SELECT, INSERT, UPDATE, DELETE ON (위 7개) TO anon;  -- 원래 anon 전체 DML GRANT
-- (새 정책 DROP: collected_data_staff_read, member_visits_self_staff_read, member_brand_withdrawals_self_staff_read,
--   chat_threads_staff_all, wio_orders_tenant_all, evolution_enrollments_self_read, evolution_enrollments_staff_all,
--   newsletter_subscribers_staff_read)
