-- Phase A-8: 마켓 주문 (구매 문의)
-- 날짜: 2026-04-20
--
-- MVP 단계: 실결제 없이 "구매 문의" 형식으로 작가와 연결.
-- 상태: pending(문의 접수) → confirmed(작가 확인) → paid → shipped → completed / cancelled

CREATE TABLE IF NOT EXISTS jakka_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES jakka_products(id) ON DELETE RESTRICT,
    buyer_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id      UUID NOT NULL REFERENCES jakka_creators(id) ON DELETE RESTRICT,

    quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price      NUMERIC NOT NULL,
    total_price     NUMERIC NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'KRW' CHECK (currency IN ('KRW', 'ETH')),

    -- 구매자 연락처 / 배송 정보
    buyer_name      TEXT,
    buyer_phone     TEXT,
    buyer_email     TEXT,
    shipping_postcode TEXT,
    shipping_address1 TEXT,
    shipping_address2 TEXT,
    message         TEXT,                          -- 구매자 → 작가 메시지
    wallet_address  TEXT,                          -- NFT 수신 지갑

    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','paid','shipped','completed','cancelled')),
    creator_note    TEXT,                          -- 작가 메모 / 답변
    tracking_number TEXT,
    status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jakka_orders_buyer   ON jakka_orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jakka_orders_creator ON jakka_orders(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jakka_orders_product ON jakka_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_jakka_orders_status  ON jakka_orders(status);

CREATE OR REPLACE FUNCTION update_jakka_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.status_changed_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jakka_orders_updated_at ON jakka_orders;
CREATE TRIGGER trg_jakka_orders_updated_at
    BEFORE UPDATE ON jakka_orders
    FOR EACH ROW EXECUTE FUNCTION update_jakka_orders_updated_at();

ALTER TABLE jakka_orders ENABLE ROW LEVEL SECURITY;

-- 조회: 본인(구매자) 또는 해당 작품의 작가
DROP POLICY IF EXISTS "jakka_orders_select" ON jakka_orders;
CREATE POLICY "jakka_orders_select"
    ON jakka_orders FOR SELECT
    USING (
        buyer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM jakka_creators c WHERE c.id = jakka_orders.creator_id AND c.user_id = auth.uid())
    );

-- 생성: 로그인 사용자 본인의 buyer_id
DROP POLICY IF EXISTS "jakka_orders_insert" ON jakka_orders;
CREATE POLICY "jakka_orders_insert"
    ON jakka_orders FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

-- 수정: 구매자는 pending일 때 취소만 / 작가는 상태·메모 전환
DROP POLICY IF EXISTS "jakka_orders_update" ON jakka_orders;
CREATE POLICY "jakka_orders_update"
    ON jakka_orders FOR UPDATE
    USING (
        (buyer_id = auth.uid() AND status = 'pending')
        OR EXISTS (SELECT 1 FROM jakka_creators c WHERE c.id = jakka_orders.creator_id AND c.user_id = auth.uid())
    );
