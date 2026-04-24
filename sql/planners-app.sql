-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — 전체 스키마 v1
-- /planners/app 기반 능동 AI 플래너 서비스
-- ═══════════════════════════════════════════════════════════════

-- ── 1. 유저 설정 + 구독 ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planners_users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id             UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subscription_status   TEXT NOT NULL DEFAULT 'free'
                          CHECK (subscription_status IN ('free', 'active', 'expired')),
  subscription_expires_at TIMESTAMPTZ,
  ai_morning_time       TIME DEFAULT '08:00',
  ai_evening_time       TIME DEFAULT '21:00',
  ai_tone               TEXT DEFAULT 'professional'
                          CHECK (ai_tone IN ('professional', 'friendly', 'brief')),
  ai_context_scope      TEXT[] DEFAULT ARRAY['today','weekly','projects'],
  onboarding_completed  BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id)
);

-- ── 2. Personal Identity ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planners_identities (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id             UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  -- Inside-Out
  inside_who            TEXT,
  inside_values         TEXT[],
  inside_strengths      TEXT[],
  inside_vision         TEXT,
  -- Outside-In
  outside_position      TEXT,
  outside_perception    TEXT,
  outside_opportunities TEXT,
  -- Vision House
  vision_foundation     TEXT,
  vision_walls          TEXT,
  vision_roof           TEXT,
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id)
);

-- ── 3. Yearly Plan ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planners_yearly (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  year         INTEGER NOT NULL,
  theme        TEXT,
  goals        JSONB DEFAULT '[]',
  reflection   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, year)
);

-- ── 4. Monthly Plan ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planners_monthly (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  year         INTEGER NOT NULL,
  month        INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  theme        TEXT,
  focus_areas  TEXT[],
  goals        JSONB DEFAULT '[]',
  reflection   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, year, month)
);

-- ── 5. Weekly Plan (Light Vrief + GPR) ─────────────────────────
CREATE TABLE IF NOT EXISTS planners_weekly (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  year         INTEGER NOT NULL,
  week         INTEGER NOT NULL CHECK (week BETWEEN 1 AND 53),
  week_start   DATE NOT NULL,
  week_end     DATE NOT NULL,
  -- Light Vrief (3 fields)
  vrief_what   TEXT,
  vrief_why    TEXT,
  vrief_how    TEXT,
  -- Weekly GPR
  gpr_goal     TEXT,
  gpr_plan     TEXT,
  gpr_result   TEXT,
  reflection   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, year, week)
);

-- ── 6. Daily Plan + Notes ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS planners_daily (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  tasks           JSONB DEFAULT '[]',
  notes           TEXT,
  energy_level    INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  daily_result    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, date)
);

-- ── 7. Projects ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planners_projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  cover_id     TEXT,
  status       TEXT DEFAULT 'active'
                 CHECK (status IN ('active', 'completed', 'archived', 'paused')),
  start_date   DATE,
  end_date     DATE,
  completed_at TIMESTAMPTZ,
  order_index  INTEGER DEFAULT 0,
  color        TEXT DEFAULT '#0F766E',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 8. Project Vrief (Full 4-stage Objective Brief) ────────────
CREATE TABLE IF NOT EXISTS planners_project_vriefs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              UUID NOT NULL REFERENCES planners_projects(id) ON DELETE CASCADE,
  -- Stage 1: 조사·분석
  research_situation      TEXT,
  research_data           JSONB DEFAULT '[]',
  research_insight        TEXT,
  -- Stage 2: 가설 수립
  hypothesis_statement    TEXT,
  hypothesis_assumptions  TEXT[],
  hypothesis_risks        TEXT,
  -- Stage 3: 가설 검증
  validation_method       TEXT,
  validation_findings     TEXT,
  validation_conclusion   TEXT,
  -- Stage 4: 전략 수립
  strategy_objective      TEXT,
  strategy_approach       TEXT,
  strategy_key_actions    TEXT[],
  strategy_success_criteria TEXT,
  updated_at              TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id)
);

-- ── 9. Project GPR (Result Brief, 7 fields) ─────────────────────
CREATE TABLE IF NOT EXISTS planners_project_gprs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES planners_projects(id) ON DELETE CASCADE,
  goal         TEXT,
  key_results  TEXT[],
  plan         TEXT,
  progress     INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  obstacles    TEXT,
  learnings    TEXT,
  result       TEXT,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id)
);

-- ── 10. Project Notes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planners_project_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES planners_projects(id) ON DELETE CASCADE,
  title        TEXT,
  content      TEXT,
  order_index  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 11. AI Briefings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planners_ai_briefings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  briefing_type     TEXT NOT NULL CHECK (briefing_type IN ('morning', 'evening')),
  briefing_date     DATE NOT NULL,
  content           TEXT NOT NULL,
  context_snapshot  JSONB,
  is_read           BOOLEAN DEFAULT false,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, briefing_type, briefing_date)
);

-- ── 12. AI 사용량 추적 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planners_ai_usage (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  usage_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_count     INTEGER DEFAULT 0,
  evening_count     INTEGER DEFAULT 0,
  manual_ai_count   INTEGER DEFAULT 0,
  UNIQUE(member_id, usage_date)
);

-- ── 인덱스 ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_planners_daily_member_date     ON planners_daily(member_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_planners_weekly_member         ON planners_weekly(member_id, year, week);
CREATE INDEX IF NOT EXISTS idx_planners_monthly_member        ON planners_monthly(member_id, year, month);
CREATE INDEX IF NOT EXISTS idx_planners_yearly_member         ON planners_yearly(member_id, year);
CREATE INDEX IF NOT EXISTS idx_planners_projects_member       ON planners_projects(member_id, status);
CREATE INDEX IF NOT EXISTS idx_planners_notes_project         ON planners_project_notes(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_planners_briefings_member_date ON planners_ai_briefings(member_id, briefing_date DESC);

-- ── RLS 활성화 ──────────────────────────────────────────────────
ALTER TABLE planners_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_identities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_yearly          ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_monthly         ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_weekly          ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_daily           ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_project_vriefs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_project_gprs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_project_notes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_ai_briefings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners_ai_usage        ENABLE ROW LEVEL SECURITY;

-- ── RLS 정책 (본인 데이터만) ─────────────────────────────────────
-- planners_users
DROP POLICY IF EXISTS "본인만" ON planners_users;
CREATE POLICY "본인만" ON planners_users
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- planners_identities
DROP POLICY IF EXISTS "본인만" ON planners_identities;
CREATE POLICY "본인만" ON planners_identities
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- planners_yearly
DROP POLICY IF EXISTS "본인만" ON planners_yearly;
CREATE POLICY "본인만" ON planners_yearly
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- planners_monthly
DROP POLICY IF EXISTS "본인만" ON planners_monthly;
CREATE POLICY "본인만" ON planners_monthly
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- planners_weekly
DROP POLICY IF EXISTS "본인만" ON planners_weekly;
CREATE POLICY "본인만" ON planners_weekly
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- planners_daily
DROP POLICY IF EXISTS "본인만" ON planners_daily;
CREATE POLICY "본인만" ON planners_daily
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- planners_projects
DROP POLICY IF EXISTS "본인만" ON planners_projects;
CREATE POLICY "본인만" ON planners_projects
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- planners_project_vriefs (project 소유자 통해 확인)
DROP POLICY IF EXISTS "본인만" ON planners_project_vriefs;
CREATE POLICY "본인만" ON planners_project_vriefs
  USING (project_id IN (
    SELECT p.id FROM planners_projects p
    JOIN members m ON m.id = p.member_id
    WHERE m.email = auth.jwt()->>'email'
  ));

-- planners_project_gprs
DROP POLICY IF EXISTS "본인만" ON planners_project_gprs;
CREATE POLICY "본인만" ON planners_project_gprs
  USING (project_id IN (
    SELECT p.id FROM planners_projects p
    JOIN members m ON m.id = p.member_id
    WHERE m.email = auth.jwt()->>'email'
  ));

-- planners_project_notes
DROP POLICY IF EXISTS "본인만" ON planners_project_notes;
CREATE POLICY "본인만" ON planners_project_notes
  USING (project_id IN (
    SELECT p.id FROM planners_projects p
    JOIN members m ON m.id = p.member_id
    WHERE m.email = auth.jwt()->>'email'
  ));

-- planners_ai_briefings
DROP POLICY IF EXISTS "본인만" ON planners_ai_briefings;
CREATE POLICY "본인만" ON planners_ai_briefings
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- planners_ai_usage
DROP POLICY IF EXISTS "본인만" ON planners_ai_usage;
CREATE POLICY "본인만" ON planners_ai_usage
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));
