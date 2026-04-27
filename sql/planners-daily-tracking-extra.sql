-- 데일리 트래킹 항목 확장: 공부·신앙
ALTER TABLE planners_daily
    ADD COLUMN IF NOT EXISTS study_level INTEGER CHECK (study_level BETWEEN 1 AND 5),
    ADD COLUMN IF NOT EXISTS faith_level INTEGER CHECK (faith_level BETWEEN 1 AND 5),
    ADD COLUMN IF NOT EXISTS study_note  TEXT,
    ADD COLUMN IF NOT EXISTS faith_note  TEXT;

-- planners_users.year_start_month — 플래너 시작월 (Yearly 보기 기준)
ALTER TABLE planners_users
    ADD COLUMN IF NOT EXISTS year_start_month INTEGER NOT NULL DEFAULT 1
        CHECK (year_start_month BETWEEN 1 AND 12);
