-- ============================================================
-- MADLeague Phase 2 — 커뮤니티 (posts + comments)
-- 작성일: 2026-04-16
-- ============================================================

CREATE TABLE IF NOT EXISTS mad_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  author_id UUID NOT NULL REFERENCES mad_members(id) ON DELETE CASCADE,
  club_id UUID REFERENCES mad_clubs(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'free' CHECK (category IN ('free','question','share','insight','pinboard','notice')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_posts_tenant ON mad_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_posts_category ON mad_posts(category);
CREATE INDEX IF NOT EXISTS idx_mad_posts_club ON mad_posts(club_id);
CREATE INDEX IF NOT EXISTS idx_mad_posts_author ON mad_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_mad_posts_created ON mad_posts(created_at DESC);

ALTER TABLE mad_posts ENABLE ROW LEVEL SECURITY;

-- 매드리거 전용 읽기: mad_members에 본인 기록이 있어야 read 가능
DROP POLICY IF EXISTS mad_posts_read_members ON mad_posts;
CREATE POLICY mad_posts_read_members ON mad_posts FOR SELECT
  USING (EXISTS (SELECT 1 FROM mad_members WHERE user_id = auth.uid()));

-- 본인 글 CUD
DROP POLICY IF EXISTS mad_posts_insert_own ON mad_posts;
CREATE POLICY mad_posts_insert_own ON mad_posts FOR INSERT
  WITH CHECK (author_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS mad_posts_update_own ON mad_posts;
CREATE POLICY mad_posts_update_own ON mad_posts FOR UPDATE
  USING (author_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()))
  WITH CHECK (author_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS mad_posts_delete_own ON mad_posts;
CREATE POLICY mad_posts_delete_own ON mad_posts FOR DELETE
  USING (author_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

-- ============================================================
CREATE TABLE IF NOT EXISTS mad_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  post_id UUID NOT NULL REFERENCES mad_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES mad_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_comments_post ON mad_comments(post_id, created_at);

ALTER TABLE mad_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mad_comments_read_members ON mad_comments;
CREATE POLICY mad_comments_read_members ON mad_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM mad_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS mad_comments_insert_own ON mad_comments;
CREATE POLICY mad_comments_insert_own ON mad_comments FOR INSERT
  WITH CHECK (author_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS mad_comments_delete_own ON mad_comments;
CREATE POLICY mad_comments_delete_own ON mad_comments FOR DELETE
  USING (author_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

-- ============================================================
-- 댓글 수 동기화 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION mad_sync_post_comments_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mad_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mad_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mad_comments_count ON mad_comments;
CREATE TRIGGER trg_mad_comments_count AFTER INSERT OR DELETE ON mad_comments
  FOR EACH ROW EXECUTE FUNCTION mad_sync_post_comments_count();
