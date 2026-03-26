-- Talk 모듈: 댓글 + 좋아요 + 북마크

-- 1. 댓글 테이블
CREATE TABLE IF NOT EXISTS wio_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL,
  tenant_id  text NOT NULL,
  author_id  uuid NOT NULL,
  parent_id  uuid,  -- 대댓글 (2depth만)
  content    text NOT NULL,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. 좋아요 테이블 (게시글 + 댓글 공용)
CREATE TABLE IF NOT EXISTS wio_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,  -- 'post' | 'comment'
  target_id  uuid NOT NULL,
  tenant_id  text NOT NULL,
  user_id    uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(target_type, target_id, user_id)
);

-- 3. 북마크 테이블
CREATE TABLE IF NOT EXISTS wio_bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL,
  tenant_id  text NOT NULL,
  user_id    uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 4. posts에 comment_count, like_count 컬럼 추가
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wio_posts' AND column_name = 'comment_count') THEN
    ALTER TABLE wio_posts ADD COLUMN comment_count int DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wio_posts' AND column_name = 'like_count') THEN
    ALTER TABLE wio_posts ADD COLUMN like_count int DEFAULT 0;
  END IF;
END $$;

-- RLS
ALTER TABLE wio_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_read" ON wio_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_write" ON wio_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "comments_update" ON wio_comments FOR UPDATE TO authenticated USING (author_id = auth.uid());

ALTER TABLE wio_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_read" ON wio_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "likes_write" ON wio_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "likes_delete" ON wio_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE wio_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_read" ON wio_bookmarks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "bookmarks_write" ON wio_bookmarks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "bookmarks_delete" ON wio_bookmarks FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON wio_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_tenant_id ON wio_comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON wio_likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON wio_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON wio_bookmarks(post_id);
