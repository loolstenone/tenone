-- ============================================================
-- RLS 정책 교체 — 민감 테이블 (Always True → 인증/role 기반)
-- 실행일: 2026-04-03 세션 10
-- 대상: members, guests, subscriptions, revenue,
--       agent_messages, agent_profiles, chat_threads,
--       chat_messages, member_brand_joins
-- ============================================================

-- ① 헬퍼 함수 (SECURITY DEFINER — RLS 우회해서 staff 여부 판별)
CREATE OR REPLACE FUNCTION is_tenone_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
      AND account_type = 'staff'
      AND tenant_id = 'tenone'
  );
$$;

-- ② members
DROP POLICY IF EXISTS "Allow all reads" ON members;
DROP POLICY IF EXISTS "authenticated_read" ON members;
DROP POLICY IF EXISTS "Allow all updates" ON members;
DROP POLICY IF EXISTS "Users can insert own data" ON members;
DROP POLICY IF EXISTS "Allow all inserts" ON members;

CREATE POLICY "members_select" ON members FOR SELECT
  USING (auth_id = auth.uid() OR is_tenone_staff());
CREATE POLICY "members_insert" ON members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "members_update" ON members FOR UPDATE
  USING (auth_id = auth.uid() OR is_tenone_staff())
  WITH CHECK (auth_id = auth.uid() OR is_tenone_staff());
CREATE POLICY "members_delete" ON members FOR DELETE
  USING (is_tenone_staff());

-- ③ guests (PII — staff only)
DROP POLICY IF EXISTS "guests_all" ON guests;
CREATE POLICY "guests_staff_only" ON guests FOR ALL
  USING (is_tenone_staff())
  WITH CHECK (is_tenone_staff());

-- ④ subscriptions
DROP POLICY IF EXISTS "subscriptions_all" ON subscriptions;
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
      OR is_tenone_staff()
    )
  );
CREATE POLICY "subscriptions_write" ON subscriptions FOR ALL
  USING (is_tenone_staff())
  WITH CHECK (is_tenone_staff());

-- ⑤ revenue (재무 — staff only)
DROP POLICY IF EXISTS "revenue_all" ON revenue;
CREATE POLICY "revenue_staff_only" ON revenue FOR ALL
  USING (is_tenone_staff())
  WITH CHECK (is_tenone_staff());

-- ⑥ agent_messages
DROP POLICY IF EXISTS "agent_messages_read" ON agent_messages;
DROP POLICY IF EXISTS "agent_messages_write" ON agent_messages;
CREATE POLICY "agent_messages_authenticated" ON agent_messages FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ⑦ agent_profiles
DROP POLICY IF EXISTS "agent_profiles_read" ON agent_profiles;
DROP POLICY IF EXISTS "agent_profiles_write" ON agent_profiles;
CREATE POLICY "agent_profiles_select" ON agent_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "agent_profiles_write" ON agent_profiles FOR ALL
  USING (is_tenone_staff())
  WITH CHECK (is_tenone_staff());

-- ⑧ chat_threads / chat_messages (인증된 사용자만)
DROP POLICY IF EXISTS "auth_all_threads" ON chat_threads;
CREATE POLICY "chat_threads_authenticated" ON chat_threads FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_all_messages" ON chat_messages;
CREATE POLICY "chat_messages_authenticated" ON chat_messages FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ⑨ member_brand_joins
DROP POLICY IF EXISTS "member_brand_joins_read" ON member_brand_joins;
DROP POLICY IF EXISTS "member_brand_joins_write" ON member_brand_joins;
CREATE POLICY "member_brand_joins_select" ON member_brand_joins FOR SELECT
  USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
    OR is_tenone_staff()
  );
CREATE POLICY "member_brand_joins_write" ON member_brand_joins FOR ALL
  USING (is_tenone_staff())
  WITH CHECK (is_tenone_staff());
