-- myverse_daily_moments 에 nutrition JSONB 컬럼 추가
ALTER TABLE myverse_daily_moments
    ADD COLUMN IF NOT EXISTS nutrition JSONB DEFAULT NULL;

COMMENT ON COLUMN myverse_daily_moments.nutrition IS
'{"foods":[{"name":"비빔밥","calories":580,"protein":18,"carbs":98,"fat":12,"portion":1.0}],"total":{"calories":580,"protein":18,"carbs":98,"fat":12}}';
