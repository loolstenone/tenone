-- 신고 / 차단

-- 모먼트 신고 — 동일 회원이 동일 모먼트를 여러 번 신고하지 못하게
CREATE TABLE IF NOT EXISTS myverse_moment_reports (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id       uuid NOT NULL REFERENCES myverse_daily_moments(id) ON DELETE CASCADE,
    reporter_id     uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    reason          text NOT NULL CHECK (reason IN ('spam','sexual','violence','hate','self_harm','illegal','other')),
    detail          text CHECK (detail IS NULL OR length(detail) <= 1000),
    status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    resolved_at     timestamptz,
    UNIQUE (moment_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_moment_reports_open ON myverse_moment_reports(status, created_at DESC) WHERE status IN ('open','reviewing');
CREATE INDEX IF NOT EXISTS idx_moment_reports_moment ON myverse_moment_reports(moment_id);

-- 사용자 차단 — 차단자→피차단자 단방향
CREATE TABLE IF NOT EXISTS myverse_user_blocks (
    blocker_id      uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    blocked_id      uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (blocker_id, blocked_id),
    CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON myverse_user_blocks(blocked_id);

-- RLS
ALTER TABLE myverse_moment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS moment_reports_reporter_insert ON myverse_moment_reports;
CREATE POLICY moment_reports_reporter_insert ON myverse_moment_reports
    FOR INSERT
    WITH CHECK (reporter_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS moment_reports_reporter_select ON myverse_moment_reports;
CREATE POLICY moment_reports_reporter_select ON myverse_moment_reports
    FOR SELECT
    USING (reporter_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS user_blocks_owner ON myverse_user_blocks;
CREATE POLICY user_blocks_owner ON myverse_user_blocks
    FOR ALL
    USING (blocker_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (blocker_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
