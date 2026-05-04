-- Planner's Planner AI — 커뮤니티 게시판
-- 사용자들의 후기/사례/개선사항/일상을 공유하는 단일 피드

CREATE TABLE IF NOT EXISTS myverse_community_posts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    category      TEXT NOT NULL CHECK (category IN ('review', 'case', 'suggestion', 'life')),
    title         TEXT NOT NULL,
    content       TEXT NOT NULL,
    image_urls    TEXT[] DEFAULT '{}',
    like_count    INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    is_pinned     BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_myverse_community_posts_created
    ON myverse_community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_myverse_community_posts_category
    ON myverse_community_posts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_myverse_community_posts_member
    ON myverse_community_posts(member_id);

CREATE TABLE IF NOT EXISTS myverse_community_comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES myverse_community_posts(id) ON DELETE CASCADE,
    member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_myverse_community_comments_post
    ON myverse_community_comments(post_id, created_at);

CREATE TABLE IF NOT EXISTS myverse_community_likes (
    post_id    UUID NOT NULL REFERENCES myverse_community_posts(id) ON DELETE CASCADE,
    member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, member_id)
);

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE myverse_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_community_likes ENABLE ROW LEVEL SECURITY;

-- 게시글: 누구나 읽기, 본인만 쓰기/수정/삭제
DROP POLICY IF EXISTS myverse_community_posts_select ON myverse_community_posts;
CREATE POLICY myverse_community_posts_select ON myverse_community_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS myverse_community_posts_insert ON myverse_community_posts;
CREATE POLICY myverse_community_posts_insert ON myverse_community_posts
    FOR INSERT WITH CHECK (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

DROP POLICY IF EXISTS myverse_community_posts_update ON myverse_community_posts;
CREATE POLICY myverse_community_posts_update ON myverse_community_posts
    FOR UPDATE USING (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

DROP POLICY IF EXISTS myverse_community_posts_delete ON myverse_community_posts;
CREATE POLICY myverse_community_posts_delete ON myverse_community_posts
    FOR DELETE USING (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

-- 댓글: 동일 패턴
DROP POLICY IF EXISTS myverse_community_comments_select ON myverse_community_comments;
CREATE POLICY myverse_community_comments_select ON myverse_community_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS myverse_community_comments_insert ON myverse_community_comments;
CREATE POLICY myverse_community_comments_insert ON myverse_community_comments
    FOR INSERT WITH CHECK (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

DROP POLICY IF EXISTS myverse_community_comments_update ON myverse_community_comments;
CREATE POLICY myverse_community_comments_update ON myverse_community_comments
    FOR UPDATE USING (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

DROP POLICY IF EXISTS myverse_community_comments_delete ON myverse_community_comments;
CREATE POLICY myverse_community_comments_delete ON myverse_community_comments
    FOR DELETE USING (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

-- 좋아요: 누구나 읽기, 본인만 추가/삭제
DROP POLICY IF EXISTS myverse_community_likes_select ON myverse_community_likes;
CREATE POLICY myverse_community_likes_select ON myverse_community_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS myverse_community_likes_insert ON myverse_community_likes;
CREATE POLICY myverse_community_likes_insert ON myverse_community_likes
    FOR INSERT WITH CHECK (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

DROP POLICY IF EXISTS myverse_community_likes_delete ON myverse_community_likes;
CREATE POLICY myverse_community_likes_delete ON myverse_community_likes
    FOR DELETE USING (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

-- ── 카운트 자동 갱신 트리거 ────────────────────────────────────
CREATE OR REPLACE FUNCTION myverse_community_bump_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE myverse_community_posts
           SET comment_count = comment_count + 1
         WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE myverse_community_posts
           SET comment_count = GREATEST(comment_count - 1, 0)
         WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS myverse_community_comment_count_trg ON myverse_community_comments;
CREATE TRIGGER myverse_community_comment_count_trg
AFTER INSERT OR DELETE ON myverse_community_comments
FOR EACH ROW EXECUTE FUNCTION myverse_community_bump_comment_count();

CREATE OR REPLACE FUNCTION myverse_community_bump_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE myverse_community_posts
           SET like_count = like_count + 1
         WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE myverse_community_posts
           SET like_count = GREATEST(like_count - 1, 0)
         WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS myverse_community_like_count_trg ON myverse_community_likes;
CREATE TRIGGER myverse_community_like_count_trg
AFTER INSERT OR DELETE ON myverse_community_likes
FOR EACH ROW EXECUTE FUNCTION myverse_community_bump_like_count();
