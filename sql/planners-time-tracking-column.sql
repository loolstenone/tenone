-- myverse_users 에 time_tracking 컬럼 추가 (시간 메뉴·Time Tracker 게이트)
-- 기본값 false (off). Settings에서 토글 시 on/off 저장.
ALTER TABLE myverse_users
    ADD COLUMN IF NOT EXISTS time_tracking BOOLEAN NOT NULL DEFAULT false;

-- PostgREST 스키마 캐시 즉시 반영
NOTIFY pgrst, 'reload schema';
