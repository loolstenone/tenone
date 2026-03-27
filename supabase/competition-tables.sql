-- ============================================
-- WIO Competition Module
-- MADLeague-style competition/hackathon events
-- ============================================

-- competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,  -- tenone, madleague, etc.
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, upcoming, open, judging, completed
    team_size_min INT DEFAULT 1,
    team_size_max INT DEFAULT 6,
    deadline TIMESTAMPTZ,
    judge_date TIMESTAMPTZ,
    max_teams INT DEFAULT 20,
    prizes JSONB DEFAULT '[]',
    categories TEXT[] DEFAULT '{}',
    rules TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- competition_teams table
CREATE TABLE IF NOT EXISTS competition_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    leader_id UUID,
    members JSONB DEFAULT '[]', -- [{userId, name, role}]
    submission_url TEXT,
    submission_text TEXT,
    score NUMERIC,
    rank INT,
    status TEXT DEFAULT 'registered', -- registered, submitted, scored, winner
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "competitions_read" ON competitions FOR SELECT USING (true);
CREATE POLICY "competitions_write" ON competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "competitions_update" ON competitions FOR UPDATE USING (true);
CREATE POLICY "teams_read" ON competition_teams FOR SELECT USING (true);
CREATE POLICY "teams_write" ON competition_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "teams_update" ON competition_teams FOR UPDATE USING (true);
