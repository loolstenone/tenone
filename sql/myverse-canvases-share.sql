-- myverse_canvases 공유 링크 + 실시간 협업 지원
-- share_token: NULL이면 비공개, 값 있으면 공유 링크 활성

ALTER TABLE myverse_canvases ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_myverse_canvases_share
    ON myverse_canvases(share_token)
    WHERE share_token IS NOT NULL;

-- 공유 토큰으로 공개 읽기 (비인증 포함)
DROP POLICY IF EXISTS myverse_canvases_shared_read ON myverse_canvases;
CREATE POLICY myverse_canvases_shared_read ON myverse_canvases
    FOR SELECT USING (share_token IS NOT NULL);
