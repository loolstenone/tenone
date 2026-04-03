-- ============================================================
-- UMS TASK 4 — COMMERCE 수정
-- 2026-04-03
-- shop_orders/products/promotions: site_id FK 추가
-- subscriptions: brand_id, site_id 추가
-- customer_payments: 신규 생성
-- ============================================================

-- 1. shop_orders — member_id, guest_id, site_id 추가
ALTER TABLE shop_orders
    ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS guest_id  UUID REFERENCES guests(id)  ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS site_id   UUID REFERENCES ums_sites(id) ON DELETE SET NULL;

-- site TEXT → site_id UUID 마이그레이션
UPDATE shop_orders so
SET site_id = us.id
FROM ums_sites us
WHERE us.slug = so.site
  AND so.site_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_shop_orders_member_id ON shop_orders (member_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_guest_id  ON shop_orders (guest_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_site_id   ON shop_orders (site_id);

-- 2. shop_products — site_id 추가 (site TEXT deprecated)
ALTER TABLE shop_products
    ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES ums_sites(id) ON DELETE SET NULL;

UPDATE shop_products sp
SET site_id = us.id
FROM ums_sites us
WHERE us.slug = sp.site
  AND sp.site_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_shop_products_site_id ON shop_products (site_id);

-- 3. promotions — site_id 추가 (site TEXT deprecated)
ALTER TABLE promotions
    ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES ums_sites(id) ON DELETE SET NULL;

UPDATE promotions p
SET site_id = us.id
FROM ums_sites us
WHERE us.slug = p.site
  AND p.site_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_site_id ON promotions (site_id);

-- 4. subscriptions — brand_id, site_id 추가
ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS brand_id TEXT,
    ADD COLUMN IF NOT EXISTS site_id  UUID REFERENCES ums_sites(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_brand_id ON subscriptions (brand_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_site_id  ON subscriptions (site_id);

-- 5. customer_payments 신규 생성
CREATE TABLE IF NOT EXISTS customer_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 주문 연결 (shop_order 또는 subscription 중 하나)
    order_id        UUID REFERENCES shop_orders(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    -- 구매자
    member_id       UUID REFERENCES members(id) ON DELETE SET NULL,
    guest_id        UUID REFERENCES guests(id)  ON DELETE SET NULL,
    site_id         UUID REFERENCES ums_sites(id) ON DELETE SET NULL,
    -- 결제 정보
    amount          INTEGER NOT NULL DEFAULT 0,
    currency        TEXT    NOT NULL DEFAULT 'KRW',
    method          TEXT    NOT NULL DEFAULT 'card',   -- card, bank_transfer, kakao_pay, naver_pay, etc.
    status          TEXT    NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded, partial_refunded
    -- PG 정보
    pg_provider     TEXT,   -- iamport, toss, inicis, etc.
    pg_tid          TEXT,   -- PG 거래 ID
    pg_receipt_url  TEXT,
    -- 환불
    refund_amount   INTEGER DEFAULT 0,
    refund_reason   TEXT,
    refunded_at     TIMESTAMPTZ,
    -- 타임스탬프
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    tenant_id       TEXT DEFAULT 'tenone'
);

CREATE INDEX IF NOT EXISTS idx_customer_payments_order_id        ON customer_payments (order_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_subscription_id ON customer_payments (subscription_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_member_id       ON customer_payments (member_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_site_id         ON customer_payments (site_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_status          ON customer_payments (status);
CREATE INDEX IF NOT EXISTS idx_customer_payments_paid_at         ON customer_payments (paid_at);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION customer_payments_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_customer_payments_updated_at ON customer_payments;
CREATE TRIGGER trg_customer_payments_updated_at
    BEFORE UPDATE ON customer_payments
    FOR EACH ROW EXECUTE FUNCTION customer_payments_set_updated_at();

-- RLS
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_payments_staff_all ON customer_payments;
CREATE POLICY customer_payments_staff_all ON customer_payments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE auth_id = auth.uid()
              AND account_type IN ('staff', 'partner', 'junior-partner', 'crew')
        )
    );

DROP POLICY IF EXISTS customer_payments_member_own ON customer_payments;
CREATE POLICY customer_payments_member_own ON customer_payments
    FOR SELECT TO authenticated
    USING (
        member_id IN (
            SELECT id FROM members WHERE auth_id = auth.uid()
        )
    );

-- 6. 검증
SELECT
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'shop_orders' AND column_name IN ('member_id','guest_id','site_id')) AS orders_cols_added,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'shop_products' AND column_name = 'site_id') AS products_site_id,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'promotions' AND column_name = 'site_id') AS promotions_site_id,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'subscriptions' AND column_name IN ('brand_id','site_id')) AS subs_cols_added,
    (SELECT count(*) FROM information_schema.tables
     WHERE table_name = 'customer_payments') AS payments_table_exists;
