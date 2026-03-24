-- ============================================
-- Ten:One™ Universe 통합 게시판 시스템
-- Supabase Migration
-- ============================================

-- 1. board_configs (게시판 설정)
CREATE TABLE IF NOT EXISTS board_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site TEXT NOT NULL,              -- 사이트 코드 (tenone, madleague, ...)
    slug TEXT NOT NULL,              -- 게시판 slug (news, archive, free ...)
    name TEXT NOT NULL,              -- 게시판 이름
    description TEXT DEFAULT '',
    categories JSONB DEFAULT '[]',   -- ["활동소식", "리제로스", "자료실"]
    settings JSONB DEFAULT '{}',     -- { defaultView, postsPerPage, pagination, allowGuestPost, ... }
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(site, slug)
);

-- 2. posts (게시글)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site TEXT NOT NULL,
    board TEXT NOT NULL,              -- board_configs.slug 참조
    title TEXT NOT NULL,
    content TEXT DEFAULT '',         -- HTML (리치 텍스트)
    excerpt TEXT DEFAULT '',         -- 요약 (자동 생성 or 수동)
    category TEXT DEFAULT '',
    tags JSONB DEFAULT '[]',         -- ["마케팅", "브랜딩"]
    represent_image TEXT DEFAULT '', -- 대표 이미지 URL
    status TEXT NOT NULL DEFAULT 'published'
        CHECK (status IN ('published', 'draft', 'hidden', 'deleted')),

    -- 작성자
    author_type TEXT NOT NULL DEFAULT 'member'
        CHECK (author_type IN ('member', 'guest', 'admin', 'agent')),
    author_id UUID,                  -- 회원 ID (members 테이블 FK)
    guest_nickname TEXT,
    guest_password TEXT,             -- bcrypt 해시
    guest_email TEXT,

    -- 카운트
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    bookmark_count INT DEFAULT 0,

    -- 플래그
    is_pinned BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_site_board ON posts(site, board);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_site_board_status ON posts(site, board, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- 3. comments (댓글)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 대댓글 (1depth)
    content TEXT NOT NULL,

    -- 작성자
    author_type TEXT NOT NULL DEFAULT 'member'
        CHECK (author_type IN ('member', 'guest')),
    author_id UUID,
    guest_nickname TEXT,
    guest_password TEXT,

    like_count INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'hidden', 'deleted')),

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- 4. attachments (첨부파일)
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,          -- 원본 파일명
    filepath TEXT NOT NULL,          -- Supabase Storage 경로
    filesize INT DEFAULT 0,
    mimetype TEXT DEFAULT '',
    download_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_post ON attachments(post_id);

-- 5. likes (좋아요)
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);

-- 6. bookmarks (북마크)
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_configs ENABLE ROW LEVEL SECURITY;

-- 읽기: 누구나 published 글 읽기 가능
CREATE POLICY "posts_read_published" ON posts
    FOR SELECT USING (status = 'published' OR status = 'draft');

-- 쓰기: 인증된 사용자 or anon (비회원)
CREATE POLICY "posts_insert" ON posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "posts_update" ON posts
    FOR UPDATE USING (
        auth.uid() = author_id
        OR author_type = 'guest'
        OR auth.jwt()->>'role' = 'admin'
    );

CREATE POLICY "posts_delete" ON posts
    FOR DELETE USING (
        auth.uid() = author_id
        OR auth.jwt()->>'role' = 'admin'
    );

-- 댓글: 누구나 읽기, 인증/비회원 쓰기
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_update" ON comments
    FOR UPDATE USING (auth.uid() = author_id OR author_type = 'guest');
CREATE POLICY "comments_delete" ON comments
    FOR DELETE USING (auth.uid() = author_id OR auth.jwt()->>'role' = 'admin');

-- 첨부파일
CREATE POLICY "attachments_read" ON attachments FOR SELECT USING (true);
CREATE POLICY "attachments_insert" ON attachments FOR INSERT WITH CHECK (true);

-- 좋아요/북마크: 본인만
CREATE POLICY "likes_read" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_read" ON bookmarks FOR SELECT USING (true);
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- board_configs: 누구나 읽기, 관리자만 수정
CREATE POLICY "board_configs_read" ON board_configs FOR SELECT USING (true);
CREATE POLICY "board_configs_write" ON board_configs
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- ============================================
-- Functions
-- ============================================

-- 조회수 증가 (race condition 방지)
CREATE OR REPLACE FUNCTION increment_post_view(p_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts SET view_count = view_count + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 댓글 수 동기화 트리거
CREATE OR REPLACE FUNCTION sync_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = (
            SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id AND status = 'active'
        ) WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = (
            SELECT COUNT(*) FROM comments WHERE post_id = OLD.post_id AND status = 'active'
        ) WHERE id = OLD.post_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE posts SET comment_count = (
            SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id AND status = 'active'
        ) WHERE id = NEW.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_comment_count
AFTER INSERT OR UPDATE OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION sync_comment_count();

-- 좋아요 수 동기화 트리거
CREATE OR REPLACE FUNCTION sync_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            UPDATE posts SET like_count = (
                SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = NEW.target_id
            ) WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'comment' THEN
            UPDATE comments SET like_count = (
                SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = NEW.target_id
            ) WHERE id = NEW.target_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'post' THEN
            UPDATE posts SET like_count = (
                SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = OLD.target_id
            ) WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'comment' THEN
            UPDATE comments SET like_count = (
                SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = OLD.target_id
            ) WHERE id = OLD.target_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION sync_like_count();

-- 북마크 수 동기화
CREATE OR REPLACE FUNCTION sync_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET bookmark_count = (
            SELECT COUNT(*) FROM bookmarks WHERE post_id = NEW.post_id
        ) WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET bookmark_count = (
            SELECT COUNT(*) FROM bookmarks WHERE post_id = OLD.post_id
        ) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_bookmark_count
AFTER INSERT OR DELETE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION sync_bookmark_count();
