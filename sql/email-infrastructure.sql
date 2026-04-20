-- Phase 1: Email Infrastructure
-- Purpose: 뉴스레터/CRM 발송의 공통 기반 (이벤트 로그, 발송 기록, 구독자 확장)

-- 1. newsletter_subscribers 확장
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bounce_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS complained_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'ko';

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_bounced
  ON newsletter_subscribers(bounced_at) WHERE bounced_at IS NOT NULL;

-- 2. 통합 발송 기록 (뉴스레터·CRM·트랜잭션 공용)
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('newsletter','crm_broadcast','transactional','confirm')),
  source_id TEXT,                         -- issue_id / campaign_id / subscriber_id
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
  person_id UUID,                         -- crm_people (FK 생략, 유연)
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  from_addr TEXT NOT NULL,
  to_addr TEXT NOT NULL,
  reply_to TEXT,
  subject TEXT NOT NULL,
  resend_id TEXT,                         -- Resend 응답 ID
  status TEXT NOT NULL DEFAULT 'queued'   -- queued, sent, delivered, bounced, complained, failed
    CHECK (status IN ('queued','sent','delivered','bounced','complained','failed')),
  error TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_sends_to_addr ON email_sends(to_addr);
CREATE INDEX IF NOT EXISTS idx_email_sends_resend_id ON email_sends(resend_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_kind_created ON email_sends(kind, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_sends_subscriber ON email_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_source ON email_sends(source_id);

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_sends service_role" ON email_sends;
CREATE POLICY "email_sends service_role" ON email_sends FOR ALL USING (true) WITH CHECK (true);

-- 3. 이벤트 로그 (Resend Webhook raw)
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id UUID REFERENCES email_sends(id) ON DELETE CASCADE,
  resend_id TEXT,
  event_type TEXT NOT NULL,   -- email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained, email.delivery_delayed
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_resend_id ON email_events(resend_id);
CREATE INDEX IF NOT EXISTS idx_email_events_send_id ON email_events(send_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type_created ON email_events(event_type, created_at DESC);

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_events service_role" ON email_events;
CREATE POLICY "email_events service_role" ON email_events FOR ALL USING (true) WITH CHECK (true);

-- 4. Intra Staff 조회 권한 (role staff/manager/super_admin)
DROP POLICY IF EXISTS "email_sends staff read" ON email_sends;
CREATE POLICY "email_sends staff read" ON email_sends FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM member_roles mr
    JOIN members m ON m.id = mr.member_id
    WHERE m.auth_id = auth.uid()
      AND mr.is_active = true
      AND mr.role IN ('staff','manager','super_admin')
  )
);

DROP POLICY IF EXISTS "email_events staff read" ON email_events;
CREATE POLICY "email_events staff read" ON email_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM member_roles mr
    JOIN members m ON m.id = mr.member_id
    WHERE m.auth_id = auth.uid()
      AND mr.is_active = true
      AND mr.role IN ('staff','manager','super_admin')
  )
);

-- 5. 발신자 레지스트리
CREATE TABLE IF NOT EXISTS email_senders (
  id TEXT PRIMARY KEY,                    -- 'noreply', 'news', 'hello', 'ceo'
  from_addr TEXT NOT NULL UNIQUE,
  from_name TEXT NOT NULL,
  reply_to TEXT,
  purpose TEXT NOT NULL,                  -- transactional, newsletter, crm, announcement
  brand_id TEXT,                          -- NULL = 공통
  daily_limit INT NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE email_senders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_senders service_role" ON email_senders;
CREATE POLICY "email_senders service_role" ON email_senders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "email_senders staff read" ON email_senders;
CREATE POLICY "email_senders staff read" ON email_senders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM member_roles mr
    JOIN members m ON m.id = mr.member_id
    WHERE m.auth_id = auth.uid()
      AND mr.is_active = true
      AND mr.role IN ('staff','manager','super_admin')
  )
);

-- 6. 발신자 시드
INSERT INTO email_senders(id, from_addr, from_name, reply_to, purpose, daily_limit, notes) VALUES
  ('noreply', 'noreply@tenone.biz', 'Ten:One Universe', 'lools@tenone.biz', 'transactional', 2000, '가입·구독 인증 등 트랜잭션'),
  ('news',    'news@tenone.biz',    'Ten:One Universe', 'lools@tenone.biz', 'newsletter',    5000, '정기 뉴스레터'),
  ('hello',   'hello@tenone.biz',   'Ten:One Universe', 'lools@tenone.biz', 'crm',           1000, 'CRM 마케팅 브로드캐스트'),
  ('ceo',     'ceo@tenone.biz',     'Ten:One Universe', 'lools@tenone.biz', 'announcement',   500, '중요 공지·초대')
ON CONFLICT (id) DO NOTHING;
