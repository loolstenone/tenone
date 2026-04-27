-- 오늘의 한 장면 — 이미지/동영상 + 5W1H 메타
CREATE TABLE IF NOT EXISTS planners_daily_moments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    media_type  TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url   TEXT NOT NULL,
    thumbnail_url TEXT,
    caption     TEXT,                 -- 한 줄
    happened_at TIMESTAMPTZ,          -- 일시 (null 이면 created_at 사용)
    with_whom   TEXT,                 -- 누구와
    location    TEXT,                 -- 어디서
    activity    TEXT,                 -- 무엇을
    width       INTEGER,
    height      INTEGER,
    duration_sec INTEGER,             -- video 전용
    file_size   BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_planners_moments_member_date
    ON planners_daily_moments(member_id, date DESC);

ALTER TABLE planners_daily_moments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS planners_moments_self ON planners_daily_moments;
CREATE POLICY planners_moments_self ON planners_daily_moments
    FOR ALL USING (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    ) WITH CHECK (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

-- updated_at 트리거
CREATE OR REPLACE FUNCTION planners_moments_touch()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS planners_moments_touch_trg ON planners_daily_moments;
CREATE TRIGGER planners_moments_touch_trg
BEFORE UPDATE ON planners_daily_moments
FOR EACH ROW EXECUTE FUNCTION planners_moments_touch();

-- Storage 버킷 (Supabase): planners-moments
-- 사용자가 직접 Dashboard 에서 만들거나, 클라이언트가 시도하면서 자동 생성됨.
-- 정책: 본인 폴더만 read/write
