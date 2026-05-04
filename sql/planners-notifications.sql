-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — 알림 인프라
-- 이메일 + Web Push
-- ═══════════════════════════════════════════════════════════════

-- 알림 설정 (myverse_users 확장)
ALTER TABLE myverse_users
  ADD COLUMN IF NOT EXISTS notify_email_briefing BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_push_briefing BOOLEAN DEFAULT false;

-- Web Push 구독 저장 (사용자가 브라우저에서 push 구독 시 저장)
CREATE TABLE IF NOT EXISTS myverse_push_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  endpoint      TEXT NOT NULL,
  p256dh        TEXT NOT NULL,
  auth          TEXT NOT NULL,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  last_used_at  TIMESTAMPTZ,
  UNIQUE(endpoint)
);

CREATE INDEX IF NOT EXISTS idx_myverse_push_member ON myverse_push_subscriptions(member_id);

ALTER TABLE myverse_push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "본인만" ON myverse_push_subscriptions;
CREATE POLICY "본인만" ON myverse_push_subscriptions
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));
