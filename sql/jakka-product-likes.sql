-- Phase A-1: 마켓 상품 찜(좋아요) 시스템
-- 날짜: 2026-04-20

-- 1. 좋아요 집계 컬럼
ALTER TABLE jakka_products ADD COLUMN IF NOT EXISTS likes_count INT NOT NULL DEFAULT 0;

-- 2. 좋아요 매핑 테이블
CREATE TABLE IF NOT EXISTS jakka_product_likes (
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES jakka_products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_jakka_product_likes_product ON jakka_product_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_jakka_product_likes_user ON jakka_product_likes(user_id);

-- 3. RLS
ALTER TABLE jakka_product_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jakka_product_likes_select" ON jakka_product_likes;
CREATE POLICY "jakka_product_likes_select" ON jakka_product_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "jakka_product_likes_insert" ON jakka_product_likes;
CREATE POLICY "jakka_product_likes_insert" ON jakka_product_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "jakka_product_likes_delete" ON jakka_product_likes;
CREATE POLICY "jakka_product_likes_delete" ON jakka_product_likes FOR DELETE USING (auth.uid() = user_id);

-- 4. likes_count 자동 집계 트리거
CREATE OR REPLACE FUNCTION jakka_update_product_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jakka_products SET likes_count = likes_count + 1 WHERE id = NEW.product_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jakka_products SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.product_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jakka_product_likes_count ON jakka_product_likes;
CREATE TRIGGER trg_jakka_product_likes_count
AFTER INSERT OR DELETE ON jakka_product_likes
FOR EACH ROW EXECUTE FUNCTION jakka_update_product_likes_count();
