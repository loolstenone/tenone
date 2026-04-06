-- HIT F: 경력 공백 복귀 결과 테이블
-- 실행: Supabase Dashboard > SQL Editor 또는 scripts/run-sql.js

CREATE TABLE IF NOT EXISTS public.hit_f_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES hit_sessions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  hit_a_result_id UUID REFERENCES hit_a_results(id),

  -- 공백 정보
  break_months INT NOT NULL DEFAULT 0,
  job_change_velocity NUMERIC(4,2) NOT NULL DEFAULT 0.5,
  job_category TEXT,

  -- 잠재 역량
  latent_score INT NOT NULL DEFAULT 0,
  latent_scores JSONB DEFAULT '{}',

  -- CVI
  cvi_raw NUMERIC(5,1) NOT NULL DEFAULT 0,
  cvi_grade TEXT NOT NULL DEFAULT 'MID' CHECK (cvi_grade IN ('HIGH', 'MID', 'LOW')),
  next_route CHAR(1) NOT NULL DEFAULT 'C' CHECK (next_route IN ('R', 'C', 'B')),

  -- 회복탄력성
  resilience_score INT NOT NULL DEFAULT 0,
  resilience_scores JSONB DEFAULT '{}',

  -- 재진입 준비도
  reentry_readiness INT NOT NULL DEFAULT 0,
  practical_readiness INT NOT NULL DEFAULT 0,
  reentry_motivation INT NOT NULL DEFAULT 0,

  -- 공백 맥락
  break_context_score INT NOT NULL DEFAULT 0,
  break_reason_score INT NOT NULL DEFAULT 0,

  -- 라우팅 & AI
  routing_rationale TEXT,
  ai_report TEXT,
  journey_stage TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_hit_f_results_session ON hit_f_results(session_id);
CREATE INDEX IF NOT EXISTS idx_hit_f_results_member ON hit_f_results(member_id);
CREATE INDEX IF NOT EXISTS idx_hit_f_results_cvi_grade ON hit_f_results(cvi_grade);
CREATE INDEX IF NOT EXISTS idx_hit_f_results_next_route ON hit_f_results(next_route);

-- RLS
ALTER TABLE hit_f_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hit_f_results_public_read" ON hit_f_results FOR SELECT USING (true);
CREATE POLICY "hit_f_results_service_insert" ON hit_f_results FOR INSERT WITH CHECK (true);
