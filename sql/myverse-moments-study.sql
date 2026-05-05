-- 공부 분석 컬럼 추가
ALTER TABLE myverse_daily_moments ADD COLUMN IF NOT EXISTS study JSONB DEFAULT NULL;
