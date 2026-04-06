-- HeRo HIT 전체 DB 스키마 (참조용)
-- 현재 실제 테이블은 sql/hit-a-tables.sql, sql/hit-b-tables.sql로 이미 적용됨
-- 이 파일은 전체 구조 문서화 목적 + HIT C~F 신규 테이블 추가 시 참조
-- Ten:One™ Universe · HeRo

-- ── 이미 존재하는 테이블 (변경 금지) ─────────────────────────────────────
-- hit_sessions, hit_questions, hit_responses
-- hit_a_results, hit_b_results, hit_hero_types

-- ── HIT B alert 컬럼 추가 ─────────────────────────────────────────────────
ALTER TABLE hit_b_results ADD COLUMN IF NOT EXISTS alert_n1 INTEGER DEFAULT 0;
ALTER TABLE hit_b_results ADD COLUMN IF NOT EXISTS alert_m1 INTEGER DEFAULT 0;
ALTER TABLE hit_b_results ADD COLUMN IF NOT EXISTS alert_p1 INTEGER DEFAULT 0;
ALTER TABLE hit_b_results ADD COLUMN IF NOT EXISTS alert_level INTEGER DEFAULT 0;

-- ── hit_questions alert_code 컬럼 추가 ───────────────────────────────────
ALTER TABLE hit_questions ADD COLUMN IF NOT EXISTS alert_code VARCHAR(10);
-- 값: 'N1' | 'M1' | 'P1' | NULL (관리자가 Supabase Dashboard에서 직접 설정)

-- ── 관심분야 컬럼 (이미 없는 경우) ──────────────────────────────────────
ALTER TABLE hit_b_results ADD COLUMN IF NOT EXISTS interest_industry TEXT;
ALTER TABLE hit_b_results ADD COLUMN IF NOT EXISTS interest_job_function TEXT;

-- ── HIT C 결과 테이블 (Sprint 3) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hit_c_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES hit_sessions(id),
  member_id UUID REFERENCES members(id),
  hit_a_result_id UUID REFERENCES hit_a_results(id),

  -- 경력 자본
  capital_scores JSONB DEFAULT '{}',     -- 전문성/인적네트워크/조직이해/역량

  -- 이직 동기
  motivation_push INTEGER,               -- 현직 불만족 (0~100)
  motivation_pull INTEGER,               -- 신직장 기대 (0~100)
  motivation_type TEXT,                  -- 'push_driven' | 'pull_driven' | 'balanced'

  -- 전직 가능성
  transferability_index INTEGER,         -- 0~100
  target_job TEXT,
  gap_areas JSONB DEFAULT '[]',

  -- 이직 준비도
  transition_readiness INTEGER,          -- 0~100

  -- AI 리포트
  ai_report TEXT,
  journey_stage TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id TEXT DEFAULT 'tenone'
);

-- ── HIT D 결과 테이블 (Sprint 3) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hit_d_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES hit_sessions(id),
  member_id UUID REFERENCES members(id),
  hit_a_result_id UUID REFERENCES hit_a_results(id),

  expertise_depth INTEGER,               -- 전문성 깊이 0~100
  expertise_domains JSONB DEFAULT '[]',  -- 전문 도메인 목록
  leadership_type TEXT,                  -- 리더십 유형
  leadership_scores JSONB DEFAULT '{}',  -- 리더십 세부 점수
  identity_flexibility INTEGER,          -- 정체성 유연성 0~100
  network_quality INTEGER,               -- 네트워크 품질 0~100
  network_breadth INTEGER,               -- 네트워크 범위 0~100
  senior_readiness INTEGER,              -- 시니어 이직 준비도 0~100
  next_role_matrix JSONB DEFAULT '{}',

  ai_report TEXT,
  journey_stage TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id TEXT DEFAULT 'tenone'
);

-- ── HIT E 결과 테이블 (Sprint 3) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hit_e_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES hit_sessions(id),
  member_id UUID REFERENCES members(id),
  hit_a_result_id UUID REFERENCES hit_a_results(id),

  life_satisfaction INTEGER,             -- 인생 만족도 0~100
  remaining_passion INTEGER,             -- 잔여 열정 0~100
  direction_type TEXT,                   -- 방향 유형
  direction_scores JSONB DEFAULT '{}',
  legacy_skill_score INTEGER,            -- 역량 재활용 점수 0~100
  legacy_areas JSONB DEFAULT '[]',
  social_need_score INTEGER,             -- 연결 필요도 0~100
  second_act_readiness INTEGER,          -- 인생 2막 준비도 0~100

  ai_report TEXT,
  journey_stage TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id TEXT DEFAULT 'tenone'
);

-- ── HIT F 결과 테이블 (Sprint 3) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hit_f_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES hit_sessions(id),
  member_id UUID REFERENCES members(id),
  hit_a_result_id UUID REFERENCES hit_a_results(id),

  break_months INTEGER,                  -- 단절 기간(월)
  job_change_velocity NUMERIC,           -- 직무변화속도 0~1
  latent_score INTEGER,                  -- 공백역량점수 0~100
  cvi_raw NUMERIC,                       -- CVI 원점수
  cvi_grade TEXT,                        -- 'HIGH' | 'MID' | 'LOW'
  next_route CHAR(1),                    -- 'B' | 'C' | 'R'(recovery)
  resilience_score INTEGER,              -- 회복탄력성 0~100
  reentry_readiness INTEGER,             -- 재진입 준비도 0~100
  routing_rationale TEXT,

  ai_report TEXT,
  journey_stage TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id TEXT DEFAULT 'tenone'
);

-- ── RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE hit_c_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE hit_d_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE hit_e_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE hit_f_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY hit_c_results_anon_insert ON hit_c_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY hit_c_results_public_read ON hit_c_results FOR SELECT TO anon USING (true);
CREATE POLICY hit_c_results_auth ON hit_c_results FOR ALL TO authenticated USING (true);

CREATE POLICY hit_d_results_anon_insert ON hit_d_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY hit_d_results_public_read ON hit_d_results FOR SELECT TO anon USING (true);
CREATE POLICY hit_d_results_auth ON hit_d_results FOR ALL TO authenticated USING (true);

CREATE POLICY hit_e_results_anon_insert ON hit_e_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY hit_e_results_public_read ON hit_e_results FOR SELECT TO anon USING (true);
CREATE POLICY hit_e_results_auth ON hit_e_results FOR ALL TO authenticated USING (true);

CREATE POLICY hit_f_results_anon_insert ON hit_f_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY hit_f_results_public_read ON hit_f_results FOR SELECT TO anon USING (true);
CREATE POLICY hit_f_results_auth ON hit_f_results FOR ALL TO authenticated USING (true);

-- ── 인덱스 ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_hit_c_results_member ON hit_c_results(member_id);
CREATE INDEX IF NOT EXISTS idx_hit_d_results_member ON hit_d_results(member_id);
CREATE INDEX IF NOT EXISTS idx_hit_e_results_member ON hit_e_results(member_id);
CREATE INDEX IF NOT EXISTS idx_hit_f_results_member ON hit_f_results(member_id);
