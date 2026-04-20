-- 쇼케이스 작가 업데이트 / 공지 타임라인
-- 날짜: 2026-04-21

CREATE TABLE IF NOT EXISTS jakka_showcase_updates (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    showcase_id  UUID NOT NULL REFERENCES jakka_showcases(id) ON DELETE CASCADE,
    author_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title        TEXT,                                  -- 선택 (없으면 본문만)
    body         TEXT NOT NULL,
    image_url    TEXT,                                  -- 선택 이미지
    is_pinned    BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jakka_showcase_updates_showcase ON jakka_showcase_updates(showcase_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_jakka_showcase_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jakka_showcase_updates_updated_at ON jakka_showcase_updates;
CREATE TRIGGER trg_jakka_showcase_updates_updated_at
    BEFORE UPDATE ON jakka_showcase_updates
    FOR EACH ROW EXECUTE FUNCTION update_jakka_showcase_updates_updated_at();

ALTER TABLE jakka_showcase_updates ENABLE ROW LEVEL SECURITY;

-- 조회: 누구나
DROP POLICY IF EXISTS "jakka_showcase_updates_select" ON jakka_showcase_updates;
CREATE POLICY "jakka_showcase_updates_select"
    ON jakka_showcase_updates FOR SELECT
    USING (true);

-- 작성: 쇼케이스 관리자(admin_user_id) 또는 참여 작가(showcase_artists)
DROP POLICY IF EXISTS "jakka_showcase_updates_insert" ON jakka_showcase_updates;
CREATE POLICY "jakka_showcase_updates_insert"
    ON jakka_showcase_updates FOR INSERT
    WITH CHECK (
        author_id = auth.uid()
        AND (
            EXISTS (SELECT 1 FROM jakka_showcases s WHERE s.id = jakka_showcase_updates.showcase_id AND s.admin_user_id = auth.uid())
            OR EXISTS (
                SELECT 1 FROM jakka_showcase_artists sa
                JOIN jakka_creators c ON c.id = sa.creator_id
                WHERE sa.showcase_id = jakka_showcase_updates.showcase_id AND c.user_id = auth.uid()
            )
        )
    );

-- 수정: 본인 글만
DROP POLICY IF EXISTS "jakka_showcase_updates_update" ON jakka_showcase_updates;
CREATE POLICY "jakka_showcase_updates_update"
    ON jakka_showcase_updates FOR UPDATE
    USING (author_id = auth.uid());

-- 삭제: 본인 또는 쇼케이스 관리자
DROP POLICY IF EXISTS "jakka_showcase_updates_delete" ON jakka_showcase_updates;
CREATE POLICY "jakka_showcase_updates_delete"
    ON jakka_showcase_updates FOR DELETE
    USING (
        author_id = auth.uid()
        OR EXISTS (SELECT 1 FROM jakka_showcases s WHERE s.id = jakka_showcase_updates.showcase_id AND s.admin_user_id = auth.uid())
    );
