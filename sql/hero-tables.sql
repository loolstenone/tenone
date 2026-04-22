-- Hero: coaching_waitlist (AI 상담 사전 신청)
CREATE TABLE IF NOT EXISTS coaching_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    email TEXT NOT NULL,
    name TEXT,
    plan TEXT NOT NULL DEFAULT 'standard',
    note TEXT,
    status TEXT NOT NULL DEFAULT 'waiting', -- waiting | notified | converted
    brand_id TEXT NOT NULL DEFAULT 'hero',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (member_id, plan)
);

ALTER TABLE coaching_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 조회" ON coaching_waitlist FOR SELECT USING (member_id = (SELECT id FROM members WHERE auth_id = auth.uid()));
CREATE POLICY "본인 INSERT" ON coaching_waitlist FOR INSERT WITH CHECK (member_id = (SELECT id FROM members WHERE auth_id = auth.uid()));
CREATE POLICY "관리자 전체 조회" ON coaching_waitlist FOR ALL USING (
    EXISTS (SELECT 1 FROM member_roles mr JOIN members m ON m.id = mr.member_id WHERE m.auth_id = auth.uid() AND mr.role IN ('staff','manager','super_admin') AND mr.is_active = true)
);

-- Hero: hero_business_inquiries (기업 파견 문의)
CREATE TABLE IF NOT EXISTS hero_business_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    company TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT,
    duration TEXT,
    budget TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | reviewing | closed
    brand_id TEXT NOT NULL DEFAULT 'hero',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hero_business_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 조회" ON hero_business_inquiries FOR SELECT USING (member_id = (SELECT id FROM members WHERE auth_id = auth.uid()));
CREATE POLICY "누구나 INSERT" ON hero_business_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "관리자 전체 조회" ON hero_business_inquiries FOR ALL USING (
    EXISTS (SELECT 1 FROM member_roles mr JOIN members m ON m.id = mr.member_id WHERE m.auth_id = auth.uid() AND mr.role IN ('staff','manager','super_admin') AND mr.is_active = true)
);

-- Hero: resumes 테이블 (이미 존재할 경우 건너뜀)
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id),
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}',
    is_primary BOOLEAN DEFAULT false,
    brand_id TEXT NOT NULL DEFAULT 'hero',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 CRUD" ON resumes FOR ALL USING (member_id = (SELECT id FROM members WHERE auth_id = auth.uid()));
CREATE POLICY "관리자 전체 조회" ON resumes FOR SELECT USING (
    EXISTS (SELECT 1 FROM member_roles mr JOIN members m ON m.id = mr.member_id WHERE m.auth_id = auth.uid() AND mr.role IN ('staff','manager','super_admin') AND mr.is_active = true)
);
