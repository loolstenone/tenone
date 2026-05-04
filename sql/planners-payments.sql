-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — 구독 결제 스키마
-- Toss Payments 연동 + 관리자 수동 활성화
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS myverse_payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  order_id             TEXT UNIQUE NOT NULL,
  amount               INTEGER NOT NULL,
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'manual')),
  method               TEXT,
  toss_payment_key     TEXT,
  toss_receipt_url     TEXT,
  subscription_years   INTEGER DEFAULT 1,
  subscription_starts  DATE,
  subscription_ends    DATE,
  source               TEXT DEFAULT 'toss'
                         CHECK (source IN ('toss', 'pdf_buyer', 'manual', 'beta')),
  meta                 JSONB DEFAULT '{}',
  paid_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_myverse_payments_member   ON myverse_payments(member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_myverse_payments_order    ON myverse_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_myverse_payments_status   ON myverse_payments(status);

ALTER TABLE myverse_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "본인 읽기" ON myverse_payments;
CREATE POLICY "본인 읽기" ON myverse_payments
  FOR SELECT
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- ── 결제 성공 시 구독 활성화 함수 ────────────────────────────────
CREATE OR REPLACE FUNCTION myverse_activate_subscription(
    _member_id UUID,
    _years INTEGER DEFAULT 1,
    _source TEXT DEFAULT 'toss'
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    _now TIMESTAMPTZ := now();
    _current_expires TIMESTAMPTZ;
    _new_expires TIMESTAMPTZ;
BEGIN
    SELECT subscription_expires_at INTO _current_expires
    FROM myverse_users
    WHERE member_id = _member_id;

    -- 현재 만료일이 미래면 연장, 아니면 오늘부터
    IF _current_expires IS NOT NULL AND _current_expires > _now THEN
        _new_expires := _current_expires + (_years || ' years')::INTERVAL;
    ELSE
        _new_expires := _now + (_years || ' years')::INTERVAL;
    END IF;

    INSERT INTO myverse_users (member_id, subscription_status, subscription_expires_at, updated_at)
    VALUES (_member_id, 'active', _new_expires, _now)
    ON CONFLICT (member_id) DO UPDATE
    SET subscription_status = 'active',
        subscription_expires_at = _new_expires,
        updated_at = _now;
END;
$$;

-- ── PDF 구매자 자동 매칭 ──────────────────────────────────────────
-- myverse_users.is_pdf_buyer 수동 플래그 기반 (관리자가 Badak Mall 주문 확인 후 설정)
-- is_pdf_buyer=true + 무료 구독 1년 자동 활성화
CREATE OR REPLACE FUNCTION myverse_activate_pdf_buyer(_member_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE myverse_users
    SET is_pdf_buyer = true,
        pdf_buyer_verified_at = now(),
        updated_at = now()
    WHERE member_id = _member_id;

    PERFORM myverse_activate_subscription(_member_id, 1, 'pdf_buyer');

    INSERT INTO myverse_payments (
        member_id, order_id, amount, status, source,
        subscription_years, subscription_starts, subscription_ends,
        paid_at, meta
    ) VALUES (
        _member_id,
        'pdf_' || _member_id::TEXT || '_' || EXTRACT(EPOCH FROM now())::BIGINT::TEXT,
        0,
        'manual',
        'pdf_buyer',
        1,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 year',
        now(),
        jsonb_build_object('note', 'PDF buyer free activation')
    )
    ON CONFLICT (order_id) DO NOTHING;
END;
$$;

-- ── 구독 만료 일괄 처리 (매일 크론) ──────────────────────────────
CREATE OR REPLACE FUNCTION myverse_expire_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    _count INTEGER;
BEGIN
    UPDATE myverse_users
    SET subscription_status = 'expired', updated_at = now()
    WHERE subscription_status = 'active'
      AND subscription_expires_at IS NOT NULL
      AND subscription_expires_at < now();
    GET DIAGNOSTICS _count = ROW_COUNT;
    RETURN _count;
END;
$$;
