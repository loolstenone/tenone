-- Myverse OAuth 토큰 저장 — 외부 데이터 소스 연결용
-- provider: google_photos | apple_health | google_calendar | ...

CREATE TABLE IF NOT EXISTS myverse_oauth_tokens (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id     uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    provider      text NOT NULL,
    access_token  text NOT NULL,
    refresh_token text,
    expires_at    timestamptz,
    scope         text,
    connected_at  timestamptz NOT NULL DEFAULT now(),
    last_sync_at  timestamptz,
    last_sync_count int DEFAULT 0,
    raw_profile   jsonb,
    UNIQUE (member_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_oauth_member_provider ON myverse_oauth_tokens(member_id, provider);

ALTER TABLE myverse_oauth_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS oauth_owner_all ON myverse_oauth_tokens;
CREATE POLICY oauth_owner_all ON myverse_oauth_tokens
    FOR ALL
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
