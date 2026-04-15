-- badak_bookmarks: 북마크 테이블
CREATE TABLE IF NOT EXISTS badak_bookmarks (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type  TEXT        NOT NULL CHECK (item_type IN ('need', 'group', 'post')),
  item_id    TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  subtitle   TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 동일 아이템 중복 북마크 방지
CREATE UNIQUE INDEX IF NOT EXISTS badak_bookmarks_user_item_idx
  ON badak_bookmarks(user_id, item_type, item_id);

-- RLS
ALTER TABLE badak_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own bookmarks" ON badak_bookmarks;
CREATE POLICY "Users manage own bookmarks" ON badak_bookmarks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
