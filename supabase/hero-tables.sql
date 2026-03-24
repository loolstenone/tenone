-- HeRo 테이블 스키마
-- HIT 검사, 커리어 프로필, 이력서

-- 1. HIT 검사 결과
CREATE TABLE hit_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL,
    scores JSONB NOT NULL DEFAULT '{}',
    summary TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 커리어 프로필
CREATE TABLE career_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID UNIQUE NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    desired_position VARCHAR(200),
    desired_industry TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    education VARCHAR(300),
    certifications TEXT[] DEFAULT '{}',
    portfolio_url TEXT,
    bio TEXT,
    career_goals TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 이력서
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT '기본 이력서',
    content JSONB NOT NULL DEFAULT '{}',
    is_primary BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_hit_results_member ON hit_results(member_id);
CREATE INDEX idx_career_profiles_member ON career_profiles(member_id);
CREATE INDEX idx_resumes_member ON resumes(member_id);

-- RLS
ALTER TABLE hit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_hit" ON hit_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_hit" ON hit_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_read_career" ON career_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_manage_career" ON career_profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_read_resumes" ON resumes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_manage_resumes" ON resumes FOR ALL TO authenticated USING (true);
