-- SmarComm — Web Push 구독 테이블
-- VAPID 기반 브라우저 푸시 알림

CREATE TABLE IF NOT EXISTS smarcomm_push_subscriptions (
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

CREATE INDEX IF NOT EXISTS idx_smarcomm_push_member ON smarcomm_push_subscriptions(member_id);

ALTER TABLE smarcomm_push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "본인만" ON smarcomm_push_subscriptions;
CREATE POLICY "본인만" ON smarcomm_push_subscriptions FOR ALL
  USING      (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
  WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
