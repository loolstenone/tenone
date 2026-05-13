-- myverse_daily_routines — 운동·식사 구조화 필드 추가
-- 운동: level(1~5) 기존 + heart_rate(BPM)·kcal 추가
-- 식사: composition(메뉴/구성)·kcal 추가
-- 모두 NULL 허용 — 기존 row 영향 없음

ALTER TABLE myverse_daily_routines
  ADD COLUMN IF NOT EXISTS kcal        INTEGER,
  ADD COLUMN IF NOT EXISTS heart_rate  INTEGER,
  ADD COLUMN IF NOT EXISTS composition TEXT;

COMMENT ON COLUMN myverse_daily_routines.kcal IS '소모/섭취 칼로리 — 운동·식사 공통';
COMMENT ON COLUMN myverse_daily_routines.heart_rate IS '평균 심박수(BPM) — 운동 전용';
COMMENT ON COLUMN myverse_daily_routines.composition IS '메뉴 구성/세트 구성 — 식사·운동 공통';
