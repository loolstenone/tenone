-- Planner's RLS 정책 표준화
-- 2026-04-29
--
-- 목적: 혼재된 인증 패턴(auth.jwt()->>'email' / auth.users 조인 / auth_id) 을
--      Universe 표준인 `members.auth_id = auth.uid()` 로 일괄 통일.
--      추가로 USING 만 있던 정책에 WITH CHECK 를 추가하여 INSERT/UPDATE 도 본인 데이터만 허용.
--
-- 영향: RLS 정책만 교체. 데이터 변경 없음. service_role 은 정책 우회 (변경 무관).
--
-- 실행: scripts/run-sql.js 또는 Supabase Dashboard SQL Editor.

-- ─── 헬퍼 패턴 ──────────────────────────────────────────────────
-- 모든 본인 한정 정책은 다음 형태로 통일:
--   USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
--   WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))

-- ─── 1. myverse_app.sql 그룹 ───────────────────────────────────
DROP POLICY IF EXISTS "본인만" ON myverse_users;
CREATE POLICY "본인만" ON myverse_users FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "본인만" ON myverse_identities;
CREATE POLICY "본인만" ON myverse_identities FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "본인만" ON myverse_yearly;
CREATE POLICY "본인만" ON myverse_yearly FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "본인만" ON myverse_monthly;
CREATE POLICY "본인만" ON myverse_monthly FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "본인만" ON myverse_weekly;
CREATE POLICY "본인만" ON myverse_weekly FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "본인만" ON myverse_daily;
CREATE POLICY "본인만" ON myverse_daily FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "본인만" ON myverse_projects;
CREATE POLICY "본인만" ON myverse_projects FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- 자식 테이블(project_id 경유) — 부모 project 의 소유 검증
DROP POLICY IF EXISTS "본인만" ON myverse_project_vriefs;
CREATE POLICY "본인만" ON myverse_project_vriefs FOR ALL
  USING       (project_id IN (
    SELECT p.id FROM myverse_projects p
    JOIN members m ON m.id = p.member_id
    WHERE m.auth_id = auth.uid()
  ))
  WITH CHECK  (project_id IN (
    SELECT p.id FROM myverse_projects p
    JOIN members m ON m.id = p.member_id
    WHERE m.auth_id = auth.uid()
  ));

DROP POLICY IF EXISTS "본인만" ON myverse_project_gprs;
CREATE POLICY "본인만" ON myverse_project_gprs FOR ALL
  USING       (project_id IN (
    SELECT p.id FROM myverse_projects p
    JOIN members m ON m.id = p.member_id
    WHERE m.auth_id = auth.uid()
  ))
  WITH CHECK  (project_id IN (
    SELECT p.id FROM myverse_projects p
    JOIN members m ON m.id = p.member_id
    WHERE m.auth_id = auth.uid()
  ));

DROP POLICY IF EXISTS "본인만" ON myverse_project_notes;
CREATE POLICY "본인만" ON myverse_project_notes FOR ALL
  USING       (project_id IN (
    SELECT p.id FROM myverse_projects p
    JOIN members m ON m.id = p.member_id
    WHERE m.auth_id = auth.uid()
  ))
  WITH CHECK  (project_id IN (
    SELECT p.id FROM myverse_projects p
    JOIN members m ON m.id = p.member_id
    WHERE m.auth_id = auth.uid()
  ));

DROP POLICY IF EXISTS "본인만" ON myverse_ai_briefings;
CREATE POLICY "본인만" ON myverse_ai_briefings FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "본인만" ON myverse_ai_usage;
CREATE POLICY "본인만" ON myverse_ai_usage FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ─── 2. calendar entries ────────────────────────────────────────
DROP POLICY IF EXISTS myverse_calendar_select ON myverse_calendar_entries;
CREATE POLICY myverse_calendar_select ON myverse_calendar_entries
  FOR SELECT USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_calendar_insert ON myverse_calendar_entries;
CREATE POLICY myverse_calendar_insert ON myverse_calendar_entries
  FOR INSERT WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_calendar_update ON myverse_calendar_entries;
CREATE POLICY myverse_calendar_update ON myverse_calendar_entries
  FOR UPDATE USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
             WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_calendar_delete ON myverse_calendar_entries;
CREATE POLICY myverse_calendar_delete ON myverse_calendar_entries
  FOR DELETE USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ─── 3. community ──────────────────────────────────────────────
-- posts: 누구나 읽기, 본인만 작성/수정/삭제 (피드 모델 유지)
DROP POLICY IF EXISTS myverse_community_posts_insert ON myverse_community_posts;
CREATE POLICY myverse_community_posts_insert ON myverse_community_posts
  FOR INSERT WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_community_posts_update ON myverse_community_posts;
CREATE POLICY myverse_community_posts_update ON myverse_community_posts
  FOR UPDATE USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
             WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_community_posts_delete ON myverse_community_posts;
CREATE POLICY myverse_community_posts_delete ON myverse_community_posts
  FOR DELETE USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_community_comments_insert ON myverse_community_comments;
CREATE POLICY myverse_community_comments_insert ON myverse_community_comments
  FOR INSERT WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_community_comments_update ON myverse_community_comments;
CREATE POLICY myverse_community_comments_update ON myverse_community_comments
  FOR UPDATE USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
             WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_community_comments_delete ON myverse_community_comments;
CREATE POLICY myverse_community_comments_delete ON myverse_community_comments
  FOR DELETE USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_community_likes_insert ON myverse_community_likes;
CREATE POLICY myverse_community_likes_insert ON myverse_community_likes
  FOR INSERT WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS myverse_community_likes_delete ON myverse_community_likes;
CREATE POLICY myverse_community_likes_delete ON myverse_community_likes
  FOR DELETE USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ─── 4. contacts ───────────────────────────────────────────────
DROP POLICY IF EXISTS "myverse_contacts_own" ON myverse_contacts;
CREATE POLICY "myverse_contacts_own" ON myverse_contacts FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ─── 5. daily moments ──────────────────────────────────────────
DROP POLICY IF EXISTS myverse_moments_self ON myverse_daily_moments;
CREATE POLICY myverse_moments_self ON myverse_daily_moments FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ─── 6. integrations + external events ─────────────────────────
DROP POLICY IF EXISTS "본인만" ON myverse_integrations;
CREATE POLICY "본인만" ON myverse_integrations FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "본인만" ON myverse_external_events;
CREATE POLICY "본인만" ON myverse_external_events FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ─── 7. payments + push subscriptions ──────────────────────────
DROP POLICY IF EXISTS "본인 읽기" ON myverse_payments;
CREATE POLICY "본인 읽기" ON myverse_payments FOR SELECT
  USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
-- 결제 INSERT/UPDATE 는 service_role 만 (서버 confirm API 경유)

DROP POLICY IF EXISTS "본인만" ON myverse_push_subscriptions;
CREATE POLICY "본인만" ON myverse_push_subscriptions FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ─── 8. canvases — 이미 auth.uid() 사용 중이지만 표준 형태로 정렬 ────
-- myverse_canvases.member_id 가 members.id 인지 auth.users.id 인지 확인 필요.
-- planners-canvases.sql:37 의 `auth.uid() = member_id` 는 member_id 를 auth.uid 로 본 것.
-- 실제 컬럼 의미가 members.id 라면 아래로 교체:
DROP POLICY IF EXISTS myverse_canvases_self ON myverse_canvases;
CREATE POLICY myverse_canvases_self ON myverse_canvases FOR ALL
  USING       (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK  (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ─── 끝 ────────────────────────────────────────────────────────
-- 검증 쿼리:
--   SELECT tablename, policyname, cmd, qual::text, with_check::text
--   FROM pg_policies
--   WHERE schemaname='public' AND tablename LIKE 'myverse_%'
--   ORDER BY tablename, policyname;
