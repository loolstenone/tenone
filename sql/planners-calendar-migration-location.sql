-- myverse_calendar_entries: with_whom / location 컬럼 추가
ALTER TABLE myverse_calendar_entries
    ADD COLUMN IF NOT EXISTS with_whom TEXT,
    ADD COLUMN IF NOT EXISTS location  TEXT;
