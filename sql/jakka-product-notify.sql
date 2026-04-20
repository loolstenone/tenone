-- Phase A-5: 품절 상품 입고 알림 신청
-- 날짜: 2026-04-20

CREATE TABLE IF NOT EXISTS jakka_product_notify (
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES jakka_products(id) ON DELETE CASCADE,
    email      TEXT,                        -- 알림 수신 이메일 (가입 시점 기본값, 추후 변경 가능)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notified_at TIMESTAMPTZ,                 -- 실제 발송 시각 (NULL = 미발송)
    PRIMARY KEY (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_jakka_product_notify_product ON jakka_product_notify(product_id);
CREATE INDEX IF NOT EXISTS idx_jakka_product_notify_user ON jakka_product_notify(user_id);
CREATE INDEX IF NOT EXISTS idx_jakka_product_notify_pending ON jakka_product_notify(product_id) WHERE notified_at IS NULL;

ALTER TABLE jakka_product_notify ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jakka_product_notify_select_own" ON jakka_product_notify;
CREATE POLICY "jakka_product_notify_select_own"
    ON jakka_product_notify FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "jakka_product_notify_insert" ON jakka_product_notify;
CREATE POLICY "jakka_product_notify_insert"
    ON jakka_product_notify FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "jakka_product_notify_delete" ON jakka_product_notify;
CREATE POLICY "jakka_product_notify_delete"
    ON jakka_product_notify FOR DELETE
    USING (auth.uid() = user_id);
