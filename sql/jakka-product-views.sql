-- Phase A-4: 마켓 상품 조회수
-- 날짜: 2026-04-20

ALTER TABLE jakka_products ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

-- 조회수 증가 RPC (익명도 호출 가능해야 하므로 SECURITY DEFINER)
CREATE OR REPLACE FUNCTION jakka_increment_product_view(p_id UUID)
RETURNS INT AS $$
DECLARE
    new_count INT;
BEGIN
    UPDATE jakka_products
        SET view_count = view_count + 1
        WHERE id = p_id
        RETURNING view_count INTO new_count;
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION jakka_increment_product_view(UUID) TO anon, authenticated;

-- 기존 더미 상품에 랜덤 조회수 부여 (데모용)
UPDATE jakka_products
SET view_count = (likes_count * 10) + (sold_count * 20) + floor(random() * 300)::int
WHERE view_count = 0;
