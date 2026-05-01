-- planners_daily_routines: level 컬럼 추가 (사용 수준 1–5)
ALTER TABLE planners_daily_routines
    ADD COLUMN IF NOT EXISTS level SMALLINT CHECK (level BETWEEN 1 AND 5);
