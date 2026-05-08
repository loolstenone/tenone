-- DM 타입을 알림에 추가 + thread_id 컬럼
ALTER TABLE myverse_notifications DROP CONSTRAINT IF EXISTS myverse_notifications_type_check;
ALTER TABLE myverse_notifications
    ADD CONSTRAINT myverse_notifications_type_check
    CHECK (type IN ('follow','reaction','comment','reply','dm'));

ALTER TABLE myverse_notifications
    ADD COLUMN IF NOT EXISTS thread_id uuid REFERENCES myverse_dm_threads(id) ON DELETE CASCADE;
