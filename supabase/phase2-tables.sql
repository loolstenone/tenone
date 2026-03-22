-- ============================================
-- Phase 2 추가 테이블
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. Opportunities (기회 관리)
CREATE TYPE opportunity_source AS ENUM ('narjangter', 'competition', 'government', 'referral', 'website', 'openchat', 'other');
CREATE TYPE opportunity_status AS ENUM ('new', 'reviewing', 'bidding', 'won', 'lost', 'expired');

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    source opportunity_source NOT NULL DEFAULT 'other',
    source_url TEXT,
    description TEXT,
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    deadline DATE,
    region VARCHAR(100),
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    status opportunity_status DEFAULT 'new',
    assigned_to UUID REFERENCES members(id),
    converted_project_id UUID REFERENCES projects(id),
    crawled_at TIMESTAMPTZ,
    crawl_source VARCHAR(100),
    relevance_score DECIMAL(3,2),
    contact_name VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_opportunities_source ON opportunities(source);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_read" ON opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON opportunities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON opportunities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "anon_insert_website" ON opportunities FOR INSERT TO anon WITH CHECK (source = 'website');

-- 2. Partners (협력사/프리랜서)
CREATE TYPE partner_type AS ENUM ('company', 'freelancer');
CREATE TYPE rate_type AS ENUM ('hourly', 'project', 'monthly');

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type partner_type NOT NULL,
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    skills TEXT[] DEFAULT '{}',
    speciality TEXT,
    portfolio_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    rate_type rate_type,
    rate_amount DECIMAL(10,2),
    bank_info JSONB,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_skills ON partners USING GIN(skills);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_read" ON partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON partners FOR UPDATE TO authenticated USING (true);
