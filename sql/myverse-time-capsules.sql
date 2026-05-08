-- 타임 캡슐 — 미래의 나에게 보내는 잠긴 메시지
-- open_at 까지는 본인도 내용 못 봄 (status='pending')
-- open_at 도달하면 status='ready' (UI에서 본인이 클릭해서 열 때 status='opened')

CREATE TABLE IF NOT EXISTS myverse_time_capsules (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    open_at     date NOT NULL,
    opened_at   timestamptz,
    title       text NOT NULL,
    message     text NOT NULL,
    image_urls  text[] DEFAULT '{}'::text[],
    note_after_open text,
    visibility  text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','friends','public')),
    CONSTRAINT future_open CHECK (open_at > created_at::date)
);

CREATE INDEX IF NOT EXISTS idx_capsules_member_open ON myverse_time_capsules(member_id, open_at);
CREATE INDEX IF NOT EXISTS idx_capsules_ready ON myverse_time_capsules(member_id, open_at) WHERE opened_at IS NULL;

ALTER TABLE myverse_time_capsules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS capsules_owner_all ON myverse_time_capsules;
CREATE POLICY capsules_owner_all ON myverse_time_capsules
    FOR ALL
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
