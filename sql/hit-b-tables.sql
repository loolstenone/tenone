-- HIT B 결과 테이블 (2026-04-03)

CREATE TABLE IF NOT EXISTS hit_b_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES hit_sessions(id),
  member_id UUID REFERENCES members(id),
  hit_a_result_id UUID REFERENCES hit_a_results(id),

  -- 인성 (15영역, JSONB)
  personality_scores JSONB DEFAULT '{}',
  dark_triad_flags JSONB DEFAULT '{}',

  -- RIASEC
  riasec_r INT, riasec_i INT, riasec_a INT,
  riasec_s INT, riasec_e INT, riasec_c INT,
  holland_code VARCHAR(3),

  -- 역량
  competency_common JSONB DEFAULT '{}',
  competency_track TEXT,
  competency_track_scores JSONB DEFAULT '{}',

  -- 준비도
  readiness_self INT, readiness_portfolio INT,
  readiness_interview INT, readiness_network INT,
  readiness_total INT,
  readiness_grade TEXT CHECK (readiness_grade IN ('A','B','C','D')),
  readiness_gaps JSONB DEFAULT '[]',

  -- AI 종합
  ai_report TEXT,
  journey_stage TEXT DEFAULT 'dreamer',

  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id TEXT DEFAULT 'tenone'
);

-- 통합 프로필
CREATE TABLE IF NOT EXISTS hero_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) UNIQUE,
  hit_a_result_id UUID REFERENCES hit_a_results(id),
  hit_b_result_id UUID REFERENCES hit_b_results(id),
  hero_stage TEXT DEFAULT 'dreamer',
  tier TEXT,
  portfolio_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  tenant_id TEXT DEFAULT 'tenone'
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_hit_b_results_member ON hit_b_results(member_id);
CREATE INDEX IF NOT EXISTS idx_hero_profiles_member ON hero_profiles(member_id);

-- RLS
ALTER TABLE hit_b_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY hit_b_results_anon_insert ON hit_b_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY hit_b_results_public_read ON hit_b_results FOR SELECT TO anon USING (true);
CREATE POLICY hit_b_results_auth ON hit_b_results FOR ALL TO authenticated USING (true);

CREATE POLICY hero_profiles_anon_insert ON hero_profiles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY hero_profiles_anon_select ON hero_profiles FOR SELECT TO anon USING (true);
CREATE POLICY hero_profiles_auth ON hero_profiles FOR ALL TO authenticated USING (true);
