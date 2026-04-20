-- Phase 5: CRM Broadcast Campaigns

CREATE TABLE IF NOT EXISTS crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purpose TEXT,                   -- 'sales', 'invite', 'announcement', 'general'

  segment_id UUID REFERENCES crm_segments(id) ON DELETE SET NULL,
  person_ids UUID[],              -- 개별 선택 발송 (segment와 별개)

  sender_id TEXT NOT NULL DEFAULT 'hello' REFERENCES email_senders(id),
  subject TEXT NOT NULL,
  preheader TEXT,
  body_html TEXT,
  body_text TEXT,
  button_label TEXT,
  button_url TEXT,
  brand_name TEXT,
  brand_color TEXT DEFAULT '#171717',

  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','scheduled','sending','sent','failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INT DEFAULT 0,

  brand_id TEXT DEFAULT 'tenone',
  tenant_id TEXT DEFAULT 'tenone',
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_campaigns_status ON crm_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_scheduled ON crm_campaigns(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_created ON crm_campaigns(created_at DESC);

ALTER TABLE crm_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_campaigns service_role" ON crm_campaigns;
CREATE POLICY "crm_campaigns service_role" ON crm_campaigns FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "crm_campaigns staff" ON crm_campaigns;
CREATE POLICY "crm_campaigns staff" ON crm_campaigns FOR ALL USING (
  EXISTS (
    SELECT 1 FROM member_roles mr
    JOIN members m ON m.id = mr.member_id
    WHERE m.auth_id = auth.uid()
      AND mr.is_active = true
      AND mr.role IN ('staff','manager','super_admin')
  )
);
