-- HIT A 검사 테이블 (2026-04-03)

-- 검사 세션
CREATE TABLE IF NOT EXISTS hit_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  session_token TEXT UNIQUE NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('A', 'B')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_module TEXT DEFAULT 'base',
  current_index INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id TEXT DEFAULT 'tenone',
  brand_id TEXT DEFAULT 'hero'
);

-- 개별 응답
CREATE TABLE IF NOT EXISTS hit_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES hit_sessions(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_index INT NOT NULL,
  selected_option INT NOT NULL,
  option_value TEXT NOT NULL,
  response_time_ms INT,
  answered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, question_id)
);

-- HIT A 결과
CREATE TABLE IF NOT EXISTS hit_a_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES hit_sessions(id),
  member_id UUID REFERENCES members(id),

  -- MBTI
  mbti_type VARCHAR(4),
  mbti_e_score INT, mbti_s_score INT, mbti_t_score INT, mbti_j_score INT,

  -- DISC
  disc_primary VARCHAR(1),
  disc_subtype VARCHAR(4),
  disc_d_score INT, disc_i_score INT, disc_s_score INT, disc_c_score INT,

  -- 기저요인
  base_summary TEXT,
  base_scores JSONB DEFAULT '{}',

  -- 64유형
  type_code VARCHAR(10),
  type_name_ko VARCHAR(100),
  type_nickname TEXT,
  type_category VARCHAR(50),
  type_traits TEXT,
  type_careers TEXT,

  -- AI + S-Power
  ai_narrative TEXT,
  s_power_scores JSONB,

  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id TEXT DEFAULT 'tenone'
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_hit_sessions_token ON hit_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_hit_sessions_member ON hit_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_hit_responses_session ON hit_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_hit_a_results_member ON hit_a_results(member_id);
CREATE INDEX IF NOT EXISTS idx_hit_a_results_type ON hit_a_results(type_code);

-- RLS
ALTER TABLE hit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hit_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hit_a_results ENABLE ROW LEVEL SECURITY;

-- 세션: anon INSERT + 토큰 기반 SELECT/UPDATE
CREATE POLICY hit_sessions_anon_insert ON hit_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY hit_sessions_anon_select ON hit_sessions FOR SELECT TO anon USING (true);
CREATE POLICY hit_sessions_anon_update ON hit_sessions FOR UPDATE TO anon USING (true);
CREATE POLICY hit_sessions_auth ON hit_sessions FOR ALL TO authenticated USING (true);

-- 응답: anon CRUD (세션 기반)
CREATE POLICY hit_responses_anon_insert ON hit_responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY hit_responses_anon_select ON hit_responses FOR SELECT TO anon USING (true);
CREATE POLICY hit_responses_auth ON hit_responses FOR ALL TO authenticated USING (true);

-- 결과: 누구나 읽기 (공유 URL), anon INSERT (채점 결과 저장)
CREATE POLICY hit_a_results_anon_insert ON hit_a_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY hit_a_results_public_read ON hit_a_results FOR SELECT TO anon USING (true);
CREATE POLICY hit_a_results_auth ON hit_a_results FOR ALL TO authenticated USING (true);
