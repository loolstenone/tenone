-- Myverse 소셜 기능 — 팔로우 / 리액션 / 댓글 / 알림
-- 모든 활동은 visibility='public' 흔적 위에서만 발생

-- 1) 팔로우 관계
CREATE TABLE IF NOT EXISTS myverse_follows (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id     uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    following_id    uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON myverse_follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_following ON myverse_follows(following_id, created_at DESC);

-- 2) 흔적 리액션 (하트 등)
CREATE TABLE IF NOT EXISTS myverse_moment_reactions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id       uuid NOT NULL REFERENCES myverse_daily_moments(id) ON DELETE CASCADE,
    member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    reaction_type   text NOT NULL DEFAULT 'heart' CHECK (reaction_type IN ('heart','wow','wish','smile')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (moment_id, member_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_moment ON myverse_moment_reactions(moment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_member ON myverse_moment_reactions(member_id, created_at DESC);

-- 3) 흔적 댓글 (1단계 reply 지원)
CREATE TABLE IF NOT EXISTS myverse_moment_comments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id       uuid NOT NULL REFERENCES myverse_daily_moments(id) ON DELETE CASCADE,
    member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    parent_id       uuid REFERENCES myverse_moment_comments(id) ON DELETE CASCADE,
    body            text NOT NULL CHECK (length(body) > 0 AND length(body) <= 500),
    created_at      timestamptz NOT NULL DEFAULT now(),
    edited_at       timestamptz
);

CREATE INDEX IF NOT EXISTS idx_comments_moment ON myverse_moment_comments(moment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_member ON myverse_moment_comments(member_id, created_at DESC);

-- 4) 알림 — 누군가 나를 팔로우/내 흔적에 반응/댓글
CREATE TABLE IF NOT EXISTS myverse_notifications (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    actor_id        uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type            text NOT NULL CHECK (type IN ('follow','reaction','comment','reply')),
    moment_id       uuid REFERENCES myverse_daily_moments(id) ON DELETE CASCADE,
    comment_id      uuid REFERENCES myverse_moment_comments(id) ON DELETE CASCADE,
    read_at         timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (recipient_id != actor_id)
);

CREATE INDEX IF NOT EXISTS idx_notif_recipient_unread ON myverse_notifications(recipient_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notif_recipient_all ON myverse_notifications(recipient_id, created_at DESC);

-- RLS
ALTER TABLE myverse_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_moment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_moment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS follows_owner_write ON myverse_follows;
CREATE POLICY follows_owner_write ON myverse_follows
    FOR ALL
    USING (follower_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (follower_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS follows_public_read ON myverse_follows;
CREATE POLICY follows_public_read ON myverse_follows
    FOR SELECT
    USING (true);   -- 팔로워/팔로잉 수는 공개

DROP POLICY IF EXISTS reactions_member_write ON myverse_moment_reactions;
CREATE POLICY reactions_member_write ON myverse_moment_reactions
    FOR ALL
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS reactions_public_read ON myverse_moment_reactions;
CREATE POLICY reactions_public_read ON myverse_moment_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS comments_member_write ON myverse_moment_comments;
CREATE POLICY comments_member_write ON myverse_moment_comments
    FOR ALL
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS comments_public_read ON myverse_moment_comments;
CREATE POLICY comments_public_read ON myverse_moment_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS notif_recipient_only ON myverse_notifications;
CREATE POLICY notif_recipient_only ON myverse_notifications
    FOR ALL
    USING (recipient_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (recipient_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
