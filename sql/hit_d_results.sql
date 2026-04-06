-- HIT D: 시니어 리더십 전환 결과 테이블
CREATE TABLE IF NOT EXISTS public.hit_d_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.hit_sessions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  hit_a_result_id UUID REFERENCES public.hit_a_results(id) ON DELETE SET NULL,
  expertise_depth INT NOT NULL DEFAULT 0,
  expertise_domains JSONB DEFAULT '{}',
  leadership_type TEXT NOT NULL DEFAULT 'visionary',
  leadership_scores JSONB DEFAULT '{}',
  identity_flexibility INT NOT NULL DEFAULT 0,
  network_quality INT NOT NULL DEFAULT 0,
  network_breadth INT NOT NULL DEFAULT 0,
  senior_readiness INT NOT NULL DEFAULT 0,
  next_role_matrix JSONB DEFAULT '{}',
  ai_report TEXT,
  journey_stage TEXT NOT NULL DEFAULT 'early_reflection',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hit_d_results_session ON public.hit_d_results(session_id);
CREATE INDEX IF NOT EXISTS idx_hit_d_results_member ON public.hit_d_results(member_id);

-- RLS
ALTER TABLE public.hit_d_results ENABLE ROW LEVEL SECURITY;

-- Public read policy (same as other HIT tables)
CREATE POLICY "hit_d_results_public_read"
  ON public.hit_d_results
  FOR SELECT
  USING (true);

-- Public insert policy (anonymous test takers)
CREATE POLICY "hit_d_results_public_insert"
  ON public.hit_d_results
  FOR INSERT
  WITH CHECK (true);
