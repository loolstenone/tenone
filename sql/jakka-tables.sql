-- JAKKA DB 스키마
-- 크리에이터 프로필, 작업, 팔로우, 좋아요

-- ─── jakka_creators ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jakka_creators (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email           text NOT NULL UNIQUE,
    handle          text NOT NULL UNIQUE, -- "@lools" 형식
    display_name    text NOT NULL,
    status          text NOT NULL DEFAULT '취업 준비 중',
    field           text,                 -- "시각디자인"
    year_level      text,                 -- "4학년"
    school          text,
    statement       text,                 -- 짧은 인트로 문장
    bio             text,                 -- 자세한 소개
    tags            text[]   NOT NULL DEFAULT '{}',
    links           jsonb    NOT NULL DEFAULT '[]', -- [{label, url}]
    featured_work_id uuid,                -- jakka_works.id (순환 참조 방지용 defer)
    followers_count int      NOT NULL DEFAULT 0,
    following_count int      NOT NULL DEFAULT 0,
    works_count     int      NOT NULL DEFAULT 0,
    is_public       boolean  NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jakka_creators_handle  ON jakka_creators(handle);
CREATE INDEX IF NOT EXISTS idx_jakka_creators_user_id ON jakka_creators(user_id);

-- RLS
ALTER TABLE jakka_creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jakka_creators_select" ON jakka_creators FOR SELECT USING (is_public OR auth.uid() = user_id);
CREATE POLICY "jakka_creators_insert" ON jakka_creators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jakka_creators_update" ON jakka_creators FOR UPDATE USING (auth.uid() = user_id);

-- ─── jakka_works ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jakka_works (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id   uuid NOT NULL REFERENCES jakka_creators(id) ON DELETE CASCADE,
    user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title        text NOT NULL,
    category     text NOT NULL,
    description  text,
    images       text[]  NOT NULL DEFAULT '{}',  -- storage URL 배열
    tags         text[]  NOT NULL DEFAULT '{}',
    is_featured  boolean NOT NULL DEFAULT false,
    year         text    NOT NULL DEFAULT to_char(now(), 'YYYY'),
    likes_count  int     NOT NULL DEFAULT 0,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jakka_works_creator  ON jakka_works(creator_id);
CREATE INDEX IF NOT EXISTS idx_jakka_works_category ON jakka_works(category);
CREATE INDEX IF NOT EXISTS idx_jakka_works_created  ON jakka_works(created_at DESC);

-- FK: featured_work_id (테이블이 생성된 후 추가)
ALTER TABLE jakka_creators
    ADD CONSTRAINT fk_featured_work
    FOREIGN KEY (featured_work_id) REFERENCES jakka_works(id) ON DELETE SET NULL;

ALTER TABLE jakka_works ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jakka_works_select" ON jakka_works FOR SELECT USING (true);
CREATE POLICY "jakka_works_insert" ON jakka_works FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jakka_works_update" ON jakka_works FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "jakka_works_delete" ON jakka_works FOR DELETE USING (auth.uid() = user_id);

-- ─── jakka_follows ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jakka_follows (
    follower_id  uuid NOT NULL REFERENCES jakka_creators(id) ON DELETE CASCADE,
    following_id uuid NOT NULL REFERENCES jakka_creators(id) ON DELETE CASCADE,
    created_at   timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_jakka_follows_following ON jakka_follows(following_id);

ALTER TABLE jakka_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jakka_follows_select" ON jakka_follows FOR SELECT USING (true);
CREATE POLICY "jakka_follows_insert" ON jakka_follows FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM jakka_creators WHERE id = follower_id)
);
CREATE POLICY "jakka_follows_delete" ON jakka_follows FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM jakka_creators WHERE id = follower_id)
);

-- ─── jakka_bookmarks ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jakka_bookmarks (
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id  uuid NOT NULL REFERENCES jakka_creators(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_jakka_bookmarks_creator ON jakka_bookmarks(creator_id);

ALTER TABLE jakka_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jakka_bookmarks_select" ON jakka_bookmarks FOR SELECT USING (true);
CREATE POLICY "jakka_bookmarks_insert" ON jakka_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jakka_bookmarks_delete" ON jakka_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ─── jakka_likes ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jakka_likes (
    user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_id    uuid NOT NULL REFERENCES jakka_works(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, work_id)
);

ALTER TABLE jakka_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jakka_likes_select" ON jakka_likes FOR SELECT USING (true);
CREATE POLICY "jakka_likes_insert" ON jakka_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jakka_likes_delete" ON jakka_likes FOR DELETE USING (auth.uid() = user_id);

-- ─── Storage 버킷 ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('jakka-works', 'jakka-works', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "jakka_works_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'jakka-works');
CREATE POLICY "jakka_works_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'jakka-works' AND auth.uid() IS NOT NULL);
CREATE POLICY "jakka_works_storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'jakka-works' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─── 카운트 자동 갱신 트리거 ──────────────────────────────────
CREATE OR REPLACE FUNCTION jakka_update_works_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jakka_creators SET works_count = works_count + 1, updated_at = now() WHERE id = NEW.creator_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jakka_creators SET works_count = GREATEST(works_count - 1, 0), updated_at = now() WHERE id = OLD.creator_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_jakka_works_count
AFTER INSERT OR DELETE ON jakka_works
FOR EACH ROW EXECUTE FUNCTION jakka_update_works_count();

CREATE OR REPLACE FUNCTION jakka_update_follow_counts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jakka_creators SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE jakka_creators SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jakka_creators SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
        UPDATE jakka_creators SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_jakka_follow_counts
AFTER INSERT OR DELETE ON jakka_follows
FOR EACH ROW EXECUTE FUNCTION jakka_update_follow_counts();

CREATE OR REPLACE FUNCTION jakka_update_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jakka_works SET likes_count = likes_count + 1 WHERE id = NEW.work_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jakka_works SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.work_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_jakka_likes_count
AFTER INSERT OR DELETE ON jakka_likes
FOR EACH ROW EXECUTE FUNCTION jakka_update_likes_count();

CREATE OR REPLACE FUNCTION jakka_update_bookmarks_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jakka_creators SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.creator_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jakka_creators SET bookmarks_count = GREATEST(bookmarks_count - 1, 0) WHERE id = OLD.creator_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_jakka_bookmarks_count
AFTER INSERT OR DELETE ON jakka_bookmarks
FOR EACH ROW EXECUTE FUNCTION jakka_update_bookmarks_count();
