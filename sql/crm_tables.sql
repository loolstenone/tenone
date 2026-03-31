-- ============================================================
-- CRM 모듈 테이블 (WIO 기준: brand_id 기반 멀티테넌트)
-- 실행: Supabase SQL Editor에서 실행
-- ============================================================

-- 1) crm_people: 연락처/인맥 관리
CREATE TABLE IF NOT EXISTS crm_people (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id TEXT NOT NULL DEFAULT 'tenone',
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    type TEXT NOT NULL DEFAULT 'Other'
        CHECK (type IN ('Student','Professional','Mentor','Partner','Client','Vendor','Other')),
    status TEXT NOT NULL DEFAULT 'Lead'
        CHECK (status IN ('Active','Lead','Inactive','Alumni')),
    company TEXT,
    position TEXT,
    avatar_initials TEXT,
    brand_association TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    source TEXT DEFAULT '',
    cohort TEXT,
    last_contacted TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) crm_organizations: 기업/기관 관리
CREATE TABLE IF NOT EXISTS crm_organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id TEXT NOT NULL DEFAULT 'tenone',
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Partner'
        CHECK (type IN ('Partner','Client','Vendor','Sponsor')),
    industry TEXT,
    website TEXT,
    brand_association TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active','Inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) crm_deals: 영업/딜 파이프라인
CREATE TABLE IF NOT EXISTS crm_deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id TEXT NOT NULL DEFAULT 'tenone',
    title TEXT NOT NULL,
    organization_id UUID REFERENCES crm_organizations(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES crm_people(id) ON DELETE SET NULL,
    stage TEXT NOT NULL DEFAULT 'Lead'
        CHECK (stage IN ('Lead','Contacted','Proposal','Negotiation','Won','Lost')),
    value NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'KRW',
    expected_close_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4) crm_activities: 활동 로그
CREATE TABLE IF NOT EXISTS crm_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id TEXT NOT NULL DEFAULT 'tenone',
    type TEXT NOT NULL DEFAULT 'Note'
        CHECK (type IN ('Meeting','Call','Email','Note','Event')),
    title TEXT NOT NULL,
    description TEXT,
    person_id UUID REFERENCES crm_people(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES crm_organizations(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) crm_org_contacts: 기관-연락처 다대다 관계
CREATE TABLE IF NOT EXISTS crm_org_contacts (
    organization_id UUID REFERENCES crm_organizations(id) ON DELETE CASCADE,
    person_id UUID REFERENCES crm_people(id) ON DELETE CASCADE,
    PRIMARY KEY (organization_id, person_id)
);

-- ── 인덱스 ──
CREATE INDEX IF NOT EXISTS idx_crm_people_brand ON crm_people(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_people_type ON crm_people(type);
CREATE INDEX IF NOT EXISTS idx_crm_people_status ON crm_people(status);
CREATE INDEX IF NOT EXISTS idx_crm_orgs_brand ON crm_organizations(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_brand ON crm_deals(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_activities_brand ON crm_activities(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_person ON crm_activities(person_id);

-- ── RLS (Row Level Security) ──
ALTER TABLE crm_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_org_contacts ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자 전체 접근 (TenOne 인트라 전용 — 추후 brand_id 기반 세분화)
CREATE POLICY "crm_people_all" ON crm_people FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "crm_orgs_all" ON crm_organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "crm_deals_all" ON crm_deals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "crm_activities_all" ON crm_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "crm_org_contacts_all" ON crm_org_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- anon도 read 가능 (서버사이드 API 호출용)
CREATE POLICY "crm_people_anon_read" ON crm_people FOR SELECT TO anon USING (true);
CREATE POLICY "crm_orgs_anon_read" ON crm_organizations FOR SELECT TO anon USING (true);
CREATE POLICY "crm_deals_anon_read" ON crm_deals FOR SELECT TO anon USING (true);
CREATE POLICY "crm_activities_anon_read" ON crm_activities FOR SELECT TO anon USING (true);
CREATE POLICY "crm_org_contacts_anon_read" ON crm_org_contacts FOR SELECT TO anon USING (true);
