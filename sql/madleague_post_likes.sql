-- ============================================================
-- MADLeague MQ-B — mad_post_likes (커뮤니티 게시글 좋아요)
-- 작성일: 2026-04-16
-- ============================================================

CREATE TABLE IF NOT EXISTS mad_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES mad_posts(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES mad_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_mad_post_likes_post ON mad_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_mad_post_likes_member ON mad_post_likes(member_id);

ALTER TABLE mad_post_likes ENABLE ROW LEVEL SECURITY;

-- 매드리거 전용 읽기
DROP POLICY IF EXISTS mad_post_likes_read ON mad_post_likes;
CREATE POLICY mad_post_likes_read ON mad_post_likes FOR SELECT
  USING (EXISTS (SELECT 1 FROM mad_members WHERE user_id = auth.uid()));

-- 본인 좋아요 추가/삭제
DROP POLICY IF EXISTS mad_post_likes_insert ON mad_post_likes;
CREATE POLICY mad_post_likes_insert ON mad_post_likes FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS mad_post_likes_delete ON mad_post_likes;
CREATE POLICY mad_post_likes_delete ON mad_post_likes FOR DELETE
  USING (member_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

-- ============================================================
-- mad_posts.likes_count 자동 동기화 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION mad_sync_post_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mad_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mad_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_mad_post_likes_sync ON mad_post_likes;
CREATE TRIGGER trg_mad_post_likes_sync
  AFTER INSERT OR DELETE ON mad_post_likes
  FOR EACH ROW EXECUTE FUNCTION mad_sync_post_likes_count();
