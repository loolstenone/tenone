-- daily_result_category CHECK 에 'scene' 추가 (오늘의 한 장면 통합)
ALTER TABLE planners_daily
    DROP CONSTRAINT IF EXISTS planners_daily_daily_result_category_check;

ALTER TABLE planners_daily
    ADD CONSTRAINT planners_daily_daily_result_category_check
    CHECK (daily_result_category IS NULL OR daily_result_category IN
        ('summary', 'quote', 'idea', 'insight', 'emotion', 'learning', 'scene', 'free'));
