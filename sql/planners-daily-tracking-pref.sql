-- myverse_users 에 데일리 트래킹 표시 설정 컬럼 추가
-- 빈 배열이면 Daily 페이지에서 트래킹 섹션 자체를 숨김
-- 기본값은 빈 배열 (사용자가 명시적으로 켜야 노출 — 잡음 최소화)

ALTER TABLE myverse_users
    ADD COLUMN IF NOT EXISTS daily_tracking_metrics TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
