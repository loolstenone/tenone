-- myverse_users 에 page_visible 컬럼 추가
-- 기본값 TRUE (공개) — false 시 @handle 공개 페이지를 비공개 처리

ALTER TABLE myverse_users
    ADD COLUMN IF NOT EXISTS page_visible BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN myverse_users.page_visible IS
    '사용자 @handle 공개 페이지 표시 여부. FALSE 시 방문자에게 "비공개 페이지" 안내 표시.';
