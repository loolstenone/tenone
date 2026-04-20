-- jakka_products: 마켓 판매 상품 테이블

CREATE TABLE IF NOT EXISTS jakka_products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id  UUID NOT NULL REFERENCES jakka_creators(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    category    TEXT NOT NULL CHECK (category IN ('원화', '프린트', '굿즈', '피규어', '포스터', '사진', 'NFT', '기타')),
    price       NUMERIC NOT NULL DEFAULT 0,
    currency    TEXT NOT NULL DEFAULT 'KRW' CHECK (currency IN ('KRW', 'ETH')),
    thumb_url   TEXT,
    images      TEXT[] DEFAULT '{}',
    is_limited  BOOLEAN NOT NULL DEFAULT false,
    stock       INT,                         -- NULL = 무제한
    sold_count  INT NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'hidden')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_jakka_products_creator ON jakka_products(creator_id);
CREATE INDEX IF NOT EXISTS idx_jakka_products_category ON jakka_products(category);
CREATE INDEX IF NOT EXISTS idx_jakka_products_status ON jakka_products(status);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_jakka_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jakka_products_updated_at ON jakka_products;
CREATE TRIGGER trg_jakka_products_updated_at
    BEFORE UPDATE ON jakka_products
    FOR EACH ROW EXECUTE FUNCTION update_jakka_products_updated_at();

-- RLS
ALTER TABLE jakka_products ENABLE ROW LEVEL SECURITY;

-- 누구나 active 상품 조회
CREATE POLICY "public read active products"
    ON jakka_products FOR SELECT
    USING (status = 'active');

-- 본인 상품 전체 조회 (hidden/sold_out 포함)
CREATE POLICY "creator read own products"
    ON jakka_products FOR SELECT
    USING (
        creator_id IN (
            SELECT id FROM jakka_creators WHERE user_id = auth.uid()
        )
    );

-- 본인 상품 등록
CREATE POLICY "creator insert own products"
    ON jakka_products FOR INSERT
    WITH CHECK (
        creator_id IN (
            SELECT id FROM jakka_creators WHERE user_id = auth.uid()
        )
    );

-- 본인 상품 수정
CREATE POLICY "creator update own products"
    ON jakka_products FOR UPDATE
    USING (
        creator_id IN (
            SELECT id FROM jakka_creators WHERE user_id = auth.uid()
        )
    );

-- 본인 상품 삭제
CREATE POLICY "creator delete own products"
    ON jakka_products FOR DELETE
    USING (
        creator_id IN (
            SELECT id FROM jakka_creators WHERE user_id = auth.uid()
        )
    );
