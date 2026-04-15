-- ============================================================
-- MADLeague Phase 2 — MADzine 고도화
-- 작성일: 2026-04-16
-- 변경:
--   1. mad_articles에 author_id, status, excerpt 추가
--   2. mad_article_likes (좋아요 테이블)
--   3. mad_article_comments (댓글 테이블)
--   4. 조회수 증가 함수
-- ============================================================

-- 1) mad_articles 확장
ALTER TABLE mad_articles ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES mad_members(id) ON DELETE SET NULL;
ALTER TABLE mad_articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));
ALTER TABLE mad_articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE mad_articles ADD COLUMN IF NOT EXISTS reject_reason TEXT;
ALTER TABLE mad_articles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 기존 published=true 아티클은 status='published'로 마이그레이션
UPDATE mad_articles SET status = 'published' WHERE is_published = true AND (status = 'draft' OR status IS NULL);
UPDATE mad_articles SET status = 'draft' WHERE is_published = false AND (status = 'draft' OR status IS NULL);

CREATE INDEX IF NOT EXISTS idx_mad_articles_status ON mad_articles(status);
CREATE INDEX IF NOT EXISTS idx_mad_articles_author ON mad_articles(author_id);

-- 퍼블릭 read 정책을 status='published' 기준으로 업데이트
DROP POLICY IF EXISTS mad_articles_read ON mad_articles;
CREATE POLICY mad_articles_read ON mad_articles FOR SELECT
  USING (is_published = true OR status = 'published');

-- 본인 draft 읽기/수정
DROP POLICY IF EXISTS mad_articles_read_own_draft ON mad_articles;
CREATE POLICY mad_articles_read_own_draft ON mad_articles FOR SELECT
  USING (author_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

-- ============================================================
-- 2) mad_article_likes — 좋아요
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_article_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  article_id UUID NOT NULL REFERENCES mad_articles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES mad_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_mad_article_likes_article ON mad_article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_mad_article_likes_member ON mad_article_likes(member_id);

ALTER TABLE mad_article_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mad_article_likes_read ON mad_article_likes;
CREATE POLICY mad_article_likes_read ON mad_article_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS mad_article_likes_insert ON mad_article_likes;
CREATE POLICY mad_article_likes_insert ON mad_article_likes FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS mad_article_likes_delete ON mad_article_likes;
CREATE POLICY mad_article_likes_delete ON mad_article_likes FOR DELETE
  USING (member_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

-- 좋아요 카운터 동기화
CREATE OR REPLACE FUNCTION mad_sync_article_likes_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mad_articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mad_articles SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.article_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mad_article_likes_count ON mad_article_likes;
CREATE TRIGGER trg_mad_article_likes_count AFTER INSERT OR DELETE ON mad_article_likes
  FOR EACH ROW EXECUTE FUNCTION mad_sync_article_likes_count();

-- ============================================================
-- 3) mad_article_comments — 댓글
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  article_id UUID NOT NULL REFERENCES mad_articles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES mad_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mad_articles ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_mad_article_comments_article ON mad_article_comments(article_id, created_at);

ALTER TABLE mad_article_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mad_article_comments_read ON mad_article_comments;
CREATE POLICY mad_article_comments_read ON mad_article_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS mad_article_comments_insert ON mad_article_comments;
CREATE POLICY mad_article_comments_insert ON mad_article_comments FOR INSERT
  WITH CHECK (author_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS mad_article_comments_delete ON mad_article_comments;
CREATE POLICY mad_article_comments_delete ON mad_article_comments FOR DELETE
  USING (author_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

CREATE OR REPLACE FUNCTION mad_sync_article_comments_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mad_articles SET comments_count = comments_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mad_articles SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.article_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mad_article_comments_count ON mad_article_comments;
CREATE TRIGGER trg_mad_article_comments_count AFTER INSERT OR DELETE ON mad_article_comments
  FOR EACH ROW EXECUTE FUNCTION mad_sync_article_comments_count();

-- ============================================================
-- 4) 조회수 증가 함수 (security definer로 RLS 우회)
-- ============================================================
CREATE OR REPLACE FUNCTION mad_increment_article_views(p_article_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE mad_articles SET views_count = views_count + 1 WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
