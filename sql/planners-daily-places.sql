-- Schema fixes (safe idempotent)
ALTER TABLE myverse_users ADD COLUMN IF NOT EXISTS location_enabled BOOLEAN DEFAULT false;
ALTER TABLE myverse_calendar_entries ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE myverse_calendar_entries ADD COLUMN IF NOT EXISTS with_whom TEXT;

-- 하루 이동 데이터 테이블
CREATE TABLE IF NOT EXISTS myverse_daily_places (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    date         DATE NOT NULL,
    visited_at   TIME,
    place_name   TEXT NOT NULL,
    address      TEXT,
    category     TEXT NOT NULL DEFAULT 'general',
    duration_min INTEGER,
    note         TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_myverse_daily_places_member_date
    ON myverse_daily_places(member_id, date);

ALTER TABLE myverse_daily_places ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'myverse_daily_places' AND policyname = 'myverse_daily_places_self'
    ) THEN
        CREATE POLICY myverse_daily_places_self ON myverse_daily_places
            USING (member_id = (
                SELECT id FROM members WHERE auth_id = auth.uid()
            ));
    END IF;
END $$;

-- 하루 일과 기록 테이블
CREATE TABLE IF NOT EXISTS myverse_daily_routines (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    date         DATE NOT NULL,
    start_time   TIME,
    end_time     TIME,
    activity     TEXT NOT NULL,
    category     TEXT NOT NULL DEFAULT 'general',
    note         TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_myverse_daily_routines_member_date
    ON myverse_daily_routines(member_id, date);

ALTER TABLE myverse_daily_routines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'myverse_daily_routines' AND policyname = 'myverse_daily_routines_self'
    ) THEN
        CREATE POLICY myverse_daily_routines_self ON myverse_daily_routines
            USING (member_id = (
                SELECT id FROM members WHERE auth_id = auth.uid()
            ));
    END IF;
END $$;
