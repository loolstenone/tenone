-- myverse_daily_routines.capture_mode DEFAULT 'manual' 설정
-- capture_mode: 'manual' | 'auto' | 'imported'
-- 기존 NULL 값을 'manual'로 백필하고 기본값 설정

ALTER TABLE myverse_daily_routines
  ALTER COLUMN capture_mode SET DEFAULT 'manual';

UPDATE myverse_daily_routines
  SET capture_mode = 'manual'
  WHERE capture_mode IS NULL;
