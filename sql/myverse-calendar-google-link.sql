-- 캘린더 엔트리 ↔ Google Calendar 이벤트 연결
-- google_event_id 가 채워진 row는 양방향 동기화 대상

ALTER TABLE myverse_calendar_entries
    ADD COLUMN IF NOT EXISTS google_event_id TEXT;

ALTER TABLE myverse_calendar_entries
    ADD COLUMN IF NOT EXISTS google_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_calendar_entries_google
    ON myverse_calendar_entries(member_id, google_event_id)
    WHERE google_event_id IS NOT NULL;

COMMENT ON COLUMN myverse_calendar_entries.google_event_id IS
    'Google Calendar primary 캘린더의 event.id. NOT NULL이면 Google에 푸시된 일정.';
