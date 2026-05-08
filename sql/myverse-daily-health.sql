-- Apple Health / Google Fit 일별 집계 — 외부 헬스 데이터 보관
-- moments의 exercise/nutrition 필드와 별개 (자동 측정 데이터)

CREATE TABLE IF NOT EXISTS myverse_daily_health (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    date            date NOT NULL,
    source          text NOT NULL DEFAULT 'apple_health' CHECK (source IN ('apple_health','google_fit','manual')),

    -- 활동
    steps           int,
    distance_km     numeric(8,3),
    active_kcal     numeric(8,2),
    flights_climbed int,
    exercise_min    int,

    -- 수면
    sleep_min       int,
    sleep_in_bed_min int,

    -- 심박/체성
    heart_rate_avg  int,
    heart_rate_resting int,
    weight_kg       numeric(5,2),
    body_fat_pct    numeric(5,2),

    raw             jsonb,
    imported_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (member_id, date, source)
);

CREATE INDEX IF NOT EXISTS idx_daily_health_member_date ON myverse_daily_health(member_id, date DESC);

ALTER TABLE myverse_daily_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS daily_health_owner_all ON myverse_daily_health;
CREATE POLICY daily_health_owner_all ON myverse_daily_health
    FOR ALL
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
