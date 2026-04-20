-- 쇼케이스 정확한 오픈 시간 + 참가 작가 소개 + 작품 캡션
-- 날짜: 2026-04-21

-- 1) 오픈 시간 (HH:MM). NULL이면 자정부터.
ALTER TABLE jakka_showcases
    ADD COLUMN IF NOT EXISTS start_time  TIME,
    ADD COLUMN IF NOT EXISTS end_time    TIME;

-- 2) 참가 작가의 쇼케이스별 statement (이번 전시에서의 인사말)
ALTER TABLE jakka_showcase_artists
    ADD COLUMN IF NOT EXISTS statement          TEXT,   -- 이번 쇼케이스에서의 작가 소개
    ADD COLUMN IF NOT EXISTS statement_updated_at TIMESTAMPTZ;

-- 3) 작품의 쇼케이스별 caption + 작가 노트
ALTER TABLE jakka_showcase_works
    ADD COLUMN IF NOT EXISTS caption        TEXT,   -- 이 쇼케이스에서의 작품 소개 (길게)
    ADD COLUMN IF NOT EXISTS title_override TEXT;   -- 쇼케이스 전용 제목 (선택)

-- display_order는 이미 존재

-- 참가 작가 본인 statement 수정 정책 추가
DROP POLICY IF EXISTS "jakka_showcase_artists_update_self" ON jakka_showcase_artists;
CREATE POLICY "jakka_showcase_artists_update_self"
    ON jakka_showcase_artists FOR UPDATE
    USING (
        creator_id IN (SELECT id FROM jakka_creators WHERE user_id = auth.uid())
    );

-- 참가 작가 본인의 작품 행 수정 정책 (caption·order)
DROP POLICY IF EXISTS "jakka_showcase_works_update_self" ON jakka_showcase_works;
CREATE POLICY "jakka_showcase_works_update_self"
    ON jakka_showcase_works FOR UPDATE
    USING (
        creator_id IN (SELECT id FROM jakka_creators WHERE user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM jakka_showcases s WHERE s.id = jakka_showcase_works.showcase_id AND s.admin_user_id = auth.uid()
        )
    );
