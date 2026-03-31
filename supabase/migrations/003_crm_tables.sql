-- CRM 모듈: People + Organizations + Deals + Activities

-- 1. 연락처 (People)
CREATE TABLE IF NOT EXISTS crm_people (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  name            text NOT NULL,
  email           text,
  phone           text,
  type            text NOT NULL DEFAULT 'Other',       -- Student | Professional | Mentor | Partner | Client | Vendor | Other
  status          text NOT NULL DEFAULT 'Lead',        -- Active | Lead | Inactive | Alumni
  company         text,
  position        text,
  avatar_initials text,
  tags            text[] DEFAULT '{}',
  brand_association text[] DEFAULT '{}',               -- 관련 브랜드 목록
  source          text,                                -- 유입 경로
  cohort          text,                                -- 기수/코호트
  last_contacted  timestamptz,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_crm_people_brand ON crm_people(brand_id);
CREATE INDEX idx_crm_people_type ON crm_people(type);
CREATE INDEX idx_crm_people_status ON crm_people(status);
CREATE INDEX idx_crm_people_email ON crm_people(email);

-- 2. 조직/회사 (Organizations)
CREATE TABLE IF NOT EXISTS crm_organizations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  name            text NOT NULL,
  type            text NOT NULL DEFAULT 'Partner',     -- Partner | Client | Vendor | Sponsor
  industry        text,
  website         text,
  brand_association text[] DEFAULT '{}',
  status          text NOT NULL DEFAULT 'Active',      -- Active | Inactive
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_crm_orgs_brand ON crm_organizations(brand_id);
CREATE INDEX idx_crm_orgs_type ON crm_organizations(type);

-- 3. 조직-연락처 연결 (Organization ↔ People)
CREATE TABLE IF NOT EXISTS crm_org_contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE,
  person_id       uuid NOT NULL REFERENCES crm_people(id) ON DELETE CASCADE,
  role            text,                                -- 해당 조직에서의 역할
  created_at      timestamptz DEFAULT now(),
  UNIQUE(organization_id, person_id)
);

-- 4. 딜/기회 (Deals)
CREATE TABLE IF NOT EXISTS crm_deals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id            text NOT NULL DEFAULT 'tenone',
  title               text NOT NULL,
  organization_id     uuid REFERENCES crm_organizations(id) ON DELETE SET NULL,
  contact_id          uuid REFERENCES crm_people(id) ON DELETE SET NULL,
  stage               text NOT NULL DEFAULT 'Lead',    -- Lead | Contacted | Proposal | Negotiation | Won | Lost
  value               bigint DEFAULT 0,
  currency            text DEFAULT 'KRW',
  expected_close_date date,
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX idx_crm_deals_brand ON crm_deals(brand_id);
CREATE INDEX idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX idx_crm_deals_org ON crm_deals(organization_id);

-- 5. 활동 이력 (Activities)
CREATE TABLE IF NOT EXISTS crm_activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        text NOT NULL DEFAULT 'tenone',
  type            text NOT NULL DEFAULT 'Note',        -- Meeting | Call | Email | Note | Event
  title           text NOT NULL,
  description     text,
  person_id       uuid REFERENCES crm_people(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES crm_organizations(id) ON DELETE SET NULL,
  deal_id         uuid REFERENCES crm_deals(id) ON DELETE SET NULL,
  date            timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_crm_activities_brand ON crm_activities(brand_id);
CREATE INDEX idx_crm_activities_person ON crm_activities(person_id);
CREATE INDEX idx_crm_activities_deal ON crm_activities(deal_id);

-- RLS
ALTER TABLE crm_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_org_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;

-- Read: 인증된 사용자 전체 읽기 (brand_id 필터는 앱 레벨)
CREATE POLICY "crm_people_read" ON crm_people FOR SELECT TO authenticated USING (true);
CREATE POLICY "crm_people_write" ON crm_people FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "crm_orgs_read" ON crm_organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "crm_orgs_write" ON crm_organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "crm_org_contacts_read" ON crm_org_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "crm_org_contacts_write" ON crm_org_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "crm_deals_read" ON crm_deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "crm_deals_write" ON crm_deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "crm_activities_read" ON crm_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "crm_activities_write" ON crm_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- anon 키로도 읽기 허용 (서버사이드 API에서 사용)
CREATE POLICY "crm_people_anon_read" ON crm_people FOR SELECT TO anon USING (true);
CREATE POLICY "crm_orgs_anon_read" ON crm_organizations FOR SELECT TO anon USING (true);
CREATE POLICY "crm_org_contacts_anon_read" ON crm_org_contacts FOR SELECT TO anon USING (true);
CREATE POLICY "crm_deals_anon_read" ON crm_deals FOR SELECT TO anon USING (true);
CREATE POLICY "crm_activities_anon_read" ON crm_activities FOR SELECT TO anon USING (true);
CREATE POLICY "crm_people_anon_write" ON crm_people FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "crm_orgs_anon_write" ON crm_organizations FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "crm_org_contacts_anon_write" ON crm_org_contacts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "crm_deals_anon_write" ON crm_deals FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "crm_activities_anon_write" ON crm_activities FOR ALL TO anon USING (true) WITH CHECK (true);
