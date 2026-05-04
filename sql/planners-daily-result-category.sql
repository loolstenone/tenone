-- 오늘의 한 줄 카테고리 컬럼 추가
ALTER TABLE myverse_daily
    ADD COLUMN IF NOT EXISTS daily_result_category TEXT
        CHECK (daily_result_category IS NULL OR daily_result_category IN
            ('summary', 'quote', 'idea', 'insight', 'emotion', 'learning', 'free'));
