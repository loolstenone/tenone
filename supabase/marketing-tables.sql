-- =============================================
-- Marketing Module DB Schema
-- Ten:One™ Universe 마케팅 모듈
-- 2026-03-26
-- =============================================

-- 1. 캠페인
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'Brand',       -- Brand, Product, Event, Content, Partnership
  status       TEXT NOT NULL DEFAULT 'Draft',        -- Draft, Active, Paused, Completed
  brand_id     TEXT,
  description  TEXT,
  budget       NUMERIC DEFAULT 0,
  spent        NUMERIC DEFAULT 0,
  kpi          TEXT,
  assignee     TEXT,
  start_date   DATE,
  end_date     DATE,
  channels     TEXT[],
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 리드
CREATE TABLE IF NOT EXISTS marketing_leads (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name         TEXT NOT NULL,
  company      TEXT,
  email        TEXT,
  phone        TEXT,
  stage        TEXT NOT NULL DEFAULT 'New',           -- New, Contacted, Qualified, Proposal, Negotiation, Won, Lost
  source       TEXT DEFAULT 'Direct',                 -- Website, Referral, Event, SNS, Badak, MADLeague, Direct
  value        NUMERIC DEFAULT 0,
  assignee     TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 콘텐츠 포스트
CREATE TABLE IF NOT EXISTS marketing_content (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'Article',      -- Article, Newsletter, SNS, Video, Shorts
  status        TEXT NOT NULL DEFAULT 'Draft',         -- Draft, Scheduled, Published, Archived
  channel       TEXT,
  brand_id      TEXT,
  assignee      TEXT,
  publish_date  DATE,
  engagement    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 딜 (영업기회)
CREATE TABLE IF NOT EXISTS marketing_deals (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  lead_id      TEXT REFERENCES marketing_leads(id),
  title        TEXT NOT NULL,
  value        NUMERIC DEFAULT 0,
  stage        TEXT NOT NULL DEFAULT 'Discovery',     -- Discovery, Proposal, Negotiation, Closed Won, Closed Lost
  assignee     TEXT,
  close_date   DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_deals ENABLE ROW LEVEL SECURITY;

-- Read policies (authenticated users)
CREATE POLICY "auth read campaigns" ON marketing_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read leads" ON marketing_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read content" ON marketing_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read deals" ON marketing_deals FOR SELECT TO authenticated USING (true);

-- Write policies (authenticated users)
CREATE POLICY "auth write campaigns" ON marketing_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write leads" ON marketing_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write content" ON marketing_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write deals" ON marketing_deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mk_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_mk_leads_stage ON marketing_leads(stage);
CREATE INDEX IF NOT EXISTS idx_mk_content_status ON marketing_content(status);
CREATE INDEX IF NOT EXISTS idx_mk_deals_stage ON marketing_deals(stage);
