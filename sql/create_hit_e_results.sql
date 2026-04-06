-- HIT E Results table — 인생 2막 분석
CREATE TABLE IF NOT EXISTS hit_e_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES hit_sessions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  hit_a_result_id UUID REFERENCES hit_a_results(id) ON DELETE SET NULL,
  life_satisfaction INT NOT NULL DEFAULT 0,
  remaining_passion INT NOT NULL DEFAULT 0,
  direction_type TEXT NOT NULL DEFAULT 'social_contribution',
  direction_scores JSONB NOT NULL DEFAULT '{}',
  legacy_skill_score INT NOT NULL DEFAULT 0,
  legacy_areas JSONB NOT NULL DEFAULT '[]',
  social_need_score INT NOT NULL DEFAULT 0,
  second_act_readiness INT NOT NULL DEFAULT 0,
  ai_report TEXT,
  journey_stage TEXT NOT NULL DEFAULT 'exploring',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hit_e_results_session ON hit_e_results(session_id);
CREATE INDEX idx_hit_e_results_member ON hit_e_results(member_id);

ALTER TABLE hit_e_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hit_e_results_public_read" ON hit_e_results
  FOR SELECT USING (true);

CREATE POLICY "hit_e_results_public_insert" ON hit_e_results
  FOR INSERT WITH CHECK (true);
