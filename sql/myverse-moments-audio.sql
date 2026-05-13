-- myverse_daily_moments 에 'audio' media_type 추가 (세션 134)
-- 캡쳐 페이지에 녹음(MediaRecorder) 도크 버튼 추가에 따른 스키마 확장.
-- text 추가 때와 동일한 패턴 — 기존 CHECK 교체 + url-required 검사 확장.

DO $$
BEGIN
    -- 기존 media_type CHECK 교체
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'myverse_daily_moments'::regclass
          AND contype = 'c'
          AND conname = 'myverse_daily_moments_media_type_check'
    ) THEN
        EXECUTE 'ALTER TABLE myverse_daily_moments DROP CONSTRAINT myverse_daily_moments_media_type_check';
    END IF;

    -- 기존 url-required CHECK 교체
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'myverse_daily_moments'::regclass
          AND contype = 'c'
          AND conname = 'myverse_daily_moments_media_url_required_for_media_check'
    ) THEN
        EXECUTE 'ALTER TABLE myverse_daily_moments DROP CONSTRAINT myverse_daily_moments_media_url_required_for_media_check';
    END IF;
END $$;

ALTER TABLE myverse_daily_moments
    ADD CONSTRAINT myverse_daily_moments_media_type_check
    CHECK (media_type IN ('image', 'video', 'text', 'audio'));

ALTER TABLE myverse_daily_moments
    ADD CONSTRAINT myverse_daily_moments_media_url_required_for_media_check
    CHECK (
        (media_type = 'text') OR
        (media_type IN ('image', 'video', 'audio') AND media_url IS NOT NULL)
    );
