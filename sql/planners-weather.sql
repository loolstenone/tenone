-- myverse_daily에 날씨 기록 컬럼 추가
ALTER TABLE myverse_daily ADD COLUMN IF NOT EXISTS weather_temp INTEGER;
ALTER TABLE myverse_daily ADD COLUMN IF NOT EXISTS weather_code INTEGER;
