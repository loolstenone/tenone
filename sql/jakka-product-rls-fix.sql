-- sold_out 상품도 퍼블릭 조회 가능하도록 RLS 완화
-- 날짜: 2026-04-20
DROP POLICY IF EXISTS "public read active products" ON jakka_products;
CREATE POLICY "public read visible products"
    ON jakka_products FOR SELECT
    USING (status IN ('active', 'sold_out'));
