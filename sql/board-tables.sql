-- Ten:One™ 통합 게시판 테이블
-- board_configs: 사이트별 게시판 설정
-- posts: 게시글
-- comments: 댓글
-- attachments: 첨부파일
-- likes, bookmarks: 좋아요/북마크

-- 1. board_configs
CREATE TABLE IF NOT EXISTS board_configs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  categories  JSONB NOT NULL DEFAULT '[]',
  settings    JSONB NOT NULL DEFAULT '{"defaultView":"list","postsPerPage":12,"pagination":"page","allowGuestPost":false,"allowGuestComment":false,"requireApproval":false,"useRepresentImage":true}',
  permissions JSONB NOT NULL DEFAULT '{"read":"all","write":"member","comment":"member"}',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site, slug)
);

-- 2. posts
CREATE TABLE IF NOT EXISTS posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site             TEXT NOT NULL,
  board            TEXT NOT NULL,  -- board_configs.slug
  title            TEXT NOT NULL,
  content          TEXT NOT NULL DEFAULT '',
  excerpt          TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL DEFAULT '',
  tags             TEXT[] NOT NULL DEFAULT '{}',
  represent_image  TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'draft',  -- published/draft/hidden/deleted
  author_type      TEXT NOT NULL DEFAULT 'member', -- member/guest/admin/agent
  author_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_nickname   TEXT,
  guest_password   TEXT,
  guest_email      TEXT,
  view_count       INT NOT NULL DEFAULT 0,
  like_count       INT NOT NULL DEFAULT 0,
  comment_count    INT NOT NULL DEFAULT 0,
  bookmark_count   INT NOT NULL DEFAULT 0,
  is_pinned        BOOLEAN NOT NULL DEFAULT false,
  is_secret        BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);

-- 3. comments
CREATE TABLE IF NOT EXISTS post_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  site            TEXT NOT NULL,
  content         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',  -- active/hidden/deleted
  author_type     TEXT NOT NULL DEFAULT 'member',
  author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_nickname  TEXT,
  guest_password  TEXT,
  guest_email     TEXT,
  like_count      INT NOT NULL DEFAULT 0,
  is_pinned       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- 4. attachments
CREATE TABLE IF NOT EXISTS post_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  mime_type   TEXT NOT NULL DEFAULT '',
  size        INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. likes
CREATE TABLE IF NOT EXISTS post_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip         TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 6. bookmarks
CREATE TABLE IF NOT EXISTS post_bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_board_configs_site ON board_configs(site);
CREATE INDEX IF NOT EXISTS idx_posts_site_board ON posts(site, board);
CREATE INDEX IF NOT EXISTS idx_posts_site_status ON posts(site, status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user ON post_bookmarks(user_id);

-- RLS
ALTER TABLE board_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

-- board_configs: 공개 읽기
DO $$ BEGIN
  DROP POLICY IF EXISTS "board_configs_public_read" ON board_configs;
  CREATE POLICY "board_configs_public_read" ON board_configs FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "board_configs_staff_write" ON board_configs;
  CREATE POLICY "board_configs_staff_write" ON board_configs FOR ALL USING (auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- posts: 발행된 글 공개 읽기, 본인 글 수정
DO $$ BEGIN
  DROP POLICY IF EXISTS "posts_public_read" ON posts;
  CREATE POLICY "posts_public_read" ON posts FOR SELECT USING (status = 'published' OR auth.uid() = author_id OR auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "posts_auth_write" ON posts;
  CREATE POLICY "posts_auth_write" ON posts FOR ALL USING (auth.uid() = author_id OR auth_is_staff() OR author_type = 'guest');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- comments: 공개 읽기
DO $$ BEGIN
  DROP POLICY IF EXISTS "post_comments_public_read" ON post_comments;
  CREATE POLICY "post_comments_public_read" ON post_comments FOR SELECT USING (status = 'active' OR auth.uid() = author_id OR auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "post_comments_auth_write" ON post_comments;
  CREATE POLICY "post_comments_auth_write" ON post_comments FOR ALL USING (auth.uid() = author_id OR auth_is_staff() OR author_type = 'guest');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 나머지 테이블: 인증 필요
DO $$ BEGIN
  DROP POLICY IF EXISTS "post_attachments_read" ON post_attachments;
  CREATE POLICY "post_attachments_read" ON post_attachments FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "post_likes_all" ON post_likes;
  CREATE POLICY "post_likes_all" ON post_likes FOR ALL USING (auth.uid() = user_id OR auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "post_bookmarks_all" ON post_bookmarks;
  CREATE POLICY "post_bookmarks_all" ON post_bookmarks FOR ALL USING (auth.uid() = user_id OR auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 시드: 주요 사이트별 기본 게시판
INSERT INTO board_configs (site, slug, name, description, categories, sort_order, settings) VALUES
  -- TenOne
  ('tenone', 'news',      '뉴스',     'TenOne 공식 뉴스',         '["공지","업데이트","이벤트"]'::jsonb, 1,
   '{"defaultView":"card","postsPerPage":12,"pagination":"page","allowGuestPost":false,"allowGuestComment":false,"requireApproval":false,"useRepresentImage":true}'::jsonb),
  ('tenone', 'community', '커뮤니티',  '멤버 자유 게시판',          '["자유","질문","후기"]'::jsonb, 2,
   '{"defaultView":"list","postsPerPage":20,"pagination":"page","allowGuestPost":false,"allowGuestComment":true,"requireApproval":false,"useRepresentImage":false}'::jsonb),
  -- MADLeague
  ('madleague', 'notice', '공지사항', 'MADLeague 공식 공지',        '["공지","이벤트","모집"]'::jsonb, 1,
   '{"defaultView":"list","postsPerPage":20,"pagination":"page","allowGuestPost":false,"allowGuestComment":false,"requireApproval":false,"useRepresentImage":false}'::jsonb),
  ('madleague', 'board',  '자유게시판','리더·멤버 자유 소통',         '["자유","질문","후기","스터디"]'::jsonb, 2,
   '{"defaultView":"list","postsPerPage":20,"pagination":"page","allowGuestPost":false,"allowGuestComment":true,"requireApproval":false,"useRepresentImage":false}'::jsonb),
  -- Badak
  ('badak', 'notice',    '공지',      'Badak 공식 공지',            '["공지","이벤트"]'::jsonb, 1,
   '{"defaultView":"list","postsPerPage":20,"pagination":"page","allowGuestPost":false,"allowGuestComment":false,"requireApproval":false,"useRepresentImage":false}'::jsonb),
  ('badak', 'community', '커뮤니티',  '네트워킹 자유 게시판',         '["자유","인사","후기","정보"]'::jsonb, 2,
   '{"defaultView":"card","postsPerPage":12,"pagination":"page","allowGuestPost":false,"allowGuestComment":true,"requireApproval":false,"useRepresentImage":true}'::jsonb)
ON CONFLICT (site, slug) DO NOTHING;
