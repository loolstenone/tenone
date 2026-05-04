-- daily_tracking_metrics 기본값에 'satisfaction' 포함
-- 신규 사용자: 만족도 자동 활성
-- 기존 사용자: 빈 배열인 경우만 'satisfaction' 추가 (이미 선택한 항목은 보존)

ALTER TABLE myverse_users
    ALTER COLUMN daily_tracking_metrics SET DEFAULT ARRAY['satisfaction']::TEXT[];

UPDATE myverse_users
   SET daily_tracking_metrics = ARRAY['satisfaction']::TEXT[]
 WHERE daily_tracking_metrics IS NULL
    OR cardinality(daily_tracking_metrics) = 0;
