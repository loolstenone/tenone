-- ============================================================
-- MADLeague Phase 2 — 프로젝트 허브
-- mad_competition_teams + mad_team_members + mad_submissions
-- 작성일: 2026-04-16
-- ============================================================

-- ============================================================
-- 1. mad_competition_teams — 경쟁PT 팀
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_competition_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  competition_id UUID NOT NULL REFERENCES mad_competitions(id) ON DELETE CASCADE,
  club_id UUID REFERENCES mad_clubs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_teams_tenant ON mad_competition_teams(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_teams_competition ON mad_competition_teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_mad_teams_club ON mad_competition_teams(club_id);

-- ============================================================
-- 2. mad_team_members — 팀-멤버 M:N
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES mad_competition_teams(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES mad_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_mad_team_members_team ON mad_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_mad_team_members_member ON mad_team_members(member_id);

-- ============================================================
-- 3. mad_submissions — 팀 제출물
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  team_id UUID NOT NULL REFERENCES mad_competition_teams(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES mad_competitions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  presentation_url TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'withdrawn')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_submissions_tenant ON mad_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_submissions_team ON mad_submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_mad_submissions_competition ON mad_submissions(competition_id);

-- ============================================================
-- 4. mad_competition_results.team_id FK 보강
--    (Phase 1에서 FK 없이 UUID로만 저장됨)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_mad_results_team'
      AND table_name = 'mad_competition_results'
  ) THEN
    ALTER TABLE mad_competition_results
      ADD CONSTRAINT fk_mad_results_team
      FOREIGN KEY (team_id) REFERENCES mad_competition_teams(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- ============================================================
-- 5. updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION mad_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mad_teams_updated ON mad_competition_teams;
CREATE TRIGGER trg_mad_teams_updated
  BEFORE UPDATE ON mad_competition_teams
  FOR EACH ROW EXECUTE FUNCTION mad_set_updated_at();

DROP TRIGGER IF EXISTS trg_mad_submissions_updated ON mad_submissions;
CREATE TRIGGER trg_mad_submissions_updated
  BEFORE UPDATE ON mad_submissions
  FOR EACH ROW EXECUTE FUNCTION mad_set_updated_at();

-- ============================================================
-- 6. RLS
-- ============================================================
ALTER TABLE mad_competition_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mad_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE mad_submissions ENABLE ROW LEVEL SECURITY;

-- 팀 정보 — 퍼블릭 읽기
DROP POLICY IF EXISTS mad_teams_read ON mad_competition_teams;
CREATE POLICY mad_teams_read ON mad_competition_teams FOR SELECT USING (true);

-- 팀-멤버 — 퍼블릭 읽기 (누가 팀인지)
DROP POLICY IF EXISTS mad_team_members_read ON mad_team_members;
CREATE POLICY mad_team_members_read ON mad_team_members FOR SELECT USING (true);

-- 제출물 — submitted 상태만 퍼블릭 읽기 / draft는 본인 팀만
DROP POLICY IF EXISTS mad_submissions_read ON mad_submissions;
CREATE POLICY mad_submissions_read ON mad_submissions
  FOR SELECT USING (status = 'submitted');

-- 운영진 쓰기 (service_role bypasses RLS)
