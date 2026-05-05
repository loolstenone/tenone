-- myverse_daily_moments 에 exercise JSONB 컬럼 추가
ALTER TABLE myverse_daily_moments
    ADD COLUMN IF NOT EXISTS exercise JSONB DEFAULT NULL;

COMMENT ON COLUMN myverse_daily_moments.exercise IS
'{"type":"벤치프레스","muscle_groups":["가슴","삼두"],"duration_min":30,"calories_burned":180,"intensity":"medium"}';
