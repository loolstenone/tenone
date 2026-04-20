-- JAKKA 스토리(글) 포스트
-- 작가의 고민·성장·일상 스토리 (브런치형 글 중심 콘텐츠)
-- 작가가 자신만의 카테고리(시리즈)를 정의할 수 있음

-- ─── jakka_posts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jakka_posts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id   uuid NOT NULL REFERENCES jakka_creators(id) ON DELETE CASCADE,
    user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug         text NOT NULL,                         -- URL용 (creator_id + slug UNIQUE)
    title        text NOT NULL,
    subtitle     text,                                  -- 부제 (선택)
    body         text NOT NULL,                         -- 마크다운 본문
    cover_image  text,                                  -- 대표 이미지 (Storage URL)
    category     text,                                  -- 작가가 정의한 카테고리 (예: "작업일기", "재료 연구")
    tags         text[]  NOT NULL DEFAULT '{}',
    read_minutes int     NOT NULL DEFAULT 1,            -- 예상 읽기 시간 (자동 계산)
    is_published boolean NOT NULL DEFAULT true,         -- 비공개 드래프트 지원
    views_count  int     NOT NULL DEFAULT 0,
    likes_count  int     NOT NULL DEFAULT 0,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (creator_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_jakka_posts_creator   ON jakka_posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_jakka_posts_category  ON jakka_posts(creator_id, category);
CREATE INDEX IF NOT EXISTS idx_jakka_posts_published ON jakka_posts(is_published, created_at DESC);

-- RLS: 공개 포스트는 누구나 읽기, 본인만 쓰기/수정/삭제
ALTER TABLE jakka_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jakka_posts_select" ON jakka_posts FOR SELECT USING (is_published OR auth.uid() = user_id);
CREATE POLICY "jakka_posts_insert" ON jakka_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jakka_posts_update" ON jakka_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "jakka_posts_delete" ON jakka_posts FOR DELETE USING (auth.uid() = user_id);

-- ─── jakka_post_likes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jakka_post_likes (
    user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id    uuid NOT NULL REFERENCES jakka_posts(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_jakka_post_likes_post ON jakka_post_likes(post_id);

ALTER TABLE jakka_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jakka_post_likes_select" ON jakka_post_likes FOR SELECT USING (true);
CREATE POLICY "jakka_post_likes_insert" ON jakka_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jakka_post_likes_delete" ON jakka_post_likes FOR DELETE USING (auth.uid() = user_id);

-- ─── likes_count 자동 갱신 트리거 ────────────────────────────
CREATE OR REPLACE FUNCTION jakka_posts_update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jakka_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jakka_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jakka_post_likes_count ON jakka_post_likes;
CREATE TRIGGER trg_jakka_post_likes_count
    AFTER INSERT OR DELETE ON jakka_post_likes
    FOR EACH ROW EXECUTE FUNCTION jakka_posts_update_likes_count();
