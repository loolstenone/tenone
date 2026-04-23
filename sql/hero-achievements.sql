-- hero_achievements: 성과 한 줄 기록
CREATE TABLE IF NOT EXISTS hero_achievements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    tags        TEXT[] NOT NULL DEFAULT '{}',
    achieved_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hero_achievements_member_date
    ON hero_achievements (member_id, achieved_at DESC);

ALTER TABLE hero_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "본인 읽기" ON hero_achievements;
DROP POLICY IF EXISTS "본인 삽입" ON hero_achievements;
DROP POLICY IF EXISTS "본인 삭제" ON hero_achievements;

CREATE POLICY "본인 읽기" ON hero_achievements
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "본인 삽입" ON hero_achievements
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "본인 삭제" ON hero_achievements
    FOR DELETE USING (auth.uid() = member_id);
