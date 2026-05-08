-- DM — 1:1 메시지
-- thread_key = LEAST(a, b) || '_' || GREATEST(a, b) — 두 사람 사이 유일성 보장

CREATE TABLE IF NOT EXISTS myverse_dm_threads (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_key      text NOT NULL UNIQUE,
    member_a        uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    member_b        uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    last_message_at timestamptz,
    last_preview    text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (member_a <> member_b)
);

CREATE INDEX IF NOT EXISTS idx_dm_threads_a_last ON myverse_dm_threads(member_a, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_threads_b_last ON myverse_dm_threads(member_b, last_message_at DESC);

CREATE TABLE IF NOT EXISTS myverse_dm_messages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id       uuid NOT NULL REFERENCES myverse_dm_threads(id) ON DELETE CASCADE,
    sender_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    body            text NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
    created_at      timestamptz NOT NULL DEFAULT now(),
    read_at         timestamptz,
    deleted_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_thread_created ON myverse_dm_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_dm_messages_unread ON myverse_dm_messages(thread_id, sender_id) WHERE read_at IS NULL AND deleted_at IS NULL;

ALTER TABLE myverse_dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_dm_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dm_threads_participant ON myverse_dm_threads;
CREATE POLICY dm_threads_participant ON myverse_dm_threads
    FOR ALL
    USING (
        member_a IN (SELECT id FROM members WHERE auth_id = auth.uid())
        OR member_b IN (SELECT id FROM members WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        member_a IN (SELECT id FROM members WHERE auth_id = auth.uid())
        OR member_b IN (SELECT id FROM members WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS dm_messages_participant ON myverse_dm_messages;
CREATE POLICY dm_messages_participant ON myverse_dm_messages
    FOR ALL
    USING (
        thread_id IN (
            SELECT id FROM myverse_dm_threads
            WHERE member_a IN (SELECT id FROM members WHERE auth_id = auth.uid())
               OR member_b IN (SELECT id FROM members WHERE auth_id = auth.uid())
        )
    )
    WITH CHECK (
        sender_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
    );
