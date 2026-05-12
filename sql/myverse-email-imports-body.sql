-- email_imports에 본문 캐시 컬럼 추가 (Notion Mail 스타일 인박스에서 본문 표시용)
-- 본문은 fetch on demand로 로드되어 캐시. 모든 메일 본문을 미리 받지 않음 (저장공간 절약).

ALTER TABLE myverse_email_imports
    ADD COLUMN IF NOT EXISTS body_text TEXT,           -- plain text 본문
    ADD COLUMN IF NOT EXISTS body_html TEXT,           -- HTML 본문 (sanitize 후)
    ADD COLUMN IF NOT EXISTS body_fetched_at TIMESTAMPTZ,  -- 본문 캐시 시각 (NULL이면 미캐시)
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT false;

-- 본문 fetched 인덱스 (캐시되지 않은 메일 빠른 식별)
CREATE INDEX IF NOT EXISTS idx_email_imports_body_unfetched
    ON myverse_email_imports(member_id, received_at DESC)
    WHERE body_fetched_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_email_imports_unread
    ON myverse_email_imports(member_id, is_read, received_at DESC);

COMMENT ON COLUMN myverse_email_imports.body_text IS
    'plain text 본문. body_fetched_at 시점에 Gmail API로 가져와 캐시.';
COMMENT ON COLUMN myverse_email_imports.body_html IS
    'HTML 본문. XSS 방지를 위해 sanitize 후 저장 (DOMPurify 또는 server-side).';
COMMENT ON COLUMN myverse_email_imports.body_fetched_at IS
    '본문 캐시 시각. NULL = 본문 미캐시(snippet만 있음).';
