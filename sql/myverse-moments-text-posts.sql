-- 오늘의 한 장면 → SNS 포스팅 확장 (세션 124)
-- moments 테이블이 텍스트 전용 포스트도 수용 — 자유 주제·자유 형태.
-- media_type에 'text' 추가, media_url을 nullable, 긴 본문 컬럼 추가.

-- 1. media_url을 nullable (텍스트 포스트는 미디어 없음)
ALTER TABLE myverse_daily_moments
    ALTER COLUMN media_url DROP NOT NULL;

-- 2. 긴 본문 컬럼 추가 (caption은 짧은 캡션 유지, body는 SNS 포스트 본문)
ALTER TABLE myverse_daily_moments
    ADD COLUMN IF NOT EXISTS body TEXT;

-- 3. media_type CHECK 제약 — 'text' 허용
DO $$
BEGIN
    -- 기존 CHECK 제약 찾아 제거 (이름은 환경마다 다를 수 있음)
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'myverse_daily_moments'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%media_type%'
    ) THEN
        EXECUTE (
            SELECT 'ALTER TABLE myverse_daily_moments DROP CONSTRAINT ' || conname
            FROM pg_constraint
            WHERE conrelid = 'myverse_daily_moments'::regclass
              AND contype = 'c'
              AND pg_get_constraintdef(oid) LIKE '%media_type%'
            LIMIT 1
        );
    END IF;
END $$;

ALTER TABLE myverse_daily_moments
    ADD CONSTRAINT myverse_daily_moments_media_type_check
    CHECK (media_type IN ('image', 'video', 'text'));

-- 4. text 포스트는 media_url NULL, image/video는 NOT NULL — 정합성 보장
ALTER TABLE myverse_daily_moments
    ADD CONSTRAINT myverse_daily_moments_media_url_required_for_media_check
    CHECK (
        (media_type = 'text') OR
        (media_type IN ('image', 'video') AND media_url IS NOT NULL)
    );

-- 5. 인덱스: feed에 노출되는 public text 포스트 빠른 조회
CREATE INDEX IF NOT EXISTS idx_myverse_daily_moments_public_text
    ON myverse_daily_moments(visibility, happened_at DESC)
    WHERE visibility = 'public' AND media_type = 'text';
