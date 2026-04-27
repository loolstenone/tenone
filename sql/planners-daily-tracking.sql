-- Planner's Planner AI: 데일리 트래킹 컬럼 추가
-- energy_level (기존) 외에 satisfaction_level, mood_level 1~5 척도 추가
-- 매일 가볍게 체크해 월간 통계와 자기 인식의 기반 데이터로 활용

ALTER TABLE planners_daily
    ADD COLUMN IF NOT EXISTS satisfaction_level INTEGER CHECK (satisfaction_level BETWEEN 1 AND 5),
    ADD COLUMN IF NOT EXISTS mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 5);
