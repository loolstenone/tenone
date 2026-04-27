-- planners_daily 에 운동/건강 트래킹 컬럼 추가
-- 사용자가 Settings 에서 켠 항목만 입력 노출

ALTER TABLE planners_daily
    -- 운동: 종류·시간(분)·거리(km)·메모
    ADD COLUMN IF NOT EXISTS exercise_type     TEXT,
    ADD COLUMN IF NOT EXISTS exercise_minutes  INTEGER,
    ADD COLUMN IF NOT EXISTS exercise_distance NUMERIC(6, 2),
    ADD COLUMN IF NOT EXISTS exercise_note     TEXT,
    -- 건강: 혈압(수축/이완), 혈당, 체중, 체온
    ADD COLUMN IF NOT EXISTS bp_systolic       INTEGER,
    ADD COLUMN IF NOT EXISTS bp_diastolic      INTEGER,
    ADD COLUMN IF NOT EXISTS blood_sugar       INTEGER,
    ADD COLUMN IF NOT EXISTS body_weight       NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS body_temp         NUMERIC(4, 2),
    ADD COLUMN IF NOT EXISTS health_note       TEXT;
