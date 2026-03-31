-- 마케팅 모듈 확장: 13개 모듈 DB 테이블

-- 1. 인플루언서 (Influencer)
CREATE TABLE IF NOT EXISTS mkt_influencers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  name            text NOT NULL,
  platform        text NOT NULL DEFAULT 'Instagram',   -- Instagram | YouTube | TikTok | Blog | Twitter
  tier            text NOT NULL DEFAULT 'Micro',       -- Mega | Macro | Mid | Micro | Nano
  status          text NOT NULL DEFAULT 'Prospect',    -- Prospect | Contacted | Active | Completed | Declined
  handle          text,
  followers       int DEFAULT 0,
  engagement_rate numeric(5,2) DEFAULT 0,
  fee             bigint DEFAULT 0,
  currency        text DEFAULT 'KRW',
  category        text,                                -- 뷰티 | 패션 | 테크 | 라이프스타일 등
  notes           text,
  campaign_id     uuid,                                -- 연결된 캠페인 (선택)
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_influencers_brand ON mkt_influencers(brand_id);
CREATE INDEX IF NOT EXISTS idx_mkt_influencers_status ON mkt_influencers(status);

-- 2. 소셜 계정 (Social)
CREATE TABLE IF NOT EXISTS mkt_social_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  platform        text NOT NULL,                       -- Instagram | YouTube | TikTok | Twitter | LinkedIn | Blog
  handle          text NOT NULL,
  display_name    text,
  followers       int DEFAULT 0,
  status          text NOT NULL DEFAULT 'Active',      -- Active | Paused | Archived
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_social_brand ON mkt_social_accounts(brand_id);

-- 3. 소셜 콘텐츠 캘린더 (Social Content)
CREATE TABLE IF NOT EXISTS mkt_social_content (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  account_id      uuid REFERENCES mkt_social_accounts(id) ON DELETE SET NULL,
  title           text NOT NULL,
  content         text,
  type            text NOT NULL DEFAULT 'Post',        -- Post | Story | Reel | Short | Thread
  status          text NOT NULL DEFAULT 'Idea',        -- Idea | Draft | Scheduled | Published | Archived
  scheduled_at    timestamptz,
  published_at    timestamptz,
  engagement      int DEFAULT 0,
  reach           int DEFAULT 0,
  assignee        text,
  tags            text[] DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_social_content_brand ON mkt_social_content(brand_id);
CREATE INDEX IF NOT EXISTS idx_mkt_social_content_status ON mkt_social_content(status);

-- 4. 크리에이티브 에셋 (Creative)
CREATE TABLE IF NOT EXISTS mkt_creatives (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  title           text NOT NULL,
  type            text NOT NULL DEFAULT 'Image',       -- Image | Video | Copy | Banner | Template
  status          text NOT NULL DEFAULT 'Draft',       -- Draft | Review | Approved | Live | Archived
  format          text,                                -- 1080x1080 | 1920x1080 | A4 등
  file_url        text,
  thumbnail_url   text,
  campaign_id     uuid,
  variants        int DEFAULT 1,
  assignee        text,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_creatives_brand ON mkt_creatives(brand_id);
CREATE INDEX IF NOT EXISTS idx_mkt_creatives_status ON mkt_creatives(status);

-- 5. 자동화 여정 (Automation / Journey)
CREATE TABLE IF NOT EXISTS mkt_journeys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  name            text NOT NULL,
  status          text NOT NULL DEFAULT 'Draft',       -- Draft | Active | Paused | Completed
  trigger_type    text NOT NULL DEFAULT 'Event',       -- Event | Schedule | Manual | Condition
  trigger_config  jsonb DEFAULT '{}',
  steps           jsonb DEFAULT '[]',                  -- 여정 스텝 배열
  total_entered   int DEFAULT 0,
  total_converted int DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_journeys_brand ON mkt_journeys(brand_id);
CREATE INDEX IF NOT EXISTS idx_mkt_journeys_status ON mkt_journeys(status);

-- 6. A/B 테스트 실험 (A/B Test)
CREATE TABLE IF NOT EXISTS mkt_experiments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  name            text NOT NULL,
  status          text NOT NULL DEFAULT 'Draft',       -- Draft | Running | Paused | Completed
  type            text NOT NULL DEFAULT 'Landing',     -- Landing | Email | Ad | CTA | Pricing
  hypothesis      text,
  start_date      date,
  end_date        date,
  sample_size     int DEFAULT 0,
  confidence      numeric(5,2) DEFAULT 0,
  variants        jsonb DEFAULT '[]',                  -- [{name, description, traffic_pct, conversions, visitors}]
  winner          text,                                -- 승리 variant 이름
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_experiments_brand ON mkt_experiments(brand_id);
CREATE INDEX IF NOT EXISTS idx_mkt_experiments_status ON mkt_experiments(status);

-- 7. 대행사 (Ops - Agencies)
CREATE TABLE IF NOT EXISTS mkt_agencies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  name            text NOT NULL,
  type            text NOT NULL DEFAULT 'Creative',    -- Creative | Media | PR | Digital | Integrated
  status          text NOT NULL DEFAULT 'Active',      -- Active | Inactive | Prospect
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  contract_start  date,
  contract_end    date,
  monthly_fee     bigint DEFAULT 0,
  currency        text DEFAULT 'KRW',
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_agencies_brand ON mkt_agencies(brand_id);

-- 8. 정산 (Ops - Settlements)
CREATE TABLE IF NOT EXISTS mkt_settlements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  agency_id       uuid REFERENCES mkt_agencies(id) ON DELETE SET NULL,
  title           text NOT NULL,
  category        text NOT NULL DEFAULT 'Media',       -- Media | Production | Fee | Etc
  amount          bigint NOT NULL DEFAULT 0,
  currency        text DEFAULT 'KRW',
  status          text NOT NULL DEFAULT 'Pending',     -- Pending | Invoiced | Paid | Disputed
  invoice_date    date,
  due_date        date,
  paid_date       date,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_settlements_brand ON mkt_settlements(brand_id);
CREATE INDEX IF NOT EXISTS idx_mkt_settlements_status ON mkt_settlements(status);

-- 9. 미디어 플랜 (Media)
CREATE TABLE IF NOT EXISTS mkt_media_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  name            text NOT NULL,
  channel         text NOT NULL,                       -- Paid | Owned | Earned
  platform        text,                                -- Google | Meta | Naver | YouTube 등
  status          text NOT NULL DEFAULT 'Planning',    -- Planning | Active | Completed | Cancelled
  budget          bigint DEFAULT 0,
  spent           bigint DEFAULT 0,
  impressions     bigint DEFAULT 0,
  clicks          bigint DEFAULT 0,
  conversions     int DEFAULT 0,
  start_date      date,
  end_date        date,
  campaign_id     uuid,
  currency        text DEFAULT 'KRW',
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_media_brand ON mkt_media_plans(brand_id);
CREATE INDEX IF NOT EXISTS idx_mkt_media_status ON mkt_media_plans(status);

-- 10. 전략 (Strategy)
CREATE TABLE IF NOT EXISTS mkt_strategies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  name            text NOT NULL,
  period          text,                                -- 2026 Q1 등
  status          text NOT NULL DEFAULT 'Draft',       -- Draft | Active | Review | Archived
  objectives      jsonb DEFAULT '[]',                  -- [{objective, kpi, target, current}]
  target_audience jsonb DEFAULT '[]',                  -- [{segment, size, description}]
  budget_split    jsonb DEFAULT '{}',                  -- {paid: 40, owned: 30, earned: 30}
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_strategies_brand ON mkt_strategies(brand_id);

-- 11. 퍼포먼스 (Performance - 채널별 KPI 스냅샷)
CREATE TABLE IF NOT EXISTS mkt_performance (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  channel         text NOT NULL,                       -- Google Ads | Meta | Naver | YouTube 등
  period          text NOT NULL,                       -- 2026-03 | 2026-W13 등
  impressions     bigint DEFAULT 0,
  clicks          bigint DEFAULT 0,
  conversions     int DEFAULT 0,
  spend           bigint DEFAULT 0,
  revenue         bigint DEFAULT 0,
  cpc             numeric(10,2) DEFAULT 0,
  ctr             numeric(5,2) DEFAULT 0,
  cvr             numeric(5,2) DEFAULT 0,
  roas            numeric(10,2) DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(brand_id, channel, period)
);

CREATE INDEX IF NOT EXISTS idx_mkt_performance_brand ON mkt_performance(brand_id);

-- 12. MMM (Marketing Mix Modeling)
CREATE TABLE IF NOT EXISTS mkt_mmm_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  model_name      text NOT NULL,
  run_date        date NOT NULL DEFAULT CURRENT_DATE,
  status          text NOT NULL DEFAULT 'Completed',   -- Running | Completed | Failed
  channels        jsonb DEFAULT '[]',                  -- [{channel, budget, contribution_pct, roi, saturation}]
  total_budget    bigint DEFAULT 0,
  optimized_budget jsonb DEFAULT '{}',                 -- 최적 배분 결과
  notes           text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_mmm_brand ON mkt_mmm_results(brand_id);

-- 13. 어트리뷰션 (Attribution)
CREATE TABLE IF NOT EXISTS mkt_attribution (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  model           text NOT NULL DEFAULT 'Last Click',  -- Last Click | First Click | Linear | Time Decay | Position Based | Data Driven
  period          text NOT NULL,
  channels        jsonb DEFAULT '[]',                  -- [{channel, conversions, value, share_pct}]
  total_conversions int DEFAULT 0,
  total_value     bigint DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(brand_id, model, period)
);

CREATE INDEX IF NOT EXISTS idx_mkt_attribution_brand ON mkt_attribution(brand_id);

-- 14. 센티먼트 (Sentiment)
CREATE TABLE IF NOT EXISTS mkt_sentiment (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  source          text NOT NULL,                       -- Twitter | Instagram | Blog | News | Review
  keyword         text NOT NULL,
  period          text NOT NULL,                       -- 2026-03-30 등
  positive        int DEFAULT 0,
  neutral         int DEFAULT 0,
  negative        int DEFAULT 0,
  score           numeric(5,2) DEFAULT 0,              -- -1.00 ~ 1.00
  volume          int DEFAULT 0,
  alerts          jsonb DEFAULT '[]',                  -- [{type, message, severity}]
  created_at      timestamptz DEFAULT now(),
  UNIQUE(brand_id, source, keyword, period)
);

CREATE INDEX IF NOT EXISTS idx_mkt_sentiment_brand ON mkt_sentiment(brand_id);

-- 15. 데이터 허브 (Data Hub - 데이터 소스 연동)
CREATE TABLE IF NOT EXISTS mkt_data_sources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  name            text NOT NULL,
  type            text NOT NULL DEFAULT 'API',         -- API | Database | CSV | Webhook | SDK
  platform        text,                                -- Google Analytics | Meta API 등
  status          text NOT NULL DEFAULT 'Active',      -- Active | Error | Paused | Pending
  endpoint        text,
  last_sync       timestamptz,
  sync_interval   text DEFAULT 'daily',                -- realtime | hourly | daily | weekly | manual
  records_synced  bigint DEFAULT 0,
  normalization   numeric(5,2) DEFAULT 0,              -- 정규화율 %
  config          jsonb DEFAULT '{}',
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_data_sources_brand ON mkt_data_sources(brand_id);

-- ── RLS 일괄 적용 ──

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'mkt_influencers', 'mkt_social_accounts', 'mkt_social_content',
      'mkt_creatives', 'mkt_journeys', 'mkt_experiments',
      'mkt_agencies', 'mkt_settlements', 'mkt_media_plans',
      'mkt_strategies', 'mkt_performance', 'mkt_mmm_results',
      'mkt_attribution', 'mkt_sentiment', 'mkt_data_sources'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "%s_auth_read" ON %I FOR SELECT TO authenticated USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_auth_write" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_anon_read" ON %I FOR SELECT TO anon USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_anon_write" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;
