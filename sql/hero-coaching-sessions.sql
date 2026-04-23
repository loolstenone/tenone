-- hero_coaching_sessions: 코칭 세션 이력
CREATE TABLE IF NOT EXISTS hero_coaching_sessions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_type TEXT NOT NULL DEFAULT 'self'
                     CHECK (session_type IN ('self','peer','mentor','pro')),
    coach_name   TEXT,
    topic        TEXT NOT NULL,
    summary      TEXT,
    action_items TEXT[] NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hero_coaching_sessions_member_date
    ON hero_coaching_sessions (member_id, session_date DESC);

ALTER TABLE hero_coaching_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "본인 읽기" ON hero_coaching_sessions;
DROP POLICY IF EXISTS "본인 삽입" ON hero_coaching_sessions;
DROP POLICY IF EXISTS "본인 삭제" ON hero_coaching_sessions;

CREATE POLICY "본인 읽기" ON hero_coaching_sessions
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "본인 삽입" ON hero_coaching_sessions
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "본인 삭제" ON hero_coaching_sessions
    FOR DELETE USING (auth.uid() = member_id);
